import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaStethoscope, FaSearch, FaBell, FaCog, FaUserCircle, 
  FaHome, FaCalendarAlt, FaUserInjured, FaUserMd, FaPhoneAlt, 
  FaHospitalAlt, FaNotesMedical, FaCheck, FaTimes, FaEdit 
} from "react-icons/fa";

function AdminDashboard({ user }) {
  const navigate = useNavigate();

  // Dummy data
  const patients = [
    { id: 1, name: "Deena Cooley", age: 65, doc: "Vicki Walsh", dept: "Surgeon", date: "Today", time: "9:30AM", disease: "Diabetes" },
    { id: 2, name: "Jerry Wilcox", age: 73, doc: "April Gallegos", dept: "Gynecologist", date: "Today", time: "9:45AM", disease: "Fever" },
    { id: 3, name: "Eduardo Kramer", age: 84, doc: "Basil Frost", dept: "Psychiatrists", date: "Today", time: "10:00AM", disease: "Cold" },
    { id: 4, name: "Jason Compton", age: 56, doc: "Nannie Guerrero", dept: "Urologist", date: "Today", time: "10:15AM", disease: "Prostate" },
    { id: 5, name: "Emmitt Bryan", age: 49, doc: "Daren Andrade", dept: "Cardiology", date: "Today", time: "10:30AM", disease: "Asthma" },
  ];

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand" onClick={() => navigate('/')}>
          <FaStethoscope className="brand-icon" />
          <span>MediCore</span>
        </div>
        
        <div className="admin-profile-mini">
          <img src="https://i.pravatar.cc/150?img=32" alt="Admin" />
          <h4>Ema Wilson</h4>
          <p>Department Admin</p>
        </div>

        <nav className="admin-nav">
          <div className="nav-group">
            <a href="#" className="nav-item active"><FaHome /> Medical Dashboard</a>
            <a href="#" className="nav-item"><FaHospitalAlt /> Clinic Dashboard</a>
            <a href="#" className="nav-item"><FaCalendarAlt /> Appointments</a>
          </div>
          <div className="nav-group">
            <p className="nav-label">Doctors</p>
            <a href="#" className="nav-item"><FaUserMd /> Doctors Grid</a>
            <a href="#" className="nav-item"><FaNotesMedical /> Add Doctor</a>
          </div>
          <div className="nav-group">
            <p className="nav-label">Patients</p>
            <a href="#" className="nav-item"><FaUserInjured /> Patients List</a>
            <a href="#" className="nav-item"><FaNotesMedical /> Add Patient</a>
          </div>
        </nav>

        <div className="admin-emergency">
          <FaPhoneAlt style={{marginRight: '8px'}} /> Emergency Contact<br/>
          <strong>0987654321</strong>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="admin-content-wrapper">
        {/* HEADER */}
        <header className="admin-header">
          <div className="admin-search">
            <FaSearch className="search-ic" />
            <input type="text" placeholder="Search..." />
          </div>
          <div className="admin-header-icons">
            <FaBell className="hd-ic" />
            <FaCog className="hd-ic" />
            <div className="hd-profile">
              <img src="https://i.pravatar.cc/150?img=32" alt="Profile" />
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <main className="admin-main">
          
          <div className="admin-hero-banner">
            <div className="hero-text">
              <p>Good Morning,</p>
              <h2>Dr. Ema Wilson</h2>
              <p>Your schedule today.</p>
              <div className="hero-stats">
                <div className="stat-pill"><FaCalendarAlt/> 86 Appointments</div>
                <div className="stat-pill"><FaNotesMedical/> 23 Surgeries</div>
              </div>
            </div>
            <div className="hero-chart-placeholder">
              <h3>Patients</h3>
              <div className="fake-line-chart"></div>
              <p>Increased patients by 98 in the last Seven days.</p>
            </div>
          </div>

          <div className="admin-grid-top">
            <div className="admin-card">
              <h3>Doctors</h3>
              <ul className="admin-doc-list">
                <li><img src="https://i.pravatar.cc/150?img=11" alt="doc"/> <div><strong>Dr. Smith Chang</strong><br/><span>Cardiology</span></div> <span className="status avail">Available</span></li>
                <li><img src="https://i.pravatar.cc/150?img=12" alt="doc"/> <div><strong>Dr. Dmitriy Groshev</strong><br/><span>Orthopedics</span></div> <span className="status avail">Available</span></li>
                <li><img src="https://i.pravatar.cc/150?img=13" alt="doc"/> <div><strong>Dr. Sheryl Glass</strong><br/><span>Dermatology</span></div> <span className="status unavail">Not Available</span></li>
              </ul>
            </div>
            
            <div className="admin-card">
              <h3>Consultation</h3>
              <div className="donut-chart-mock">
                <div className="donut-circle"><span>80%</span><br/>New: 600</div>
              </div>
              <div className="gender-stats">
                <div className="g-stat"><FaUserCircle/> 86 Male</div>
                <div className="g-stat"><FaUserCircle/> 38 Female</div>
              </div>
            </div>
          </div>

          <div className="admin-card table-card">
            <h3>Patients</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th><th>Patient Name</th><th>Age</th><th>Consulting Doctor</th><th>Department</th><th>Date</th><th>Time</th><th>Disease</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td>0{p.id}</td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.age}</td>
                    <td><div className="tbl-doc"><img src={`https://i.pravatar.cc/150?img=${p.id + 20}`} alt="doc"/> {p.doc}</div></td>
                    <td>{p.dept}</td>
                    <td>{p.date}</td>
                    <td>{p.time}</td>
                    <td>{p.disease}</td>
                    <td>
                      <div className="tbl-actions">
                        <button className="act-btn accept"><FaCheck/></button>
                        <button className="act-btn reject"><FaTimes/></button>
                        <button className="act-btn edit"><FaEdit/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;

