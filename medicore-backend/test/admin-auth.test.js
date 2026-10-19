const test = require('node:test');
const assert = require('node:assert/strict');

const { ensureDefaultUsers } = require('../config/seedAdmin');

test('ensureDefaultUsers creates the seeded admin account when missing', async () => {
  const model = {
    findOne: async ({ email }) => (email === 'admin@medicore.com' ? null : { email }),
    create: async (user) => ({ ...user, _id: 'admin-1' }),
    countDocuments: async () => 0,
  };

  const created = await ensureDefaultUsers(model);
  assert.equal(created.admin.email, 'admin@medicore.com');
  assert.equal(created.admin.password, 'password123');
  assert.equal(created.admin.role, 'admin');
});
