import React, { useEffect, useState } from 'react';
import { getPublicNotifications } from '../api';

function DashboardPage({ navigate, user, setUser }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getPublicNotifications();
        setNotifications(data || []);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="logo" onClick={() => navigate("/")} style={{cursor: "pointer"}}>MediCore</div>
        <nav className="nav">
          <button type="button" className="nav-button" onClick={() => navigate("/")}>
            Home
          </button>
          <button type="button" className="nav-button" onClick={() => { localStorage.removeItem("user"); setUser(null); navigate("/"); }}>
            Logout
          </button>
        </nav>
      </header>

      <main className="container page-content">
        <div className="dash-hero-card">
          <p className="dash-eyebrow">HEALTHCARE MADE SIMPLE</p>
          <h1>Book medical appointments with confidence.</h1>
          <p className="dash-subtitle">
            MediCore helps patients quickly schedule visits with trusted doctors, explore available
            specialists, and manage appointments in one place.
          </p>
          <div className="dash-actions">
            <button className="book-button" onClick={() => navigate("/booking")}>Book an Appointment</button>
            <button className="secondary-button" onClick={() => navigate("/doctors")}>View Doctors</button>
            <button className="secondary-button" onClick={() => navigate("/appointments")}>View Appointments</button>
          </div>
        </div>

        <div className="dash-info-cards">
          <div className="dash-info-card">
            <h3>What this app does</h3>
            <p>Patients can browse doctor profiles, choose a preferred date and time, and reserve a medical appointment in seconds.</p>
          </div>
          <div className="dash-info-card">
            <h3>Why it matters</h3>
            <p>It reduces waiting, makes scheduling easier, and keeps appointment information organized for both patients and healthcare staff.</p>
          </div>
          <div className="dash-info-card">
            <h3>Who it is for</h3>
            <p>Ideal for clinics, hospitals, and patients who want a smooth digital appointment booking experience without confusion.</p>
          </div>
        </div>

        <div className="dash-info-card" style={{ marginTop: '24px' }}>
          <h3>Latest announcements</h3>
          {notifications.length === 0 ? (
            <p>No announcements have been posted yet.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '10px' }}>
              {notifications.map((item) => (
                <li key={item._id}>
                  <strong>{item.title}</strong>
                  <div style={{ color: '#475569', fontSize: '0.9rem' }}>
                    {new Date(item.createdAt).toLocaleDateString('en-GB')} • {item.target || 'All users'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
