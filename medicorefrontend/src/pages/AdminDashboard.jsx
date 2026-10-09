import React, { useState, useEffect } from 'react';
import { getUsers, updateUserStatus, getAppointments, getHealth, getNotifications, createNotification, getFeedback, getAuditLogs, getDoctors, updateDoctorAvailability, updateDoctorProfile, updateAppointment } from '../api';
import { useNavigate } from 'react-router-dom';

import AishaSilva from '../assets/AishaSilva.avif';
import DanielFernando from '../assets/DanielFernando.jpeg';
import GraceThompson from '../assets/GraceThompson.jpg';
import JamesWalker from '../assets/JamesWalker.jpg';
import KevinPatel from '../assets/KevinPatel.avif';
import LucasGreen from '../assets/LucasGreen.jpeg';
import MayaPatel from '../assets/MayaPatel.jpeg';
import MichaelChen from '../assets/MichaelChen.jpeg';
import OliviaBrown from '../assets/OliviaBrown.jpeg';
import PriyaNair from '../assets/PriyaNair.avif';
import RaviKumar from '../assets/RaviKumar.jpeg';
import SarahLee from '../assets/SarahLee.jpeg';
import SaraJohnson from '../assets/SaraJohnson.jpeg';
import SofiaMartinez from '../assets/SofiaMartinez.jpeg';

