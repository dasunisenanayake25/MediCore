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
    return { admin: existing, created: false };
  }

  const created = await UserModel.create({
    ...DEFAULT_ADMIN,
    email: DEFAULT_ADMIN.email.toLowerCase(),
  });

  return { admin: created, created: true };
}

module.exports = {
  DEFAULT_ADMIN,
  ensureDefaultUsers,
};
