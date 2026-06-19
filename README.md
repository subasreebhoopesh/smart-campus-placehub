# PlaceHub — Smart Campus Placement Portal

A full-stack placement management system for colleges with Admin, HR, and Student roles.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express
- **Database**: MongoDB (local or Atlas)

## Features

- Admin dashboard with analytics, reports, student management
- HR portal for managing applications and placement drives
- Student portal for applying to drives, uploading documents, resume builder
- Real-time notifications
- Document verification
- Chat system
- Skill-based auto-shortlisting

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB installed locally (or a MongoDB Atlas account)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/smart-campus-pathways.git
cd smart-campus-pathways
```

### 2. Set up environment files

**Frontend** — copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

**Backend** — copy `backend/.env.example` to `backend/.env`:
```bash
copy backend\.env.example backend\.env
```
Edit `backend/.env` and set your `MONGODB_URI`.

### 3. Install dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 4. Seed the admin user
```bash
cd backend
node seed-admin.js
cd ..
```

### 5. Start the servers

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Open **http://localhost:8080** in your browser.

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | admin123 |
| Student | (register via Student Login page) | — |
| HR | (created by Admin in HR Credentials section) | — |

## Project Structure

```
├── src/                    # React frontend
│   ├── pages/              # Page components (admin/, hr/, student/)
│   ├── components/         # Shared UI components
│   ├── contexts/           # React contexts (Auth, Notifications)
│   └── services/           # API service layer
├── backend/                # Express backend
│   ├── config/             # Database configuration
│   ├── models/             # Mongoose models
│   ├── routes/             # API route handlers
│   ├── middleware/         # Auth middleware
│   ├── utils/              # Helper utilities
│   └── server.js           # Entry point
└── package.json
```
