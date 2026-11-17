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
const Attendance = require('../models/Attendance');

let server;
let baseUrl;
let facultyToken;
let studentToken;
let adminToken;
let assignedClassId;
let assignedSubjectId;
let unassignedClassId;
let studentIds = [];
let createdAttendanceId;

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

describe('AttendEase Part 3: Faculty Attendance Management Test Suite', () => {
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

    // Obtain Faculty Token
    const facultyLogin = await request('POST', '/api/auth/login', {
      email: 'faculty@attendease.com',
      password: 'FacultyPassword123!',
    });
    facultyToken = facultyLogin.data.token;

    // Obtain Student Token
    const studentLogin = await request('POST', '/api/auth/login', {
      email: 'student@attendease.com',
      password: 'StudentPassword123!',
    });
    studentToken = studentLogin.data.token;

    // Obtain Admin Token
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@attendease.com',
      password: 'AdminPassword123!',
    });
    adminToken = adminLogin.data.token;

    // Retrieve faculty's assigned classes and subjects
    const facultyDoc = await Faculty.findOne({ email: 'faculty@attendease.com' });
    if (facultyDoc && facultyDoc.assignedClasses.length > 0) {
      assignedClassId = facultyDoc.assignedClasses[0].toString();
    }
    if (facultyDoc && facultyDoc.assignedSubjects.length > 0) {
      assignedSubjectId = facultyDoc.assignedSubjects[0].toString();
    }

    // Retrieve students enrolled in the assigned class
    const students = await Student.find({ class: assignedClassId });
    studentIds = students.map((s) => s._id.toString());

    // Create an unassigned dummy class to test access controls
    const unassignedClass = await Class.findOne({ _id: { $nin: facultyDoc.assignedClasses } });
    if (unassignedClass) {
      unassignedClassId = unassignedClass._id.toString();
    }
  });

  after(async () => {
    if (createdAttendanceId) {
      await Attendance.findByIdAndDelete(createdAttendanceId);
    }
    await mongoose.connection.close();
    await new Promise((resolve) => server.close(resolve));
  });

  test('Unauthenticated user cannot access faculty dashboard (401)', async () => {
    const res = await request('GET', '/api/faculty/dashboard');
    assert.equal(res.status, 401);
    assert.equal(res.data.success, false);
  });

  test('Student cannot access faculty endpoints (403 Forbidden)', async () => {
    const res = await request('GET', '/api/faculty/dashboard', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert.equal(res.status, 403);
    assert.equal(res.data.success, false);
  });

  test('Faculty can access dashboard overview statistics (200)', async () => {
    const res = await request('GET', '/api/faculty/dashboard', null, {
      Authorization: `Bearer ${facultyToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(typeof res.data.data.stats.totalClasses === 'number');
    assert.ok(typeof res.data.data.stats.totalSubjects === 'number');
    assert.ok(typeof res.data.data.stats.totalStudents === 'number');
    assert.ok(typeof res.data.data.stats.turnoutPercentage === 'number');
    assert.ok(Array.isArray(res.data.data.weeklyTrends));
  });

  test('Faculty can get list of assigned classes (200)', async () => {
    const res = await request('GET', '/api/faculty/classes', null, {
      Authorization: `Bearer ${facultyToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
    assert.ok(res.data.data.length > 0);
  });

  test('Faculty can get list of assigned subjects (200)', async () => {
    const res = await request('GET', '/api/faculty/subjects', null, {
      Authorization: `Bearer ${facultyToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
    assert.ok(res.data.data.length > 0);
  });

  test('Faculty can retrieve student roster for assigned class (200)', async () => {
    const res = await request('GET', `/api/faculty/classes/${assignedClassId}/students`, null, {
      Authorization: `Bearer ${facultyToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
  });

  test('Faculty cannot access student roster of unassigned class (403 Forbidden)', async () => {
    if (!unassignedClassId) return;
    const res = await request('GET', `/api/faculty/classes/${unassignedClassId}/students`, null, {
      Authorization: `Bearer ${facultyToken}`,
    });
    assert.equal(res.status, 403);
    assert.equal(res.data.success, false);
  });

  test('Faculty can mark attendance with Present, Absent, and Late records (201)', async () => {
    // Generate a unique future date for testing
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 45); // far in future to avoid seeding conflicts
    const isoDate = testDate.toISOString().split('T')[0];

    const records = studentIds.map((id, index) => {
      let status = 'present';
      if (index === 0) status = 'absent';
      if (index === 1) status = 'late';
      return {
        student: id,
        status,
        remarks: status === 'late' ? 'Bus delayed' : '',
      };
    });

    const payload = {
      classId: assignedClassId,
      subjectId: assignedSubjectId,
      date: isoDate,
      records,
    };

    const res = await request('POST', '/api/faculty/attendance', payload, {
      Authorization: `Bearer ${facultyToken}`,
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data._id);
    createdAttendanceId = res.data.data._id;
    assert.equal(res.data.data.totalStudents, studentIds.length);
  });

  test('Prevent duplicate attendance marking on the same class, subject, and date (409 Conflict)', async () => {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 45);
    const isoDate = testDate.toISOString().split('T')[0];

    const payload = {
      classId: assignedClassId,
      subjectId: assignedSubjectId,
      date: isoDate,
      records: studentIds.map((id) => ({ student: id, status: 'present' })),
    };

    const res = await request('POST', '/api/faculty/attendance', payload, {
      Authorization: `Bearer ${facultyToken}`,
    });

    assert.equal(res.status, 409);
    assert.equal(res.data.success, false);
    assert.ok(res.data.message.includes('already exists'));
  });

  test('Faculty can view attendance history (200)', async () => {
    const res = await request('GET', '/api/faculty/attendance/history', null, {
      Authorization: `Bearer ${facultyToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(Array.isArray(res.data.data));
  });

  test('Faculty can fetch attendance session by ID (200)', async () => {
    if (!createdAttendanceId) return;
    const res = await request('GET', `/api/faculty/attendance/${createdAttendanceId}`, null, {
      Authorization: `Bearer ${facultyToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data._id, createdAttendanceId);
  });

  test('Faculty can update attendance session records (200)', async () => {
    if (!createdAttendanceId) return;
    const updatePayload = {
      records: studentIds.map((id) => ({
        student: id,
        status: 'present',
        remarks: 'Rectified attendance',
      })),
    };

    const res = await request('PUT', `/api/faculty/attendance/${createdAttendanceId}`, updatePayload, {
      Authorization: `Bearer ${facultyToken}`,
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.totalPresent, studentIds.length);
    assert.equal(res.data.data.totalAbsent, 0);
  });

  test('Faculty can retrieve attendance reports and analytics (200)', async () => {
    const res = await request('GET', '/api/faculty/reports', null, {
      Authorization: `Bearer ${facultyToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.summary);
    assert.ok(Array.isArray(res.data.data.classComparison));
    assert.ok(Array.isArray(res.data.data.subjectBreakdown));
  });

  test('Faculty can view and update their profile', async () => {
    const res = await request('GET', '/api/faculty/profile', null, {
      Authorization: `Bearer ${facultyToken}`,
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.faculty.fullName);

    const updateRes = await request('PUT', '/api/faculty/profile', {
      phoneNumber: '+1-555-888-9999',
    }, {
      Authorization: `Bearer ${facultyToken}`,
    });
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.data.success, true);
    assert.equal(updateRes.data.data.phoneNumber, '+1-555-888-9999');
  });
});
