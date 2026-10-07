require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Appointment = require('./models/Appointment');
const User = require('./models/User');


const Notification = require('./models/Notification');
const Feedback = require('./models/Feedback');
const AuditLog = require('./models/AuditLog');

const app = express();
const demoDoctors = [
  { _id: 'doc-1', name: 'Dr. Aisha Silva', specialization: 'Cardiology', department: 'Cardiology', email: 'aisha@medicore.com' },
  { _id: 'doc-2', name: 'Dr. Daniel Fernando', specialization: 'Dermatology', department: 'Dermatology', email: 'daniel@medicore.com' },
  { _id: 'doc-3', name: 'Dr. Priya Nair', specialization: 'Neurology', department: 'Neurology', email: 'priya@medicore.com' },
  { _id: 'doc-4', name: 'Dr. Kevin Patel', specialization: 'Dental Care', department: 'Dental Care', email: 'kevin@medicore.com' },
  { _id: 'doc-5', name: 'Dr. Sara Johnson', specialization: 'Gastroenterology', department: 'Gastroenterology', email: 'sara@medicore.com' },
  { _id: 'doc-6', name: 'Dr. Michael Chen', specialization: 'Orthopaedics', department: 'Orthopaedics', email: 'michael@medicore.com' },
  { _id: 'doc-7', name: 'Dr. Olivia Brown', specialization: 'Pulmonology', department: 'Pulmonology', email: 'olivia@medicore.com' },
  { _id: 'doc-8', name: 'Dr. Ravi Kumar', specialization: 'Cardiology', department: 'Cardiology', email: 'ravi@medicore.com' },
  { _id: 'doc-9', name: 'Dr. Emma Wilson', specialization: 'Neurology', department: 'Neurology', email: 'emma@medicore.com' },
  { _id: 'doc-10', name: 'Dr. Grace Thompson', specialization: 'Dental Care', department: 'Dental Care', email: 'grace@medicore.com' },
  { _id: 'doc-11', name: 'Dr. James Walker', specialization: 'Gastroenterology', department: 'Gastroenterology', email: 'james@medicore.com' },
  { _id: 'doc-12', name: 'Dr. Sofia Martinez', specialization: 'Orthopaedics', department: 'Orthopaedics', email: 'sofia@medicore.com' },
  { _id: 'doc-13', name: 'Dr. Lucas Green', specialization: 'Pulmonology', department: 'Pulmonology', email: 'lucas@medicore.com' }
];
const demoAppointments = [];
let demoUsers = [
  { _id: 'admin-1', username: 'System Admin', email: 'admin@medicore.com', password: 'password123', role: 'admin', status: 'active' },
  ...demoDoctors.map((doctor) => ({
    _id: doctor._id,
    username: doctor.name,
    email: doctor.email,
    password: 'doctor123',
    role: 'doctor',
    status: 'active',
    specialization: doctor.specialization,
    department: doctor.department || doctor.specialization
  }))
];

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

connectDB();

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
      const user = { _id: "user-" + Date.now(), username, email, password, role: 'patient', status: 'active' };
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
      _id: "appt-" + Date.now(),
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

app.get('/api/admin/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.status(200).json(users);
    }
    const safeDemoUsers = demoUsers.map(({ password, ...u }) => ({ ...u, role: u.role || 'patient', status: u.status || 'active' }));
    return res.status(200).json(safeDemoUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/admin/users/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
      return res.status(200).json(user);
    }
    const userIndex = demoUsers.findIndex(u => String(u._id) === String(req.params.id));
    if (userIndex !== -1) {
      demoUsers[userIndex].status = status;
      const { password, ...u } = demoUsers[userIndex];
      return res.status(200).json(u);
    }
    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/admin/notifications', async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/admin/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});



