# AirGuard Backend

Backend service for **AirGuard — Proactive Smart Inhaler**. Ingests sensor/risk data from the ESP32 device, stores it, and serves it to the mobile/web dashboard.

> Phase 2 status: environment + skeleton only. Sensor/alert/history endpoints, Firebase, and Firestore are Phase 3 work — see `../docs/API_CONTRACT.md` for the locked contract they will implement.

## Requirements
- Node.js 18+
- npm

## Installation
```bash
cd backend
npm install
```

## Environment setup
Copy the example file and adjust if needed:
```bash
cp .env.example .env
```

| Variable | Description | Phase 2 default |
|---|---|---|
| PORT | Port the server listens on | 5000 |
| NODE_ENV | Environment name | development |

Never commit `.env` — it's ignored by `.gitignore`. Firebase credentials will be added in Phase 3 and must also stay out of git.

## Development
```bash
npm run dev
```
Runs the server with `nodemon` (auto-restarts on file changes).

## Production
```bash
npm start
```

## Health endpoint
```
GET /health
```
Expected response (`200 OK`):
```json
{
  "status": "OK",
  "service": "AirGuard Backend"
}
```
