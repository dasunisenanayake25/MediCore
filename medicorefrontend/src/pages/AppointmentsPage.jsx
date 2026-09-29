import React from 'react';
import { cancelAppointment } from "../api";

function AppointmentsPage({ appointments, doctors, message, error, handleCancel, setError, navigate }) {
  const getDoctorName = (appointment) => {
    if (appointment?.doctorName && appointment.doctorName !== "Unknown" && appointment.doctorName !== "Unknown Doctor") {
      return appointment.doctorName;
    }

    if (appointment?.doctorId && typeof appointment.doctorId === "object") {
      return appointment.doctorId.name || "Unknown";
    }

    const doctorIdValue =
      typeof appointment?.doctorId === "string"
        ? appointment.doctorId
        : appointment?.doctorId?._id || appointment?.doctorId?.id;

    if (doctorIdValue) {
      const doctor = doctors.find((item) => String(item._id) === String(doctorIdValue));
      if (doctor?.name) {
        return doctor.name;
      }
    }

    return "Unknown";
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">MediCore</div>
        <nav className="nav">
          <button type="button" className="nav-button" onClick={() => navigate("/")}>
            Home
          </button>
        </nav>
      </header>

      <main className="container page-content">
        <div className="page-header-row">
          <div>
            <p className="eyebrow">Schedule</p>
            <h2 className="section-title">Booked Appointments</h2>
          </div>
          <button type="button" className="secondary-button" onClick={() => navigate("/booking")}>
            New Booking
          </button>
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="appointments-card">
          {appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>{appointment.patientName}</td>
                    <td>{getDoctorName(appointment)}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>{appointment.status}</td>
                    <td>
                      {appointment.status !== "Cancelled" && (
                        <button className="cancel-button" onClick={() => handleCancel(appointment._id)}>
                          Cancel
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

export default AppointmentsPage;
