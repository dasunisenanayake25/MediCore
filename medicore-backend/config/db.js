const mongoose = require('mongoose');
const User = require('../models/User');
const { ensureDefaultUsers } = require('./seedAdmin');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.log('MongoDB URI not configured. Running in demo mode without a database.');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    const result = await ensureDefaultUsers(User);
    if (result.created) {
      console.log(`Seeded default admin user: ${result.admin.email}`);
    }
  } catch (error) {
    console.error(`Database Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;