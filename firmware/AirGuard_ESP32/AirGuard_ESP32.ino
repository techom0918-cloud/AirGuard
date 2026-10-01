#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// ---------- PINS ----------
#define DHT_PIN       4
#define DHT_TYPE      DHT11

#define MQ135_PIN     34

#define LED_PIN       26
#define BUZZER_PIN    25

// ---------- SETTINGS ----------
#define AQI_HIGH_THRESHOLD 150

const unsigned long SENSOR_INTERVAL = 5000;
const unsigned long ALARM_DURATION = 3000;

DHT dht(DHT_PIN, DHT_TYPE);

unsigned long lastSensorRead = 0;
bool alarmActive = false;
unsigned long alarmStartTime = 0;


// =================================================
// WIFI & DEVICE CREDENTIALS
// =================================================
// Credentials are separated into "secrets.h" (ignored by Git).
// Copy "secrets.h.example" to "secrets.h" to define your credentials.

#if __has_include("secrets.h")
#include "secrets.h"
#else
#warning "secrets.h not found. Using fallback placeholder credentials. Please copy secrets.h.example to secrets.h."
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define DEVICE_API_KEY "YOUR_DEVICE_API_KEY"
#endif


// =================================================
// AIRGUARD BACKEND
// =================================================

const char* HEALTH_URL =
  "http://60.70.1.214:5001/health";

const char* SENSOR_URL =
  "http://60.70.1.214:5001/api/sensor-data";

const char* DEVICE_ID = "AG-001";


// =================================================
// CONNECT WIFI
// =================================================

void connectWiFi()
{
  Serial.println();
  Serial.println("Connecting to WiFi...");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;

  while (WiFi.status() != WL_CONNECTED && attempts < 30)
  {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println("WiFi CONNECTED");

    Serial.print("ESP32 IP: ");
    Serial.println(WiFi.localIP());
  }
  else
  {
    Serial.println("WiFi connection FAILED");
  }
}


// =================================================
// BACKEND HEALTH CHECK
// =================================================

