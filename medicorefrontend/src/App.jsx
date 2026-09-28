import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";

import {
  getDoctors,
  getAppointments,
  createAppointment,
  cancelAppointment,
} from "./api";

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
      <Route path="/" element={<LandingPage navigate={navigate} />} />
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

function LandingPage({ navigate }) {
  return (
    <div className="app">
      <header className="header">
        <div className="logo">MediCore</div>
        <nav className="nav">
          <button type="button" className="nav-button" onClick={() => navigate("/")}>
            Home
          </button>
          <button type="button" className="nav-button" onClick={() => navigate("/doctors")}>
            Doctors
          </button>
          <button type="button" className="nav-button" onClick={() => navigate("/appointments")}>
            Appointments
          </button>
        </nav>
      </header>

      <main className="container landing-page">
        <section className="hero-card">
          <p className="eyebrow">Your health, our focus</p>
          <h1>Healthcare that feels personal</h1>
          <p className="intro-text">
            Schedule consultations, discover trusted specialists, and manage your care in one
            simple place.
          </p>

          <div className="action-row">
            <button type="button" className="primary-button" onClick={() => navigate("/booking")}>
              Book Appointment
            </button>
            <button type="button" className="secondary-button" onClick={() => navigate("/doctors")}>
              View Doctors
            </button>
          </div>
        </section>

        <section className="feature-grid">
          <article className="feature-card">
            <h3>Trusted Doctors</h3>
            <p>Meet skilled specialists for every stage of your care journey.</p>
          </article>

          <article className="feature-card">
            <h3>Easy Booking</h3>
            <p>Reserve your appointment in a few quick steps with a smooth experience.</p>
          </article>

          <article className="feature-card">
            <h3>Care Dashboard</h3>
            <p>Track bookings and stay organized with a clear appointment overview.</p>
          </article>
        </section>
      </main>
    </div>
  );
}

function DoctorsPage({ doctors, navigate }) {
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
            <p className="eyebrow">Our specialists</p>
            <h2 className="section-title">Doctors</h2>
          </div>
          <button type="button" className="secondary-button" onClick={() => navigate("/booking")}>
            Book Appointment
          </button>
        </div>

        <div className="doctors-grid">
          {doctors.length === 0 ? (
            <p>No doctors available.</p>
          ) : (
            doctors.map((doctor) => (
              <div className="doctor-card" key={doctor._id}>
                <h3>{doctor.name}</h3>
                <p>
                  <strong>Specialization:</strong> {doctor.specialization}
                </p>
                <p>
                  <strong>Email:</strong> {doctor.email}
                </p>
                <p className="available">Available</p>
              </div>
            ))
          )}
        </div>
      </main>
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