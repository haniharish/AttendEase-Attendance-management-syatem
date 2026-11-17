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
let adminToken;
let facultyToken;
let studentToken;

let createdClassId;
let createdSubjectId;
let createdFacultyId;
let createdStudentId;
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

describe('AttendEase Part 5: Full Multi-Role End-to-End Integration Suite', () => {
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

    // 1. Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@attendease.com',
      password: 'AdminPassword123!',
    });
    adminToken = adminLogin.data.token;
  });

  after(async () => {
    // Clean up created integration test records
    if (createdAttendanceId) await Attendance.findByIdAndDelete(createdAttendanceId);
    if (createdStudentId) {
      const st = await Student.findById(createdStudentId);
      if (st && st.user) await User.findByIdAndDelete(st.user);
      await Student.findByIdAndDelete(createdStudentId);
    }
    if (createdSubjectId) await Subject.findByIdAndDelete(createdSubjectId);
    if (createdFacultyId) {
      const fac = await Faculty.findById(createdFacultyId);
      if (fac && fac.user) await User.findByIdAndDelete(fac.user);
      await Faculty.findByIdAndDelete(createdFacultyId);
    }
    if (createdClassId) await Class.findByIdAndDelete(createdClassId);

    await mongoose.connection.close();
    await new Promise((resolve) => server.close(resolve));
  });

  // --- STAGE 1: Admin Provisions Academic Environment ---
  test('Step 1: Admin creates an academic Class', async () => {
    const res = await request(
      'POST',
      '/api/admin/classes',
      {
        name: 'Cyber Security Integration',
        section: 'Z',
        academicYear: '2026-2027',
        description: 'End-to-End Integration Batch Cohort',
      },
      { Authorization: `Bearer ${adminToken}` }
    );

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data._id);
    createdClassId = res.data.data._id;
  });

  test('Step 2: Admin creates a Faculty member with auto-provisioned login account', async () => {
    const uniqueEmail = `integ.faculty.${Date.now()}@attendease.com`;
    const res = await request(
      'POST',
      '/api/admin/faculty',
      {
        fullName: 'Prof. Alan Turing',
        employeeId: `FAC-E2E-${Date.now().toString().slice(-4)}`,
        email: uniqueEmail,
        phoneNumber: '+1-555-010-9999',
        department: 'Cyber Security',
        assignedClasses: [createdClassId],
      },
      { Authorization: `Bearer ${adminToken}` }
    );

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data._id);
    createdFacultyId = res.data.data._id;

    // Authenticate the newly created faculty
    const facultyLogin = await request('POST', '/api/auth/login', {
      email: uniqueEmail,
      password: 'FacultyPassword123!',
    });
    assert.equal(facultyLogin.status, 200);
    assert.equal(facultyLogin.data.user.role, 'faculty');
    facultyToken = facultyLogin.data.token;
  });

  test('Step 3: Admin creates a Subject mapped to Class and assigned to Faculty', async () => {
    const uniqueCode = `SEC-${Date.now().toString().slice(-3)}`;
    const res = await request(
      'POST',
      '/api/admin/subjects',
      {
        name: 'Cryptography & Protocol Analysis',
        code: uniqueCode,
        description: 'Advanced cryptanalysis, hash functions, and key exchanges',
        class: createdClassId,
        faculty: createdFacultyId,
        credits: 4,
      },
      { Authorization: `Bearer ${adminToken}` }
    );

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data._id);
    createdSubjectId = res.data.data._id;

    // Link subject in faculty's assignedSubjects array
    await Faculty.findByIdAndUpdate(createdFacultyId, {
      $addToSet: { assignedSubjects: createdSubjectId },
    });
  });

  test('Step 4: Admin creates an enrolled Student with auto-provisioned student login', async () => {
    const uniqueEmail = `integ.student.${Date.now()}@attendease.com`;
    const uniqueReg = `REG-E2E-${Date.now().toString().slice(-4)}`;
    const res = await request(
      'POST',
      '/api/admin/students',
      {
        fullName: 'Grace Hopper',
        registrationNumber: uniqueReg,
        email: uniqueEmail,
        phoneNumber: '+1-555-020-8888',
        class: createdClassId,
        section: 'Z',
        rollNumber: '01',
      },
      { Authorization: `Bearer ${adminToken}` }
    );

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data._id);
    createdStudentId = res.data.data._id;

    // Authenticate the newly enrolled student
    const studentLogin = await request('POST', '/api/auth/login', {
      email: uniqueEmail,
      password: 'StudentPassword123!',
    });
    assert.equal(studentLogin.status, 200);
    assert.equal(studentLogin.data.user.role, 'student');
    studentToken = studentLogin.data.token;
  });

  // --- STAGE 2: Faculty Attendance Workflow ---
  test('Step 5: Faculty sees assigned Class and Subject', async () => {
    const classRes = await request('GET', '/api/faculty/classes', null, {
      Authorization: `Bearer ${facultyToken}`,
    });
    assert.equal(classRes.status, 200);
    const hasClass = classRes.data.data.some((c) => c._id === createdClassId);
    assert.ok(hasClass);

    const subjRes = await request('GET', '/api/faculty/subjects', null, {
      Authorization: `Bearer ${facultyToken}`,
    });
    assert.equal(subjRes.status, 200);
    const hasSubj = subjRes.data.data.some((s) => s._id === createdSubjectId);
    assert.ok(hasSubj);
  });

  test('Step 6: Faculty fetches student roster and marks attendance session', async () => {
    const rosterRes = await request(
      'GET',
      `/api/faculty/classes/${createdClassId}/students`,
      null,
      { Authorization: `Bearer ${facultyToken}` }
    );
    assert.equal(rosterRes.status, 200);
    assert.ok(rosterRes.data.data.length >= 1);

    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 90); // far in future
    const isoDate = testDate.toISOString().split('T')[0];

    const markRes = await request(
      'POST',
      '/api/faculty/attendance',
      {
        classId: createdClassId,
        subjectId: createdSubjectId,
        date: isoDate,
        records: [
          {
            student: createdStudentId,
            status: 'present',
            remarks: 'On time for inaugural lab',
          },
        ],
      },
      { Authorization: `Bearer ${facultyToken}` }
    );

    assert.equal(markRes.status, 201);
    assert.equal(markRes.data.success, true);
    assert.equal(markRes.data.data.totalPresent, 1);
    createdAttendanceId = markRes.data.data._id;
  });

  test('Step 7: Duplicate attendance for same class, subject, and date is rejected (409 Conflict)', async () => {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 90);
    const isoDate = testDate.toISOString().split('T')[0];

    const dupRes = await request(
      'POST',
      '/api/faculty/attendance',
      {
        classId: createdClassId,
        subjectId: createdSubjectId,
        date: isoDate,
        records: [{ student: createdStudentId, status: 'present' }],
      },
      { Authorization: `Bearer ${facultyToken}` }
    );

    assert.equal(dupRes.status, 409);
    assert.equal(dupRes.data.success, false);
  });

  // --- STAGE 3: Student Attendance Real-Time Reflection ---
  test('Step 8: Student views Dashboard and sees 100% attendance recorded', async () => {
    const dashRes = await request('GET', '/api/student/dashboard', null, {
      Authorization: `Bearer ${studentToken}`,
    });

    assert.equal(dashRes.status, 200);
    assert.equal(dashRes.data.success, true);
    assert.equal(dashRes.data.data.stats.totalConducted, 1);
    assert.equal(dashRes.data.data.stats.totalAttended, 1);
    assert.equal(dashRes.data.data.stats.overallPercentage, 100);
  });

  test('Step 9: Student views Subject-Wise Attendance and verifies calculations', async () => {
    const subjRes = await request('GET', '/api/student/attendance/subjects', null, {
      Authorization: `Bearer ${studentToken}`,
    });

    assert.equal(subjRes.status, 200);
    assert.equal(subjRes.data.success, true);
    const ourSubj = subjRes.data.data.find((s) => s.subjectId === createdSubjectId);
    assert.ok(ourSubj);
    assert.equal(ourSubj.totalClasses, 1);
    assert.equal(ourSubj.attendedClasses, 1);
    assert.equal(ourSubj.percentage, 100);
    assert.equal(ourSubj.status, 'healthy');
  });

  test('Step 10: Faculty rectifies attendance to absent; Student sees instant attendance update', async () => {
    // Faculty modifies record to absent
    const editRes = await request(
      'PUT',
      `/api/faculty/attendance/${createdAttendanceId}`,
      {
        records: [
          {
            student: createdStudentId,
            status: 'absent',
            remarks: 'Rectified: Student was absent',
          },
        ],
      },
      { Authorization: `Bearer ${facultyToken}` }
    );
    assert.equal(editRes.status, 200);
    assert.equal(editRes.data.data.totalAbsent, 1);
    assert.equal(editRes.data.data.totalPresent, 0);

    // Student dashboard now reflects 0% and triggers low attendance warning
    const studentDash = await request('GET', '/api/student/dashboard', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert.equal(studentDash.status, 200);
    assert.equal(studentDash.data.data.stats.totalMissed, 1);
    assert.equal(studentDash.data.data.stats.overallPercentage, 0);

    // Warnings endpoint includes this subject with classes needed calculated
    const warnRes = await request('GET', '/api/student/attendance/warnings', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert.equal(warnRes.status, 200);
    assert.ok(warnRes.data.data.hasWarnings);
    const ourWarning = warnRes.data.data.warnings.find((w) => w.subjectId === createdSubjectId);
    assert.ok(ourWarning);
    assert.equal(ourWarning.currentPercentage, 0);
    assert.ok(ourWarning.classesNeeded > 0);
  });

  // --- STAGE 4: Security Boundary & RBAC Isolation Verification ---
  test('Step 11: Cross-role security boundary enforcement', async () => {
    // Student cannot access Admin
    const stAdmin = await request('GET', '/api/admin/dashboard/stats', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert.equal(stAdmin.status, 403);

    // Student cannot access Faculty
    const stFaculty = await request('GET', '/api/faculty/dashboard', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert.equal(stFaculty.status, 403);

    // Faculty cannot access Admin
    const facAdmin = await request('GET', '/api/admin/dashboard/stats', null, {
      Authorization: `Bearer ${facultyToken}`,
    });
    assert.equal(facAdmin.status, 403);

    // Faculty cannot mark attendance for unassigned class
    const otherClass = await Class.findOne({ _id: { $ne: createdClassId } });
    if (otherClass) {
      const facOtherClass = await request(
        'GET',
        `/api/faculty/classes/${otherClass._id}/students`,
        null,
        { Authorization: `Bearer ${facultyToken}` }
      );
      assert.equal(facOtherClass.status, 403);
    }
  });
});