void checkBackendHealth()
{
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("WiFi not connected.");
    return;
  }

  HTTPClient http;

  http.begin(HEALTH_URL);

  int httpCode = http.GET();

  Serial.print("Health HTTP: ");
  Serial.println(httpCode);

  if (httpCode > 0)
  {
    String response = http.getString();

    Serial.println("Health Response:");
    Serial.println(response);
  }
  else
  {
    Serial.print("Health Error: ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
}


// =================================================
// READ MQ135
// =================================================

int readMQ135()
{
  return analogRead(MQ135_PIN);
}


// =================================================
// CONVERT MQ135 RAW TO DEMO AIR QUALITY SCORE
// =================================================

int calculateAQI(int raw)
{
  /*
     This is NOT official AQI.
     It is a demo/proxy score based on MQ135.
  */

  int aqi = map(raw, 300, 3000, 0, 300);

  if (aqi < 0)
    aqi = 0;

  if (aqi > 300)
    aqi = 300;

  return aqi;
}


// =================================================
// SEND REAL SENSOR DATA TO AIRGUARD BACKEND
// =================================================

void sendTelemetry(
  float temperature,
  float humidity,
  int mqRaw,
  float sensorVoltage,
  int aqi
)
{
  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("WiFi disconnected.");
    Serial.println("Reconnecting...");

    connectWiFi();

    if (WiFi.status() != WL_CONNECTED)
    {
      Serial.println("Telemetry skipped.");
      return;
    }
  }

  HTTPClient http;

  http.begin(SENSOR_URL);

  // ---------- HEADERS ----------

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  http.addHeader(
    "X-Device-Key",
    DEVICE_API_KEY
  );


  // =================================================
  // RISK MAPPING
  // =================================================

  /*
     Hardware code uses:
       SAFE
       HIGH

     Backend accepts:
       SAFE
       DANGER

     Therefore:
       HIGH -> DANGER
  */

  String riskLevel;

  if (aqi >= AQI_HIGH_THRESHOLD)
  {
    riskLevel = "DANGER";
  }
  else
  {
    riskLevel = "SAFE";
  }


  // =================================================
  // FINAL BACKEND PAYLOAD
  // =================================================

  String json = "{";

  json += "\"device_id\":\"";
  json += DEVICE_ID;
  json += "\",";

  json += "\"temp\":";
  json += String(temperature, 2);
  json += ",";

  json += "\"humidity\":";
  json += String(humidity, 2);
  json += ",";

  json += "\"mq135_raw\":";
  json += String(mqRaw);
  json += ",";

  json += "\"sensor_voltage\":";
  json += String(sensorVoltage, 2);
  json += ",";

  json += "\"air_quality_score\":";
  json += String(aqi);
  json += ",";

  json += "\"risk_level\":\"";
  json += riskLevel;
  json += "\"";

  json += "}";


  // =================================================
  // SEND
  // =================================================

  Serial.println();
  Serial.println("Sending telemetry to AirGuard...");
  Serial.println("Payload:");
  Serial.println(json);

  int httpCode = http.POST(json);

  Serial.print("HTTP Status: ");
  Serial.println(httpCode);


  // =================================================
  // BACKEND RESPONSE
  // =================================================

  if (httpCode > 0)
  {
    String response = http.getString();

    Serial.println("Backend Response:");
    Serial.println(response);

    if (httpCode == 201)
    {
      Serial.println("================================");
      Serial.println("      TELEMETRY SUCCESS");
      Serial.println("================================");
    }
    else
    {
      Serial.println("Telemetry received unexpected status.");
    }
  }
  else
  {
    Serial.print("HTTP Error: ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
}


// =================================================
// SETUP
// =================================================

void setup()
{
  Serial.begin(115200);

  dht.begin();

  pinMode(MQ135_PIN, INPUT);

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  analogSetPinAttenuation(MQ135_PIN, ADC_11db);

  Serial.println();
  Serial.println("================================");
  Serial.println("      AIRGUARD SYSTEM");
  Serial.println("================================");
  Serial.println("MQ135 + DHT11");
  Serial.println("Sharp Disabled");
  Serial.println("================================");


  // =================================================
  // WIFI
  // =================================================

  connectWiFi();


  // =================================================
  // BACKEND HEALTH CHECK
  // =================================================

  if (WiFi.status() == WL_CONNECTED)
  {
    checkBackendHealth();
  }


  Serial.println();
  Serial.println("System Ready.");
  Serial.println("================================");
}


// =================================================
// LOOP
// =================================================

void loop()
{
  unsigned long now = millis();

  if (now - lastSensorRead >= SENSOR_INTERVAL)
  {
    lastSensorRead = now;

    // ---------- DHT11 ----------
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    // ---------- MQ135 ----------
    int mqRaw = readMQ135();

    // ADC voltage
    float adcVoltage = (mqRaw / 4095.0) * 3.3;

    // Your current divider is assumed to be 10k + 10k
    float sensorVoltage = adcVoltage * 2.0;

    // ---------- AQI PROXY ----------
    int aqi = calculateAQI(mqRaw);

    Serial.println();
    Serial.println("--------------------------------");

    Serial.print("Temperature : ");
    Serial.print(temperature);
    Serial.println(" °C");

    Serial.print("Humidity    : ");
    Serial.print(humidity);
    Serial.println(" %");

    Serial.print("MQ135 Raw   : ");
    Serial.println(mqRaw);

    Serial.print("Sensor Volt : ");
    Serial.print(sensorVoltage, 2);
    Serial.println(" V");

    Serial.print("AQI*        : ");
    Serial.println(aqi);


    // =================================================
    // HIGH AQI → LED + BUZZER
    // =================================================

    if (aqi >= AQI_HIGH_THRESHOLD)
    {
      Serial.println("Risk        : HIGH");

      if (!alarmActive)
      {
        alarmActive = true;
        alarmStartTime = now;

        digitalWrite(LED_PIN, HIGH);
        digitalWrite(BUZZER_PIN, HIGH);

        Serial.println("⚠️ ALARM ON");
      }
    }
    else
    {
      Serial.println("Risk        : SAFE");

      digitalWrite(LED_PIN, LOW);
      digitalWrite(BUZZER_PIN, LOW);

      alarmActive = false;
    }


    // =================================================
    // SEND TO AIRGUARD BACKEND
    // =================================================

    if (!isnan(temperature) && !isnan(humidity))
    {
      sendTelemetry(
        temperature,
        humidity,
        mqRaw,
        sensorVoltage,
        aqi
      );
    }
    else
    {
      Serial.println("DHT11 invalid reading.");
      Serial.println("Telemetry skipped.");
    }
  }


  // ---------- TURN OFF ALARM AFTER 3 SEC ----------

  if (alarmActive &&
      now - alarmStartTime >= ALARM_DURATION)
  {
    digitalWrite(LED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);

    alarmActive = false;

    Serial.println("Alarm OFF");
  }
}