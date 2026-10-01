# AirGuard Master Firestore Database Schema Contract

This document specifies the locked Firestore database collections, document schemas, risk vocabulary, indexing, and validation rules for the AirGuard data layer.

---

## 1. Master Risk Level Vocabulary

The platform strictly enforces a unified 3-level risk vocabulary across all telemetry data and alerts:

- **`SAFE`**: Normal environmental conditions / low exposure risk.
- **`WARNING`**: Elevated particulate matter or ambient warning conditions.
- **`DANGER`**: Critical air quality hazard requiring immediate user action.

> **CRITICAL RULE**: Legacy values (`low`, `moderate`, `high`) are **strictly prohibited** and will trigger explicit `INVALID_RISK_LEVEL` validation errors without silent conversion.

---

## 2. Collections & Document Schemas

### 2.1 `devices` Collection
Stores metadata for hardware inhaler sleeve devices registered in the platform.

- **Document ID**: `device_id` (e.g., `"DEV-ESP32-001"`)

| Field Name | Type | Requirement | Description | Timestamp Behavior |
| :--- | :--- | :--- | :--- | :--- |
| `device_id` | String | **Required** | Unique hardware/device identifier | N/A |
| `owner` | String | **Required** | User identifier or email address | N/A |
| `registered_at` | String / Timestamp | **Required** | Device registration timestamp | ISO 8601 String or Firestore Timestamp |

---

### 2.2 `readings` Collection
Stores time-series environmental telemetry received from inhaler sleeve devices.

- **Document ID**: Auto-generated or explicit UUID

| Field Name | Type | Requirement | Description | Validation & Range |
| :--- | :--- | :--- | :--- | :--- |
| `device_id` | String | **Required** | Reporting device identifier | Non-empty string |
| `pm25` | Number | **Required** | PM2.5 concentration in µg/m³ | Finite number $\ge 0$ |
| `temp` | Number | **Required** | Ambient temperature in °C | Finite number ($-50$ to $100$) |
| `humidity` | Number | **Required** | Relative humidity percentage | Finite number ($0$ to $100$) |
| `risk_level` | String | **Required** | Risk level classification | Must be `SAFE`, `WARNING`, or `DANGER` |
| `lat` | Number | **Required** | GPS Latitude coordinate | Finite number ($-90$ to $90$) |
| `lng` | Number | **Required** | GPS Longitude coordinate | Finite number ($-180$ to $180$) |
| `timestamp` | String / Timestamp | **Required** | Telemetry reading timestamp | ISO 8601 String or Firestore Timestamp |

---

### 2.3 `alerts` Collection
Stores environmental risk alerts and anomalous hazard events.

- **Document ID**: Auto-generated or explicit UUID

| Field Name | Type | Requirement | Description | Validation & Range |
| :--- | :--- | :--- | :--- | :--- |
| `device_id` | String | **Required** | Associated device identifier | Non-empty string |
| `risk_level` | String | **Required** | Hazard risk classification | Must be `SAFE`, `WARNING`, or `DANGER` |
| `lat` | Number | **Required** | Alert location latitude | Finite number ($-90$ to $90$) |
| `lng` | Number | **Required** | Alert location longitude | Finite number ($-180$ to $180$) |
| `timestamp` | String / Timestamp | **Required** | Alert creation timestamp | ISO 8601 String or Firestore Timestamp |
| `resolved` | Boolean | **Required** | Alert resolution flag | `true` or `false` |

---

## 3. Firestore Composite Indexes

The following composite indexes are required for data layer queries:

1. **`readings` (`device_id` ASC, `timestamp` DESC)**
   - Used by `getLatestReading` and `getReadingHistory` to fetch chronological telemetry per device.

2. **`readings` (`lat` ASC, `lng` ASC, `timestamp` DESC)**
   - Used by `getHeatmapReadings` and `getHeatmapData` to perform geospatial filtering and rendering.

3. **`alerts` (`device_id` ASC, `timestamp` DESC)**
   - Used by `getAlertHistory` to retrieve full alert logs for a device.

4. **`alerts` (`device_id` ASC, `resolved` ASC, `timestamp` DESC)**
   - Used by `getActiveAlerts` to fetch unresolved alerts for active monitoring.

---

## 4. Error Codes & Validation Contracts

All database modules throw deterministic errors on validation or Firestore communication failures:

- `DEVICE_NOT_FOUND`: Specified device document does not exist.
- `INVALID_DEVICE_ID`: Missing or non-string device_id.
- `INVALID_PM25`: Invalid pm25 reading value.
- `INVALID_TEMPERATURE`: Out of range ambient temperature reading.
- `INVALID_HUMIDITY`: Out of range humidity reading.
- `INVALID_RISK_LEVEL`: Risk level string not in `SAFE`, `WARNING`, `DANGER`.
- `INVALID_TIMESTAMP`: Invalid date, ISO string, or timestamp object.
- `INVALID_LOCATION`: Coordinates out of valid latitude/longitude bounds.
- `FIRESTORE_READ_FAILED`: Database read exception.
- `FIRESTORE_WRITE_FAILED`: Database write exception.
