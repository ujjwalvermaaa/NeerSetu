# NeerSetu — Smart Community Water Quality & Health Monitoring System

NeerSetu is a full-stack IoT + AI platform designed for rural communities to monitor water quality in real time, predict health outbreak risks, and deliver instant multi-channel alerts. It bridges the gap between IoT sensor data, machine learning intelligence, and community-level health management through a modern web dashboard and mobile app.

---

## The Problem It Solves

Rural communities often lack access to real-time water quality data. Contaminated water sources go undetected until health problems emerge. NeerSetu provides an end-to-end solution: sensors collect data, an ML model predicts outbreak risk, and an alert system notifies health workers and residents before the situation escalates.

---

## Architecture Overview

```
IoT Sensors (Simulated)
        │
        ▼
  Backend API (Node.js / Express)  ◄──►  MongoDB
        │                                    │
        ▼                                    ▼
  ML Service (FastAPI + Python)     Alert Service (Twilio / Firebase)
        │
        ▼
  Admin Dashboard (React)   +   Community Web App (React)   +   Mobile App (React Native / Expo)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Node.js, Express.js |
| Database | MongoDB 7.0, Firebase Firestore |
| ML Service | Python, FastAPI, scikit-learn |
| IoT Simulation | Python (sensor data generator) |
| Admin Dashboard | React, Tailwind CSS, Leaflet, OpenStreetMap |
| Community Web App | React (port 3001) |
| Mobile App | React Native, Expo |
| Alerts | Twilio SMS/WhatsApp, Firebase Push Notifications |
| Containerization | Docker, Docker Compose |
| Reverse Proxy | Nginx |

---

## Project Structure

```
Neersetu/
├── backend/              # Node.js REST API (port 5000)
├── dashboard/            # Admin React dashboard (port 3000)
├── neersetu-web/         # Community web app (port 3001)
├── mobile-app/           # React Native / Expo app (port 19006)
├── ml-service/           # FastAPI ML prediction service (port 8000)
├── iot-simulator/        # Python IoT sensor data simulator
├── scripts/              # DB init scripts (mongo-init.js)
├── Datasets/             # Training datasets for ML model
├── docker-compose.yml    # Full stack Docker orchestration
├── package.json          # Root npm scripts for running all services
└── start-all.sh          # One-command startup script (macOS/Linux)
```

---

## Prerequisites

### Without Docker
- **Node.js 18+** and **npm 8+**
- **Python 3.9+**
- **MongoDB** running locally (or Atlas connection string)

### With Docker
- **Docker Desktop** (includes Docker Compose)

---

## Quick Start — Without Docker

### 1. Install all dependencies

```bash
# From project root
npm run install:all
```

This installs Node dependencies for dashboard, web app, and mobile app, and Python dependencies for ML service and IoT simulator.

### 2. Configure environment variables

```bash
# Copy the example env file and edit with your credentials
cp .env.example .env
```

Key variables to set in `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/neersetu
JWT_SECRET=your_secret_key_here
ML_SERVICE_URL=http://localhost:8000

# Twilio (for SMS alerts)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

### 3. Start all services

```bash
# macOS / Linux
./start-all.sh

# Or using npm (starts all services concurrently)
npm start
```

### 4. Access the apps

| Service | URL |
|---|---|
| Admin Dashboard | http://localhost:3000 |
| Community Web App | http://localhost:3001 |
| Backend API | http://localhost:5000 |
| ML Service (FastAPI) | http://localhost:8000 |
| Mobile App (Expo Web) | http://localhost:19006 |

---

## Quick Start — With Docker

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes (full reset)
docker-compose down -v
```

Access the dashboard at **http://localhost:3000** (or **http://localhost:80** via Nginx).

---

## Running Individual Services

```bash
# Backend API only
npm run start:backend

# Admin dashboard only
npm run start:dashboard

# Community web app only
npm run start:web

# ML service only
npm run start:ml

# IoT simulator only
npm run start:iot

# Mobile app (Expo)
npm run start:mobile
```

---

## Features

- **Real-time water quality monitoring** — pH, turbidity, TDS, temperature, dissolved oxygen tracked per sensor location
- **AI health risk prediction** — ML model flags outbreak risk zones before symptoms spread
- **Geographic mapping** — Leaflet maps show sensor locations and risk heat zones
- **Multi-channel alerts** — SMS (Twilio), WhatsApp, and push notifications (Firebase) for health workers and residents
- **Admin dashboard** — Full operational view: sensor status, alert history, outbreak trends
- **Community web app** — Simplified public-facing portal for community members to check local water safety
- **Mobile app** — On-the-go access for field health workers via React Native / Expo

---

## ML Model

The ML service (`ml-service/`) runs a scikit-learn classification model that predicts health outbreak risk from incoming sensor readings. It exposes a FastAPI endpoint that the backend calls automatically when new sensor data arrives.

To retrain the model with updated data:

```bash
cd ml-service
python train_model.py   # outputs outbreak_model.joblib
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| MongoDB connection refused | Ensure MongoDB is running: `mongod --dbpath /data/db` |
| ML service not starting | Install Python deps: `cd ml-service && pip install -r requirements.txt` |
| Expo mobile app errors | Run `cd mobile-app && npm install` then retry |
| Port already in use | Kill the process on that port: `lsof -ti:3000 \| xargs kill` |
| Docker build fails | Ensure Docker Desktop is running and try `docker-compose build --no-cache` |

---

## License

MIT
