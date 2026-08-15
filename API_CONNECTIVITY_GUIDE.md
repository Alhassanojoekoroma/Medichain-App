# MediChain App Architecture - API Connectivity Guide

> **Historical prototype document — not release evidence.** Phase 0 issued a FAIL/STOP SHIP decision and Phase 1 containment disables unsafe legacy, demo, AI, emergency and clinical paths. Do not use credentials or deployment instructions in this file. The controlling status is `docs/audit/07_Release_Decision.md`.

## System Overview

The MediChain application consists of three main components that communicate via a centralized backend API:

```
┌─────────────────────┐         ┌──────────────────────┐
│   Doctor Web App    │         │  Patient Mobile App  │
│   (Next.js Port     │         │   (Expo/React       │
│    3001)            │         │    Native)           │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           └───────────────┬───────────────┘
                           │
                    ┌──────▼──────┐
                    │   Backend   │
                    │    API      │
                    │  (Port 3000)│
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼────┐    ┌─────▼────┐    ┌────▼──────┐
    │ PostgreSQL│    │ Hyperledger│  │   IPFS    │
    │    DB     │    │  Fabric    │  │  Storage  │
    └───────────┘    └───────────┘  └───────────┘
```

## API Configuration

### Doctor Web App (Port 3001)
**Location:** `doctor-web/`  
**Framework:** Next.js  
**API Base URL:** `http://localhost:3000`

**Key Services:**
- `services/auth.ts` - Doctor authentication (POST `/api/auth/doctor/login`)
- `services/blockchain.ts` - Fabric gateway interactions
- Environment: `.env.local` (development), `.env.production` (production)

**Credentials (Demo):**
- Email: `doctor@medichain.sl`
- Password: `password123`

### Patient Mobile App
**Location:** `src/`  
**Framework:** React Native (Expo)  
**API Base URL:** `http://localhost:3000`

**Key Services:**
- `services/authService.ts` - Patient authentication
- `services/syncService.ts` - Data synchronization
- Environment: `.env.mobile` (configuration)

**Credentials (Demo):**
- Email: `patient@medichain.sl`
- Password: `password123`

### Backend API Server (Port 3000)
**Location:** `backend/`  
**Framework:** Express.js (Node.js)  
**Port:** 3000

**Available Routes:**
- `POST /api/auth/doctor/login` - Doctor login
- `POST /api/auth/patient/login` - Patient login  
- `GET /api/health` - Health check
- `POST /api/sync/record` - Sync medical records
- `POST /api/sync/access` - Sync access requests
- `POST /api/sync/consent` - Sync consent updates

**Database:** PostgreSQL (localhost:5432)  
**Blockchain:** Hyperledger Fabric

## Running the Application

### Start Backend API (Required First)
```bash
cd backend
npm install
npm start
# Runs on http://localhost:3000
```

### Start Doctor Web App
```bash
cd doctor-web
npm install
npm run dev
# Runs on http://localhost:3001
```

### Start Patient Mobile App
```bash
# Using Expo
expo start
# Or use local runner
npm start
```

## CORS Configuration

The backend allows requests from:
- `http://localhost:3001` - Doctor web app (development)
- `http://localhost:3000` - Local testing
- `http://192.168.56.1:3001` - Network doctor web app
- `http://192.168.56.1:3000` - Network API access

## Environment Variables

### Doctor Web App (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MediChain SL - Doctor Portal
NODE_ENV=development
```

### Patient Mobile App (`.env.mobile`)
```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APP_NAME=MediChain SL - Patient Mobile
```

### Backend (`.env.local`)
```
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001,http://localhost:3000,http://192.168.56.1:3001,http://192.168.56.1:3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medichain
DB_USER=postgres
DB_PASSWORD=postgres
```

## Troubleshooting

### "Cannot reach API" Error
- Ensure backend is running on port 3000
- Check `.env.local` files have correct `NEXT_PUBLIC_API_URL`
- Verify CORS configuration in backend

### "Invalid credentials" at Login
- Use demo credentials: email/password123
- Check database is initialized with seed data
- Verify TokenService is properly configured

### Port Already in Use
- Doctor web: `lsof -i :3001` or change port in `next.config.mjs`
- Backend: `lsof -i :3000` or change PORT in `.env.local`
- Mobile: Use Expo app on different port

## Security Notes

- Production API should use HTTPS only
- Update CORS_ORIGIN for production domain
- Use environment-specific API URLs (never hardcode)
- Store sensitive config in `.env.local` (not in git)
- Rotate database credentials regularly
