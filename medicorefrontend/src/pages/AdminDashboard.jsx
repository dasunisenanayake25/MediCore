import React, { useState, useEffect } from 'react';
import { getUsers, updateUserStatus } from '../api';
import { useNavigate } from 'react-router-dom';
import { 
  FaStethoscope, FaSearch, FaBell, FaCog, FaUserCircle, 
  FaHome, FaCalendarAlt, FaUserInjured, FaUserMd, FaPhoneAlt, 
  FaHospitalAlt, FaNotesMedical, FaCheck, FaTimes, FaEdit 
} from "react-icons/fa";

function AdminDashboard({ user }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsersList(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateUserStatus(id, newStatus);
      fetchUsers(); // refresh
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };


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
        
        

        <nav className="admin-nav">
          <div className="nav-group">
            <a href="#" className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("dashboard"); }}><FaHome /> Medical Dashboard</a>
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
            <a href="#" className={`nav-item ${activeTab === "users" ? "active" : ""}`} onClick={(e) => { e.preventDefault(); setActiveTab("users"); }}><FaUserInjured /> User Management</a>
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
            
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <main className="admin-main">
          
          
          {activeTab === 'dashboard' ? (
            <>
              
                

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
                <h3>Recent Activity</h3>
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
            </>
          ) : (
            <div className="admin-card table-card">
              <h3 style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                User Management (Patients & Doctors)
              </h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u, idx) => (
                    <tr key={u._id}>
                      <td>{u._id.substring(0,8)}...</td>
                      <td><strong>{u.username}</strong></td>
                      <td>{u.email}</td>
                      <td style={{textTransform: 'capitalize'}}>{u.role || 'Patient'}</td>
                      <td>
                        <span className={`status ${u.status === 'suspended' ? 'unavail' : 'avail'}`}>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td>
                        <div className="tbl-actions">
                          {u.status === 'suspended' ? (
                            <button className="act-btn accept" onClick={() => handleStatusChange(u._id, 'active')} title="Activate"><FaCheck/></button>
                          ) : (
                            <button className="act-btn reject" onClick={() => handleStatusChange(u._id, 'suspended')} title="Suspend"><FaTimes/></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center'}}>No users found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}


        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;



