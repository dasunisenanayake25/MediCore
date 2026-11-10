const bcrypt = require('bcryptjs');

const DEFAULT_ADMIN = {
  username: 'System Admin',
  email: 'admin@medicore.com',
  password: 'password123',
  role: 'admin',
  status: 'active',
};

async function ensureDefaultUsers(UserModel) {
  if (!UserModel) {
    return { admin: DEFAULT_ADMIN };
  }

  const existing = await UserModel.findOne({ email: DEFAULT_ADMIN.email.toLowerCase() });
  if (existing) {
    if (!String(existing.password).startsWith('$2')) {
      existing.password = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
      await existing.save();
    }
    return { admin: existing, created: false };
  }

  const created = await UserModel.create({
    ...DEFAULT_ADMIN,
    email: DEFAULT_ADMIN.email.toLowerCase(),
    password: await bcrypt.hash(DEFAULT_ADMIN.password, 10),
  });

  return { admin: created, created: true };
}

module.exports = {
  DEFAULT_ADMIN,
  ensureDefaultUsers,
};
