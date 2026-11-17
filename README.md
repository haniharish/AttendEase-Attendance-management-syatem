# AttendEase – Student Attendance Management System

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-v22.13-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![JWT](https://img.shields.io/badge/Auth-JWT_HTTP--only_Cookies-FB542B)](https://jwt.io)
[![Tests](https://img.shields.io/badge/Tests-58%2F58%20Passing%20(100%25)-10b981)](https://github.com/haniharish/AttendEase-Attendance-management-syatem)

**AttendEase** is an enterprise-grade Student Attendance Management System built with the MERN stack (MongoDB, Express.js, React, Node.js). Designed with a modern, high-contrast SaaS aesthetic (Plus Jakarta Sans, 24px rounded cards, three-column layout), it provides a complete end-to-end workflow for academic institutions to monitor attendance, conduct classroom roll-calls, track student eligibility, and analyze attendance trends.

---

## 🌟 Key Features by Portal

### 🛡️ Administrator Portal
- **Overview Dashboard**: Real-time institutional statistics (total students, faculty, classes, subjects, present/absent today) with weekly turnout charts.
- **Student Management**: Full CRUD operations for enrolled students with search, class/section filters, roll number validation, and profile drawers.
- **Faculty Management**: Instructor directory with automated user account creation and teaching load allocation.
- **Academic Structure**: Manage classes, sections, academic terms, and course catalogs with deletion dependency guards.
- **Attendance Intelligence**: Institutional, class-wise, subject-wise, and date-wise attendance analytics.

### 🎓 Faculty Portal
- **Teaching Overview**: Overview of assigned cohorts, active courses, today's lectures, and recent sessions.
- **Interactive Roll-Call**: 8-step marking workflow with enrolled student rosters, quick-mark actions (*Mark All Present*, *Mark All Absent*, *Reset*), and real-time tallies.
- **Duplicate Prevention**: Automated verification preventing duplicate attendance entries for the same class, course, and date.
- **Session Ledger & Rectification**: Historical attendance log with student-level audit inspection and inline record correction.
- **Course Reports**: Visual daily turnout area charts and course-level performance comparisons.

### 🎒 Student Portal
- **Personalized Dashboard**: Live attendance rate, total lectures conducted, attended, missed, and late arrivals.
- **Interactive Mini-Calendar**: Horizontal weekly day selector with pink highlight for active dates and day-by-day lecture status lookups.
- **Subject-Wise Attendance**: Visual progress bars color-coded by health status:
  - 🟢 **Healthy** (&ge; 75%)
  - 🟠 **Warning** (65% – 74%)
  - 🔴 **Low** (< 65%)
- **Target Recovery Calculator**: Automatically calculates the exact number of consecutive classes required to reach the institutional 75% threshold: $\lceil (0.75 \times T - P) / 0.25 \rceil$.
- **Attendance History & Analytics**: Paginated log with status filters, date range filters, and Recharts participation distribution charts.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3.4, React Router DOM 6, Recharts, Lucide React, Axios |
| **Backend** | Node.js, Express.js 4.21, JWT (JSON Web Tokens), bcrypt.js, Cookie-Parser, CORS |
| **Database** | MongoDB 8.0, Mongoose 8.9 (Compound Indexes & Schema Validation) |
| **Optimization**| Route-level code splitting (`React.lazy` + `Suspense`), subdocument indexing |

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (SPA)                          │
│            React 18 + Vite 6 + Tailwind CSS                 │
│         (3-Column SuperDesign: Sidebar - Canvas - Profile)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON (Credentials)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Express API Server                      │
│             JWT Verification & Role Middleware              │
├──────────────────────────────┼──────────────────────────────┤
│  /api/auth   │  /api/admin   │  /api/faculty │ /api/student │
└──────────────┴───────────────┴───────────────┴──────────────┘
                               │ Mongoose ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        MongoDB                              │
│       Users • Students • Faculty • Classes • Attendance      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐳 Docker Setup and Deployment (DevOps Phase 1)

AttendEase is fully containerized using **Docker** and **Docker Compose** for reliable, repeatable, multi-environment deployments.

### 🏗️ Docker Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Client Web Browser                                │
└───────────────────────┬─────────────────────────────────┬───────────────────┘
                        │ HTTP Port 5176                  │ Port 6000 (Direct)
                        ▼                                 ▼
┌───────────────────────────────────────┐   ┌─────────────────────────────────┐
│        `attendease-frontend`          │   │      `attendease-backend`       │
│  • Multi-stage build (Node 20 + Vite) │   │  • Node 20-alpine runtime       │
│  • Nginx 1.27 Alpine production server│   │  • Non-root `node` user security│
│  • Client SPA Routing                 │   │  • Express REST API             │
│  • Reverse Proxy: `/api/` ────────────┼──►│  • Built-in container healthcheck│
└───────────────────────────────────────┘   └────────────────┬────────────────┘
                        ▲                                    │
                        │ Internal Docker Bridge Network     │ TCP Port 27017
                        │ (`attendease-network`)             ▼
                        │                   ┌─────────────────────────────────┐
                        │                   │       `attendease-mongodb`      │
                        │                   │  • Official Mongo 7.0 engine    │
                        │                   │  • Container healthcheck (ping) │
                        └───────────────────┤  • Host port: 27018             │
                                            └────────────────┬────────────────┘
                                                             │
                                                             ▼
                                                    ┌─────────────────┐
                                                    │  Persistent Vol │
                                                    │ (`mongodb_data`)│
                                                    └─────────────────┘
```

### 📋 Prerequisites
- **Docker**: Version 20.10.0 or higher (Docker Desktop on Windows/macOS or Docker Engine on Linux)
- **Docker Compose**: Version v2.20.0 or higher (`docker compose` command)

---

### ⚙️ Environment Configuration

Copy the sample environment file to `.env` in the repository root:

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
|---|---|---|
| `FRONTEND_PORT` | `5176` | Host port mapped to the Nginx frontend container (port 80) |
| `BACKEND_PORT` | `6000` | Host port mapped to the Express backend container |
| `MONGODB_PORT` | `27018` | Host port mapped to MongoDB (avoids collision with local 27017) |
| `MONGODB_URI` | `mongodb://mongodb:27017/attendease` | Container database connection (or custom MongoDB Atlas URI) |
| `JWT_SECRET` | `your_secure_jwt_secret_key` | Secret key used for signing JWT authentication tokens |
| `CLIENT_URL` | `http://localhost:5176` | Allowed client origin for CORS security policies |
| `NODE_ENV` | `production` | Container runtime mode |

> [!TIP]
> If connecting to **MongoDB Atlas** instead of the local Docker database container, set `MONGODB_URI` in `.env` to your Atlas connection string (`mongodb+srv://<user>:<password>@cluster.mongodb.net/attendease`).

---

### 🚀 Quick Start with Docker

#### 1. Build and Launch Containers
Build the multi-stage images and spin up all three services in detached background mode:
```bash
docker compose up -d --build
```

#### 2. Seed Initial Demo Accounts & Academic Data
Once the containers are healthy, seed the database directly inside the backend container:
```bash
docker compose exec backend npm run seed
```

#### 3. Access the Application
- **Frontend Application**: [http://localhost:5176](http://localhost:5176)
- **Backend API Health**: [http://localhost:5176/api/health](http://localhost:5176/api/health) (or direct: [http://127.0.0.1:6000/api/health](http://127.0.0.1:6000/api/health))

---

### 🛠️ Common Docker Commands

#### Check Service Status & Health
```bash
docker compose ps
```

#### View Live Real-time Logs
```bash
# Stream all logs
docker compose logs -f

# Stream specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

#### Stop Containers
```bash
# Stop containers (preserves container state)
docker compose stop

# Stop and remove containers and network (preserves database volume)
docker compose down
```

#### Rebuild Containers After Code Changes
```bash
docker compose up -d --build
```

#### Database Persistence
Data is stored safely in the named volume `mongodb_data`. Your data remains intact across container restarts, image upgrades, and `docker compose down` operations. To permanently wipe the database volume:
```bash
docker compose down -v
```

---

### 🔧 Troubleshooting Docker Issues

| Symptom | Cause | Solution |
|---|---|---|
| `bind: address already in use: 0.0.0.0:27017` | Local MongoDB is already running on port 27017 on the host. | AttendEase maps host port to `27018` by default (`MONGODB_PORT=27018`). Ensure your `.env` specifies `MONGODB_PORT=27018`. |
| `bind: address already in use: 0.0.0.0:5176` | An existing Node or Vite process is holding port 5176. | Run `netstat -ano \| findstr :5176` and terminate the orphaned process with `Stop-Process -Id <PID> -Force` (PowerShell) or `kill -9 <PID>` (Linux/macOS). |
| Backend container unhealthy | MongoDB not ready before backend start. | AttendEase uses Docker Compose `depends_on` with `condition: service_healthy` so backend only starts after Mongo passes its ping test. Check logs: `docker compose logs backend`. |
| Browser cannot reach `/api/*` | Nginx reverse proxy configuration error. | The Nginx container proxies `/api/` traffic directly to `http://backend:6000/api/` over the internal Docker network. Verify frontend logs: `docker compose logs frontend`. |

---

## 💻 Local Development Setup (Non-Docker)

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22.13 recommended)
- **MongoDB**: Community Server running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

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

Configure your environment file `backend/.env`:
```env
PORT=6000
MONGODB_URI=mongodb://127.0.0.1:27017/attendease
JWT_SECRET=attendease_production_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5176
NODE_ENV=development
```

Seed the initial database with demo cohorts, subjects, and accounts:
```bash
npm run seed
```

Start the backend API:
```bash
npm start
# API server running on http://localhost:6000
```

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
```

Configure your environment file `frontend/.env`:
```env
VITE_API_URL=http://localhost:6000/api
```

Start the frontend development server:
```bash
npm run dev
# Vite UI running on http://localhost:5176
```

---

## 🔑 Demo Accounts

The database seeder provisions demo accounts for each user role:

| Role | Email | Password | Scope |
|---|---|---|---|
| **Administrator** | `admin@attendease.com` | `AdminPassword123!` | System Administration & Configuration |
| **Faculty** | `faculty@attendease.com` | `FacultyPassword123!` | Dr. Sarah Jenkins (CSE-A, CS-301, CS-302) |
| **Faculty** | `robert.davis@attendease.com` | `FacultyPassword123!` | Prof. Robert Davis (IT Dept, IT-201) |
| **Student** | `student@attendease.com` | `StudentPassword123!` | Alex Johnson (CSE-A, Roll #01) |

---

## 📡 API Overview

| Scope | Method | Route | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | System health and uptime status |
| **Auth** | `POST` | `/api/auth/register` | Student signup (enforces `student` role) |
| **Auth** | `POST` | `/api/auth/login` | Authenticate & set HTTP-only cookie |
| **Auth** | `GET` | `/api/auth/me` | Fetch active user session |
| **Auth** | `POST` | `/api/auth/logout` | Invalidate token & clear cookie |
| **Admin** | `GET` | `/api/admin/dashboard/stats` | High-level metrics & attendance overview |
| **Admin** | `CRUD`| `/api/admin/students` | Manage student records |
| **Admin** | `CRUD`| `/api/admin/faculty` | Manage faculty instructors |
| **Admin** | `CRUD`| `/api/admin/classes` | Manage classes & sections |
| **Admin** | `CRUD`| `/api/admin/subjects` | Manage curriculum subjects |
| **Admin** | `GET` | `/api/admin/reports/*` | Class, subject, and date-wise reports |
| **Faculty**| `GET` | `/api/faculty/dashboard` | Assigned classes, subjects & weekly trend |
| **Faculty**| `GET` | `/api/faculty/classes` | Faculty assigned classes & student rosters |
| **Faculty**| `POST`| `/api/faculty/attendance` | Mark & submit classroom attendance |
| **Faculty**| `PUT` | `/api/faculty/attendance/:id` | Rectify / update past attendance records |
| **Faculty**| `GET` | `/api/faculty/reports` | Course and class attendance analytics |
| **Student**| `GET` | `/api/student/dashboard` | Student metrics, subject summaries & alerts |
| **Student**| `GET` | `/api/student/attendance` | Detailed log with period filters |
| **Student**| `GET` | `/api/student/attendance/subjects`| Course percentages & recovery calculations |
| **Student**| `GET` | `/api/student/attendance/history` | Paginated personal session history |
| **Student**| `GET` | `/api/student/attendance/warnings`| Low attendance warnings (< 75%) |
| **Student**| `GET/PUT`| `/api/student/profile` | View credentials & update contact phone |

---

## 🧪 Automated Testing

AttendEase includes 5 comprehensive test suites covering unit logic, role authorization, and end-to-end integration:

```bash
cd backend
npm test
```

```
✔ AttendEase Part 1: Authentication & Role Authorization (10 tests) - PASS
✔ AttendEase Part 2: Admin Dashboard & Management System (12 tests) - PASS
✔ AttendEase Part 3: Faculty Attendance Management (14 tests) - PASS
✔ AttendEase Part 4: Student Attendance & Analytics (11 tests) - PASS
✔ AttendEase Part 5: Full Multi-Role End-to-End Suite (11 tests) - PASS
========================================================================
Total Test Suites: 5 | Total Assertions: 58 | Passing: 58 | Failing: 0 (100% PASS)
```

---

## 📌 Project Milestones

- **Part 1**: Project foundation, SuperDesign system, landing page, and JWT authentication.
- **Part 2**: Complete Admin management system for students, faculty, classes, subjects, and reports.
- **Part 3**: Faculty portal with 8-step attendance marking, duplicate prevention, and session rectification.
- **Part 4**: Student dashboard, subject-wise attendance, 75% warning system, and Recharts analytics.
- **Part 5**: Code-splitting performance optimization, database compound indexing, security review, and multi-role integration testing.

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
