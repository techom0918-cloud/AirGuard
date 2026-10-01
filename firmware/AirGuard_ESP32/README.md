# AirGuard ESP32 Prototype Firmware

Official firmware implementation for the AirGuard physical IoT device prototype.

---

## 1. Hardware Specification

The current physical hardware prototype consists of:

- **Microcontroller**: ESP32 Dev Module (NodeMCU-32S / ESP32-WROOM-32)
- **Temperature & Humidity Sensor**: DHT11
- **Gas / Air Quality Sensor**: MQ135 (Air Quality / Gas Detection Sensor)
- **Visual Alert**: Red LED
- **Auditory Alert**: Active Piezo Buzzer
- **Dust Sensor**: **Sharp GP2Y1010AU0F0 is REMOVED / DISABLED** from the active physical prototype and firmware.

---

## 2. GPIO Pinout Mapping

| Peripheral | ESP32 Pin | Signal Type | Notes |
|---|---|---|---|
| **DHT11** | `GPIO 4` | Digital I/O | Standard one-wire communication |
| **MQ135** | `GPIO 34` | Analog Input (`ADC1_CH6`) | Configured with `ADC_11db` attenuation via 10k:10k voltage divider |
| **Red LED** | `GPIO 26` | Digital Output | Active HIGH visual alarm |
| **Buzzer** | `GPIO 25` | Digital Output | Active HIGH acoustic alarm |
| **Sharp Sensor** | *Disabled* | *N/A* | Permanently removed from hardware and omitted from code |

---

## 3. Sensor Acquisition & Signal Processing

### DHT11
- Reads ambient temperature in degrees Celsius (`readTemperature()`).
- Reads relative humidity percentage (`readHumidity()`).
- Telemetry is guarded to skip transmissions if sensor reads `NaN`.

### MQ135 & Air Quality Proxy
- Reads analog raw ADC counts (12-bit, range 0–4095) on `GPIO 34`.
- **Voltage Divider**: The analog circuit uses a 10kΩ + 10kΩ resistive divider to step down the 5V sensor output to safe ESP32 3.3V ADC levels:
  $$\text{adcVoltage} = \left(\frac{\text{raw}}{4095.0}\right) \times 3.3\,\text{V}$$
  $$\text{sensorVoltage} = \text{adcVoltage} \times 2.0$$
- **Air Quality Score (`air_quality_score`)**:
  - Raw ADC values are mapped using `map(raw, 300, 3000, 0, 300)` and clamped between `0` and `300`.
  - **IMPORTANT SCIENTIFIC NOTICE**: This score is a **demonstration / proxy indicator** of ambient air quality based on MQ135 sensitivity to reducing gases (CO2, alcohol, benzene, smoke).
  - **NOT OFFICIAL AQI**: This is not an EPA-standard Air Quality Index.
  - **NOT PM2.5**: The MQ135 does not measure fine particulate matter ($PM_{2.5}$). The prototype does not synthesize, fabricate, or claim PM2.5 readings.

---

## 4. Local Alert Logic (LED + Buzzer)

- **High AQI Threshold**: `#define AQI_HIGH_THRESHOLD 150`
- **Condition**:
  - When `air_quality_score >= 150`:
    - `risk_level` is set to `"DANGER"`.
    - Red LED (`GPIO 26`) is set `HIGH`.
    - Active Buzzer (`GPIO 25`) is set `HIGH`.
    - Non-blocking timer triggers alarm for `ALARM_DURATION` (3,000 ms / 3 seconds).
  - When `air_quality_score < 150`:
    - `risk_level` is set to `"SAFE"`.
    - Red LED and Buzzer are set `LOW`.

---

## 5. Backend Communication & Telemetry Contract

- **Protocol**: HTTP/1.1 POST
- **Target Endpoint**: `POST /api/sensor-data`
- **Health Check**: `GET /health`
- **Default Server URL**: `http://60.70.1.214:5001/api/sensor-data`
- **Authentication**: `X-Device-Key` header with device API key
- **Content-Type**: `application/json`
- **Device ID**: `"AG-001"`
- **Transmission Interval**: Every 5,000 ms (5 seconds)

### JSON Telemetry Payload Schema
```json
{
  "device_id": "AG-001",
  "temp": 28.50,
  "humidity": 58.20,
  "mq135_raw": 1420,
  "sensor_voltage": 2.29,
  "air_quality_score": 124,
  "risk_level": "SAFE"
}
```

| Field | Type | Description |
|---|---|---|
| `device_id` | String | Fixed device identifier (`"AG-001"`) |
| `temp` | Float | Ambient temperature (°C), 2 decimals |
| `humidity` | Float | Relative humidity (%), 2 decimals |
| `mq135_raw` | Integer | Raw 12-bit ADC reading (0–4095) |
| `sensor_voltage` | Float | Calculated sensor pin voltage (V), 2 decimals |
| `air_quality_score` | Integer | MQ135 proxy score (0–300) |
| `risk_level` | String | `"SAFE"` or `"DANGER"` |

---

## 6. Required Dependencies & Arduino Libraries

Before compiling, install the following via the Arduino Library Manager:

1. **ESP32 Arduino Core** (by Espressif Systems) — includes `<WiFi.h>` and `<HTTPClient.h>`
2. **DHT sensor library** (by Adafruit) — version 1.4.x
3. **Adafruit Unified Sensor** (by Adafruit) — required base dependency for DHT

---

## 7. Setup & Flashing Instructions

1. Open `AirGuard_ESP32.ino` in the Arduino IDE.
2. In the same directory, copy `secrets.h.example` to `secrets.h`:
   ```bash
   cp secrets.h.example secrets.h
   ```
3. Open `secrets.h` and configure your credentials:
   ```cpp
   #define WIFI_SSID "YourNetworkSSID"
   #define WIFI_PASSWORD "YourNetworkPassword"
   #define DEVICE_API_KEY "YourDeviceAPIKey"
   ```
   *(Note: `secrets.h` is excluded by `.gitignore` to prevent leaking credentials).*
4. Connect the ESP32 board via USB.
5. In the Arduino IDE menu:
   - **Tools > Board > ESP32 Arduino > ESP32 Dev Module**
   - **Tools > Upload Speed > 921600** (or 115200)
   - **Tools > CPU Frequency > 240MHz (WiFi/BT)**
   - **Tools > Flash Frequency > 80MHz**
   - **Tools > Port > (Select your ESP32 COM Port)**
6. Click **Upload**.
7. Open **Serial Monitor** at **115200 baud** to view real-time logs, Wi-Fi status, and HTTP telemetry responses.
