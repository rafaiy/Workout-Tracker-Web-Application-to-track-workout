import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createDatabase } from '../../src/db/connection.js';
import { createApp } from '../../src/app.js';

const apps = [];
function appWith(provider = { parseWorkout: async () => ({ outcome: 'needs_clarification', reason: 'missing', message: 'Add more detail.' }) }) {
  const db = createDatabase(':memory:'); const app = createApp({ db, llmProvider: provider }); apps.push(db); return app;
}
afterEach(() => { while (apps.length) apps.pop().close(); });

describe('session REST contract', () => {
  it('lists the catalog and creates a Pending local session', async () => {
    const app = appWith();
    expect((await request(app).get('/api/exercises').expect(200)).body.exercises.length).toBeGreaterThan(5);
    const response = await request(app).post('/api/sessions').send({ startedAt: '2026-11-23T06:30:00+05:30', timeZone: 'Asia/Kolkata' }).expect(201);
    expect(response.body.session.status).toBe('PENDING');
    expect(response.body.session.timeOfDay).toBe('morning');
  });

  it('rejects invalid sets with JSON 400 and leaves the session unchanged', async () => {
    const app = appWith();
    const session = (await request(app).post('/api/sessions').send({ startedAt: '2026-11-23T06:30:00+05:30', timeZone: 'Asia/Kolkata' })).body.session;
    const exercise = (await request(app).get('/api/exercises')).body.exercises[0];
    const response = await request(app).post(`/api/sessions/${session.id}/exercises`).send({ exerciseId: exercise.id, sets: [{ weightKg: -5, reps: 10 }] }).expect(400);
    expect(response.body.error.message).toMatch(/greater than 0/);
    expect((await request(app).get(`/api/sessions/${session.id}`)).body.session.exercises).toHaveLength(0);
  });

  it('adds sets and completes a session with standard resource responses', async () => {
    const app = appWith();
    const session = (await request(app).post('/api/sessions').send({ startedAt: '2026-11-23T06:30:00+05:30', timeZone: 'Asia/Kolkata' })).body.session;
    const exercise = (await request(app).get('/api/exercises')).body.exercises[0];
    await request(app).post(`/api/sessions/${session.id}/exercises`).send({ exerciseId: exercise.id, sets: [{ weightKg: 20, reps: 12 }] }).expect(201);
    expect((await request(app).post(`/api/sessions/${session.id}/complete`).send({})).body.session.status).toBe('COMPLETED');
    await request(app).get('/api/sessions/900').expect(404);
  });
});
