# Farm Direct Access to Market

A modern MERN-stack marketplace designed to connect farmers directly with buyers, eliminating middlemen and empowering agricultural trade.

---

## Project Overview

* **Application Name**: Farm Direct Access to Market
* **Repository**: [https://github.com/lakshaymittal312/Farmer.git](https://github.com/lakshaymittal312/Farmer.git)
* **Stack**: MongoDB, Express.js, React, Node.js (MERN)

---

## Current Progress

**Step 1: Backend Foundation + MongoDB Connection + User Model** (Completed)

---

## Current Features

* **Express.js Server**: Modular server setup with JSON parsing and CORS enabled.
* **MongoDB Connection**: Reliable Mongoose connection handler with error trapping and environment configuration.
* **User Model**: Complete schema with validation rules, enum roles (`farmer`, `buyer`, `admin`), password concealment (`select: false`), and string phone fields.
* **Health Check API**: Endpoint (`GET /api/health`) to confirm operational backend status.
* **Environment Management**: Configured via `.env` with sanitized template `.env.example`.

---

## User Roles Architecture

```text
User (Collection: users)
 ├── Farmer (Role: farmer)  --> Farmer Profile (Planned)
 ├── Buyer  (Role: buyer)   --> Buyer Profile (Planned)
 └── Admin  (Role: admin)   --> Admin Permissions (Planned)
```

Common authentication attributes (`name`, `email`, `password`, `phone`, `role`) are stored in the primary `users` collection. Domain-specific profiles for farmers and buyers will be created in separate collections during future steps.

---

## Getting Started

### Prerequisites
* Node.js (v18+)
* MongoDB instance (local or MongoDB Atlas)

### Installation
Run from project root:
```bash
npm install
npm run install-all
```

### Running the Application

#### 1. Start Both Frontend & Backend Together (One-Command Startup)
From the project root:
```bash
npm run dev
```

#### 2. Start Backend Only
```bash
cd backend
npm run dev
```

#### 3. Start Frontend Only
```bash
cd frontend
npm run dev
```

### Application URLs
* **Frontend**: `http://localhost:3000`
* **Backend API**: `http://localhost:5000`
* **API Health Check**: `http://localhost:5000/api/health`

### Build for Production
From the project root:
```bash
npm run build
```

---

## Test & Verification

To run the backend API integration test suite:
```bash
cd backend
npm test
```

---

## Next Steps

**User Authentication → bcrypt → Register/Login → JWT → Authentication Middleware**
