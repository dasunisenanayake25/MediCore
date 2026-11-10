const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');

const waitForServer = async (url, timeoutMs = 15000) => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // retry until server is ready
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Server did not respond at ${url}`);
};

test('backend exposes /api/health for frontend connectivity', async () => {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: __dirname + '/..',
    env: { ...process.env, PORT: '5010' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    const response = await waitForServer('http://localhost:5010/api/health');
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'UP');
  } finally {
    server.kill('SIGTERM');
  }
});

test('appointment creation accepts a time that matches the doctor schedule for that day', async () => {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: __dirname + '/..',
    env: { ...process.env, PORT: '5012' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await waitForServer('http://localhost:5012/api/health');

    const response = await fetch('http://localhost:5012/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: 'Valid Patient',
        email: 'valid@example.com',
        phone: '9876543210',
        doctorId: 'doc-1',
        date: '2026-10-12',
        time: '09:00',
      }),
    });

    const body = await response.json();
    assert.equal(response.status, 201);
    assert.equal(body.doctorId, 'doc-1');
    assert.equal(body.time, '09:00');
  } finally {
    server.kill('SIGTERM');
  }
});

test('appointment creation accepts any time inside a doctor availability range', async () => {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: __dirname + '/..',
    env: { ...process.env, PORT: '5013' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await waitForServer('http://localhost:5013/api/health');

    const loginResponse = await fetch('http://localhost:5013/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@medicore.com', password: 'password123' }),
    });
    const { token } = await loginResponse.json();
    assert.equal(loginResponse.status, 200);

    const updateResponse = await fetch('http://localhost:5013/api/admin/doctors/doc-9/availability', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        availability: [
          { day: 'Mon', slots: ['09:30 AM - 01:00 PM'] }
        ]
      }),
    });

    assert.equal(updateResponse.status, 200);

    const response = await fetch('http://localhost:5013/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: 'Range Patient',
        email: 'range@example.com',
        phone: '5555555555',
        doctorId: 'doc-9',
        date: '2026-10-26',
        time: '12:15',
      }),
    });

    const body = await response.json();
    assert.equal(response.status, 201);
    assert.equal(body.doctorId, 'doc-9');
  } finally {
    server.kill('SIGTERM');
  }
});

test('appointment creation rejects times outside the doctor schedule', async () => {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: __dirname + '/..',
    env: { ...process.env, PORT: '5011' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await waitForServer('http://localhost:5011/api/health');

    const response = await fetch('http://localhost:5011/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        doctorId: 'doc-1',
        date: '2026-10-12',
        time: '10:00',
      }),
    });

    const body = await response.json();
    assert.equal(response.status, 400);
    assert.match(body.message, /not available|available/i);
  } finally {
    server.kill('SIGTERM');
  }
});

test('doctor can view and update only appointments assigned to them', async () => {
  const server = spawn(process.execPath, ['server.js'], {
    cwd: __dirname + '/..',
    env: { ...process.env, PORT: '5014' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await waitForServer('http://localhost:5014/api/health');

    const loginResponse = await fetch('http://localhost:5014/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aisha@medicore.com', password: 'doctor123' }),
    });
    const { token } = await loginResponse.json();
    assert.equal(loginResponse.status, 200);

    const createResponse = await fetch('http://localhost:5014/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: 'Assigned Patient',
        email: 'assigned@example.com',
        phone: '5555555555',
        doctorId: 'doc-1',
        date: '2026-10-12',
        time: '09:00',
      }),
    });
    const createdAppointment = await createResponse.json();
    assert.equal(createResponse.status, 201);

    const appointmentsResponse = await fetch('http://localhost:5014/api/appointments', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const doctorAppointments = await appointmentsResponse.json();
    assert.equal(appointmentsResponse.status, 200);
    assert.equal(doctorAppointments.some((appointment) => appointment._id === createdAppointment._id), true);

    const approveResponse = await fetch(`http://localhost:5014/api/appointments/${createdAppointment._id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'Confirmed' }),
    });
    const approvedAppointment = await approveResponse.json();
    assert.equal(approveResponse.status, 200);
    assert.equal(approvedAppointment.status, 'Confirmed');

    const cancelResponse = await fetch(`http://localhost:5014/api/appointments/${createdAppointment._id}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(cancelResponse.status, 200);
    assert.equal((await cancelResponse.json()).status, 'Cancelled');
  } finally {
    server.kill('SIGTERM');
  }
});
