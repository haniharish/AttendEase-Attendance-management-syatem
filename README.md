# AttendEase – Smart Student Attendance Management System

[![Node.js](https://img.shields.io/badge/Node.js-v22.13-339933?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com)
[![JWT](https://img.shields.io/badge/Auth-JWT_HTTP--only_Cookies-FB542B)](https://jwt.io)

AttendEase is an enterprise-grade, modern SaaS-style Student Attendance Management System developed using the MERN stack (MongoDB, Express, React, Node.js). 

This repository contains the completed **Part 1 (Foundation & Authentication)** and **Part 2 (Admin Dashboard & Management System)**.

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

Run both test suites (Part 1 Auth + Part 2 Admin):

```bash
cd backend
npm test
```

### Test Coverage Highlights (22/22 Passing):
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
- ✅ Attendance reports overview, class-wise, subject-wise, and date-wise queries

---

## 🗺️ Five-Part Development Roadmap

- **Part 1 (Done)**: Project setup, design system, landing page, authentication, and role routing.
- **Part 2 (Current)**: Admin dashboard, student & faculty management, classes, subjects, faculty assignments, and attendance reports.
- **Part 3 (Next)**: Faculty dashboard, classroom session marking, attendance editing, and class-wise reporting.
- **Part 4**: Student dashboard, attendance history, subject percentages, and analytics.
- **Part 5**: Integration, end-to-end testing, validation, and final production polish.
