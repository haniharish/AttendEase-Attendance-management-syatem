const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });
process.env.NODE_ENV = 'test';

const app = require('../server');
const User = require('../models/User');

let server;
let baseUrl;

// Helper to make HTTP requests
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

describe('AttendEase Authentication & Role Authorization Test Suite', () => {
  before(async () => {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendease';
    await mongoose.connect(connUri);

    // Clean up test users
    await User.deleteMany({ email: /@test\.com$/ });

    // Start server on an ephemeral port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await User.deleteMany({ email: /@test\.com$/ });
    await mongoose.connection.close();
    await new Promise((resolve) => server.close(resolve));
  });

  test('GET /api/health should return ok status', async () => {
    const res = await request('GET', '/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.data.status, 'ok');
  });

  test('POST /api/auth/register should register a new student', async () => {
    const payload = {
      name: 'John Student',
      email: 'john@test.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };

    const res = await request('POST', '/api/auth/register', payload);
    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.user.email, 'john@test.com');
    assert.equal(res.data.user.role, 'student');
    assert.ok(res.data.token, 'Token should be returned');
    assert.equal(res.data.user.password, undefined, 'Password hash must never be returned');

    // Verify Set-Cookie header is sent
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies, 'Set-Cookie header should be present');
    assert.ok(cookies.some((c) => c.includes('token=')), 'Token cookie should be set');
  });

  test('POST /api/auth/register must enforce role: student even if admin is requested', async () => {
    const payload = {
      name: 'Attacker User',
      email: 'attacker@test.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'admin', // Attempting privilege escalation
    };

    const res = await request('POST', '/api/auth/register', payload);
    assert.equal(res.status, 201);
    assert.equal(res.data.user.role, 'student', 'Public registration must force role to student');
  });

  test('POST /api/auth/register should fail on duplicate email', async () => {
    const payload = {
      name: 'John Duplicate',
      email: 'john@test.com',
      password: 'Password123!',
    };

    const res = await request('POST', '/api/auth/register', payload);
    assert.equal(res.status, 409);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /already exists/i);
  });

  test('POST /api/auth/register should fail when passwords do not match', async () => {
    const payload = {
      name: 'Mismatch User',
      email: 'mismatch@test.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
    };

    const res = await request('POST', '/api/auth/register', payload);
    assert.equal(res.status, 400);
    assert.equal(res.data.success, false);
    assert.match(res.data.message, /match/i);
  });

  test('POST /api/auth/login should authenticate with valid credentials', async () => {
    const payload = {
      email: 'john@test.com',
      password: 'Password123!',
    };

    const res = await request('POST', '/api/auth/login', payload);
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.user.email, 'john@test.com');
    assert.equal(res.data.user.role, 'student');
    assert.ok(res.data.token);
  });

  test('POST /api/auth/login should fail with invalid password', async () => {
    const payload = {
      email: 'john@test.com',
      password: 'WrongPassword!',
    };

    const res = await request('POST', '/api/auth/login', payload);
    assert.equal(res.status, 401);
    assert.equal(res.data.success, false);
  });

  test('GET /api/auth/me should return current user when authorized', async () => {
    // First login to get token
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'john@test.com',
      password: 'Password123!',
    });
    const token = loginRes.data.token;

    // Call /me with Bearer token
    const meRes = await request('GET', '/api/auth/me', null, {
      Authorization: `Bearer ${token}`,
    });
    assert.equal(meRes.status, 200);
    assert.equal(meRes.data.success, true);
    assert.equal(meRes.data.user.email, 'john@test.com');
  });

  test('GET /api/auth/me should return 401 when no token is provided', async () => {
    const meRes = await request('GET', '/api/auth/me');
    assert.equal(meRes.status, 401);
    assert.equal(meRes.data.success, false);
  });

  test('POST /api/auth/logout should clear session cookie', async () => {
    const res = await request('POST', '/api/auth/logout');
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    const cookies = res.headers['set-cookie'];
    assert.ok(cookies, 'Set-Cookie header should be present to clear cookie');
  });
});
