import React, { useEffect, useState } from 'react';
import { cancelAppointment, getAppointments, updateAppointmentStatus } from '../api';

function DoctorDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    try {
      setError('');
      setLoading(true);
      setAppointments(await getAppointments());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const updateStatus = async (appointmentId, status) => {
    try {
      setError('');
      const updatedAppointment = await updateAppointmentStatus(appointmentId, status);
      setAppointments((currentAppointments) => currentAppointments.map((appointment) => (
        appointment._id === appointmentId ? { ...appointment, ...updatedAppointment } : appointment
      )));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update appointment.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    window.location.href = '/';
  };

  const pendingCount = appointments.filter((appointment) => appointment.status === 'Pending').length;
  const confirmedCount = appointments.filter((appointment) => appointment.status === 'Confirmed').length;
  const declinedCount = appointments.filter((appointment) => appointment.status === 'Cancelled').length;

  return (
    <div className="app doctor-portal">
      <header className="header">
        <div>
          <div className="logo">MediCore</div>
          <span className="eyebrow">Doctor portal</span>
        </div>
        <nav className="nav">
          <span className="nav-button">{user.username || user.email}</span>
          <button type="button" className="nav-button" onClick={handleLogout}>Logout</button>
        </nav>
      </header>

      <main className="container page-content">
        <div className="page-header-row">
          <div>
            <p className="eyebrow">Care team workspace</p>
            <h1 className="section-title">Your appointment desk</h1>
            <p>Review patient requests, see their details, and respond to each appointment.</p>
          </div>
          <button type="button" className="secondary-button" onClick={loadAppointments}>Refresh</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="dash-info-cards" style={{ marginBottom: '24px' }}>
          <div className="dash-info-card"><span className="eyebrow">Pending review</span><h2>{pendingCount}</h2><p>Appointments waiting for your response.</p></div>
          <div className="dash-info-card"><span className="eyebrow">Approved</span><h2>{confirmedCount}</h2><p>Appointments confirmed with patients.</p></div>
          <div className="dash-info-card"><span className="eyebrow">Declined</span><h2>{declinedCount}</h2><p>Requests you have declined.</p></div>
        </div>

        <div className="appointments-card">
          {loading ? (
            <p>Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p>No appointments are assigned to you.</p>
          ) : (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.patientEmail || appointment.email || 'Not provided'}</td>
                    <td>{appointment.phone || 'Not provided'}</td>
                    <td>{appointment.date ? new Date(appointment.date).toLocaleDateString() : 'Not set'}</td>
                    <td>{appointment.time}</td>
                    <td>{appointment.status}</td>
                    <td>
                      {appointment.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button type="button" className="book-button" onClick={() => updateStatus(appointment._id, 'Confirmed')}>
                            Approve
                          </button>
                          <button type="button" className="cancel-button" onClick={() => updateStatus(appointment._id, 'Cancelled')}>
                            Decline
                          </button>
                        </div>
                      )}
                      {appointment.status === 'Confirmed' && (
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() => cancelAppointment(appointment._id).then(loadAppointments).catch((requestError) => setError(requestError.response?.data?.message || 'Unable to cancel appointment.'))}
                        >
                          Cancel appointment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default DoctorDashboard;
