const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });
process.env.NODE_ENV = 'test';

const app = require('../server');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

let server;
let baseUrl;
let adminToken;
let studentToken;

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

describe('AttendEase Part 2: Admin Dashboard & Management System Test Suite', () => {
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

    // Obtain Admin Token
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@attendease.com',
      password: 'AdminPassword123!',
    });
    adminToken = adminLogin.data.token;

    // Obtain Student Token
    const studentLogin = await request('POST', '/api/auth/login', {
      email: 'student@attendease.com',
      password: 'StudentPassword123!',
    });
    studentToken = studentLogin.data.token;
  });

  after(async () => {
    await mongoose.connection.close();
    await new Promise((resolve) => server.close(resolve));
  });

  test('Unauthenticated user cannot access admin dashboard (401)', async () => {
    const res = await request('GET', '/api/admin/dashboard/stats');
    assert.equal(res.status, 401);
    assert.equal(res.data.success, false);
  });

  test('Student cannot access admin dashboard (403 Forbidden)', async () => {
    const res = await request('GET', '/api/admin/dashboard/stats', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert.equal(res.status, 403);
    assert.equal(res.data.success, false);
  });

  test('Admin can access dashboard stats (200)', async () => {
    const res = await request('GET', '/api/admin/dashboard/stats', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.counts.totalStudents >= 0);
    assert.ok(res.data.data.counts.totalFaculty >= 0);
    assert.ok(res.data.data.counts.totalClasses >= 0);
    assert.ok(res.data.data.counts.totalSubjects >= 0);
  });

  // Class Management Tests
  let testClassId;
  test('Admin can create a new class', async () => {
    const res = await request('POST', '/api/admin/classes', {
      name: 'Civil Engineering',
      section: 'C',
      academicYear: '2026-2027',
      description: 'Test Civil Class',
    }, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    testClassId = res.data.data._id;
  });

  test('Admin can get list of classes', async () => {
    const res = await request('GET', '/api/admin/classes', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.data));
  });

  // Subject Management Tests
  let testSubjectId;
  test('Admin can create a new subject', async () => {
    const res = await request('POST', '/api/admin/subjects', {
      name: 'Structural Analysis',
      code: 'CE-301',
      description: 'Test Subject',
      class: testClassId,
      credits: 4,
    }, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    testSubjectId = res.data.data._id;
  });

  test('Class deletion prevented when subject depends on it', async () => {
    const res = await request('DELETE', `/api/admin/classes/${testClassId}`, null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(res.status, 400);
    assert.match(res.data.message, /cannot delete class/i);
  });

  // Student Management Tests
  let testStudentId;
  test('Admin can create a student', async () => {
    const res = await request('POST', '/api/admin/students', {
      fullName: 'Test Student One',
      registrationNumber: 'REG-TEST-999',
      email: 'test.student.one@test.com',
      phoneNumber: '+1-555-0000',
      class: testClassId,
      section: 'C',
      rollNumber: '99',
    }, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    testStudentId = res.data.data._id;
  });

  test('Admin can search and filter students', async () => {
    const res = await request('GET', `/api/admin/students?search=REG-TEST-999`, null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.count, 1);
    assert.equal(res.data.data[0].registrationNumber, 'REG-TEST-999');
  });

  // Faculty Management Tests
  let testFacultyId;
  test('Admin can create a faculty member', async () => {
    const res = await request('POST', '/api/admin/faculty', {
      fullName: 'Prof. Test Faculty',
      employeeId: 'FAC-TEST-999',
      email: 'test.faculty@test.com',
      phoneNumber: '+1-555-1111',
      department: 'Civil Engineering',
      assignedClasses: [testClassId],
      assignedSubjects: [testSubjectId],
    }, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    testFacultyId = res.data.data._id;
  });

  test('Admin can view attendance reports overview', async () => {
    const res = await request('GET', '/api/admin/reports/overview', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.totalSessions >= 0);
  });

  // Cleanup test entities
  test('Admin can delete student, subject, faculty, and class', async () => {
    const delStudent = await request('DELETE', `/api/admin/students/${testStudentId}`, null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(delStudent.status, 200);

    const delSubject = await request('DELETE', `/api/admin/subjects/${testSubjectId}`, null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(delSubject.status, 200);

    const delFaculty = await request('DELETE', `/api/admin/faculty/${testFacultyId}`, null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(delFaculty.status, 200);

    const delClass = await request('DELETE', `/api/admin/classes/${testClassId}`, null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert.equal(delClass.status, 200);

    // Clean up created user accounts
    await User.deleteMany({ email: { $in: ['test.student.one@test.com', 'test.faculty@test.com'] } });
  });
});
