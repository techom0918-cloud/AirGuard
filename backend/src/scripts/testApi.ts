import app from '../server.js';
import http from 'http';
import { config } from '../config/index.js';

const PORT = config.port;

async function request(path: string, options: { method?: string; body?: any } = {}): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const method = options.method || 'GET';
    const payload = options.body ? JSON.stringify(options.body) : null;

    const req = http.request(
      `http://localhost:${PORT}${path}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Key': config.deviceApiKey,
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode || 500, body: json });
          } catch {
            resolve({ status: res.statusCode || 500, body: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

export async function runApiTests(): Promise<void> {
  console.log('--- AIRGUARD REST API TEST SUITE STARTED ---');
  const server = app.listen(PORT);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}${detail ? `: ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health Endpoint
    const health = await request('/api/health');
    assert(health.status === 200 && health.body.status === 'ok', 'GET /api/health returns 200 OK');

    // 2. Devices API
    const postDevice = await request('/api/devices', {
      method: 'POST',
      body: {
        device_id: 'DEV-ESP32-003',
        owner: 'api-tester@airguard.local',
        registered_at: '2026-09-27T15:00:00.000Z',
      },
    });
    assert(postDevice.status === 201 && postDevice.body.device_id === 'DEV-ESP32-003', 'POST /api/devices creates device (201)');

    const getDevice = await request('/api/devices/DEV-ESP32-003');
    assert(getDevice.status === 200 && getDevice.body.owner === 'api-tester@airguard.local', 'GET /api/devices/:deviceId retrieves device (200)');

    const listDevs = await request('/api/devices');
    assert(listDevs.status === 200 && Array.isArray(listDevs.body) && listDevs.body.length >= 1, 'GET /api/devices lists devices (200)');

    const getUnknownDev = await request('/api/devices/DEV-UNKNOWN-999');
    assert(getUnknownDev.status === 404 && getUnknownDev.body?.error?.message !== undefined, 'GET unknown device returns HTTP 404 error shape');

    // 3. Readings API
    const postReading = await request('/api/readings', {
      method: 'POST',
      body: {
        device_id: 'DEV-ESP32-003',
        pm25: 35.4,
        temp: 29.5,
        humidity: 61.2,
        risk_level: 'WARNING',
        lat: 28.6139,
        lng: 77.209,
        timestamp: '2026-09-27T15:00:00.000Z',
      },
    });
    assert(postReading.status === 201 && postReading.body.pm25 === 35.4, 'POST /api/readings saves reading (201)');

    const getLatestRdg = await request('/api/readings/DEV-ESP32-003/latest');
    assert(getLatestRdg.status === 200 && getLatestRdg.body.pm25 === 35.4, 'GET /api/readings/:deviceId/latest returns latest reading (200)');

    const getRdgHistory = await request('/api/readings/DEV-ESP32-003?limit=20');
    assert(getRdgHistory.status === 200 && Array.isArray(getRdgHistory.body), 'GET /api/readings/:deviceId with ?limit=20 returns readings array (200)');

    const getUnknownRdgLatest = await request('/api/readings/DEV-NO-READINGS-999/latest');
    assert(getUnknownRdgLatest.status === 404, 'GET latest reading for non-existent device returns HTTP 404');

    // 4. Alerts API
    const postAlert = await request('/api/alerts', {
      method: 'POST',
      body: {
        device_id: 'DEV-ESP32-003',
        risk_level: 'DANGER',
        lat: 28.6139,
        lng: 77.209,
        timestamp: '2026-09-27T15:00:00.000Z',
        resolved: false,
      },
    });
    assert(postAlert.status === 201 && postAlert.body.resolved === false, 'POST /api/alerts saves alert (201)');

    const getAlertHist = await request('/api/alerts/DEV-ESP32-003');
    assert(getAlertHist.status === 200 && Array.isArray(getAlertHist.body), 'GET /api/alerts/:deviceId returns alert history (200)');

    const getActiveAlts = await request('/api/alerts/DEV-ESP32-003/active');
    assert(getActiveAlts.status === 200 && Array.isArray(getActiveAlts.body) && getActiveAlts.body.every((a: any) => a.resolved === false), 'GET /api/alerts/:deviceId/active returns only unresolved alerts (200)');

    // 5. Heatmap API
    const getHeatmap = await request('/api/heatmap?minLat=28.5&maxLat=28.7&minLng=77.1&maxLng=77.3&limit=100');
    assert(getHeatmap.status === 200 && Array.isArray(getHeatmap.body), 'GET /api/heatmap with bounding box query returns points array (200)');

    // 6. Input Validation Tests (HTTP 400)
    const invalidDevPost = await request('/api/devices', { method: 'POST', body: { owner: 'user@example.com' } });
    assert(invalidDevPost.status === 400 && invalidDevPost.body?.error?.message !== undefined, 'POST /api/devices without device_id returns 400');

    const invalidRdgPm25 = await request('/api/readings', {
      method: 'POST',
      body: { device_id: 'DEV-ESP32-003', pm25: 'NOT_NUM', temp: 20, humidity: 50, risk_level: 'SAFE', lat: 28.5, lng: 77.1, timestamp: '2026-09-27T15:00:00Z' },
    });
    assert(invalidRdgPm25.status === 400, 'POST /api/readings with non-numeric pm25 returns 400');

    const invalidRdgLat = await request('/api/readings', {
      method: 'POST',
      body: { device_id: 'DEV-ESP32-003', pm25: 25, temp: 20, humidity: 50, risk_level: 'SAFE', lat: 999.0, lng: 77.1, timestamp: '2026-09-27T15:00:00Z' },
    });
    assert(invalidRdgLat.status === 400, 'POST /api/readings with invalid lat > 90 returns 400');

    const legacyRiskLevel = await request('/api/readings', {
      method: 'POST',
      body: { device_id: 'DEV-ESP32-003', pm25: 25, temp: 20, humidity: 50, risk_level: 'low', lat: 28.5, lng: 77.1, timestamp: '2026-09-27T15:00:00Z' },
    });
    assert(legacyRiskLevel.status === 400, "POST /api/readings with legacy risk_level 'low' returns 400");

    const invalidRiskLevel = await request('/api/readings', {
      method: 'POST',
      body: { device_id: 'DEV-ESP32-003', pm25: 25, temp: 20, humidity: 50, risk_level: 'INVALID_LEVEL', lat: 28.5, lng: 77.1, timestamp: '2026-09-27T15:00:00Z' },
    });
    assert(invalidRiskLevel.status === 400, "POST /api/readings with invalid risk_level returns 400");

    const invalidLimit = await request('/api/readings/DEV-ESP32-003?limit=99999');
    assert(invalidLimit.status === 400, 'GET /api/readings with limit=99999 returns 400');

    const invalidAlertRisk = await request('/api/alerts', {
      method: 'POST',
      body: { device_id: 'DEV-ESP32-003', risk_level: 'INVALID', lat: 28.5, lng: 77.1, timestamp: '2026-09-27T15:00:00Z', resolved: false },
    });
    assert(invalidAlertRisk.status === 400, 'POST /api/alerts with invalid risk_level returns 400');

    console.log(`\n--- REST API TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('API Test Execution Failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('testApi.ts')) {
  runApiTests();
}
