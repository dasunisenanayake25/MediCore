require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Appointment = require('./models/Appointment');

const app = express();
const demoDoctors = [
  { _id: 'doc-1', name: 'Dr. Aisha Silva', specialization: 'Cardiology', email: 'aisha@medicore.com' },
  { _id: 'doc-2', name: 'Dr. Daniel Fernando', specialization: 'Dermatology', email: 'daniel@medicore.com' },
  { _id: 'doc-3', name: 'Dr. Priya Nair', specialization: 'Neurology', email: 'priya@medicore.com' }
];
const demoAppointments = [];

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

connectDB();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'MediCore Backend' });
});

app.get('/api/doctors', (req, res) => {
  res.status(200).json(demoDoctors);
});

app.post('/api/appointments', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      status: req.body.status || 'Pending',
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      const newAppointment = await Appointment.create(payload);
      return res.status(201).json(newAppointment);
    }

    const newAppointment = {
      _id: `appt-${Date.now()}`,
      ...payload
    };

    demoAppointments.unshift(newAppointment);
    return res.status(201).json(newAppointment);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/api/appointments', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const appointments = await Appointment.find().sort({ createdAt: -1 });
      return res.status(200).json(appointments);
    }

    return res.status(200).json(demoAppointments);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch('/api/appointments/:id/cancel', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const updatedAppointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status: 'Cancelled' },
        { new: true }
      );

      if (!updatedAppointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      return res.status(200).json(updatedAppointment);
    }

    const appointmentIndex = demoAppointments.findIndex(
      (appointment) => String(appointment._id) === String(req.params.id)
    );

    if (appointmentIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    demoAppointments[appointmentIndex].status = 'Cancelled';
    return res.status(200).json(demoAppointments[appointmentIndex]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});