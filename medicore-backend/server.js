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

const User = require('./models/User');
let demoUsers = [];

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
      const user = await User.create({ username, email, password });
      return res.status(201).json({ _id: user._id, username: user.username, email: user.email });
    } else {
      if (demoUsers.find(u => u.email === email)) return res.status(400).json({ message: 'User already exists' });
      const user = { _id: \user-\+\Date.now(), username, email, password };
      demoUsers.push(user);
      return res.status(201).json({ _id: user._id, username: user.username, email: user.email });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email, password });
    } else {
      user = demoUsers.find(u => u.email === email && u.password === password);
    }
    
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    res.status(200).json({ _id: user._id, username: user.username, email: user.email, token: 'mock-jwt-token-123' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'MediCore Backend' });
});

app.get('/api/doctors', (req, res) => {
  res.status(200).json(demoDoctors);
});

app.post('/api/appointments', async (req, res) => {
  try {
    const selectedDoctor = demoDoctors.find(
      (doctor) => String(doctor._id) === String(req.body.doctorId)
    );

    const payload = {
      ...req.body,
      doctorId: req.body.doctorId || (selectedDoctor ? selectedDoctor._id : ''),
      doctorName: req.body.doctorName || (selectedDoctor ? selectedDoctor.name : 'Unknown Doctor'),
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
