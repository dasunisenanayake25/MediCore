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

import LandingPage from "./pages/LandingPage";
import DoctorsPage from "./pages/DoctorsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import BookingPage from "./pages/BookingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

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









export default App;
























