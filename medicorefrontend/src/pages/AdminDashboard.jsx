import React, { useState, useEffect } from 'react';
import { getUsers, updateUserStatus, getAppointments, getHealth } from '../api';
import { useNavigate } from 'react-router-dom';

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [usersList, setUsersList] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [sysHealth, setSysHealth] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uData, aData, hData] = await Promise.all([
        getUsers(),
        getAppointments(),
        getHealth().catch(() => null)
      ]);
      setUsersList(uData || []);
      setAppointments(aData || []);
      setSysHealth(hData);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    }
  };

  const handleStatusChange = async (u, forceStatus = null) => {
    try {
      const newStatus = forceStatus || (u.status === 'suspended' ? 'active' : 'suspended');
      await updateUserStatus(u._id, newStatus);
      fetchData(); // refresh
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const totalPatients = usersList.filter(u => u.role !== 'doctor' && u.role !== 'admin').length;
  const totalDoctors = usersList.filter(u => u.role === 'doctor').length;
  const activePatients = usersList.filter(u => u.role !== 'doctor' && u.status === 'active').length;

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
                <select><option>All roles</option><option>Doctors</option><option>Patients</option></select>
                <select><option>All statuses</option><option>Active</option><option>Suspended</option></select>
              </div>
            </header>
            <div className="mc-table-wrapper">
              <table className="mc-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
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
                        <div className="mc-btn-group">
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
                      <button className="mc-action-btn outline">View</button>
                    ) : (
                      <>
                        <button className="mc-action-btn outline">Reschedule</button>
                        <button className="mc-action-btn outline">Cancel</button>
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
        const docs = usersList.filter(u => u.role === 'doctor');
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
                  <strong>{doc.username}</strong>
                  <span>{doc.specialization || 'General Medicine'} • 5 yrs experience</span>
                  <p>Mon-Fri • 9:00-1:00</p>
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
                <input type="text" className="mc-notify-input" placeholder="Write an announcement..." />
                <button className="mc-action-btn primary">Post</button>
              </div>
              <div className="mc-list-item">
                <div className="mc-item-info">
                  <strong>Public holiday — clinics closed 4 Feb</strong>
                  <p>Posted 2 days ago • All users</p>
                </div>
                <span className="mc-badge badge-active">Live</span>
              </div>
              <div className="mc-list-item">
                <div className="mc-item-info">
                  <strong>Scheduled maintenance, Sat 12 AM–2 AM</strong>
                  <p>Posted 5 days ago • All users</p>
                </div>
                <span className="mc-badge badge-active">Live</span>
              </div>
              <div className="mc-list-item">
                <div className="mc-item-info">
                  <strong>New: video consultations now available</strong>
                  <p>Posted 1 week ago • All users</p>
                </div>
                <span className="mc-badge badge-suspended">Expired</span>
              </div>
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
              <div className="mc-list-item" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                <div style={{marginBottom: '8px'}}><strong>K. Jayawardena</strong> <span style={{color: '#f59e0b'}}>?????</span></div>
                <p style={{margin: 0, color: '#475569'}}>Booking was quick and the reminder notification was helpful.</p>
              </div>
              <div className="mc-list-item" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                <div style={{marginBottom: '8px'}}><strong>R. Dissanayake</strong> <span style={{color: '#f59e0b'}}>?????</span></div>
                <p style={{margin: 0, color: '#475569'}}>Had to wait 20 minutes past my slot � scheduling needs tightening.</p>
              </div>
              <div className="mc-list-item" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                <div style={{marginBottom: '8px'}}><strong>A. Silva</strong> <span style={{color: '#f59e0b'}}>?????</span></div>
                <p style={{margin: 0, color: '#475569'}}>Doctor profile info could show more about consultation fees upfront.</p>
              </div>
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
              <div className="mc-list-item">
                <span style={{color: '#64748b', width: '100px'}}>09:14 AM</span>
                <strong style={{flex: 1, color: '#0f172a'}}>Admin approved Dr. N. Perera's registration</strong>
              </div>
              <div className="mc-list-item">
                <span style={{color: '#64748b', width: '100px'}}>08:52 AM</span>
                <strong style={{flex: 1, color: '#0f172a'}}>Admin suspended account � R. Dissanayake</strong>
              </div>
              <div className="mc-list-item">
                <span style={{color: '#64748b', width: '100px'}}>Yesterday</span>
                <strong style={{flex: 1, color: '#0f172a'}}>System: Jenkins pipeline deployed build #142</strong>
              </div>
              <div className="mc-list-item">
                <span style={{color: '#64748b', width: '100px'}}>Yesterday</span>
                <strong style={{flex: 1, color: '#0f172a'}}>Admin posted announcement � scheduled maintenance</strong>
              </div>
              <div className="mc-list-item">
                <span style={{color: '#64748b', width: '100px'}}>2 days ago</span>
                <strong style={{flex: 1, color: '#0f172a'}}>System: K8s auto-scaled backend pods 4 ? 6</strong>
              </div>
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


