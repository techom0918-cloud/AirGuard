# AirGuard — ARCHITECTURE.md
**Phase 1: Architecture & Contract Lock — FINAL**

---

## 1. System Architecture

AirGuard has two deliberately separated paths:

### LOCAL / EDGE PATH (works without internet)
```
PM2.5 / Temp / Humidity Sensors
        ↓
      ESP32
        ↓
Edge Risk Detection (on-device threshold/anomaly logic)
        ↓
OLED + Buzzer + LED (immediate local alert)
```

### CLOUD / DATA PATH (for history, dashboard, doctor-sharing)
```
ESP32
  ↓ HTTP POST (device API key)
Backend API (Node.js + Express)
  ↓
Firebase Admin SDK
  ↓
Firestore (devices / readings / alerts)
  ↓
Frontend (Mobile/Web dashboard, heatmap, weekly report)
```

**Why separated:** A patient's physical safety (buzzer/LED/OLED warning) must not depend on Wi-Fi, backend uptime, or Firebase latency. The ESP32 computes risk locally and alerts the patient immediately; it then *also* reports the same event to the backend for logging, trends, and doctor-sharing — but a network failure never blocks the physical alert.

---

## 2. Backend Architecture

**Stack (locked, hackathon-appropriate):** Node.js + Express + Firebase Admin SDK + Firestore. No additional frameworks unless a genuine blocker appears.

**Logical folder structure (not created yet — Phase 1 defines responsibility only):**

```
backend/
├── src/
│   ├── server.js       → starts HTTP server, loads app.js
│   ├── app.js           → Express app setup, middleware wiring, route mounting
│   ├── routes/          → maps URLs (e.g. POST /api/sensor-data) to controllers
│   ├── controllers/     → parses requests, validates shape, calls services, sends response
│   ├── services/        → business logic: risk validation, Firestore reads/writes
│   ├── middleware/      → device API key auth, request validation, error handler
│   ├── models/          → shared data shape definitions (Reading, Alert, Device)
│   └── config/          → Firebase Admin init, environment variable loading
├── .env / .env.example
├── package.json
└── README.md
```

Owner: Om (overall), Siddharth (routes/controllers/APIs), Rishabh (services/models tied to Firestore, config/deployment).

---

## 3. Final Architecture Diagram (with ownership)

```
[Sensors: PM2.5, Temp, Humidity]
            │
            ▼
      [ ESP32 ]  ── Owner: Om (integration), Swapnil (edge AI logic)
            │
            ▼
 [ Edge Risk Detection ]  ── Owner: Swapnil
            │
   ┌────────┴─────────┐
   ▼                   ▼
[OLED/Buzzer/LED]   [HTTP POST /api/sensor-data]
Owner: Om              │
                        ▼
               [ Middleware: Auth + Validation ]  ── Owner: Siddharth
                        │
                        ▼
                  [ Controllers ]  ── Owner: Siddharth
                        │
                        ▼
                   [ Services ]  ── Owner: Siddharth + Rishabh
                        │
                        ▼
                  [ Firebase / Firestore ]  ── Owner: Rishabh
                        │
                        ▼
              [ Frontend / Mobile Dashboard ]  ── Owner: Maitri
```

---

## Assumptions (Phase 1)
- ⚠️ Backend and Edge AI both implement risk thresholding; the backend re-validates `risk_level` rather than trusting the ESP32 blindly (see API_CONTRACT.md §Error Handling).
- ⚠️ ESP32 has Wi-Fi capability for the cloud path (standard for ESP32 boards) — not stated explicitly in the brief but required for the architecture to work.
