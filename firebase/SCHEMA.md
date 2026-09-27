# AirGuard Firestore Database Schema Contract

This document defines the locked Firestore database collections, fields, and index configurations for the AirGuard platform.

## Collections & Document Schemas

### 1. `devices` Collection
Stores metadata for hardware inhaler sleeve devices registered in the system.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `device_id` | String | Unique hardware/device identifier (e.g. `DEV-ESP32-001`) |
| `owner` | String | User identifier / email of the device owner |
| `registered_at` | Timestamp / String | ISO 8601 string or Firestore Timestamp of device registration |

### 2. `readings` Collection
Stores time-series environmental sensor telemetry received from devices.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `device_id` | String | Identifier of reporting device |
| `pm25` | Number | Particulate matter PM2.5 reading in µg/m³ |
| `temp` | Number | Ambient temperature reading in °C |
| `humidity` | Number | Relative humidity percentage |
| `risk_level` | String | Risk evaluation (`low`, `moderate`, `high`) |
| `lat` | Number | GPS Latitude coordinate |
| `lng` | Number | GPS Longitude coordinate |
| `timestamp` | Timestamp / String | ISO 8601 string or Firestore Timestamp of reading |

### 3. `alerts` Collection
Stores environmental risk alerts and anomalies.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `device_id` | String | Identifier of associated device |
| `risk_level` | String | Alert risk classification (`low`, `moderate`, `high`) |
| `lat` | Number | GPS Latitude coordinate of alert event |
| `lng` | Number | GPS Longitude coordinate of alert event |
| `timestamp` | Timestamp / String | ISO 8601 string or Firestore Timestamp of alert |
| `resolved` | Boolean | Alert resolution status (`true` / `false`) |

---

## Firestore Composite Indexes

1. **`readings` (`device_id` ASC, `timestamp` DESC)**: Enables rapid lookup of recent readings per device.
2. **`readings` (`lat` ASC, `lng` ASC, `timestamp` DESC)**: Supports geospatial querying and heatmap rendering.
3. **`alerts` (`device_id` ASC, `timestamp` DESC)**: Enables alert history retrieval per device.
4. **`alerts` (`device_id` ASC, `resolved` ASC, `timestamp` DESC)**: Supports filtering active/unresolved alerts per device.
