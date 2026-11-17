const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const ActivityLog = require('../models/ActivityLog');

dotenv.config();

const seedDatabase = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendease';
    await mongoose.connect(connUri);
    console.log('[Seed] Connected to MongoDB');

    // 1. Seed Core User Accounts
    const demoAccounts = [
      {
        name: 'System Administrator',
        email: 'admin@attendease.com',
        password: 'AdminPassword123!',
        role: 'admin',
        isActive: true,
      },
      {
        name: 'Dr. Sarah Jenkins',
        email: 'faculty@attendease.com',
        password: 'FacultyPassword123!',
        role: 'faculty',
        isActive: true,
      },
      {
        name: 'Prof. Robert Davis',
        email: 'robert.davis@attendease.com',
        password: 'FacultyPassword123!',
        role: 'faculty',
        isActive: true,
      },
      {
        name: 'Alex Johnson',
        email: 'student@attendease.com',
        password: 'StudentPassword123!',
        role: 'student',
        isActive: true,
      },
    ];

    const userMap = {};
    for (const acc of demoAccounts) {
      let user = await User.findOne({ email: acc.email });
      if (!user) {
        user = await User.create(acc);
        console.log(`[Seed] Created ${acc.role} account: ${acc.email}`);
      } else {
        console.log(`[Seed] Account already exists: ${acc.email}`);
      }
      userMap[acc.email] = user;
    }

    // 2. Seed Classes
    const sampleClasses = [
      {
        name: 'Computer Science & Engineering',
        section: 'A',
        academicYear: '2026-2027',
        description: 'Third Year B.Tech CSE Batch Morning',
      },
      {
        name: 'Computer Science & Engineering',
        section: 'B',
        academicYear: '2026-2027',
        description: 'Third Year B.Tech CSE Batch Afternoon',
      },
      {
        name: 'Information Technology',
        section: 'A',
        academicYear: '2026-2027',
        description: 'Second Year B.Tech IT Morning',
      },
      {
        name: 'Mechanical Engineering',
        section: 'A',
        academicYear: '2026-2027',
        description: 'Fourth Year B.Tech ME Core',
      },
    ];

    const classMap = {};
    for (const c of sampleClasses) {
      let cls = await Class.findOne({
        name: c.name,
        section: c.section,
        academicYear: c.academicYear,
      });
      if (!cls) {
        cls = await Class.create(c);
        console.log(`[Seed] Created class: ${cls.name} (${cls.section})`);
      }
      classMap[`${c.name}-${c.section}`] = cls;
    }

    // 3. Seed Faculty Profiles
    const faculty1User = userMap['faculty@attendease.com'];
    let faculty1 = await Faculty.findOne({ email: faculty1User.email });
    if (!faculty1) {
      faculty1 = await Faculty.create({
        user: faculty1User._id,
        fullName: 'Dr. Sarah Jenkins',
        employeeId: 'FAC-1001',
        email: faculty1User.email,
        phoneNumber: '+1 (555) 234-5678',
        department: 'Computer Science & Engineering',
        assignedClasses: [classMap['Computer Science & Engineering-A']._id],
      });
      console.log(`[Seed] Created faculty profile for: ${faculty1.fullName}`);
    }

    const faculty2User = userMap['robert.davis@attendease.com'];
    let faculty2 = await Faculty.findOne({ email: faculty2User.email });
    if (!faculty2) {
      faculty2 = await Faculty.create({
        user: faculty2User._id,
        fullName: 'Prof. Robert Davis',
        employeeId: 'FAC-1002',
        email: faculty2User.email,
        phoneNumber: '+1 (555) 345-6789',
        department: 'Information Technology',
        assignedClasses: [classMap['Information Technology-A']._id],
      });
      console.log(`[Seed] Created faculty profile for: ${faculty2.fullName}`);
    }

    // 4. Seed Subjects
    const sampleSubjects = [
      {
        name: 'Database Management Systems',
        code: 'CS-301',
        description: 'Relational algebra, SQL, indexing, transaction management',
        class: classMap['Computer Science & Engineering-A']._id,
        faculty: faculty1._id,
        credits: 4,
      },
      {
        name: 'Computer Networks & Security',
        code: 'CS-302',
        description: 'OSI layers, TCP/IP protocol stack, network security',
        class: classMap['Computer Science & Engineering-A']._id,
        faculty: faculty1._id,
        credits: 4,
      },
      {
        name: 'Data Structures & Algorithms',
        code: 'IT-201',
        description: 'Trees, graphs, asymptotic analysis, dynamic programming',
        class: classMap['Information Technology-A']._id,
        faculty: faculty2._id,
        credits: 4,
      },
      {
        name: 'Operating Systems',
        code: 'CS-303',
        description: 'Process scheduling, virtualization, file systems, IPC',
        class: classMap['Computer Science & Engineering-B']._id,
        faculty: faculty2._id,
        credits: 3,
      },
    ];

    const subjectMap = {};
    for (const s of sampleSubjects) {
      let subj = await Subject.findOne({ code: s.code });
      if (!subj) {
        subj = await Subject.create(s);
        console.log(`[Seed] Created subject: ${subj.code} - ${subj.name}`);
      }
      subjectMap[s.code] = subj;
    }

    // Update faculty assigned subjects
    await Faculty.findByIdAndUpdate(faculty1._id, {
      $addToSet: { assignedSubjects: { $each: [subjectMap['CS-301']._id, subjectMap['CS-302']._id] } },
    });
    await Faculty.findByIdAndUpdate(faculty2._id, {
      $addToSet: { assignedSubjects: { $each: [subjectMap['IT-201']._id, subjectMap['CS-303']._id] } },
    });

    // 5. Seed Students
    const studentUser = userMap['student@attendease.com'];
    const sampleStudents = [
      {
        user: studentUser._id,
        fullName: 'Alex Johnson',
        registrationNumber: 'REG-2026-001',
        email: 'student@attendease.com',
        phoneNumber: '+1 (555) 789-0123',
        class: classMap['Computer Science & Engineering-A']._id,
        section: 'A',
        rollNumber: '01',
      },
      {
        fullName: 'Emma Watson',
        registrationNumber: 'REG-2026-002',
        email: 'emma.watson@student.attendease.com',
        phoneNumber: '+1 (555) 890-1234',
        class: classMap['Computer Science & Engineering-A']._id,
        section: 'A',
        rollNumber: '02',
      },
      {
        fullName: 'Michael Kane',
        registrationNumber: 'REG-2026-003',
        email: 'michael.kane@student.attendease.com',
        phoneNumber: '+1 (555) 901-2345',
        class: classMap['Computer Science & Engineering-A']._id,
        section: 'A',
        rollNumber: '03',
      },
      {
        fullName: 'Sophia Chen',
        registrationNumber: 'REG-2026-004',
        email: 'sophia.chen@student.attendease.com',
        phoneNumber: '+1 (555) 912-3456',
        class: classMap['Computer Science & Engineering-A']._id,
        section: 'A',
        rollNumber: '04',
      },
      {
        fullName: 'David Miller',
        registrationNumber: 'REG-2026-005',
        email: 'david.miller@student.attendease.com',
        phoneNumber: '+1 (555) 923-4567',
        class: classMap['Information Technology-A']._id,
        section: 'A',
        rollNumber: '01',
      },
      {
        fullName: 'Olivia Taylor',
        registrationNumber: 'REG-2026-006',
        email: 'olivia.taylor@student.attendease.com',
        phoneNumber: '+1 (555) 934-5678',
        class: classMap['Information Technology-A']._id,
        section: 'A',
        rollNumber: '02',
      },
    ];

    const studentList = [];
    for (const st of sampleStudents) {
      let student = await Student.findOne({ registrationNumber: st.registrationNumber });
      if (!student) {
        student = await Student.create(st);
        console.log(`[Seed] Enrolled student: ${student.fullName} (${student.registrationNumber})`);
      }
      studentList.push(student);
    }

    // 6. Seed Real Attendance Records for the past 5 days
    const cseClass = classMap['Computer Science & Engineering-A'];
    const cseStudents = studentList.filter((s) => s.class.toString() === cseClass._id.toString());
    const dbmsSubject = subjectMap['CS-301'];

    for (let i = 4; i >= 0; i--) {
      const attendanceDate = new Date();
      attendanceDate.setDate(attendanceDate.getDate() - i);
      attendanceDate.setHours(9, 30, 0, 0);

      const existingRecord = await Attendance.findOne({
        class: cseClass._id,
        subject: dbmsSubject._id,
        date: {
          $gte: new Date(new Date(attendanceDate).setHours(0, 0, 0, 0)),
          $lte: new Date(new Date(attendanceDate).setHours(23, 59, 59, 999)),
        },
      });

      if (!existingRecord) {
        const records = cseStudents.map((st, idx) => ({
          student: st._id,
          status: (i === 1 && idx === 2) ? 'absent' : (i === 3 && idx === 3 ? 'late' : 'present'),
          remarks: (i === 1 && idx === 2) ? 'Medical leave requested' : '',
        }));

        await Attendance.create({
          date: attendanceDate,
          class: cseClass._id,
          subject: dbmsSubject._id,
          faculty: faculty1._id,
          records,
        });
        console.log(`[Seed] Logged attendance session for ${attendanceDate.toDateString()}`);
      }
    }

    // 7. Seed Initial Activity Logs
    const adminUser = userMap['admin@attendease.com'];
    const initialActivities = [
      {
        action: 'SYSTEM_INIT',
        entity: 'System',
        details: 'AttendEase Management System initialized with academic batch 2026-2027',
        performedBy: adminUser._id,
      },
      {
        action: 'CREATE_FACULTY',
        entity: 'Faculty',
        entityId: faculty1._id,
        details: 'Assigned Dr. Sarah Jenkins to Computer Science Department',
        performedBy: adminUser._id,
      },
      {
        action: 'CREATE_CLASS',
        entity: 'Class',
        entityId: cseClass._id,
        details: 'Configured class Computer Science & Engineering (Section A)',
        performedBy: adminUser._id,
      },
      {
        action: 'CREATE_STUDENT',
        entity: 'Student',
        entityId: studentList[0]._id,
        details: 'Enrolled student Alex Johnson (REG-2026-001) in CSE Section A',
        performedBy: adminUser._id,
      },
    ];

    for (const act of initialActivities) {
      await ActivityLog.create(act);
    }
    console.log('[Seed] Seeded initial activity logs');

    console.log('[Seed] Seeding finished successfully.');
    if (require.main === module) {
      await mongoose.connection.close();
      process.exit(0);
    }
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
