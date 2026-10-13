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
