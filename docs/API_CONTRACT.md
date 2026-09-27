# AirGuard — API_CONTRACT.md
**Phase 1: Architecture & Contract Lock — FINAL**

---

## 1. Communication Protocol

- **ESP32 → Backend:** HTTP POST, JSON body.
- **Content-Type:** `application/json`
- **Authentication header:** `X-Device-Key: <device_api_key>`
  ⚠️ Assumption: header name not specified in brief — locking `X-Device-Key` as the single standard. Do not invent a second auth scheme.
- **Expected response codes:** `200/201` success, `400` bad payload, `401` bad/missing key, `404` unknown device, `500` server error.

---

## 2. Sensor Data Contract (LOCKED — do not rename)

```json
{
  "device_id": "AIRGUARD_001",
  "pm25": 85.5,
  "temp": 30.2,
  "humidity": 65.4,
  "risk_level": "WARNING",
  "timestamp": "2026-09-27T11:30:00"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| device_id | string | Yes | Non-empty, must match a registered device |
| pm25 | number (float) | Yes | ≥ 0 |
| temp | number (float) | Yes | Reasonable range, e.g. -20 to 60 (°C) |
| humidity | number (float) | Yes | 0–100 |
| risk_level | string enum | Yes | One of `SAFE`, `WARNING`, `DANGER` |
| timestamp | string (ISO 8601) | Yes | Valid ISO 8601; ⚠️ assumption: treated as UTC — brief doesn't state timezone |

Do not rename to `pm_25`, `temperature`, `relative_humidity`, `risk`, or `riskLevel`.

---

## 3. Risk Level Contract (LOCKED)

Edge AI output shape (Swapnil → Om/Siddharth):

```json
{
  "risk_level": "WARNING",
  "reason": "High PM2.5 concentration"
}
```

- **Field name:** `risk_level` (not `risk`, not `riskLevel`)
- **Allowed values:** `SAFE`, `WARNING`, `DANGER` — no additional categories
- **reason:** Mandatory when `risk_level` is `WARNING` or `DANGER`; optional/omit when `SAFE`.
- **confidence:** Not included in MVP. ⚠️ Flagged as ambiguous in brief ("optional") — Phase 1 decision: leave out entirely to avoid scope creep; revisit in Phase 2 if Swapnil's model produces it naturally.
- **Invalid risk_level handling:** Backend rejects the request with `400` and does not write to Firestore. It does not attempt to "guess" or coerce an unknown value.

---

## 4. API Endpoint Contract

### GET /health
- Purpose: liveness check
- Auth: none
- Response: `200 { "status": "ok" }`

### POST /api/sensor-data
- Purpose: ingest a sensor reading + computed risk level from ESP32
- Auth: required (`X-Device-Key`)
- Request body: Sensor Data Contract (§2)
- Required fields: all of §2
- Response (success): `201 { "status": "logged", "id": "<reading_id>" }`
- Errors: `400` invalid payload, `401` bad key, `500` server error

### POST /api/alert
- Purpose: explicit high-priority alert event (distinct from routine readings)
- ⚠️ Ambiguous in brief: not defined whether this is separate from sensor-data or backend-derived. **Phase 1 decision:** the backend automatically creates an `alerts` document whenever an incoming `/api/sensor-data` payload has `risk_level` of `WARNING` or `DANGER`. `POST /api/alert` is reserved for the ESP32 to push a standalone alert event when it cannot/should not wait for the next full sensor reading cycle (e.g., buzzer triggered locally, no fresh PM2.5 sample yet). This is optional to implement in Phase 2 — locking the contract now so it doesn't block anyone.
- Auth: required (`X-Device-Key`)
- Request body: `{ device_id, risk_level, reason, timestamp }`
- Required fields: `device_id`, `risk_level`, `timestamp`
- Response: `201 { "status": "alert_logged", "id": "<alert_id>" }`
- Errors: `400`, `401`, `500`

### GET /api/history/:deviceId
- Purpose: retrieve historical readings for dashboard/heatmap
- Auth: required (`X-Device-Key` or user session — ⚠️ assumption: for MVP, reuse device key; user-level auth for the app is out of scope for Phase 1)
- Response: `200 { "readings": [ {device_id, pm25, temp, humidity, risk_level, lat, lng, timestamp}, ... ] }`
- Pagination: ⚠️ not specified in brief — not locking in Phase 1; flag for Phase 2.
- Errors: `401`, `404` (unknown device), `500`

---

## 5. Database Contract (Firestore)

Collections: `devices`, `readings`, `alerts`.

**devices**
| Field | Type |
|---|---|
| device_id | string (doc ID) |
| owner | string |
| registered_at | timestamp |

**readings**
| Field | Type |
|---|---|
| device_id | string |
| pm25 | number |
| temp | number |
| humidity | number |
| risk_level | string |
| lat | number |
| lng | number |
| timestamp | timestamp |

**alerts**
| Field | Type |
|---|---|
| device_id | string |
| risk_level | string |
| lat | number |
| lng | number |
| timestamp | timestamp |
| resolved | boolean |

⚠️ **Ambiguity:** `lat`/`lng` appear in `readings`/`alerts` but are **not** part of the locked Sensor Data Contract (§2) sent by the ESP32. **Phase 1 decision:** the backend attaches `lat`/`lng` to each reading/alert by looking up the device's registered location from the `devices` collection (a device is stationary/associated with a patient's known area for MVP). If the ESP32 is meant to carry a GPS module and send live coordinates, that must be added to §2 as a documented exception — currently out of scope.

**Field-name alignment rule:** API field names = Database field names = Frontend field names, wherever a field is shared (`device_id`, `pm25`, `temp`, `humidity`, `risk_level`, `timestamp`, `lat`, `lng`). No translation layer between layers.

---

## 6. Error Handling Contract

| Code | Meaning |
|---|---|
| 400 | Invalid or missing payload |
| 401 | Invalid/missing device API key |
| 404 | Device or resource not found |
| 500 | Server error |

Specific field failures (all → `400` with a message naming the field):
- `pm25` missing → 400, `"pm25 is required"`
- `humidity` missing → 400, `"humidity is required"`
- `risk_level` invalid/not in enum → 400, `"invalid risk_level"`
- `timestamp` invalid → 400, `"invalid timestamp format"`
- `device_id` missing → 400, `"device_id is required"`
- `device_id` not found in `devices` → 404

No retries, no queuing, no partial-success handling in Phase 1 — out of scope for a 36-hour build.
