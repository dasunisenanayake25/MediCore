import { FaTooth, FaBrain, FaHeartbeat, FaStethoscope, FaBone, FaLungs, FaPhoneAlt, FaEnvelope, FaUser, FaLock, FaSearch, FaStar, FaCalendarAlt, FaTh, FaList } from "react-icons/fa";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate, Link } from "react-router-dom";

import {
  getDoctors,
  getAppointments,
  createAppointment,
  cancelAppointment,
  registerUser,
  loginUser,
} from "./api";

import heroBannerImg from "./assets/hero-banner.jpg";
import journeyDoctorImg from "./assets/journey-doctor.jpg";
import registerBgImg from "./assets/register-bg.jpg";
import loginBgImg from "./assets/login-bg.jpg";

const initialForm = {
  patientName: "",
  email: "",
  phone: "",
  doctorId: "",
  date: "",
  time: "",
};

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [doctorsData, appointmentsData] = await Promise.all([
        getDoctors(),
        getAppointments(),
      ]);

      setDoctors(doctorsData);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the backend server.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const selectedDoctor = doctors.find((doctor) => doctor._id === form.doctorId);
      const appointmentData = {
        ...form,
        doctorId: form.doctorId,
        doctorName: selectedDoctor ? selectedDoctor.name : "Unknown Doctor",
      };

      await createAppointment(appointmentData);
      setMessage("Appointment booked successfully!");
      setForm(initialForm);
      await loadData();
      navigate("/appointments");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to book appointment.");
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      setMessage("Appointment cancelled successfully.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Failed to cancel appointment.");
    }
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage navigate={navigate} user={user} setUser={setUser} />} />
      <Route path="/register" element={<RegisterPage navigate={navigate} setUser={setUser} />} />
      <Route path="/dashboard" element={<DashboardPage navigate={navigate} user={user} setUser={setUser} />} />
      <Route path="/login" element={<LoginPage navigate={navigate} setUser={setUser} />} />
      <Route
        path="/booking"
        element={
          <BookingPage
            doctors={doctors}
            form={form}
            error={error}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            setError={setError}
            navigate={navigate}
          />
        }
      />
      <Route path="/doctors" element={<DoctorsPage doctors={doctors} navigate={navigate} />} />
      <Route
        path="/appointments"
        element={
          <AppointmentsPage
            appointments={appointments}
            doctors={doctors}
            message={message}
            error={error}
            handleCancel={handleCancel}
            setError={setError}
            navigate={navigate}
          />
        }
      />
    </Routes>
  );
}

