# Disaster Management & Emergency Response (DMER)

MERN-based, production-structured web app for disaster management, real-time SOS alerts, incident reporting and analytics.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, Multer, JWT, bcrypt, express-rate-limit, morgan, dotenv
- **Frontend**: React (Vite), React Router, Tailwind CSS (dark / glassmorphism), Leaflet, Recharts, socket.io-client, axios

## Project Structure

```text
server/
  controllers/
  models/
  routes/
  middleware/
  socket/
  seed/
  server.js

client/
  src/
    components/
    pages/
    context/
    services/
    hooks/
    App.jsx
    main.jsx
```

## Setup

```bash
cd "c:\Disaster Management System\server"
npm install
cp .env.example .env   # or create .env manually

cd "../client"
npm install
```

Update `server/.env` as needed:

```env
MONGODB_URI=mongodb://localhost:27017/disaster-mgmt
PORT=5000
JWT_SECRET=supersecretjwt
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

## Seed Data

```bash
cd "c:\Disaster Management System\server"
npm run seed
```

Creates users:

- `citizen@test.com` (password `123456`, role `citizen`)
- `authority@test.com` (password `123456`, role `authority`)
- `admin@test.com` (password `123456`, role `admin`)

And a couple of sample incidents.

## Run in Development

### Backend

```bash
cd "c:\Disaster Management System\server"
npm run dev
```

### Frontend

```bash
cd "c:\Disaster Management System\client"
npm run dev
```

Open: http://localhost:5173

Backend serves:

- REST API under `/api/*`
- Socket.io under `/socket.io`
- Uploaded images under `/uploads/*`

## Core Features

- User auth (JWT, roles: `citizen`, `authority`, `admin`)
- Incident reporting with image upload and geolocation (2dsphere index)
- Real-time SOS alerts via Socket.io
- Authority dashboard (status management, responder assignment)
- Analytics dashboards with Recharts (status distribution, time series)
- Dark, glassmorphism UI with Tailwind CSS

