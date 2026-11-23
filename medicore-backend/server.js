require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
const hasMongoConnection = () => Boolean(process.env.MONGO_URI) && mongoose.connection.readyState === 1;

const normalizeTimeString = (timeValue) => {
  if (!timeValue || typeof timeValue !== 'string') return null;

  const trimmedValue = timeValue.trim().replace(/\./g, ':').replace(/\s+/g, ' ');
  if (!trimmedValue) return null;

  const meridiemMatch = trimmedValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (meridiemMatch) {
    const hours = Number(meridiemMatch[1]);
    const minutes = Number(meridiemMatch[2]);

    if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      return null;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${meridiemMatch[3].toUpperCase()}`;
  }

  const [hoursString, minutesString] = trimmedValue.split(':');
  if (hoursString === undefined || minutesString === undefined) return null;

  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const adjustedHour = hours % 12 || 12;
  return `${String(adjustedHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

const normalizeSlotString = (slotValue) => {
  if (!slotValue || typeof slotValue !== 'string') return null;

  const trimmedValue = slotValue.trim().replace(/\./g, ':').replace(/\s+/g, ' ');
  if (!trimmedValue) return null;

  if (/^\d{1,2}:\d{2}\s*(?:AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM)$/i.test(trimmedValue)) {
    return trimmedValue;
  }

  return normalizeTimeString(trimmedValue) || trimmedValue;
};

const timeToMinutes = (timeValue) => {
  if (!timeValue || typeof timeValue !== 'string') return null;

  const cleanedValue = timeValue.trim().replace(/\./g, ':').replace(/\s+/g, ' ');
  const meridiemMatch = cleanedValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (meridiemMatch) {
    const hours = Number(meridiemMatch[1]);
    const minutes = Number(meridiemMatch[2]);
    if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
    const normalizedHours = hours % 12;
    return (normalizedHours + 12 * (meridiemMatch[3].toUpperCase() === 'PM' ? 1 : 0)) * 60 + minutes;
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

const isTimeWithinSlot = (requestedTime, slotValue) => {
  const requestedMinutes = timeToMinutes(requestedTime);
  if (requestedMinutes === null || !slotValue || typeof slotValue !== 'string') return false;

  const cleanedSlot = slotValue.trim();
  const rangeMatch = cleanedSlot.match(/^(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))$/i);
  if (rangeMatch) {
    const startMinutes = timeToMinutes(rangeMatch[1]);
    const endMinutes = timeToMinutes(rangeMatch[2]);
    if (startMinutes === null || endMinutes === null) return false;
    if (endMinutes < startMinutes) {
      return requestedMinutes >= startMinutes || requestedMinutes <= endMinutes;
    }
    return requestedMinutes >= startMinutes && requestedMinutes <= endMinutes;
  }

  const slotMinutes = timeToMinutes(cleanedSlot);
  if (slotMinutes === null) return false;
  return requestedMinutes === slotMinutes;
};

const getDoctorAvailabilityForDate = (doctor, appointmentDate) => {
  if (!doctor || !doctor.availability || !appointmentDate) return [];

  const date = new Date(`${appointmentDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return [];

  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const availabilityEntry = doctor.availability.find((slot) => slot.day === weekday);

  return Array.isArray(availabilityEntry?.slots) ? availabilityEntry.slots : [];
};

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
let demoNotifications = [
  {
    _id: 'notice-1',
    title: 'Welcome to MediCore! Please keep your profile details updated for a smoother visit.',
    target: 'All users',
    status: 'Live',
    createdAt: new Date().toISOString()
  }
];
const _adminHash = bcrypt.hashSync('password123', 10);
const _doctorHash = bcrypt.hashSync('doctor123', 10);
let demoUsers = [
  { _id: 'admin-1', username: 'System Admin', email: 'admin@medicore.com', password: _adminHash, role: 'admin', status: 'active' },
  ...demoDoctors.map((doctor) => ({
    _id: doctor._id,
    username: doctor.name,
    email: doctor.email,
    password: _doctorHash,
    role: 'doctor',
    status: 'active',
    specialization: doctor.specialization,
    department: doctor.department || doctor.specialization
  }))
];

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'medicore_dev_secret';
    req.user = jwt.verify(token, secret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator access required.' });
  }

  return next();
};

connectDB();

app.post('/api/auth/register', async (req, res) => {
  const username = String(req.body?.username || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!username || !email || password.length < 8) {
    return res.status(400).json({ message: 'Username, email, and a password of at least 8 characters are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
      const user = await User.create({ username, email, password: hashedPassword });
      const token = jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'medicore_dev_secret',
        { expiresIn: '7d' }
      );
      return res.status(201).json({ _id: user._id, username: user.username, email: user.email, role: user.role, token });
    } else {
      if (demoUsers.find(u => u.email === email)) return res.status(400).json({ message: 'User already exists' });
      const user = { _id: 'user-' + Date.now(), username, email, password: hashedPassword, role: 'patient', status: 'active' };
      demoUsers.push(user);
      const token = jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'medicore_dev_secret',
        { expiresIn: '7d' }
      );
      return res.status(201).json({ _id: user._id, username: user.username, email: user.email, role: user.role, token });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '').trim();

  try {
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email });
    }
    if (!user) {
      user = demoUsers.find(
        u => String(u.email).toLowerCase() === email
      );
    }

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status === 'suspended') return res.status(403).json({ message: 'This account has been suspended.' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const secret = process.env.JWT_SECRET || 'medicore_dev_secret';
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      secret,
      { expiresIn: '7d' }
    );

    res.status(200).json({ _id: user._id, username: user.username, email: user.email, role: user.role, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'MediCore Backend' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'MediCore Backend' });
});

app.get('/api/doctors', (req, res) => {
  if (!hasMongoConnection()) {
    return res.status(200).json(demoDoctors);
  }

  User.find({ role: 'doctor' }).select('-password').lean()
    .then((databaseDoctors) => res.status(200).json([
      ...databaseDoctors.map((doctor) => ({
        ...doctor,
        _id: String(doctor._id),
        name: doctor.username,
        availability: doctor.availability || [],
      })),
      ...demoDoctors,
    ]))
    .catch((error) => res.status(500).json({ message: error.message }));
});

app.post('/api/admin/doctors', authenticateToken, requireAdmin, async (req, res) => {
  const { name, email, password, specialization, department, experience, address } = req.body;

  if (!name || !email || !password || !specialization) {
    return res.status(400).json({ message: 'Name, email, password, and specialization are required.' });
  }

  try {
    if (!hasMongoConnection()) {
      const normalizedEmail = email.trim().toLowerCase();
      if (demoUsers.some((user) => String(user.email).toLowerCase() === normalizedEmail)) {
        return res.status(409).json({ message: 'A user with this email already exists.' });
      }

      const doctor = {
        _id: `doc-${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        specialization: specialization.trim(),
        department: (department || specialization).trim(),
        experience: (experience || '').trim(),
        address: (address || '').trim(),
        availability: []
      };
      demoDoctors.push(doctor);
      demoUsers.push({
        _id: doctor._id,
        username: doctor.name,
        email: doctor.email,
        password: await bcrypt.hash(password, 10),
        role: 'doctor',
        status: 'active',
        specialization: doctor.specialization,
        department: doctor.department
      });

      return res.status(201).json(doctor);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const doctor = await User.create({
      username: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      role: 'doctor',
      status: 'active',
      specialization: specialization.trim(),
      department: (department || specialization).trim(),
      experience: (experience || '').trim(),
      address: (address || '').trim(),
      availability: [],
    });

    const safeDoctor = doctor.toObject();
    delete safeDoctor.password;
    return res.status(201).json({
      ...safeDoctor,
      _id: String(safeDoctor._id),
      name: safeDoctor.username,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.patch('/api/admin/doctors/:id/availability', authenticateToken, requireAdmin, async (req, res) => {
  const { availability } = req.body;
  if (hasMongoConnection() && mongoose.isValidObjectId(req.params.id)) {
    const doctor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'doctor' },
      { availability: Array.isArray(availability) ? availability : [] },
      { new: true }
    ).select('-password').lean();

    if (doctor) {
      return res.status(200).json({ ...doctor, _id: String(doctor._id), name: doctor.username });
    }
  }

  const doctorIndex = demoDoctors.findIndex((doctor) => String(doctor._id) === String(req.params.id));

  if (doctorIndex === -1) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  const normalizedAvailability = Array.isArray(availability) ? availability : [];
  demoDoctors[doctorIndex].availability = normalizedAvailability;

  return res.status(200).json(demoDoctors[doctorIndex]);
});

app.patch('/api/admin/doctors/:id', authenticateToken, requireAdmin, async (req, res) => {
  if (hasMongoConnection() && mongoose.isValidObjectId(req.params.id)) {
    const updates = {};
    ['name', 'specialization', 'department', 'experience', 'address'].forEach((field) => {
      if (req.body[field] !== undefined) updates[field === 'name' ? 'username' : field] = req.body[field];
    });

    const doctor = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'doctor' },
      updates,
      { new: true }
    ).select('-password').lean();

    if (doctor) {
      return res.status(200).json({ ...doctor, _id: String(doctor._id), name: doctor.username });
    }
  }

  const doctorIndex = demoDoctors.findIndex((doctor) => String(doctor._id) === String(req.params.id));

  if (doctorIndex === -1) {
    return res.status(404).json({ message: 'Doctor not found' });
  }

  demoDoctors[doctorIndex] = {
    ...demoDoctors[doctorIndex],
    ...(req.body.name !== undefined ? { name: String(req.body.name).trim() } : {}),
    ...(req.body.specialization !== undefined ? { specialization: String(req.body.specialization).trim() } : {}),
    ...(req.body.department !== undefined ? { department: String(req.body.department).trim() } : {}),
    ...(req.body.experience !== undefined ? { experience: String(req.body.experience).trim() } : {}),
    ...(req.body.address !== undefined ? { address: String(req.body.address).trim() } : {}),
    availability: Array.isArray(req.body.availability) ? req.body.availability : demoDoctors[doctorIndex].availability || []
  };

  return res.status(200).json(demoDoctors[doctorIndex]);
});

app.delete('/api/admin/doctors/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (hasMongoConnection() && mongoose.isValidObjectId(req.params.id)) {
      const deletedDoctor = await User.findOneAndDelete({ _id: req.params.id, role: 'doctor' }).select('-password');
      if (deletedDoctor) {
        return res.status(200).json({ message: 'Doctor deleted successfully.' });
      }
    }

    const doctorIndex = demoDoctors.findIndex((doctor) => String(doctor._id) === String(req.params.id));
    if (doctorIndex === -1) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    const [deletedDoctor] = demoDoctors.splice(doctorIndex, 1);
    demoUsers = demoUsers.filter((user) => String(user._id) !== String(deletedDoctor._id));
    return res.status(200).json({ message: 'Doctor deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.patch('/api/admin/appointments/:id', authenticateToken, requireAdmin, (req, res) => {
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
    let authenticatedUser = null;
    const authorization = req.headers.authorization || '';
    if (authorization) {
      if (!authorization.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid authentication header.' });
      }

      try {
        authenticatedUser = jwt.verify(authorization.slice(7), process.env.JWT_SECRET || 'medicore_dev_secret');
      } catch {
        return res.status(401).json({ message: 'Invalid or expired authentication token.' });
      }
    }

    if (!String(req.body?.patientName || '').trim() || !String(req.body?.phone || '').trim()) {
      return res.status(400).json({ message: 'Patient name and phone number are required.' });
    }

    let selectedDoctor = demoDoctors.find(
      (doctor) => String(doctor._id) === String(req.body.doctorId)
    );

    if (!selectedDoctor && hasMongoConnection() && mongoose.isValidObjectId(req.body.doctorId)) {
      const databaseDoctor = await User.findOne({ _id: req.body.doctorId, role: 'doctor' }).lean();
      if (databaseDoctor) {
        selectedDoctor = {
          ...databaseDoctor,
          _id: String(databaseDoctor._id),
          name: databaseDoctor.username,
          availability: databaseDoctor.availability || [],
        };
      }
    }

    if (!selectedDoctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    const requestedTime = normalizeTimeString(req.body.time);
    const allowedSlots = getDoctorAvailabilityForDate(selectedDoctor, req.body.date)
      .map((slot) => normalizeSlotString(slot))
      .filter(Boolean);

    const matchesSchedule = allowedSlots.some((slot) => isTimeWithinSlot(req.body.time, slot));

    if (!requestedTime || !allowedSlots.length || !matchesSchedule) {
      const availableMessage = allowedSlots.length
        ? `Doctor is not available at this time. Available slots: ${allowedSlots.join(', ')}`
        : 'Doctor is not available at this time.';

      return res.status(400).json({ message: availableMessage });
    }

    const payload = {
      ...req.body,
      patientEmail: String(authenticatedUser?.email || req.body.email || req.body.patientEmail || '').trim().toLowerCase(),
      doctorId: req.body.doctorId || (selectedDoctor ? selectedDoctor._id : ''),
      doctorName: selectedDoctor.name,
      time: req.body.time || requestedTime,
      status: 'Pending',
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
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    let authenticatedUser = null;

    if (token) {
      try {
        authenticatedUser = jwt.verify(token, process.env.JWT_SECRET || 'medicore_dev_secret');
      } catch {
        return res.status(401).json({ message: 'Invalid or expired authentication token.' });
      }
    }

    const requestedEmail = String(req.query.email || '').trim().toLowerCase();
    const mineOnly = req.query.mine === 'true';

    if (authenticatedUser && authenticatedUser.role !== 'admin') {
      const ownEmail = String(authenticatedUser.email || '').toLowerCase();
      if (requestedEmail && requestedEmail !== ownEmail) {
        return res.status(403).json({ message: 'You can only view your own appointments.' });
      }
    }

    if (!authenticatedUser) {
      return res.status(401).json({ message: 'Authentication required to view appointments.' });
    }

    const scopedEmail = authenticatedUser?.role === 'admin'
      ? requestedEmail
      : authenticatedUser?.email || requestedEmail;

    const doctorScope = authenticatedUser?.role === 'doctor'
      ? { doctorId: String(authenticatedUser._id) }
      : null;

    if (mineOnly && !scopedEmail) {
      return res.status(200).json([]);
    }

    if (mongoose.connection.readyState === 1) {
      const filter = doctorScope || (scopedEmail ? { patientEmail: scopedEmail } : {});
      const appointments = await Appointment.find(filter).sort({ createdAt: -1 });
      return res.status(200).json(appointments);
    }

    const appointments = doctorScope
      ? demoAppointments.filter((appointment) => String(appointment.doctorId) === doctorScope.doctorId)
      : scopedEmail
      ? demoAppointments.filter((appointment) => String(appointment.patientEmail || appointment.email || '').toLowerCase() === scopedEmail)
      : mineOnly ? [] : demoAppointments;
    return res.status(200).json(appointments);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch('/api/appointments/:id/cancel', async (req, res) => {
  try {
    const authorization = req.headers.authorization || '';
    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    let authenticatedUser;
    try {
      authenticatedUser = jwt.verify(authorization.slice(7), process.env.JWT_SECRET || 'medicore_dev_secret');
    } catch {
      return res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }

    if (mongoose.connection.readyState === 1) {
      const filter = authenticatedUser.role === 'admin'
        ? { _id: req.params.id }
        : authenticatedUser.role === 'doctor'
          ? { _id: req.params.id, doctorId: String(authenticatedUser._id) }
        : { _id: req.params.id, patientEmail: String(authenticatedUser.email).toLowerCase() };
      const updatedAppointment = await Appointment.findOneAndUpdate(filter, { status: 'Cancelled' }, { new: true });

      if (!updatedAppointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      return res.status(200).json(updatedAppointment);
    }

    const appointmentIndex = demoAppointments.findIndex(
      (appointment) => String(appointment._id) === String(req.params.id)
        && (authenticatedUser.role === 'admin'
          || (authenticatedUser.role === 'doctor' && String(appointment.doctorId) === String(authenticatedUser._id))
          || String(appointment.patientEmail || appointment.email || '').toLowerCase() === String(authenticatedUser.email).toLowerCase())
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

app.patch('/api/appointments/:id/status', authenticateToken, async (req, res) => {
  const nextStatus = String(req.body?.status || '').trim();
  if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(nextStatus)) {
    return res.status(400).json({ message: 'Invalid appointment status.' });
  }

  try {
    const isAdmin = req.user.role === 'admin';
    const isDoctor = req.user.role === 'doctor';
    if (!isAdmin && !isDoctor) {
      return res.status(403).json({ message: 'Only doctors or administrators can update appointment status.' });
    }

    const filter = isAdmin
      ? { _id: req.params.id }
      : { _id: req.params.id, doctorId: String(req.user._id) };

    if (mongoose.connection.readyState === 1) {
      const appointment = await Appointment.findOneAndUpdate(
        filter,
        { status: nextStatus, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
      return res.status(200).json(appointment);
    }

    const appointment = demoAppointments.find(
      (item) => String(item._id) === String(req.params.id)
        && (isAdmin || String(item.doctorId) === String(req.user._id))
    );

    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    appointment.status = nextStatus;
    appointment.updatedAt = new Date();
    return res.status(200).json(appointment);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
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

app.patch('/api/admin/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
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

app.post('/api/admin/notifications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const payload = {
      title: req.body.title,
      target: req.body.target || 'All users',
      status: req.body.status || 'Live'
    };

    if (hasMongoConnection()) {
      const notification = await Notification.create(payload);
      return res.status(201).json(notification);
    }

    const notification = {
      _id: `notice-${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString()
    };
    demoNotifications.unshift(notification);
    return res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    if (hasMongoConnection()) {
      const notifications = await Notification.find().sort({ createdAt: -1 });
      return res.status(200).json(notifications);
    }

    const notifications = [...demoNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/notifications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (hasMongoConnection()) {
      const notifications = await Notification.find().sort({ createdAt: -1 });
      return res.status(200).json(notifications);
    }

    const notifications = [...demoNotifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/notifications/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (hasMongoConnection()) {
      const deletedNotification = await Notification.findByIdAndDelete(req.params.id);
      if (!deletedNotification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      return res.status(200).json({ message: 'Notification deleted successfully' });
    }

    const initialLength = demoNotifications.length;
    demoNotifications = demoNotifications.filter((item) => String(item._id) !== String(req.params.id));

    if (demoNotifications.length === initialLength) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/feedback', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/audit-logs', authenticateToken, requireAdmin, async (req, res) => {
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



