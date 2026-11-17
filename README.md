# AttendEase – Smart Student Attendance Management System

[![Node.js](https://img.shields.io/badge/Node.js-v22.13-339933?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com)
[![JWT](https://img.shields.io/badge/Auth-JWT_HTTP--only_Cookies-FB542B)](https://jwt.io)
[![Tests](https://img.shields.io/badge/Tests-58%2F58%20Passing%20(100%25)-10b981)](https://github.com/haniharish/AttendEase-Attendance-management-syatem)

AttendEase is an enterprise-grade, modern SaaS educational management platform developed using the MERN stack (MongoDB, Express, React, Node.js). It provides a unified system for administrators, faculty instructors, and students to track, mark, audit, and analyze academic attendance in real time.

All five development parts are completed, fully integrated, verified, and committed.

---

## 🏛️ System Architecture & Portals

AttendEase features a unified **SuperDesign Three-Column Dashboard Architecture** across all three authenticated user roles:
- **Left Navigation Sidebar (`256px`)**: Role-specific modules, active indicator with primary blue highlighting, and responsive mobile drawers.
- **Center Canvas**: Flexible workspace with high-radius cards (`24px`), subtle shadows (`shadow-xs`), and Recharts visual analytics.
- **Right Profile & Activity Sidebar (`320px`)**: Live profile cards, academic term widgets, horizontal calendar date pickers, quick-action shortcuts, and activity ledgers.

```
                                  ┌────────────────────────┐
                                  │      Client (SPA)      │
                                  │   React 18 + Vite 6    │
                                  │      Tailwind CSS      │
                                  └───────────┬────────────┘
                                              │ HTTP / JSON
                                              │ (withCredentials: true)
                                              ▼
                                  ┌────────────────────────┐
                                  │   Express 4.21 API     │
                                  │  JWT + Role Middleware │
                                  └───────────┬────────────┘
                                              │
                      ┌───────────────────────┼──────────────────────┐
                      ▼                       ▼                      ▼
               /api/admin/*            /api/faculty/*          /api/student/*
             (Admin Management)      (Attendance Marking)    (Student Analytics)
                      │                       │                      │
                      └───────────────────────┼──────────────────────┘
                                              │ Mongoose ORM
                                              ▼
                                  ┌────────────────────────┐
                                  │     MongoDB 8.0        │
                                  │   (Indexes + Unique)   │
                                  └────────────────────────┘
```

---

## 🌟 Complete Feature Matrix

### 1. Public & Authentication Portal (Part 1)
- **High-Converting Landing Page**: Hero section with interactive CTA, core platform features, "How It Works" step sequence, benefits overview, and responsive navigation.
- **Secure Authentication**:
  - JWT token generation with HTTP-only cookies and Authorization header fallback.
  - Password hashing with `bcrypt.js` (salt factor 10).
  - Public registration locked strictly to the `student` role (prevents privilege escalation).
  - Role-based automatic post-login redirection (`/admin/dashboard`, `/faculty/dashboard`, `/student/dashboard`).
  - Session timeout and logout with cookie invalidation.

### 2. Admin Management System (Part 2)
- **Overview Dashboard** (`/admin/dashboard`): 6 real-time metrics (Total Students, Faculty, Classes, Subjects, Today's Present, Today's Absent), 7-day attendance trend area chart, recent marked rosters, quick action shortcuts.
- **Student CRUD** (`/admin/students`): Enroll students, full-text search, class and section filters, roll number collision prevention, pagination, student detail drawer, and safe deletion.
- **Faculty CRUD** (`/admin/faculty`): Register instructors with auto-provisioned user logins, department filters, search, and class/course allocation.
- **Class Management** (`/admin/classes`): Create cohorts, academic years, sections (A, B, C), and dependent record deletion guards.
- **Subject Catalog** (`/admin/subjects`): Catalog course codes (`CS-301`, `CS-302`), credit hours, class mapping, and faculty instructor assignment.
- **Institutional Reports** (`/admin/reports`): Overall percentage, class-wise comparison bar charts, subject performance breakdown, and date-wise trends.
- **System Settings** (`/admin/settings`): Academic term metadata and minimum threshold configuration (default 75%).

### 3. Faculty Dashboard & Attendance Marking (Part 3)
- **Faculty Hub** (`/faculty/dashboard`): Total assigned classes, subjects, students under faculty, today's lecture sessions, attendance turnout percentage, and 7-day Recharts weekly bar chart.
- **Assigned Classes** (`/faculty/classes`): View only classes assigned to the instructor with enrolled learner counts and direct roll-call triggers.
- **Assigned Subjects** (`/faculty/subjects`): Courses mapped to the instructor with direct shortcuts to launch attendance or inspect logs.
- **Mark Attendance – Core Module** (`/faculty/mark-attendance`):
  - 8-Step marking workflow: Select Class $\rightarrow$ Select Subject $\rightarrow$ Select Date $\rightarrow$ Populate Enrolled Roster $\rightarrow$ Interactive Status Toggles (Present, Late, Absent) $\rightarrow$ Bulk Actions (Mark All Present, Mark All Absent, Reset) $\rightarrow$ Real-Time Summary Counters $\rightarrow$ Confirmation Modal $\rightarrow$ Save.
  - Duplicate Prevention: Enforces unique class-subject-date index (`HTTP 409 Conflict`) with direct links to edit in History.
  - Strict Authorization: Faculty blocked from marking unassigned classes (`HTTP 403 Forbidden`).
- **Attendance History & Rectification** (`/faculty/history`):
  - Filterable past session log table (search, class, subject, date).
  - **Inspect Modal**: Detailed student-by-student roll breakdown.
  - **Rectify Modal**: Edit individual student attendance statuses and remarks with an audit trail.
- **Faculty Analytics** (`/faculty/reports`): 7/14/30-day temporal window, daily turnout area chart, class comparison, and course breakdown.
- **Faculty Profile** (`/faculty/profile`): Instructor credentials, assigned teaching load chips, and contact phone number updates.

### 4. Student Dashboard & Attendance Analytics (Part 4)
- **Student Hub** (`/student/dashboard`): Overall attendance percentage, total classes conducted, attended, missed, and late arrivals.
- **Interactive Mini Calendar**: Horizontal 7-day selector with pink (`#ec4899`) active highlight and lecture status lookup.
- **My Attendance Ledger** (`/student/attendance`): Time filters (*All Time*, *Today*, *This Week*, *This Month*, *Custom Range*), monthly distribution bar chart, and detailed participation log.
- **Subject-Wise Attendance** (`/student/subjects`):
  - Visual Progress Bars: Green (&ge; 75%), Orange (65-74%), Pink/Red (< 65%).
  - Mathematical Target Recovery: Calculates exact upcoming consecutive classes needed to cross the 75% threshold: $\lceil (0.75 \times T - P) / 0.25 \rceil$.
- **Attendance History** (`/student/history`): Search by course/faculty, status filters, date range filters, sort toggle, and paginated table. Data isolation guarantees students view only their own records.
- **Attendance Analytics** (`/student/reports`): Trajectory area chart, subject comparison bar chart, participation distribution donut chart, and monthly tabular summary.
- **Low Attendance Warning System**: Immediate notification when any subject falls below 75%.
- **Student Profile** (`/student/profile`): Verified student credentials with strict security immutability on academic fields.

### 5. Final Integration, Performance & Security (Part 5)
- **Route-Level Code-Splitting**: Replaced static imports with `React.lazy` and `Suspense`, eliminating bundle warnings and optimizing initial load time.
- **Database Optimization**: Compound indexes added on `Attendance` (`date + class + subject`, `'records.student'`, `faculty + date`) and `Student` (`class + rollNumber`, `user`).
- **End-to-End Integration Suite**: Automated test suite simulating the full admin-faculty-student lifecycle.

---

## 🎨 Design System Specifications

| Purpose | Hex Code | Visual Application |
|---|---|---|
| **Main Background** | `#f8f9fc` | Base canvas background |
| **Card Surface** | `#ffffff` | Elevated card components |
| **Primary Blue** | `#0d6efd` | Primary brand CTA, highlights, active nav pills |
| **Secondary Orange**| `#f97316` | Faculty indicators, warning status, secondary accents |
| **Success Green**   | `#10b981` | Present status, positive metrics, badges |
| **Pink**            | `#ec4899` | Mini-calendar active highlight, low status |
| **Purple**          | `#a855f7` | Admin indicators, course credit badges |
| **Primary Text**    | `#1e293b` | Headings, bold text, high-contrast labels |
| **Secondary Text**  | `#64748b` | Muted labels, metadata, subtitles |
| **Border**          | `#f3f4f6` | Dividers, subtle card strokes |
| **Warning**         | `#f59e0b` | Late status, warning badges |
| **Error**           | `#ef4444` | Absent status, critical shortage alerts |

- **Typography**: Exclusively **Plus Jakarta Sans** (Google Fonts weights 400 to 800).
- **Border Radius**: Main cards: `24px`, Large banners: `24px–32px`, Buttons & Inputs: `12px`, Badges: `8px–12px`.
- **Shadows**: Subtle `shadow-xs` / `shadow-sm`, elevation on hover, primary CTA `shadow-md shadow-brand-blue/20`.

---

## 📁 Repository Structure

```
AttendEase/
├── backend/
│   ├── config/
│   │   └── db.js                        # Mongoose database connection
│   ├── controllers/
│   │   ├── authController.js            # Login, register, logout, getMe
│   │   ├── adminController.js           # Admin student, faculty, class, subject CRUD
│   │   ├── dashboardController.js       # Admin overview metrics & activity logs
│   │   ├── classController.js           # Class lifecycle & validation
│   │   ├── facultyController.js         # Faculty directory & assignment
│   │   ├── studentController.js         # Student directory & registration
│   │   ├── subjectController.js         # Curriculum catalog & allocation
│   │   ├── reportController.js          # Admin attendance intelligence
│   │   ├── facultyAttendanceController.js # Faculty marking, history, reports
│   │   └── studentAttendanceController.js # Student personal dashboard & analytics
│   ├── middleware/
│   │   ├── authMiddleware.js            # JWT verification & user lookup
│   │   ├── roleMiddleware.js            # Role-based access control (RBAC)
│   │   └── errorMiddleware.js           # Centralized exception handler
│   ├── models/
│   │   ├── User.js                      # Base authentication model
│   │   ├── Student.js                   # Enrolled student profiles
│   │   ├── Faculty.js                   # Instructor profiles & assignments
│   │   ├── Class.js                     # Academic cohorts & sections
│   │   ├── Subject.js                   # Curriculum subjects
│   │   ├── Attendance.js                # Roster session logs & subdocuments
│   │   └── ActivityLog.js               # Audit trail for operations
│   ├── routes/
│   │   ├── authRoutes.js                # /api/auth endpoints
│   │   ├── adminRoutes.js               # /api/admin endpoints
│   │   ├── facultyRoutes.js             # /api/faculty endpoints
│   │   └── studentRoutes.js             # /api/student endpoints
│   ├── test/
│   │   ├── auth.test.js                 # Authentication & authorization suite
│   │   ├── admin.test.js                # Admin management & reports suite
│   │   ├── faculty.test.js              # Faculty marking & history suite
│   │   ├── student.test.js              # Student analytics & warnings suite
│   │   └── integration.test.js          # Multi-role end-to-end integration suite
│   ├── utils/
│   │   └── seed.js                      # Database seeder with demo accounts
│   ├── .env.example
│   ├── package.json
│   └── server.js                        # Express server entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/                   # AdminSidebar, AdminRightSidebar, Modal, ConfirmDialog
│   │   │   ├── common/                  # Navbar, Footer, Button, Input, Card, Badge, Spinner
│   │   │   ├── faculty/                 # FacultySidebar, FacultyRightSidebar
│   │   │   ├── landing/                 # HeroSection, FeaturesSection, BenefitsSection, etc.
│   │   │   └── student/                 # StudentSidebar, StudentRightSidebar, ProgressBar, Warning
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # User state, token refresh, login, logout
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx          # 3-column admin workspace
│   │   │   ├── FacultyLayout.jsx        # 3-column faculty workspace
│   │   │   └── StudentLayout.jsx        # 3-column student workspace
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── UnauthorizedPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── admin/                   # Student, Faculty, Class, Subject, Reports, Settings
│   │   │   ├── faculty/                 # Classes, Subjects, MarkAttendance, History, Reports, Profile
│   │   │   ├── student/                 # MyAttendance, Subjects, History, Reports, Profile
│   │   │   └── dashboards/              # Admin, Faculty, and Student Dashboard homepages
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx            # Lazy-loaded code-split routes
│   │   │   ├── ProtectedRoute.jsx       # Auth guard
│   │   │   ├── RoleProtectedRoute.jsx   # Role guard
│   │   │   └── PublicOnlyRoute.jsx      # Guest guard
│   │   ├── services/
│   │   │   ├── api.js                   # Axios client with interceptors
│   │   │   ├── authService.js
│   │   │   ├── adminService.js
│   │   │   ├── facultyService.js
│   │   │   └── studentService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🔌 API Endpoint Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| **Health** | `GET /api/health` | Public | System status and uptime check |
| **Auth** | `POST /api/auth/register` | Public | Register student account |
| **Auth** | `POST /api/auth/login` | Public | Authenticate user & return token/cookie |
| **Auth** | `GET /api/auth/me` | Authenticated | Fetch current authenticated user session |
| **Auth** | `POST /api/auth/logout` | Authenticated | Clear authentication session & cookie |
| **Admin** | `GET /api/admin/dashboard/stats` | Admin | 6-metric overview & attendance tally |
| **Admin** | `GET /api/admin/dashboard/activities`| Admin | Recent audit activity logs |
| **Admin** | `GET/POST /api/admin/classes` | Admin | List & create academic cohorts |
| **Admin** | `PUT/DELETE /api/admin/classes/:id` | Admin | Update & safely delete class |
| **Admin** | `GET/POST /api/admin/subjects` | Admin | Catalog & map curriculum courses |
| **Admin** | `PUT/DELETE /api/admin/subjects/:id`| Admin | Update & delete subject |
| **Admin** | `GET/POST /api/admin/faculty` | Admin | Directory & provision faculty account |
| **Admin** | `PUT/DELETE /api/admin/faculty/:id` | Admin | Update & delete faculty member |
| **Admin** | `GET/POST /api/admin/students` | Admin | Directory & enroll student |
| **Admin** | `PUT/DELETE /api/admin/students/:id`| Admin | Update & delete student |
| **Admin** | `GET /api/admin/reports/overview` | Admin | Aggregate institutional turnout % |
| **Admin** | `GET /api/admin/reports/class-wise` | Admin | Cohort turnout comparison |
| **Admin** | `GET /api/admin/reports/subject-wise`| Admin | Course turnout performance |
| **Admin** | `GET /api/admin/reports/date-wise` | Admin | Temporal trend line queries |
| **Faculty**| `GET /api/faculty/dashboard` | Faculty | Assigned classes, subjects, weekly trend |
| **Faculty**| `GET /api/faculty/classes` | Faculty | Assigned classes only |
| **Faculty**| `GET /api/faculty/classes/:id/students`| Faculty | Enrolled roster for assigned class |
| **Faculty**| `GET /api/faculty/subjects` | Faculty | Assigned courses only |
| **Faculty**| `POST /api/faculty/attendance` | Faculty | Mark & submit attendance roster |
| **Faculty**| `GET /api/faculty/attendance/history` | Faculty | Historical session ledger |
| **Faculty**| `GET /api/faculty/attendance/:id` | Faculty | Single session student breakdown |
| **Faculty**| `PUT /api/faculty/attendance/:id` | Faculty | Rectify / edit attendance records |
| **Faculty**| `GET /api/faculty/reports` | Faculty | Visual analytics & course breakdowns |
| **Faculty**| `GET/PUT /api/faculty/profile` | Faculty | View credentials & update contact phone |
| **Student**| `GET /api/student/dashboard` | Student | Personal metrics, subject summary, warnings |
| **Student**| `GET /api/student/attendance` | Student | Detailed logs with period filters |
| **Student**| `GET /api/student/attendance/subjects`| Student | Course attendance with target recovery |
| **Student**| `GET /api/student/attendance/history` | Student | Paginated personal session history |
| **Student**| `GET /api/student/attendance/analytics`| Student | Recharts trend, comparison, distribution |
| **Student**| `GET /api/student/attendance/warnings` | Student | Subjects below 75% & recovery classes |
| **Student**| `GET/PUT /api/student/profile` | Student | View profile & update contact phone |

---

## 🔐 Security & Access Control Model

1. **Authentication**:
   - Industry-standard JSON Web Tokens (JWT) signed with SHA-256 (`process.env.JWT_SECRET`).
   - Delivered via `HttpOnly`, `SameSite=Lax` cookies with header `Authorization: Bearer <token>` fallback.
   - Passwords hashed with `bcrypt.js` using a salt work factor of 10. Passwords are set with `select: false` on the User model so they are never returned in queries.
2. **Role-Based Authorization (RBAC)**:
   - Evaluated server-side via `protect` and `authorize('admin' | 'faculty' | 'student')` middleware.
   - Route-level client guards (`ProtectedRoute`, `RoleProtectedRoute`, `PublicOnlyRoute`) prevent unauthorized views from rendering.
3. **Data Isolation & Boundary Enforcement**:
   - Faculty members can only access rosters and mark attendance for classes and courses assigned to them (`HTTP 403 Forbidden` on unassigned items).
   - Students identify dynamically from `req.user._id` — query parameters cannot override identity to access another learner's records.
   - Administrative fields (`registrationNumber`, `class`, `section`, `role`, `attendance`) cannot be altered through profile endpoints.

---

## 🏃 Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22.13 recommended)
- **MongoDB**: Community Server running locally on `localhost:27017` or MongoDB Atlas URI

### 1. Clone the Repository
```bash
git clone https://github.com/haniharish/AttendEase-Attendance-management-syatem.git
cd AttendEase-Attendance-management-syatem
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/attendease
JWT_SECRET=attendease_production_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Initialize Database & Seed Demo Accounts
```bash
npm run seed
```
*This populates classes, subjects, demo admin, faculty instructors, enrolled students, and past attendance sessions.*

### 4. Start Backend Server
```bash
npm start
# Server listening on http://localhost:5000
```

### 5. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 6. Start Frontend Development Server
```bash
npm run dev
# Vite UI running on http://localhost:5173
```

---

## 🔑 Demo User Credentials

| Portal | Email | Password | Assigned Scope |
|---|---|---|---|
| **Administrator** | `admin@attendease.com` | `AdminPassword123!` | System Administration & Configuration |
| **Faculty Member** | `faculty@attendease.com` | `FacultyPassword123!` | Dr. Sarah Jenkins (CSE-A, CS-301, CS-302) |
| **Faculty Member** | `robert.davis@attendease.com`| `FacultyPassword123!` | Prof. Robert Davis (IT Dept, IT-201) |
| **Student** | `student@attendease.com` | `StudentPassword123!` | Alex Johnson (CSE-A, Roll #01) |

---

## 🧪 Comprehensive Testing Report

The backend includes 5 automated test suites executed using Node.js built-in test runner (`node --test`).

```bash
cd backend
npm test
```

### Complete Test Results: 58 / 58 Passing (100% Pass Rate)

| Test Suite | Total Tests | Passed | Failed | Status |
|---|---|---|---|---|
| **Authentication & RBAC** (`auth.test.js`) | 10 | 10 | 0 | ✅ PASS |
| **Admin Management** (`admin.test.js`) | 12 | 12 | 0 | ✅ PASS |
| **Faculty Attendance** (`faculty.test.js`) | 14 | 14 | 0 | ✅ PASS |
| **Student Analytics** (`student.test.js`) | 11 | 11 | 0 | ✅ PASS |
| **Multi-Role Integration** (`integration.test.js`) | 11 | 11 | 0 | ✅ PASS |
| **Total** | **58** | **58** | **0** | **100% PASS** |

### Execution Highlights:
1. **Health Check**: `GET /api/health` returns status `200 OK`.
2. **Student Signup & Role Lockdown**: Public registration strictly assigns `student` role; admin role escalation attempts are neutralized.
3. **Password Security**: Validates password matching, minimum length, and bcrypt salt hashing.
4. **JWT Lifecycle**: Issues secure tokens on login, rejects unauthenticated calls (`401`), and clears cookies on logout.
5. **Class & Subject Deletion Guards**: Deleting a class with mapped subjects or students is rejected with a safe warning (`400`).
6. **Attendance Marking & Duplicate Prevention**: Marks rosters with Present/Late/Absent tally; submitting twice for the same class, subject, and date rejects with `409 Conflict`.
7. **Attendance Calculation Consistency**: Both present and late count as attended; verified across Admin, Faculty, and Student dashboards.
8. **Low Attendance Warnings**: Mathematically validates the consecutive classes needed target calculation: $\lceil (0.75 \times T - P) / 0.25 \rceil$.
9. **Cross-Role Security Matrix**: Student cannot access Admin or Faculty APIs; Faculty cannot access Admin APIs or unassigned classes.
10. **Full End-to-End Lifecycle**: Admin creates class/subject/faculty/student $\rightarrow$ Faculty marks session $\rightarrow$ Student dashboard updates instantly $\rightarrow$ Faculty rectifies status $\rightarrow$ Student metrics update immediately.

---

## 🏁 Development Status

- ✅ **Part 1 (Completed)**: Project Setup, Design System, Landing Page & Authentication.
- ✅ **Part 2 (Completed)**: Admin Dashboard & Complete Management System.
- ✅ **Part 3 (Completed)**: Faculty Dashboard, Roster Attendance Marking & History.
- ✅ **Part 4 (Completed)**: Student Dashboard, Attendance History, Subject Ratios & Analytics.
- ✅ **Part 5 (Completed)**: Final Integration, Performance Code-Splitting, Security Review, Testing & Optimization.

---

## 📄 License
This project is licensed under the ISC License.