function LandingPage({ navigate, user, setUser }) {
  return (
    <div className="landing-layout">
      <header className="landing-header">
        <div className="landing-logo-container">
          <div className="landing-logo">
            <FaStethoscope className="logo-icon" style={{marginRight: "8px", color: "#1d4ed8"}} /> MediCore
          </div>
          <div className="logo-tagline">Care Beyond Measure</div>
        </div>
        <nav className="landing-nav">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/"); }}>Home</a>
          <a href="#">About</a>
          <a href="#">Pages</a>
          <a href="#">Departments</a>
        </nav>
        <div className="auth-buttons">
          {user ? (
            <>
              <span style={{fontWeight: "bold", color: "#1e40af"}}>Hi, {user.username}</span>
              <button className="landing-login-btn" onClick={() => { localStorage.removeItem("user"); setUser(null); }}>Logout</button>
            </>
          ) : (
            <>
              <button className="landing-login-btn" onClick={() => navigate("/login")}>Login</button>
              <button className="landing-reg-btn" onClick={() => navigate("/register")}>Register</button>
            </>
          )}
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-content">
          <h1>Your health,<br/>Our priority</h1>
          <p className="hero-desc">
            Our dedicated team is committed to providing comprehensive and compassionate care, tailored to your unique needs and preferences.
          </p>
          <button className="hero-btn" onClick={() => navigate("/doctors")}>
            Find a doctor
          </button>
        </div>
        <div className="hero-image-wrapper">
          <img src={heroBannerImg} alt="Doctors team" className="hero-img" />
        </div>
      </section>

      <section className="landing-expertise">
        <h2>Expertise & specializations</h2>
        <div className="expertise-grid">
          {[
            { title: "Dental Care", icon: <FaTooth /> },
            { title: "Neurology", icon: <FaBrain /> },
            { title: "Cardiology", icon: <FaHeartbeat /> },
            { title: "Gastroenterology", icon: <FaStethoscope /> },
            { title: "Orthopaedics", icon: <FaBone /> },
            { title: "Pulmonology", icon: <FaLungs /> }
          ].map((item, index) => (
            <div className="expertise-card" key={index}>
              <div className="card-icon" style={{color: "#3b82f6"}}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>Lorem ipsum dolor sit amet, consect adip elit, sed do eiusmod tempor.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-journey">
        <div className="journey-content">
          <h2>Start Your<br/>Wellness Journey<br/>Now</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, standard dummy text ever since the 1500s, when an unknown to the scrambled it to make a type specimen book.
          </p>
          <button className="contact-btn">Contact us <FaPhoneAlt style={{marginLeft: "8px"}}/></button>
        </div>
        <div className="journey-image-wrapper">
          <img src={journeyDoctorImg} alt="Doctor" className="journey-img" />
        </div>
      </section>

      <section className="landing-lab">
        <h2>We Have Lab Test Facilities,<br/>So Book Yours Todays!</h2>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <FaStethoscope style={{marginRight: "8px"}} /> MediCore
            </div>
            <p className="footer-tagline">Care Beyond Measure</p>
          </div>
          
          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="#">Home</a>
            <a href="#">About Us</a>
            <a href="#">Departments</a>
            <a href="#">Contact</a>
          </div>

          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p><FaPhoneAlt /> +1 234 567 8900</p>
            <p><FaEnvelope /> info@medicore.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} MediCore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function DoctorsPage({ doctors, navigate }) {
  const enrichedDoctors = doctors.map((doc, idx) => ({
    ...doc,
    rating: doc.rating || (4.5 + (idx % 5) * 0.1).toFixed(1),
    address: doc.address || "1200 Natalie Brook Apt. 966",
    image: doc.image || `https://i.pravatar.cc/150?img=${idx + 11}`
  }));

  const displayDoctors = enrichedDoctors.length > 0 ? enrichedDoctors : [
    { _id: "d1", name: "Dr. Topon Kumar", specialization: "NEUROLOGIST", rating: "4.5", address: "1200 Natalie Brook Apt. 966", image: "https://i.pravatar.cc/150?img=11" },
    { _id: "d2", name: "Dr. Albert Miles", specialization: "CARDIOLOGIST", rating: "5.0", address: "1200 Natalie Brook Apt. 966", image: "https://i.pravatar.cc/150?img=12" },
    { _id: "d3", name: "Gabriel Holt", specialization: "NEUROLOGIST", rating: "4.8", address: "1200 Natalie Brook Apt. 966", image: "https://i.pravatar.cc/150?img=5" },
    { _id: "d4", name: "Lois Saunders", specialization: "ONCOLOGY", rating: "4.3", address: "1200 Natalie Brook Apt. 966", image: "https://i.pravatar.cc/150?img=14" }
  ];

  return (
    <div className="doctors-layout">
      <div className="doc-topbar">
        <div onClick={() => navigate("/")} style={{cursor: "pointer", display: "flex", alignItems: "center", gap: "12px"}}>
          <FaStethoscope style={{fontSize: "32px", color: "#1d4ed8"}} />
          <div>
            <h2 style={{margin: 0, fontSize: "24px", color: "#1e293b", fontWeight: "bold"}}>MediCore</h2>
            <p style={{fontSize: "12px", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b"}}>Care Beyond Measure</p>
          </div>
        </div>
        <div className="doc-search">
          <input type="text" placeholder="Search Doctor" />
          <FaSearch className="search-icon" />
        </div>
      </div>

      <div className="doc-filter-bar">
        <div className="doc-tabs">
          <span className="doc-tab active">ALL</span>
          <span className="doc-tab">DENTAL CARE</span>
          <span className="doc-tab">NEUROLOGY</span>
          <span className="doc-tab">CARDIOLOGY</span>
          <span className="doc-tab">GASTROENTEROLOGY</span>
          <span className="doc-tab">ORTHOPAEDICS</span>
          <span className="doc-tab">PULMONOLOGY</span>
        </div>
      </div>

      <div className="doc-grid">
        {displayDoctors.map((doc) => (
          <div className="doc-card" key={doc._id}>
            <div className="doc-avatar">
              <img src={doc.image} alt={doc.name} />
            </div>
            
            <h3 className="doc-name">{doc.name}</h3>
            <p className="doc-address">{doc.address}</p>
            
            <div className="doc-spec-pill">
              {doc.specialization.toUpperCase()}
            </div>
            
            <div className="doc-actions">
              <button className="doc-action-btn">
                <FaCalendarAlt className="action-ic" /> Availability
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

function BookingPage({ doctors, form, error, handleChange, handleSubmit, setError, navigate }) {
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
            <p className="eyebrow">Appointment form</p>
            <h2 className="section-title">Applicant Details</h2>
          </div>
          <button type="button" className="secondary-button" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>

        <div className="booking-card">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  value={form.patientName}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Doctor</label>
                <select name="doctorId" value={form.doctorId} onChange={handleChange} required>
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Appointment Date</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Appointment Time</label>
                <input type="time" name="time" value={form.time} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="book-button">
                Book Appointment
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;


function RegisterPage({ navigate, setUser }) {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await registerUser(formData);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user); navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left" style={{ backgroundImage: `url(${registerBgImg})` }}>
        <div className="auth-overlay">
          <div className="auth-brand" onClick={() => navigate("/")} style={{cursor: "pointer"}}>
            <FaStethoscope className="auth-brand-icon" />
            <div className="auth-brand-text">
              <h2>MediCore</h2>
              <p style={{fontSize: "12px", opacity: 0.8, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em"}}>Care Beyond Measure</p>
            </div>
          </div>
          <div className="auth-footer">
            <p>All Right Reserved, 2026</p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <div className="auth-logo-circle">
              <FaStethoscope />
            </div>
            <h2>Sign Up</h2>
            <p>Register a new membership</p>
          </div>

          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); navigate("/"); }}>
            <div className="input-wrapper">
              <label>User Name</label>
              <div className="input-group">
                <FaUser className="input-icon" />
                <input type="text" placeholder="Enter User Name" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
              </div>
            </div>
            <div className="input-wrapper">
              <label>Email</label>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input type="email" placeholder="Enter Email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="input-wrapper">
              <label>Password</label>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input type="password" placeholder="Password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="submit-btn">Sign Up</button>
          </form>

          <p className="auth-switch">
            You already have a membership? <span onClick={() => navigate("/login")}>Log in</span>
          </p>
        </div>

        <div className="auth-bottom-links">
          <a href="#">Contact Us</a> | <a href="#">About Us</a> | <a href="#">FAQ</a>
        </div>
      </div>
    </div>
  );
}





function LoginPage({ navigate, setUser }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(formData);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user); navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left" style={{ backgroundImage: `url(${loginBgImg})` }}>
        <div className="auth-overlay">
          <div className="auth-brand" onClick={() => navigate("/")} style={{cursor: "pointer"}}>
            <FaStethoscope className="auth-brand-icon" />
            <div className="auth-brand-text">
              <h2>MediCore</h2>
              <p style={{fontSize: "12px", opacity: 0.8, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em"}}>Care Beyond Measure</p>
            </div>
          </div>
          <div className="auth-footer">
            <p>All Right Reserved, 2026</p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <div className="auth-logo-circle">
              <FaStethoscope />
            </div>
            <h2>Log In</h2>
            <p>Access your account</p>
          </div>

          <form className="auth-form" onSubmit={(e) => { e.preventDefault(); navigate("/"); }}>
            <div className="input-wrapper">
              <label>Email</label>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input type="email" placeholder="Enter Email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="input-wrapper">
              <label>Password</label>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input type="password" placeholder="Password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="submit-btn" style={{marginTop: "10px"}}>Log In</button>
          </form>

          <p className="auth-switch">
            Don't have an account? <span onClick={() => navigate("/register")}>Sign up</span>
          </p>
        </div>

        <div className="auth-bottom-links">
          <a href="#">Contact Us</a> | <a href="#">About Us</a> | <a href="#">FAQ</a>
        </div>
      </div>
    </div>
  );
}













function DashboardPage({ navigate, user, setUser }) {
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
      </main>
    </div>
  );
}
