# ZK-K30 Biometric Attendance System

A production-grade integration and real-time attendance tracking platform for ZKTeco K30 biometric devices.

---

## 🔐 Authentication & Access Control

Access to both the **API** and the **Next.js Web Dashboard** is protected with JWT (JSON Web Tokens) and bcrypt password hashing.

### Administrator Account Setup
When the backend starts, administrator credentials are loaded securely from the gitignored `credentials.env` file:

| Field | Configuration |
| :--- | :--- |
| **Username** | Defined by `ADMIN_USERNAME` in `credentials.env` |
| **Password** | Defined by `ADMIN_PASSWORD` in `credentials.env` (gitignored) |
| **Role** | `admin` |

*(Note: Never commit passwords to version control. Passwords and keys must always remain in gitignored files).*

---

## 📁 Repository Structure

```
d:\BioMetric Project D/
├── backend/                       # Node.js + Express API & Hardware Gateway
│   ├── config/                    # MongoDB connection configuration
│   ├── models/                    # User (Auth), Employee & Attendance schemas
│   ├── controllers/               # Auth, attendance, employee, device controllers
│   ├── middleware/                # JWT route protection middleware (protect, requireAdmin)
│   ├── routes/                    # Protected REST routes & public /api/auth routes
│   ├── services/                  # K30 Device Manager, sync, & realtime services
│   ├── scripts/                   # Standalone scripts (time sync, device test)
│   ├── .env                       # Backend environment variables
│   ├── package.json               # Backend dependencies
│   └── server.js                  # Main server entry point
│
├── frontend/                      # Next.js 16 Web Application
│   ├── app/                       # App Router pages and layout with AuthProvider
│   ├── components/                # UI components (LoginForm, Navbar, StatsCards, Tables, Modals)
│   ├── lib/                       # Auth Context, API clients with Bearer token injection
│   └── package.json               # Frontend dependencies
│
├── other/                         # Managed archive of non-backend files
│   ├── backups/                   # Raw JSON backups & snapshots
│   ├── docs/                      # Architecture notes & reference documentation
│   ├── scripts/                   # Legacy standalone CLI test scripts
│   └── legacy-backend/            # Historical root backend copy
│
├── package.json                   # Root monorepo orchestration scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on v24)
- **MongoDB** running locally on port 27017 or a MongoDB Atlas URI
- **ZKTeco K30** machine connected to the same LAN at `192.168.1.201:4370`

### 2. Running Backend & Frontend

From the project root:

```bash
# Start Backend API & K30 Real-time Listener (Port 5000)
npm run backend:start

# Start Frontend Development Server (Port 3000)
npm run frontend:dev

# Build Frontend for Production
npm run frontend:build
```

1. Open **http://localhost:3000** in your browser.
2. Sign in with the credentials defined in your gitignored `credentials.env` file.
3. Access real-time attendance logs, employee rosters, and device synchronization controls!

---

## 🛠 Standalone Device Commands

```bash
# Synchronize K30 hardware clock with PC / Server time
npm --prefix backend run set-time

# Run K30 hardware diagnostics
npm --prefix backend run test-device
```
