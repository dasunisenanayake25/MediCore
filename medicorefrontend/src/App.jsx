import { useEffect, useState } from "react";

import {
  getDoctors,
  getAppointments,
  createAppointment,
  cancelAppointment,
} from "./api";

function App() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [form, setForm] = useState({
    patientName: "",
    email: "",
    phone: "",
    doctorId: "",
    date: "",
    time: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const doctorsData = await getDoctors();
      const appointmentsData = await getAppointments();

      setDoctors(doctorsData);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the backend server."
      );
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
      await createAppointment(form);

      setMessage(
        "Appointment booked successfully!"
      );

      setForm({
        patientName: "",
        email: "",
        phone: "",
        doctorId: "",
        date: "",
        time: "",
      });

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to book appointment."
      );
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);

      setMessage(
        "Appointment cancelled successfully."
      );

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        "Failed to cancel appointment."
      );
    }
  };

  return (
    <div className="app">

      {/* Header */}

      <header className="header">
        <div className="logo">
          MediCore
        </div>

        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#doctors">Doctors</a>
          <a href="#appointments">
            Appointments
          </a>
        </nav>
      </header>

      {/* Hero */}

      <section className="hero" id="home">
        <h1>
          Smart Healthcare Appointment System
        </h1>

        <p>
          Book and manage your healthcare
          appointments easily.
        </p>
      </section>

      <main className="container">

        {/* Booking */}

        <section>
          <h2 className="section-title">
            Book an Appointment
          </h2>

          <div className="booking-card">

            {message && (
              <div className="success-message">
                {message}
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Patient Name
                  </label>

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
                  <label>
                    Email
                  </label>

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
                  <label>
                    Phone Number
                  </label>

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
                  <label>
                    Doctor
                  </label>

                  <select
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select a doctor
                    </option>

                    {doctors.map((doctor) => (
                      <option
                        key={doctor._id}
                        value={doctor._id}
                      >
                        {doctor.name} -{" "}
                        {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Appointment Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Appointment Time
                  </label>

                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <button
                type="submit"
                className="book-button"
              >
                Book Appointment
              </button>

            </form>
          </div>
        </section>

        {/* Doctors */}

        <section id="doctors">

          <h2 className="section-title">
            Available Doctors
          </h2>

          <div className="doctors-grid">

            {doctors.length === 0 ? (
              <p>
                No doctors available.
              </p>
            ) : (
              doctors.map((doctor) => (
                <div
                  className="doctor-card"
                  key={doctor._id}
                >
                  <h3>
                    {doctor.name}
                  </h3>

                  <p>
                    <strong>
                      Specialization:
                    </strong>{" "}
                    {doctor.specialization}
                  </p>

                  <p>
                    <strong>
                      Email:
                    </strong>{" "}
                    {doctor.email}
                  </p>

                  <p className="available">
                    Available
                  </p>
                </div>
              ))
            )}

          </div>
        </section>

        {/* Appointments */}

        <section id="appointments">

          <h2 className="section-title">
            Appointments
          </h2>

          <div className="appointments-card">

            {appointments.length === 0 ? (
              <p>
                No appointments found.
              </p>
            ) : (
              <table className="appointments-table">

                <thead>
                  <tr>
                    <th>
                      Patient
                    </th>

                    <th>
                      Doctor
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Time
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {appointments.map(
                    (appointment) => (
                      <tr
                        key={appointment._id}
                      >
                        <td>
                          {
                            appointment.patientName
                          }
                        </td>

                        <td>
                          {
                            appointment.doctorId?.name ||
                            "Unknown"
                          }
                        </td>

                        <td>
                          {
                            appointment.date
                          }
                        </td>

                        <td>
                          {
                            appointment.time
                          }
                        </td>

                        <td>
                          {
                            appointment.status
                          }
                        </td>

                        <td>

                          {appointment.status !==
                            "Cancelled" && (
                            <button
                              className="cancel-button"
                              onClick={() =>
                                handleCancel(
                                  appointment._id
                                )
                              }
                            >
                              Cancel
                            </button>
                          )}

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>
            )}

          </div>
        </section>

      </main>

      {/* Footer */}

      <footer className="footer">
        <p>
          © 2026 MediCore - Smart Healthcare
          Appointment System
        </p>
      </footer>

    </div>
  );
}

export default App;