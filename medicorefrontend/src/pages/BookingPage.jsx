import React from 'react';

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

export default BookingPage;
