const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });
process.env.NODE_ENV = 'test';

const app = require('../server');
const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

let server;
let baseUrl;
let studentToken;
let facultyToken;
let adminToken;
let studentDoc;

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

describe('AttendEase Part 4: Student Attendance & Analytics Test Suite', () => {
  before(async () => {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendease';
    await mongoose.connect(connUri);

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    // Obtain Student Token
    const studentLogin = await request('POST', '/api/auth/login', {
      email: 'student@attendease.com',
      password: 'StudentPassword123!',
    });
    studentToken = studentLogin.data.token;

    // Obtain Faculty Token
    const facultyLogin = await request('POST', '/api/auth/login', {
      email: 'faculty@attendease.com',
      password: 'FacultyPassword123!',
    });
    facultyToken = facultyLogin.data.token;

    // Obtain Admin Token
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@attendease.com',
      password: 'AdminPassword123!',
    });
    adminToken = adminLogin.data.token;

    studentDoc = await Student.findOne({ email: 'student@attendease.com' });
  });

  after(async () => {
    await mongoose.connection.close();
    await new Promise((resolve) => server.close(resolve));
  });

  test('Unauthenticated user cannot access student dashboard (401)', async () => {
    const res = await request('GET', '/api/student/dashboard');
    assert.equal(res.status, 401);
    assert.equal(res.data.success, false);
  });

  test('Faculty member cannot access student endpoints (403 Forbidden)', async () => {
    const res = await request('GET', '/api/student/dashboard', null, {
      Authorization: `Bearer ${facultyToken}`,
    });
    assert.equal(res.status, 403);
    assert.equal(res.data.success, false);
  });

  test('Admin cannot access student endpoints directly (403 Forbidden)', async () => {
    const res = await request('GET', '/api/student/dashboard', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(res.status, 403);
    assert.equal(res.data.success, false);
  });

  test('Student can access dashboard overview statistics (200)', async () => {
    const res = await request('GET', '/api/student/dashboard', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(typeof res.data.data.stats.overallPercentage === 'number');
    assert.ok(typeof res.data.data.stats.totalConducted === 'number');
    assert.ok(typeof res.data.data.stats.totalAttended === 'number');
    assert.ok(typeof res.data.data.stats.totalMissed === 'number');
    assert.ok(Array.isArray(res.data.data.subjectSummaries));
    assert.ok(Array.isArray(res.data.data.monthlyTrend));
    assert.ok(Array.isArray(res.data.data.recentActivity));
  });

  test('Student can fetch their profile (200)', async () => {
    const res = await request('GET', '/api/student/profile', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.email, 'student@attendease.com');
    assert.ok(res.data.data.registrationNumber);
    assert.ok(res.data.data.class);
  });

  test('Student can update contact phone number but cannot escalate or alter registration number', async () => {
    const updateRes = await request(
      'PUT',
      '/api/student/profile',
      {
        phoneNumber: '+1-555-432-8765',
        registrationNumber: 'HACKED-REG',
        role: 'admin',
      },
      {
        Authorization: `Bearer ${studentToken}`,
      }
    );
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.data.success, true);
    assert.equal(updateRes.data.data.phoneNumber, '+1-555-432-8765');
    // Ensure protected registrationNumber was unchanged
    assert.notEqual(updateRes.data.data.registrationNumber, 'HACKED-REG');
  });

  test('Student can fetch detailed attendance with date filters (200)', async () => {
    const res = await request('GET', '/api/student/attendance?filter=all', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.data.records));
    assert.ok(typeof res.data.data.overallPercentage === 'number');
  });

  test('Student can fetch subject-wise attendance breakdown (200)', async () => {
    const res = await request('GET', '/api/student/attendance/subjects', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
    assert.ok(res.data.data.length > 0);
    const firstSubject = res.data.data[0];
    assert.ok(firstSubject.code);
    assert.ok(typeof firstSubject.percentage === 'number');
    assert.ok(typeof firstSubject.totalClasses === 'number');
  });

  test('Student can fetch attendance history with search and pagination (200)', async () => {
    const res = await request('GET', '/api/student/attendance/history?page=1&limit=5', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.data.records));
    assert.ok(typeof res.data.data.totalRecords === 'number');
    assert.equal(res.data.data.currentPage, 1);
  });

  test('Student can fetch attendance analytics for Recharts (200)', async () => {
    const res = await request('GET', '/api/student/attendance/analytics', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.data.monthlyTrend));
    assert.ok(Array.isArray(res.data.data.subjectComparison));
    assert.ok(Array.isArray(res.data.data.distribution));
    assert.ok(res.data.data.summary);
  });

  test('Student can fetch attendance warnings (<75% threshold) (200)', async () => {
    const res = await request('GET', '/api/student/attendance/warnings', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(typeof res.data.data.threshold === 'number');
    assert.ok(Array.isArray(res.data.data.warnings));
  });
});