const doctorImageMap = {
  'Dr. Aisha Silva': AishaSilva,
  'Dr. Daniel Fernando': DanielFernando,
  'Dr. Grace Thompson': GraceThompson,
  'Dr. James Walker': JamesWalker,
  'Dr. Kevin Patel': KevinPatel,
  'Dr. Lucas Green': LucasGreen,
  'Dr. Maya Patel': MayaPatel,
  'Dr. Michael Chen': MichaelChen,
  'Dr. Olivia Brown': OliviaBrown,
  'Dr. Priya Nair': PriyaNair,
  'Dr. Ravi Kumar': RaviKumar,
  'Dr. Sarah Lee': SarahLee,
  'Dr. Sara Johnson': SaraJohnson,
  'Dr. Sofia Martinez': SofiaMartinez,
};

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [usersList, setUsersList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [sysHealth, setSysHealth] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [availabilityDrafts, setAvailabilityDrafts] = useState({});
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uData, dData, aData, hData, nData, fData, lData] = await Promise.all([
        getUsers(),
        getDoctors(),
        getAppointments(),
        getHealth().catch(() => null),
        getNotifications().catch(() => []),
        getFeedback().catch(() => []),
        getAuditLogs().catch(() => [])
      ]);
      setUsersList(uData || []);
      setDoctorsList(dData || []);
      setAppointments(aData || []);
      setSysHealth(hData);
      setNotifications(nData || []);
      setFeedbacks(fData || []);
      setAuditLogs(lData || []);

      const nextDrafts = {};
      (dData || []).forEach((doctor) => {
        nextDrafts[doctor._id] = Array.isArray(doctor.availability)
          ? doctor.availability.map((slot) => `${slot.day}: ${slot.slots.join(', ')}`).join('\n')
          : 'No schedule set yet.';
      });
      setAvailabilityDrafts(nextDrafts);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    }
  };

  const handlePostAnnouncement = async () => {
    if (!newAnnouncement) return;
    try {
      await createNotification({ title: newAnnouncement });
      setNewAnnouncement(""); 
      fetchData(); 
    } catch (err) {
      console.error("Failed to post notification", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleStatusChange = async (user, nextStatus) => {
    try {
      const updatedUser = await updateUserStatus(user._id, nextStatus);
      setUsersList(prev => prev.map(u => (u._id === user._id ? { ...u, ...updatedUser, status: nextStatus } : u)));
    } catch (err) {
      console.error("Failed to update user status", err);
    }
  };

  const parseAvailabilityText = (value) => {
    if (!value || !value.trim()) return [];
    return value
      .split(/\n|;/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [day, ...rest] = line.split(':');
        const slots = (rest.join(':') || '')
          .split(',')
          .map((slot) => slot.trim())
          .filter(Boolean);

        return { day: day.trim(), slots };
      })
      .filter((item) => item.day && item.slots.length > 0);
  };

  const handleAvailabilityUpdate = async (doctorId, value) => {
    try {
      const availability = parseAvailabilityText(value);
      const updatedDoctor = await updateDoctorAvailability(doctorId, availability);
      setDoctorsList(prev => prev.map(doc => (doc._id === doctorId ? { ...doc, ...updatedDoctor, availability: updatedDoctor.availability || availability } : doc)));
      setAvailabilityDrafts(prev => ({ ...prev, [doctorId]: value }));
    } catch (err) {
      console.error("Failed to update doctor availability", err);
    }
  };

  const handleDoctorFieldUpdate = async (doctorId, field, value) => {
    try {
      const doctor = doctorsList.find((item) => item._id === doctorId);
      const updatedDoctor = await updateDoctorProfile(doctorId, { ...doctor, [field]: value });
      setDoctorsList(prev => prev.map(doc => (doc._id === doctorId ? { ...doc, ...updatedDoctor, [field]: value } : doc)));
    } catch (err) {
      console.error("Failed to update doctor profile", err);
    }
  };

  const handleAppointmentEdit = async (appointmentId, updates) => {
    try {
      const updatedAppointment = await updateAppointment(appointmentId, updates);
      setAppointments(prev => prev.map(item => (item._id === appointmentId ? { ...item, ...updatedAppointment } : item)));
    } catch (err) {
      console.error("Failed to update appointment", err);
    }
  };

  const totalPatients = usersList.filter(u => u.role !== 'doctor' && u.role !== 'admin').length;
  const totalDoctors = usersList.filter(u => u.role === 'doctor').length;
  const activePatients = usersList.filter(u => u.role !== 'doctor' && u.status === 'active').length;

  const filteredUsers = usersList.filter(user => {
    const roleMatch = roleFilter === 'all' || (user.role || 'patient') === roleFilter;
    const statusMatch = statusFilter === 'all' || (user.status || 'active') === statusFilter;
    return roleMatch && statusMatch;
  });

  const selectedUser = usersList.find((user) => user._id === selectedUserId) || null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

  const renderContent = () => {
    switch(activeTab) {
      case 'Users':
        return (
          <div className="mc-tab-content">
            <header className="mc-admin-header">
              <div>
                <h1>Users</h1>
                <p>Manage patient and doctor accounts</p>
              </div>
              <div className="mc-filters">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="all">All roles</option>
                  <option value="doctor">Doctors</option>
                  <option value="patient">Patients</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.9fr', gap: '20px', alignItems: 'start' }}>
              <div className="mc-table-wrapper">
                <table className="mc-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id} onClick={() => setSelectedUserId(u._id)} style={{ cursor: 'pointer' }}>
                        <td><strong>{u.username}</strong></td>
                        <td style={{textTransform: 'capitalize'}}>{u.role || 'Patient'}</td>
                        <td>{new Date(u.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td>
                          <span className={`mc-badge ${u.status === 'suspended' ? 'badge-suspended' : u.status === 'pending' ? 'badge-warning' : 'badge-active'}`}>
                            {u.status || 'Active'}
                          </span>
                        </td>
                        <td>
                          <div className="mc-btn-group" onClick={(e) => e.stopPropagation()}>
                            {u.status === 'pending' ? (
                              <>
                                <button className="mc-action-btn primary" onClick={() => handleStatusChange(u, 'active')}>Approve</button>
                                <button className="mc-action-btn outline" onClick={() => handleStatusChange(u, 'suspended')}>Reject</button>
                              </>
                            ) : u.status === 'suspended' ? (
                              <button className="mc-action-btn primary" onClick={() => handleStatusChange(u, 'active')}>Reactivate</button>
                            ) : (
                              <button className="mc-action-btn outline" onClick={() => handleStatusChange(u, 'suspended')}>Suspend</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedUser && (
                <div className="mc-doc-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    {selectedUser.role === 'doctor' ? (
                      <img
                        src={doctorImageMap[selectedUser.username] || doctorImageMap[selectedUser.name] || 'https://i.pravatar.cc/150'}
                        alt={selectedUser.username}
                        style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #dbeafe' }}
                      />
                    ) : (
                      <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', fontWeight: 700, color: '#1d4ed8' }}>
                        {selectedUser.username?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                    )}
                  </div>

                  <h3 style={{ margin: '0 0 8px' }}>{selectedUser.username}</h3>
                  <p style={{ margin: '0 0 16px', textTransform: 'capitalize', color: '#64748b' }}>{selectedUser.role || 'patient'}</p>

                  {selectedUser.role === 'doctor' ? (
                    <div style={{ display: 'grid', gap: '8px', fontSize: '14px', color: '#334155' }}>
                      <div><strong>Email:</strong> {selectedUser.email}</div>
                      <div><strong>Specialization:</strong> {selectedUser.specialization || 'General Medicine'}</div>
                      <div><strong>Department:</strong> {selectedUser.department || selectedUser.specialization || 'General Medicine'}</div>
                      <div><strong>Experience:</strong> {selectedUser.experience || '5 years'}</div>
                      <div><strong>Address:</strong> {selectedUser.address || 'Not provided'}</div>
                      <div><strong>Status:</strong> {selectedUser.status || 'active'}</div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '8px', fontSize: '14px', color: '#334155' }}>
                      <div><strong>Email:</strong> {selectedUser.email}</div>
                      <div><strong>Role:</strong> Patient</div>
                      <div><strong>Status:</strong> {selectedUser.status || 'active'}</div>
                      <div><strong>Account:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Recent user'}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'Appointments':
        return (
          <div className="mc-tab-content">
            <header className="mc-admin-header">
              <div>
                <h1>Appointments</h1>
                <p>All bookings across the platform</p>
              </div>
              <div className="mc-filters">
                <input type="date" />
                <select><option>All doctors</option></select>
                <select><option>All statuses</option></select>
              </div>
            </header>
            <div className="mc-card-list lg-list">
              {appointments.length > 0 ? appointments.map(app => (
                <div className="mc-list-item" key={app._id}>
                  <div className="mc-item-info">
                    <strong><span className={`mc-dot ${app.status === 'Cancelled' ? 'red' : 'green'}`}></span> {app.patientName || 'Patient'} → {app.doctorName}</strong>
                    <p>{app.date || 'Today'}, {app.time || '10:30 AM'} • {app.status}</p>
                  </div>
                  <div className="mc-btn-group">
                    {app.status === 'Cancelled' ? (
                      <button className="mc-action-btn outline" onClick={() => handleAppointmentEdit(app._id, { status: 'Pending' })}>Reopen</button>
                    ) : (
                      <>
                        <button className="mc-action-btn outline" onClick={() => {
                          const newDate = window.prompt('New appointment date (YYYY-MM-DD)', app.date || '');
                          if (!newDate) return;
                          const newTime = window.prompt('New appointment time (HH:MM)', app.time || '09:00');
                          if (!newTime) return;
                          handleAppointmentEdit(app._id, { date: newDate, time: newTime, status: 'Rescheduled' });
                        }}>Reschedule</button>
                        <button className="mc-action-btn outline" onClick={() => handleAppointmentEdit(app._id, { status: 'Cancelled' })}>Cancel</button>
                      </>
                    )}
                  </div>
                </div>
              )) : (
                <div className="mc-list-item"><p>No appointments found.</p></div>
              )}
            </div>
          </div>
        );

      case 'Doctors & Departments':
        const docs = doctorsList.length > 0 ? doctorsList : usersList.filter(u => u.role === 'doctor');
        return (
          <div className="mc-tab-content">
            <header className="mc-admin-header">
              <div>
                <h1>Doctors & departments</h1>
                <p>Profiles, specializations and schedules</p>
              </div>
              <button className="mc-action-btn primary">Add doctor</button>
            </header>
            
            <h3 className="mc-subheading">Doctor profiles</h3>
            <div className="mc-doc-grid">
              {docs.map(doc => (
                <div className="mc-doc-card" key={doc._id}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                    <img
                      src={doctorImageMap[doc.name || doc.username] || doc.image || 'https://i.pravatar.cc/150'}
                      alt={doc.name || doc.username}
                      style={{ width: '92px', height: '92px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #dbeafe' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      value={doc.name || doc.username || ''}
                      onChange={(e) => handleDoctorFieldUpdate(doc._id, 'name', e.target.value)}
                      style={{ border: '1px solid #dbeafe', borderRadius: '8px', padding: '8px 10px', fontWeight: 700 }}
                    />
                    <input
                      value={doc.specialization || doc.department || 'General Medicine'}
                      onChange={(e) => handleDoctorFieldUpdate(doc._id, 'specialization', e.target.value)}
                      style={{ border: '1px solid #dbeafe', borderRadius: '8px', padding: '8px 10px' }}
                    />
                    <input
                      value={doc.department || doc.specialization || 'General Medicine'}
                      onChange={(e) => handleDoctorFieldUpdate(doc._id, 'department', e.target.value)}
                      style={{ border: '1px solid #dbeafe', borderRadius: '8px', padding: '8px 10px' }}
                    />
                    <input
                      value={doc.experience || '5 yrs experience'}
                      onChange={(e) => handleDoctorFieldUpdate(doc._id, 'experience', e.target.value)}
                      style={{ border: '1px solid #dbeafe', borderRadius: '8px', padding: '8px 10px' }}
                    />
                    <input
                      value={doc.address || ''}
                      onChange={(e) => handleDoctorFieldUpdate(doc._id, 'address', e.target.value)}
                      style={{ border: '1px solid #dbeafe', borderRadius: '8px', padding: '8px 10px' }}
                    />
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Availability</label>
                    <textarea
                      rows={4}
                      value={availabilityDrafts[doc._id] ?? (Array.isArray(doc.availability) ? doc.availability.map((slot) => `${slot.day}: ${slot.slots.join(', ')}`).join('\n') : 'No schedule set yet.')}
                      onChange={(e) => setAvailabilityDrafts(prev => ({ ...prev, [doc._id]: e.target.value }))}
                      style={{ width: '100%', borderRadius: '10px', border: '1px solid #dbeafe', padding: '8px 10px', fontFamily: 'inherit' }}
                    />
                    <button className="mc-action-btn primary" onClick={() => handleAvailabilityUpdate(doc._id, availabilityDrafts[doc._id] ?? '')}>Save schedule</button>
                  </div>
                </div>
              ))}
              {docs.length === 0 && <p>No doctors registered yet.</p>}
            </div>

            <h3 className="mc-subheading mt-32">Departments</h3>
            <div className="mc-card-list">
              <div className="mc-list-item"><span>Cardiology</span><strong>9</strong></div>
              <div className="mc-list-item"><span>Pediatrics</span><strong>7</strong></div>
              <div className="mc-list-item"><span>Dermatology</span><strong>5</strong></div>
              <div className="mc-list-item"><span>General Medicine</span><strong>12</strong></div>
              <div className="mc-list-item"><span>Orthopedics</span><strong>8</strong></div>
            </div>
          </div>
        );

      case 'Analytics':
        return (
          <div className="mc-tab-content">
            <header className="mc-admin-header">
              <div>
                <h1>Analytics</h1>
                <p>Last 30 days</p>
              </div>
            </header>
            <div className="mc-analytics-box mb-32">
              <div className="mc-chart-area mc-flex-2">
                <span>Booking trend</span>
                <div className="mc-trend-line"></div>
              </div>
              <div className="mc-top-stats mc-flex-1">
                <div className="mc-top-row"><span>Most booked — Dr. Perera</span><strong>182</strong></div>
                <div className="mc-top-row"><span>Most booked — Dr. Fernando</span><strong>151</strong></div>
                <div className="mc-top-row"><span>Top department — Cardiology</span><strong>31%</strong></div>
              </div>
            </div>
            
            <h3 className="mc-subheading">Cancellations vs completed</h3>
            <div className="mc-card-list p-24">
              <div className="mc-progress-bar-container">
                <div className="mc-progress-bar">
                  <div className="mc-pb-fill green" style={{width: '88%'}}></div>
                </div>
                <span>Completed 88%</span>
              </div>
              <div className="mc-progress-bar-container mt-16">
                <div className="mc-progress-bar">
                  <div className="mc-pb-fill red" style={{width: '12%'}}></div>
                </div>
                <span>Cancelled 12%</span>
              </div>
            </div>
          </div>
        );

      case 'Notifications':
        return (
          <div className="mc-tab-content">
            <header className="mc-admin-header">
              <div>
                <h1>Notifications</h1>
                <p>Platform-wide announcements</p>
              </div>
            </header>
                        <div className="mc-card-list lg-list">
              <div className="mc-list-item" style={{background: '#f8fafc'}}>
                <input 
                  type="text" 
                  className="mc-notify-input" 
                  placeholder="Write an announcement..." 
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                />
                <button className="mc-action-btn primary" onClick={handlePostAnnouncement}>Post</button>
              </div>
              
              {notifications.map(notif => (
                <div className="mc-list-item" key={notif._id}>
                  <div className="mc-item-info">
                    <strong>{notif.title}</strong>
                    <p>Posted on {new Date(notif.createdAt).toLocaleDateString('en-GB')} • {notif.target}</p>
                  </div>
                  <span className={`mc-badge ${notif.status === 'Expired' ? 'badge-suspended' : 'badge-active'}`}>
                    {notif.status}
                  </span>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="mc-list-item"><p>No announcements posted yet.</p></div>
              )}
            </div>
          </div>
        );

            case 'Feedback':
        return (
          <div className="mc-tab-content">
            <header className="mc-admin-header">
              <div>
                <h1>Feedback</h1>
                <p>Patient reviews and complaints</p>
              </div>
            </header>
            <div className="mc-card-list">
              {feedbacks.length > 0 ? feedbacks.map(fb => (
                <div className="mc-list-item" key={fb._id} style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                  <div style={{marginBottom: '8px'}}>
                    <strong>{fb.patientName}</strong> <span style={{color: '#f59e0b'}}>{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                  </div>
                  <p style={{margin: 0, color: '#475569'}}>{fb.comment}</p>
                </div>
              )) : (
                <div className="mc-list-item"><p>No feedback available yet.</p></div>
              )}
            </div>
          </div>
        );

      case 'Audit Log':
        return (
          <div className="mc-tab-content">
            <header className="mc-admin-header">
              <div>
                <h1>Audit log</h1>
                <p>Admin and system actions</p>
              </div>
            </header>
                        <div className="mc-card-list">
              {auditLogs.length > 0 ? auditLogs.map(log => (
                <div className="mc-list-item" key={log._id}>
                  <span style={{color: '#64748b', width: '120px'}}>
                    {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                  <strong style={{flex: 1, color: '#0f172a'}}>{log.action}</strong>
                </div>
              )) : (
                <div className="mc-list-item"><p>No audit logs available.</p></div>
              )}
            </div>
          </div>
        );

      case 'System Health':
        return (
          <div className="mc-tab-content">
            <header className="mc-admin-header">
              <div>
                <h1>System health</h1>
                <p>Live infrastructure status</p>
              </div>
            </header>
            
            <div className="mc-health-grid" style={{marginBottom: '32px'}}>
              <div className="mc-health-card">
                <span>API uptime</span>
                <strong><span className="mc-dot green"></span> 99.95%</strong>
              </div>
              <div className="mc-health-card">
                <span>Database connection</span>
                <strong><span className={`mc-dot ${sysHealth ? 'green' : 'red'}`}></span> {sysHealth ? 'Connected' : 'Error'}</strong>
              </div>
              <div className="mc-health-card">
                <span>Jenkins � last build</span>
                <strong><span className="mc-dot green"></span> Passed, 2h ago</strong>
              </div>
              <div className="mc-health-card">
                <span>K8s pods healthy</span>
                <strong><span className="mc-dot green"></span> 6 / 6</strong>
              </div>
            </div>

            <h3 className="mc-subheading">Recent incidents</h3>
            <div className="mc-card-list">
              <div className="mc-list-item">
                <span style={{color: '#64748b', width: '120px'}}>3 days ago</span>
                <strong style={{flex: 1, color: '#0f172a'}}>Brief DB latency spike, resolved in 4 min</strong>
              </div>
              <div className="mc-list-item">
                <span style={{color: '#64748b', width: '120px'}}>1 week ago</span>
                <strong style={{flex: 1, color: '#0f172a'}}>Pod restart after memory limit hit</strong>
              </div>
            </div>
          </div>
        );
      case 'Dashboard':
      default:
        return (
          <div className="mc-tab-content">
            <header className="mc-admin-header">
              <div>
                <h1>Admin overview</h1>
                <p>{today} — MediCore operations at a glance</p>
              </div>
              <div className="mc-admin-badge">Admin • MediCore HQ</div>
            </header>

            <div className="mc-stats-grid">
              <div className="mc-stat-card">
                <span className="label">Total appointments</span>
                <h2>{appointments.length || 1284}</h2>
                <span className="trend positive">+6.2% this week</span>
              </div>
              <div className="mc-stat-card">
                <span className="label">Active patients</span>
                <h2>{activePatients || 932}</h2>
                <span className="trend positive">+18 today</span>
              </div>
              <div className="mc-stat-card">
                <span className="label">Doctors on platform</span>
                <h2>{totalDoctors || 41}</h2>
                <span className="trend neutral">All active</span>
              </div>
              <div className="mc-stat-card">
                <span className="label">No-shows (7d)</span>
                <h2>27</h2>
                <span className="trend negative">2.1% of bookings</span>
              </div>
            </div>

            <section className="mc-section">
              <div className="mc-section-header">
                <h3>User management</h3>
                <span>Patients & doctors</span>
              </div>
              <div className="mc-table-wrapper">
                <table className="mc-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.slice(0, 5).map(u => (
                      <tr key={u._id}>
                        <td><strong>{u.username}</strong></td>
                        <td style={{textTransform: 'capitalize'}}>{u.role || 'Patient'}</td>
                        <td>{new Date(u.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td>
                          <span className={`mc-badge ${u.status === 'suspended' ? 'badge-suspended' : u.status === 'pending' ? 'badge-warning' : 'badge-active'}`}>
                            {u.status || 'Active'}
                          </span>
                        </td>
                        <td>
                          {u.status === 'suspended' ? (
                            <button className="mc-action-btn primary" onClick={() => handleStatusChange(u, 'active')}>Reactivate</button>
                          ) : (
                            <button className="mc-action-btn outline" onClick={() => handleStatusChange(u, 'suspended')}>Suspend</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            
            <div className="mc-split-section">
              <section className="mc-section mc-flex-2">
                <div className="mc-section-header">
                  <h3>Appointment oversight</h3>
                  <span>Filter by date, doctor, status</span>
                </div>
                <div className="mc-card-list">
                  {appointments.slice(0, 3).map(app => (
                    <div className="mc-list-item" key={app._id}>
                      <div className="mc-item-info">
                        <strong><span className={`mc-dot ${app.status === 'Cancelled' ? 'red' : 'green'}`}></span> {app.patientName || 'Patient'} → {app.doctorName}</strong>
                        <p>{app.date || 'Today'}, {app.time || '10:30 AM'} • {app.status}</p>
                      </div>
                      <button className="mc-action-btn outline">Manage</button>
                    </div>
                  ))}
                  {appointments.length === 0 && <div className="mc-list-item"><p>No appointments.</p></div>}
                </div>
              </section>

              <section className="mc-section mc-flex-1">
                <div className="mc-section-header">
                  <h3>Departments</h3>
                  <span>Doctors per dept.</span>
                </div>
                <div className="mc-card-list">
                  <div className="mc-list-item"><span>Cardiology</span><strong>9</strong></div>
                  <div className="mc-list-item"><span>Pediatrics</span><strong>7</strong></div>
                </div>
              </section>
            </div>
            
            <section className="mc-section">
              <div className="mc-section-header">
                <h3>System health</h3>
                <span>Live service status</span>
              </div>
              <div className="mc-health-grid">
                <div className="mc-health-card">
                  <span>API uptime</span>
                  <strong><span className="mc-dot green"></span> 99.95%</strong>
                </div>
                <div className="mc-health-card">
                  <span>Database connection</span>
                  <strong><span className={`mc-dot ${sysHealth ? 'green' : 'red'}`}></span> {sysHealth ? 'Connected' : 'Error'}</strong>
                </div>
                <div className="mc-health-card">
                  <span>Frontend Build</span>
                  <strong><span className="mc-dot green"></span> Passed, 2h ago</strong>
                </div>
                <div className="mc-health-card">
                  <span>Backend Service</span>
                  <strong><span className="mc-dot green"></span> Running</strong>
                </div>
              </div>
            </section>
            
          </div>
        );
    }
  };

  const navItems = ['Dashboard', 'Users', 'Appointments', 'Doctors & Departments', 'Analytics', 'Notifications', 'Feedback', 'Audit Log', 'System Health'];

  return (
    <div className="mc-admin-wrapper">
      <aside className="mc-admin-sidebar">
        <div className="mc-sidebar-brand" onClick={() => navigate('/')}>MediCore</div>
        <nav className="mc-sidebar-nav">
          {navItems.map(item => (
            <a 
              key={item} 
              href="#" 
              className={activeTab === item ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); setActiveTab(item); }}
            >
              {item}
            </a>
          ))}
        </nav>
        <div style={{padding: '24px', fontSize: '13px', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
          Group 76 - DevOps Engineering<br/>
          Signed in as Admin
        </div>
      </aside>

      <main className="mc-admin-main">
        {renderContent()}
      </main>
    </div>
  );
}

export default AdminDashboard;


