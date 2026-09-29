require('dotenv').config();

const request = require('supertest');
const app = require('../src/app');
const store = require('../src/services/dataStore');

const KEY = process.env.DEVICE_API_KEY;

beforeEach(() => {
  store._reset();
});

describe('POST /api/sensor-data', () => {
  const validPayload = {
    device_id: 'AG-001',
    pm25: 42.5,
    temp: 29.4,
    humidity: 61.2,
    risk_level: 'SAFE',
    timestamp: '2026-09-27T16:30:00Z',
  };

  it('accepts a valid payload -> 201', async () => {
    const res = await request(app)
      .post('/api/sensor-data')
      .set('X-Device-Key', KEY)
      .send(validPayload);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('logged');
    expect(res.body.id).toBeDefined();
  });

  it('rejects without device key -> 401', async () => {
    const res = await request(app).post('/api/sensor-data').send(validPayload);
    expect(res.statusCode).toBe(401);
  });

  it('rejects wrong device key -> 401', async () => {
    const res = await request(app)
      .post('/api/sensor-data')
      .set('X-Device-Key', 'wrong-key')
      .send(validPayload);
    expect(res.statusCode).toBe(401);
  });

  it('rejects missing device_id -> 400', async () => {
    const { device_id, ...rest } = validPayload;
    const res = await request(app).post('/api/sensor-data').set('X-Device-Key', KEY).send(rest);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects non-numeric pm25 -> 400', async () => {
    const res = await request(app)
      .post('/api/sensor-data')
      .set('X-Device-Key', KEY)
      .send({ ...validPayload, pm25: 'high' });
    expect(res.statusCode).toBe(400);
  });

  it('rejects missing timestamp -> 400', async () => {
    const { timestamp, ...rest } = validPayload;
    const res = await request(app).post('/api/sensor-data').set('X-Device-Key', KEY).send(rest);
    expect(res.statusCode).toBe(400);
  });

  it('rejects invalid risk_level -> 400', async () => {
    const res = await request(app)
      .post('/api/sensor-data')
      .set('X-Device-Key', KEY)
      .send({ ...validPayload, risk_level: 'CRITICAL' });
    expect(res.statusCode).toBe(400);
  });

  it('auto-creates an alert when risk_level is DANGER', async () => {
    await request(app)
      .post('/api/sensor-data')
      .set('X-Device-Key', KEY)
      .send({ ...validPayload, risk_level: 'DANGER' });

    const historyRes = await request(app)
      .get(`/api/history/${validPayload.device_id}`)
      .set('X-Device-Key', KEY);
    expect(historyRes.statusCode).toBe(200);
    expect(historyRes.body.readings.length).toBe(1);
    expect(historyRes.body.readings[0].risk_level).toBe('DANGER');
  });
});

describe('POST /api/alert', () => {
  it('accepts a valid SAFE alert -> 201', async () => {
    const res = await request(app)
      .post('/api/alert')
      .set('X-Device-Key', KEY)
      .send({ device_id: 'AG-001', risk_level: 'SAFE', timestamp: '2026-09-27T16:30:00Z' });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('alert_logged');
  });

  it('rejects missing required fields -> 400', async () => {
    const res = await request(app).post('/api/alert').set('X-Device-Key', KEY).send({});
    expect(res.statusCode).toBe(400);
  });

  it('rejects invalid risk_level -> 400', async () => {
    const res = await request(app)
      .post('/api/alert')
      .set('X-Device-Key', KEY)
      .send({ device_id: 'AG-001', risk_level: 'CRITICAL', timestamp: '2026-09-27T16:30:00Z' });
    expect(res.statusCode).toBe(400);
  });

  it('rejects WARNING/DANGER without a reason -> 400', async () => {
    const res = await request(app)
      .post('/api/alert')
      .set('X-Device-Key', KEY)
      .send({ device_id: 'AG-001', risk_level: 'DANGER', timestamp: '2026-09-27T16:30:00Z' });
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/history/:deviceId', () => {
  it('returns readings for a known device', async () => {
    await request(app)
      .post('/api/sensor-data')
      .set('X-Device-Key', KEY)
      .send({
        device_id: 'AG-001',
        pm25: 42.5,
        temp: 29.4,
        humidity: 61.2,
        risk_level: 'SAFE',
        timestamp: '2026-09-27T16:30:00Z',
      });

    const res = await request(app).get('/api/history/AG-001').set('X-Device-Key', KEY);
    expect(res.statusCode).toBe(200);
    expect(res.body.readings.length).toBe(1);
  });

  it('returns 404 for an unknown device', async () => {
    const res = await request(app).get('/api/history/NO-SUCH-DEVICE').set('X-Device-Key', KEY);
    expect(res.statusCode).toBe(404);
  });
});
