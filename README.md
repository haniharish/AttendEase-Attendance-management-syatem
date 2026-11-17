# AttendEase – Smart Student Attendance Management System

[![Node.js](https://img.shields.io/badge/Node.js-v22.13-339933?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com)
[![JWT](https://img.shields.io/badge/Auth-JWT_HTTP--only_Cookies-FB542B)](https://jwt.io)

AttendEase is an enterprise-grade, modern SaaS-style Student Attendance Management System developed using the MERN stack (MongoDB, Express, React, Node.js). 

This repository contains the completed **Part 1 (Foundation & Authentication)**, **Part 2 (Admin Dashboard & Management System)**, **Part 3 (Faculty Dashboard & Attendance Management System)**, and **Part 4 (Student Dashboard & Attendance Analytics)**.

---

## 🎒 Part 4 Scope & Delivered Features

- **Three-Column Student Portal Layout**:
  - **Left Navigation Sidebar (`256px`)**: Dashboard, My Attendance, Subject-Wise Attendance, Attendance History, Attendance Reports, My Profile, Sign Out with primary-blue active indicator and responsive mobile drawer.
  - **Flexible Center Canvas**: Clean typography, 24px high-radius cards, soft shadows, live metrics, and Recharts interactive graphs.
  - **Right Profile & Activity Sidebar (`320px`)**:
    - **Student Profile**: Avatar, Name, Registration Number, Class & Section, Academic Year.
    - **Interactive Mini Calendar**: Horizontal 7-day selector with pink (`#ec4899`) active date highlighting and lecture attendance status lookup.
    - **Cumulative Attendance Tally**: Real-time counter of Present, Late, and Absent days.
    - **Academic Notice Widget**: Verified enrollment and 75% examination threshold reminder.
- **Student Dashboard Overview** (`/student/dashboard`):
  - 5 Core Metrics: **Overall Attendance Rate**, **Total Conducted Lectures**, **Classes Attended** (Present + Late), **Classes Missed** (Absent), and **Late Arrivals**.
  - Monthly attendance trajectory area chart.
  - Subject summary cards with visual progress bars.
  - Recent lecture activity table with instructor names and attendance badges.
  - Low attendance alert integration.
- **My Attendance Ledger** (`/student/attendance`):
  - Period filters: **All Time**, **Today**, **This Week**, **This Month**, and **Custom Date Range** (`startDate` to `endDate`).
  - Attendance rate summary cards for the selected window.
  - Monthly distribution bar chart.
  - Detailed log table of lecture attendances.
- **Subject-Wise Attendance** (`/student/subjects`):
  - Course-by-course breakdown: Subject Name, Code, Assigned Instructor, Total Conducted, Attended, and Missed.
  - **Visual Attendance Progress Bar**:
    - **Healthy** (`>= 75%`): `#10b981` Emerald Green
    - **Warning** (`65% - 74%`): `#f97316` Amber Orange
    - **Low** (`< 65%`): `#ef4444` Crimson Red
  - **Mathematical Target Recovery**: Exact formula calculation of how many upcoming consecutive classes the student must attend to reach the 75% standard: $\lceil (0.75 \times T - P) / 0.25 \rceil$.
- **Attendance History** (`/student/history`):
  - Search by subject title, subject code, or faculty instructor.
  - Filter by attendance status (Present, Late, Absent).
  - Date range filtering and chronological sort toggle (Newest / Oldest first).
  - Paginated data table (10 records per page).
  - **Data Isolation**: Strict server-side verification ensuring students can only view their own attendance history.
- **Attendance Reports & Visual Analytics** (`/student/reports`):
  - **Overall Attendance Area Chart**: Month-over-month trajectory curve.
  - **Subject Turnout Bar Chart**: Side-by-side percentage comparison across curriculum courses.
  - **Participation Distribution Donut Chart**: Proportional breakdown of Present vs Late vs Absent sessions.
  - **Monthly Performance Table**: Tabular ledger with exact counts and percentages per academic month.
- **Low Attendance Warning System** (`/api/student/attendance/warnings`):
  - Identifies subjects falling below the 75% institutional rule.
  - Provides clear, actionable warnings and the number of consecutive lectures needed to recover.
- **Student Profile Management** (`/student/profile`):
  - Displays full academic enrollment: Name, Registration Number, Institutional Email, Phone Number, Section, Roll Number, and Academic Year.
  - In-place form allowing student to update only permitted fields (`phoneNumber`).
  - Administrative records (Class, Roll number, Registration number, Attendance history) remain strictly immutable.

---

## 🎓 Part 3 Scope & Delivered Features

- **Three-Column Faculty Portal Layout**:
  - Left navigation sidebar (`256px`): Dashboard, My Classes, My Subjects, Mark Attendance, Attendance History, Attendance Reports, Profile, Logout.
  - Center main content: Flexible width, statistics cards, Recharts visualizations, interactive roll-call table.
  - Right profile & quick-action sidebar (`320px`): Faculty profile summary, academic calendar widget, "Mark Roster Now" quick action, recent session ledger.
- **Faculty Dashboard Overview** (`/faculty/dashboard`):
  - 5 Core Metrics: Total Assigned Classes, Total Assigned Subjects, Students Under Faculty, Today's Sessions, Turnout Rate.
  - Recharts 7-Day Attendance Trend Bar Chart (Present vs Late vs Absent breakdown).
  - Assigned classes overview with quick action to mark attendance.
  - Recent lecture attendance rosters marked by the faculty.
- **My Classes Management** (`/faculty/classes`):
  - View classes assigned strictly to the logged-in faculty member.
  - Display Class name, Section, Academic year, Enrolled learners count, and assigned course tags.
  - Search classes and filter by section.
  - Quick action to launch attendance for each class.
- **My Subjects Management** (`/faculty/subjects`):
  - View courses assigned to the logged-in faculty member.
  - Display Course name, Course code, Associated class, Section, and Enrolled students.
  - Search courses, launch roster marking, or inspect subject attendance logs.
- **Mark Attendance – Core Feature** (`/faculty/mark-attendance`):
  - **8-Step Professional Workflow**:
    1. Select assigned class.
    2. Select assigned subject (auto-filtered to subjects linked to that class).
    3. Select lecture date.
    4. Enrolled students automatically populated with Roll number, Name, and Registration number.
    5. Mark attendance status: **Present** (Green), **Late** (Amber), or **Absent** (Red).
    6. Bulk action buttons: *Mark All Present*, *Mark All Absent*, and *Reset*.
    7. Live summary counters: Total learners, Present count, Late count, Absent count, Real-time Turnout %.
    8. Confirmation modal with full session review before persisting to MongoDB.
  - **Duplicate Session Prevention**: Strict validation preventing duplicate rosters on the same class, subject, and date (HTTP 409 Conflict with direct link to rectify in History).
  - **Authorization Verification**: Faculty can only mark attendance for classes and subjects officially assigned to them (HTTP 403 Forbidden on unassigned records).
- **Attendance History & Log Inspection** (`/faculty/history`):
  - View all past lecture sessions marked by the instructor.
  - Multi-criteria filtering: Search term, class filter, subject filter, and date filter.
  - **Inspect Session Modal**: Detailed student-by-student roll breakdown with status badges and remarks.
  - **Rectify / Edit Session Modal**: Inline status and remarks modification for error corrections, maintaining audit logs.
- **Attendance Reports & Analytics** (`/faculty/reports`):
  - Configurable temporal window: Past 7 days, 14 days, or 30 days.
  - Recharts Daily Turnout Trend Area Chart.
  - Recharts Class Turnout Comparison Bar Chart.
  - Recharts Subject Turnout Breakdown Bar Chart.
  - Summary metrics: Recorded sessions, Present logs, Late arrivals, Absences, Overall Turnout %.
- **Faculty Profile & Teaching Load** (`/faculty/profile`):
  - View instructor credentials: Full Name, Employee ID, Email, Department, Verified Status.
  - Update official contact phone number.
  - Chips and cards for assigned classes and courses.

---

## 🚀 Part 2 Scope & Delivered Features

- **Three-Column SuperDesign Dashboard Layout**:
  - Left navigation sidebar (`256px`): Dashboard, Students, Faculty, Classes, Subjects, Attendance Reports, Settings, Logout.
  - Center main content: Flexible width, statistics cards, Recharts visualizations, interactive data tables.
  - Right profile & activity sidebar (`320px`): Admin profile, active academic term date widget, system alerts, and real-time MongoDB activity logs.
- **Admin Dashboard Overview** (`/admin/dashboard`):
  - 6 Key Statistics: Total Students, Total Faculty, Total Classes, Total Subjects, Today's Present, Today's Absent.
  - Recharts 7-Day Attendance Trend Area Chart.
  - Recent lecture attendance rosters marked in the system.
  - Quick action shortcuts (Add Student, Add Faculty, Create Class, Add Subject).
- **Student Management CRUD** (`/admin/students`):
  - Enrolls students with full name, registration number, email, class, section, roll number, and phone number.
  - Full-text search, class filters, section filters, pagination, and view details modal.
  - Edit student profile, class reassignment, and safe delete dialogs.
- **Faculty Management CRUD** (`/admin/faculty`):
  - Add instructors with automated creation of authorized faculty login accounts.
  - Search by name, employee ID, and department filter.
  - Modal for allocating teaching courses and classroom sections to faculty.
- **Class & Section Management** (`/admin/classes`):
  - Create and configure classes, sections (A, B, C), and academic year (2026-2027).
  - Enrolled student count, mapped subject count, and drawer showing class members.
  - **Safe Deletion Guard**: Prevents deletion of classes with dependent students or subjects.
- **Subject Management** (`/admin/subjects`):
  - Catalog academic courses with unique codes (e.g. `CS-301`, `CS-302`), credits, and syllabus details.
  - Map subjects to specific classes and assign qualified faculty.
- **Attendance Intelligence & Reports** (`/admin/reports`):
  - Overall attendance turnout percentage.
  - Class-wise attendance comparison bar chart.
  - Subject-wise performance breakdown.
  - Date-wise trend lines with configurable 7/14/30 day filters.
  - Detailed lecture session logs queried directly from MongoDB.
- **System Settings** (`/admin/settings`):
  - Institution profile, academic year management, 75% attendance policy threshold controls.

---

## 🎨 Master Design System Specifications

| Purpose | Hex Code | Visual Application |
|---|---|---|
| **Main Background** | `#f8f9fc` | Base app background canvas |
| **Card Background** | `#ffffff` | Elevated component surface |
| **Primary Blue** | `#0d6efd` | Primary brand CTA, highlights, links |
| **Secondary Orange** | `#f97316` | Faculty indicators, alerts, secondary accents |
| **Success Green** | `#10b981` | Present status, positive metrics, badges |
| **Pink** | `#ec4899` | Subject analytics, charts |
| **Purple** | `#a855f7` | Admin badges, security indicators |
| **Primary Text** | `#1e293b` | Headings, bold text, high-contrast labels |
| **Secondary Text** | `#64748b` | Muted descriptions, metadata, subtitles |
| **Border** | `#f3f4f6` | Dividers, subtle card strokes |
| **Warning** | `#f59e0b` | Low attendance warnings (<75%) |
| **Error** | `#ef4444` | Absent status, validation errors |

- **Typography**: Plus Jakarta Sans (Google Fonts, weights 400 to 800)
- **Border Radius**: Cards: `24px`, Sections: `24px–32px`, Buttons: `12px`, Inputs: `12px`, Badges: `8px–12px`
- **Shadows**: Subtle `shadow-sm`, elevation on hover, primary CTA `shadow-lg shadow-blue-500/20`

---

## 📁 Repository Structure

```
AttendEase/
│
├── frontend/                     # React + Vite + Tailwind CSS SPA
│   ├── public/                   # Static favicon and assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/            # AdminSidebar (256px), AdminRightSidebar (320px), Modal, ConfirmDialog, StatCard
│   │   │   ├── common/           # Navbar, Footer, Button, Input, Card, Badge, LoadingSpinner
│   │   │   └── landing/          # HeroSection, FeaturesSection, HowItWorksSection, BenefitsSection, CtaBanner
│   │   ├── context/              # AuthContext (user, login, register, logout, checkAuth)
│   │   ├── layouts/              # AdminLayout (3-column), DashboardLayout
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── UnauthorizedPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── admin/            # StudentManagement, FacultyManagement, ClassManagement, SubjectManagement, Reports, Settings
│   │   │   └── dashboards/       # AdminDashboardPage, FacultyDashboardPage, StudentDashboardPage
│   │   ├── routes/               # AppRoutes, ProtectedRoute, RoleProtectedRoute, PublicOnlyRoute
│   │   ├── services/             # Axios API instance, authService, adminService
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                      # Node.js + Express + MongoDB REST API
│   ├── config/
│   │   └── db.js                 # Mongoose connection & disconnect helpers
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Me, Logout
│   │   ├── dashboardController.js# Stats, Chart data, Activity logs
│   │   ├── studentController.js  # Student CRUD & enrollment
│   │   ├── facultyController.js  # Faculty CRUD & assignments
│   │   ├── classController.js    # Class CRUD & section checks
│   │   ├── subjectController.js  # Subject CRUD & course allocations
│   │   └── reportController.js   # Attendance overview, class-wise, subject-wise, date-wise
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token verification (cookie/header)
│   │   ├── roleMiddleware.js     # Reusable role-based authorization (authorize('admin'))
│   │   └── errorMiddleware.js    # Central error & 404 handler
│   ├── models/
│   │   ├── User.js               # Core authentication model
│   │   ├── Student.js            # Enrolled student profiles
│   │   ├── Faculty.js            # Instructor profiles & teaching allocations
│   │   ├── Class.js              # Classrooms, branches, sections
│   │   ├── Subject.js            # Academic course catalog
│   │   ├── Attendance.js         # Real daily session records & turnout
│   │   └── ActivityLog.js        # Audit trail of administrative events
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints
│   │   └── adminRoutes.js        # /api/admin/* endpoints
│   ├── test/
│   │   ├── auth.test.js          # Authentication test suite
│   │   └── admin.test.js         # Admin CRUD & reports test suite (22/22 passing)
│   ├── utils/
│   │   └── seed.js               # Database seeder for classes, subjects, faculty, students, attendance logs
│   ├── .env.example
│   ├── server.js                 # Express server entry point
│   └── package.json
│
├── .gitignore
├── package.json                  # Root runner script configuration
└── README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended, tested on v22.13)
- [MongoDB](https://www.mongodb.com/) (local daemon or MongoDB Atlas URI)

### 1. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env` (or copy from `backend/.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/attendease
JWT_SECRET=attendease_super_secure_jwt_secret_key_2026_dev
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Seed Demo Data

Seed complete test accounts, classes, subjects, faculty, students, and 5 days of attendance sessions:

```bash
cd backend
npm run seed
```

This populates the following accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@attendease.com` | `AdminPassword123!` | Full Admin Management Suite |
| **Faculty** | `faculty@attendease.com` | `FacultyPassword123!` | Faculty Hub (Part 3) |
| **Student** | `student@attendease.com` | `StudentPassword123!` | Student Portal (Part 4) |

---

## 🏃 Running the Application

### Start Backend Server
```bash
cd backend
npm start
# API listening on http://localhost:5000
```

### Start Frontend Dev Server
```bash
cd frontend
npm run dev
# Vite UI running on http://localhost:5173
```

---

## 🧪 Automated Testing

Run all four test suites (Part 1 Auth + Part 2 Admin + Part 3 Faculty + Part 4 Student):

```bash
cd backend
npm test
```

### Test Coverage Highlights (47/47 Passing):
- ✅ `GET /api/health` verification
- ✅ Student registration with validation
- ✅ Role enforcement (cannot escalate to admin via public signup)
- ✅ Duplicate email & password mismatch handling
- ✅ JWT cookie authentication & logout
- ✅ Unauthenticated access to admin APIs blocked (401)
- ✅ Student access to admin APIs blocked (403 Forbidden)
- ✅ Admin dashboard statistics & weekly trend calculation
- ✅ Class creation, retrieval, update, and dependent delete prevention
- ✅ Subject creation, code uniqueness, and faculty assignment
- ✅ Student creation, roll number collision prevention, search, and deletion
- ✅ Faculty creation with auto-provisioned user login and course assignment
- ✅ Admin attendance reports overview, class-wise, subject-wise, and date-wise queries
- ✅ Unauthenticated access to faculty APIs blocked (401)
- ✅ Student access to faculty endpoints blocked (403 Forbidden)
- ✅ Faculty dashboard overview stats (assigned classes, subjects, students, turnout rate)
- ✅ Faculty can retrieve list of assigned classes
- ✅ Faculty can retrieve list of assigned subjects
- ✅ Faculty can retrieve student roster for assigned class
- ✅ Faculty blocked from accessing unassigned class rosters (403 Forbidden)
- ✅ Faculty can mark attendance with Present, Absent, and Late records (201)
- ✅ Duplicate attendance prevention on same class, subject, and date (409 Conflict)
- ✅ Faculty can view attendance history logs
- ✅ Faculty can fetch single attendance session by ID
- ✅ Faculty can update attendance session records (rectification)
- ✅ Faculty can retrieve visual attendance reports and analytics
- ✅ Faculty can view and update profile details
- ✅ Unauthenticated access to student endpoints blocked (401)
- ✅ Faculty blocked from accessing student endpoints (403 Forbidden)
- ✅ Admin blocked from accessing student endpoints directly (403 Forbidden)
- ✅ Student can access personal dashboard statistics from real attendance data (200)
- ✅ Student can view profile credentials
- ✅ Student can update contact phone number but cannot escalate or alter registration number
- ✅ Student can fetch detailed attendance records with date filters (today, week, month, custom)
- ✅ Student can fetch subject-wise attendance breakdown with percentage calculation
- ✅ Student can fetch attendance history with search, status filters, and pagination
- ✅ Student can fetch visual analytics (monthly trend, subject comparison, participation distribution)
- ✅ Student can fetch low attendance warnings with consecutive classes needed target calculation

---

## 🗺️ Five-Part Development Roadmap

- **Part 1 (Done)**: Project setup, design system, landing page, authentication, and role routing.
- **Part 2 (Done)**: Admin dashboard, student & faculty management, classes, subjects, faculty assignments, and attendance reports.
- **Part 3 (Done)**: Faculty dashboard, classroom session marking, attendance editing, assigned classes/subjects, and faculty analytics.
- **Part 4 (Done)**: Student dashboard, attendance history, subject percentages, low-attendance warnings, and analytics.
- **Part 5 (Next)**: Integration, end-to-end testing, validation, and final production polish.
