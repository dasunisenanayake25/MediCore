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
  {
    _id: 'doc-1',
    name: 'Dr. Aisha Silva',
    specialization: 'Cardiology',
    department: 'Cardiology',
    email: 'aisha@medicore.com',
    experience: '12 years',
    address: 'No. 15, Colombo 03',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
    availability: [
      { day: 'Mon', slots: ['09:00 AM', '11:00 AM', '02:00 PM'] },
      { day: 'Wed', slots: ['10:00 AM', '01:00 PM'] },
      { day: 'Fri', slots: ['09:30 AM', '03:00 PM'] }
    ]
  },
  {
    _id: 'doc-2',
    name: 'Dr. Ravi Kumar',
    specialization: 'Cardiology',
    department: 'Cardiology',
    email: 'ravi@medicore.com',
    experience: '14 years',
    address: 'No. 88, Jaffna',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    availability: [
      { day: 'Tue', slots: ['09:00 AM', '12:00 PM'] },
      { day: 'Thu', slots: ['11:00 AM', '02:30 PM'] },
      { day: 'Sat', slots: ['10:00 AM'] }
    ]
  },
  {
    _id: 'doc-3',
    name: 'Dr. Daniel Fernando',
    specialization: 'Dermatology',
    department: 'Dermatology',
    email: 'daniel@medicore.com',
    experience: '10 years',
    address: 'No. 28, Kandy Road',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80',
    availability: [
      { day: 'Mon', slots: ['08:30 AM', '01:30 PM'] },
      { day: 'Thu', slots: ['09:00 AM', '03:00 PM'] },
      { day: 'Fri', slots: ['10:30 AM'] }
    ]
  },
  {
    _id: 'doc-4',
    name: 'Dr. Sarah Lee',
    specialization: 'Dermatology',
    department: 'Dermatology',
    email: 'sarah@medicore.com',
    experience: '8 years',
    address: 'No. 33, Dehiwala',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    availability: [
      { day: 'Tue', slots: ['09:30 AM', '12:30 PM', '04:00 PM'] },
      { day: 'Wed', slots: ['10:00 AM'] },
      { day: 'Sat', slots: ['08:00 AM', '11:30 AM'] }
    ]
  },
  {
    _id: 'doc-5',
    name: 'Dr. Priya Nair',
    specialization: 'Neurology',
    department: 'Neurology',
    email: 'priya@medicore.com',
    experience: '11 years',
    address: 'No. 42, Galle Face',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=80',
    availability: [
      { day: 'Mon', slots: ['10:00 AM', '02:00 PM'] },
      { day: 'Wed', slots: ['09:00 AM', '01:30 PM'] },
      { day: 'Fri', slots: ['11:00 AM'] }
    ]
  },
  {
    _id: 'doc-6',
    name: 'Dr. James Walker',
    specialization: 'Neurology',
    department: 'Neurology',
    email: 'james@medicore.com',
    experience: '11 years',
    address: 'No. 45, Kadawatha',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=800&q=80',
    availability: [
      { day: 'Tue', slots: ['08:00 AM', '12:00 PM'] },
      { day: 'Thu', slots: ['09:30 AM', '02:00 PM'] },
      { day: 'Sun', slots: ['10:30 AM'] }
    ]
  },
  {
    _id: 'doc-7',
    name: 'Dr. Kevin Patel',
    specialization: 'Dental Care',
    department: 'Dental Care',
    email: 'kevin@medicore.com',
    experience: '8 years',
    address: 'No. 09, Mount Lavinia',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    availability: [
      { day: 'Mon', slots: ['09:00 AM', '12:00 PM'] },
      { day: 'Tue', slots: ['10:00 AM', '03:00 PM'] },
      { day: 'Thu', slots: ['08:30 AM'] }
    ]
  },
  {
    _id: 'doc-8',
    name: 'Dr. Grace Thompson',
    specialization: 'Dental Care',
    department: 'Dental Care',
    email: 'grace@medicore.com',
    experience: '7 years',
    address: 'No. 31, Malabe',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    availability: [
      { day: 'Wed', slots: ['08:00 AM', '11:00 AM'] },
      { day: 'Fri', slots: ['09:00 AM', '02:00 PM'] },
      { day: 'Sat', slots: ['10:00 AM'] }
    ]
  },
  {
    _id: 'doc-9',
    name: 'Dr. Sara Johnson',
    specialization: 'Gastroenterology',
    department: 'Gastroenterology',
    email: 'sara@medicore.com',
    experience: '9 years',
    address: 'No. 17, Negombo',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    availability: [
      { day: 'Mon', slots: ['09:30 AM', '01:00 PM'] },
      { day: 'Tue', slots: ['11:00 AM'] },
      { day: 'Thu', slots: ['08:30 AM', '02:30 PM'] }
    ]
  },
  {
    _id: 'doc-10',
    name: 'Dr. Michael Chen',
    specialization: 'Gastroenterology',
    department: 'Gastroenterology',
    email: 'michael@medicore.com',
    experience: '13 years',
    address: 'No. 11, Bambalapitiya',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    availability: [
      { day: 'Wed', slots: ['09:00 AM', '12:30 PM'] },
      { day: 'Fri', slots: ['10:00 AM', '01:30 PM'] },
      { day: 'Sun', slots: ['09:00 AM'] }
    ]
  },
  {
    _id: 'doc-11',
    name: 'Dr. Sofia Martinez',
    specialization: 'Orthopaedics',
    department: 'Orthopaedics',
    email: 'sofia@medicore.com',
    experience: '10 years',
    address: 'No. 58, Kurunegala',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    availability: [
      { day: 'Tue', slots: ['08:30 AM', '01:00 PM'] },
      { day: 'Thu', slots: ['10:30 AM', '02:00 PM'] },
      { day: 'Sat', slots: ['09:00 AM'] }
    ]
  },
  {
    _id: 'doc-12',
    name: 'Dr. Olivia Brown',
    specialization: 'Orthopaedics',
    department: 'Orthopaedics',
    email: 'olivia@medicore.com',
    experience: '10 years',
    address: 'No. 67, Nugegoda',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    availability: [
      { day: 'Mon', slots: ['08:00 AM', '11:30 AM'] },
      { day: 'Thu', slots: ['09:00 AM', '02:00 PM'] },
      { day: 'Sat', slots: ['10:00 AM', '03:00 PM'] }
    ]
  },
  {
    _id: 'doc-13',
    name: 'Dr. Lucas Green',
    specialization: 'Pulmonology',
    department: 'Pulmonology',
    email: 'lucas@medicore.com',
    experience: '12 years',
    address: 'No. 76, Wanathamulla',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    availability: [
      { day: 'Tue', slots: ['09:00 AM', '12:00 PM'] },
      { day: 'Wed', slots: ['10:00 AM', '03:00 PM'] },
      { day: 'Fri', slots: ['09:30 AM'] }
    ]
  },
  {
    _id: 'doc-14',
    name: 'Dr. Maya Patel',
    specialization: 'Pulmonology',
    department: 'Pulmonology',
    email: 'maya@medicore.com',
    experience: '9 years',
    address: 'No. 20, Kalubowila',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    availability: [
      { day: 'Mon', slots: ['10:30 AM', '01:00 PM'] },
      { day: 'Wed', slots: ['09:00 AM', '02:00 PM'] },
      { day: 'Sat', slots: ['11:00 AM'] }
    ]
  }
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

