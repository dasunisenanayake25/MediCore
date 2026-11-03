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
import AdminDashboard from "./pages/AdminDashboard";

const initialForm = {
  patientName: "",
  email: "",
  phone: "",
  doctorId: "",
  date: "",
  time: "",
};

const timeToMinutes = (timeValue) => {
  if (!timeValue || typeof timeValue !== "string") return null;

  const cleanedValue = timeValue.trim().replace(/\./g, ":").replace(/\s+/g, " ");
  const meridiemMatch = cleanedValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (meridiemMatch) {
    const hours = Number(meridiemMatch[1]);
    const minutes = Number(meridiemMatch[2]);
    if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
    const normalizedHours = hours % 12;
    return (normalizedHours + 12 * (meridiemMatch[3].toUpperCase() === "PM" ? 1 : 0)) * 60 + minutes;
  }

  const simpleMatch = cleanedValue.match(/^(\d{1,2}):(\d{2})$/);
  if (simpleMatch) {
    const hours = Number(simpleMatch[1]);
    const minutes = Number(simpleMatch[2]);
    if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours * 60 + minutes;
  }

  return null;
};

const isTimeInSchedule = (requestedTime, slotValue) => {
  const requestedMinutes = timeToMinutes(requestedTime);
  if (requestedMinutes === null || !slotValue || typeof slotValue !== "string") return false;

  const rangeMatch = slotValue.trim().match(/^(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))$/i);
  if (rangeMatch) {
    const startMinutes = timeToMinutes(rangeMatch[1]);
    const endMinutes = timeToMinutes(rangeMatch[2]);
    if (startMinutes === null || endMinutes === null) return false;
    if (endMinutes < startMinutes) {
      return requestedMinutes >= startMinutes || requestedMinutes <= endMinutes;
    }
    return requestedMinutes >= startMinutes && requestedMinutes <= endMinutes;
  }

  const slotMinutes = timeToMinutes(slotValue);
  return slotMinutes !== null && requestedMinutes === slotMinutes;
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
      const appointmentDate = form.date;
      const requestedTime = form.time;

      if (!selectedDoctor || !appointmentDate || !requestedTime) {
        setError("Please choose a doctor, date, and appointment time.");
        return;
      }

      const selectedDay = new Date(`${appointmentDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
      const allowedSlots = Array.isArray(selectedDoctor.availability)
        ? selectedDoctor.availability.find((slot) => slot.day === selectedDay)?.slots || []
        : [];

      const normalizedAllowedSlots = allowedSlots.filter(Boolean);
      const isAvailable = normalizedAllowedSlots.some((slot) => isTimeInSchedule(requestedTime, slot));

      if (!normalizedAllowedSlots.length || !isAvailable) {
        setError(
          normalizedAllowedSlots.length
            ? `Doctor is not available at this time. Available slots: ${normalizedAllowedSlots.join(', ')}`
            : 'Doctor is not available at this time.'
        );
        return;
      }

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
      <Route path="/admin" element={<AdminDashboard user={user} />} />
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




























