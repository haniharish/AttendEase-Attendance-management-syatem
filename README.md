# AttendEase – Smart Student Attendance Management System

[![Node.js](https://img.shields.io/badge/Node.js-v22.13-339933?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com)
[![JWT](https://img.shields.io/badge/Auth-JWT_HTTP--only_Cookies-FB542B)](https://jwt.io)

AttendEase is an enterprise-grade, modern SaaS-style Student Attendance Management System developed using the MERN stack (MongoDB, Express, React, Node.js). 

This repository contains the completed **Part 1: Project Setup, Design System & Authentication**.

---

## 🚀 Part 1 Scope & Delivered Features

- **Full Project Architecture**: Clean decoupling between `backend/` and `frontend/` services.
- **Master Design System**: Pixel-perfect implementation based on modern educational dashboard aesthetics, using the **Plus Jakarta Sans** typography, `24px` high-radius cards, soft shadows, and a designated color palette.
- **Public Landing Page**: Complete with a sticky responsive Navbar, Hero section with interactive live dashboard preview, 6 core Feature cards, 3-step How It Works breakdown, Institutional Benefits, Call-To-Action banner, and institutional Footer.
- **Full-Stack Authentication**:
  - Secure Registration (`POST /api/auth/register`) with input sanitization, email validation, and strict enforcement of the **Student** role for public signups.
  - Authentication (`POST /api/auth/login`) with bcrypt.js password hashing, active status check, and automated role detection.
  - Session Verification (`GET /api/auth/me`) supporting both secure HTTP-only cookies and Bearer tokens.
  - Logout (`POST /api/auth/logout`) that securely clears authentication cookies.
- **Role-Based Client Routing**:
  - `ProtectedRoute` and `RoleProtectedRoute` route guards.
  - `PublicOnlyRoute` redirecting authenticated users to their corresponding dashboard.
  - Automatic redirection: Admin (`/admin/dashboard`), Faculty (`/faculty/dashboard`), Student (`/student/dashboard`).
  - Access-denied handling (`/unauthorized`) and 404 handler (`*`).
- **Placeholder Dashboards**: Polished shells for Admin, Faculty, and Student workspaces with verified session metadata and Part 2–4 roadmaps.

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
│   │   │   ├── common/           # Navbar, Footer, Button, Input, Card, Badge, Spinner
│   │   │   └── landing/          # HeroSection, FeaturesSection, HowItWorksSection, BenefitsSection, CtaBanner
│   │   ├── context/              # AuthContext (user, login, register, logout, checkAuth)
│   │   ├── layouts/              # DashboardLayout
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── UnauthorizedPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── dashboards/       # AdminDashboardPage, FacultyDashboardPage, StudentDashboardPage
│   │   ├── routes/               # AppRoutes, ProtectedRoute, RoleProtectedRoute, PublicOnlyRoute
│   │   ├── services/             # Axios API instance and authService
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── backend/                      # Node.js + Express + MongoDB REST API
│   ├── config/
│   │   └── db.js                 # Mongoose connection & disconnect helpers
│   ├── controllers/
│   │   └── authController.js     # Register, Login, Me, Logout
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token verification (cookie/header)
│   │   ├── roleMiddleware.js     # Reusable role-based authorization
│   │   └── errorMiddleware.js    # Central error & 404 handler
│   ├── models/
│   │   └── User.js               # User model with bcrypt hashing & schema validation
│   ├── routes/
│   │   └── authRoutes.js         # /api/auth endpoint routes
│   ├── test/
│   │   └── auth.test.js          # Automated test suite (10/10 passing)
│   ├── utils/
│   │   └── seed.js               # Database seeder for demo Admin, Faculty, and Student accounts
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

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd AttendEase

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
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

### 3. Seed Demo Accounts (Optional but Recommended)

Seed initial test accounts for all three roles:

```bash
cd backend
npm run seed
```

This creates the following credentials:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@attendease.com` | `AdminPassword123!` |
| **Faculty** | `faculty@attendease.com` | `FacultyPassword123!` |
| **Student** | `student@attendease.com` | `StudentPassword123!` |

*(Note: The login screen also features 1-click quick-fill buttons for instant testing of all 3 roles).*

---

## 🏃 Running the Application

### Start Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### Start Frontend Dev Server
```bash
cd frontend
npm run dev
# Vite runs on http://localhost:5173
```

---

## 🧪 Testing

Run the automated authentication and role authorization test suite:

```bash
cd backend
npm test
```

### Test Coverage Highlights:
- ✅ Health check verification (`GET /api/health`)
- ✅ Student registration with validation (`POST /api/auth/register`)
- ✅ Security privilege-escalation prevention (enforces student role)
- ✅ Duplicate email rejection
- ✅ Password mismatch rejection
- ✅ User login with valid credentials
- ✅ User login failure on invalid credentials
- ✅ Authenticated profile lookup (`GET /api/auth/me`)
- ✅ Protected route rejection without token (401)
- ✅ Session cookie revocation on logout (`POST /api/auth/logout`)

---

## 🔒 Security Architecture

1. **Password Protection**: Passwords hashed with `bcryptjs` (salt rounds: 10). Hashes are excluded from queries by default and stripped from JSON serialization.
2. **JWT via HTTP-Only Cookies**: Tokens are issued inside secure, `httpOnly: true` cookies with `sameSite` protection to prevent XSS credential theft.
3. **Strict Registration Role Guarding**: Public registration endpoints strictly enforce `role: 'student'` to prevent self-assignment of administrative roles.
4. **Role Authorization Middleware**: Route protection guards endpoints using reusable `authorize('admin')`, `authorize('faculty')` middleware.
5. **CORS Hardening**: Cross-Origin Resource Sharing restricted with credential reflection for specified client origins.

---

## 🗺️ Project Roadmap

- **Part 1 (Current)**: Project setup, design system, landing page, authentication, and role routing.
- **Part 2 (Next)**: Admin dashboard, student & faculty management, classes, subjects, and assignments.
- **Part 3**: Faculty dashboard, attendance marking, editing, and class-wise reporting.
- **Part 4**: Student dashboard, attendance history, subject percentages, and analytics.
- **Part 5**: Integration, end-to-end testing, validation, and final production polish.