app.patch('/api/admin/doctors/:id/availability', (req, res) => {
  const { availability } = req.body;
  const doctorIndex = demoDoctors.findIndex((doctor) => String(doctor._id) === String(req.params.id));

  if (doctorIndex === -1) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const normalizedAvailability = Array.isArray(availability) ? availability : [];
  demoDoctors[doctorIndex].availability = normalizedAvailability;

  return res.status(200).json(demoDoctors[doctorIndex]);
});

app.patch('/api/admin/doctors/:id', (req, res) => {
  const doctorIndex = demoDoctors.findIndex((doctor) => String(doctor._id) === String(req.params.id));

  if (doctorIndex === -1) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  demoDoctors[doctorIndex] = {
    ...demoDoctors[doctorIndex],
    ...req.body,
    availability: Array.isArray(req.body.availability) ? req.body.availability : demoDoctors[doctorIndex].availability || []
  };

  return res.status(200).json(demoDoctors[doctorIndex]);
});

app.patch('/api/admin/appointments/:id', (req, res) => {
  const appointmentIndex = demoAppointments.findIndex((appointment) => String(appointment._id) === String(req.params.id));

  if (appointmentIndex === -1) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  demoAppointments[appointmentIndex] = {
    ...demoAppointments[appointmentIndex],
    ...req.body,
    updatedAt: new Date()
  };

  return res.status(200).json(demoAppointments[appointmentIndex]);
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



