/**
 * Health check and generic 404-fallback tests.
 * Endpoint-specific tests for /api/sensor-data, /api/alert, and
 * /api/history/:deviceId live in tests/phase3.test.js.
 */

const request = require('supertest');
const app = require('../src/app');

describe('GET /health', () => {
  it('responds with 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });

  it('responds with the exact locked shape', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toEqual({
      status: 'OK',
      service: 'AirGuard Backend',
    });
  });

  it('responds with JSON content-type', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('Unmatched routes', () => {
  it('returns 404 for an unknown GET route', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      status: 'error',
      message: 'Not found',
    });
  });

  it('returns 404 for a genuinely unmatched POST route', async () => {
    const res = await request(app).post('/api/not-a-real-endpoint').send({});
    expect(res.statusCode).toBe(404);
  });
});
