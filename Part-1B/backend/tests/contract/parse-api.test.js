import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createDatabase } from '../../src/db/connection.js';
import { createApp } from '../../src/app.js';

const dbs = [];
const valid = { outcome: 'parsed', exerciseName: 'Chest press machine', sets: [{ weightKg: 50, reps: 10 }, { weightKg: 50, reps: 10 }, { weightKg: 50, reps: 10 }] };
function create(provider) { const db = createDatabase(':memory:'); dbs.push(db); return createApp({ db, llmProvider: provider }); }
afterEach(() => { while (dbs.length) dbs.pop().close(); });
const body = { text: 'I did 3 sets of chest press at 50 kg for 10 reps', timeZone: 'Asia/Kolkata', submittedAt: '2026-11-23T06:30:00+05:30' };

describe('natural-language parse API', () => {
  it('creates valid new workout data and returns 201', async () => {
    const app = create({ parseWorkout: vi.fn(async () => valid) });
    const result = await request(app).post('/api/sessions/parse').send(body).expect(201);
    expect(result.body.outcome).toBe('saved'); expect(result.body.created).toBe(true);
  });
  it('returns a clear 400 for a negative weight and writes nothing', async () => {
    const provider = { parseWorkout: vi.fn(async () => valid) }; const app = create(provider);
    const result = await request(app).post('/api/sessions/parse').send({ ...body, text: 'I did chest press at -5kg for 10 reps' }).expect(400);
    expect(result.body.error.message).toMatch(/greater than 0/); expect(provider.parseWorkout).not.toHaveBeenCalled();
    expect((await request(app).get('/api/sessions')).body.sessions).toHaveLength(0);
  });
  it('returns clarification without saving vague input', async () => {
    const app = create({ parseWorkout: async () => ({ outcome: 'needs_clarification', reason: 'missing_exercise', message: 'Which exercise did you do?' }) });
    const result = await request(app).post('/api/sessions/parse').send({ ...body, text: 'I did some chest today' }).expect(200);
    expect(result.body.outcome).toBe('needs_clarification'); expect(result.body.originalText).toBe('I did some chest today');
    expect((await request(app).get('/api/sessions')).body.sessions).toHaveLength(0);
  });
  it('returns matching sessions and writes only after target selection is resubmitted', async () => {
    const app = create({ parseWorkout: async () => valid });
    const one = await request(app).post('/api/sessions').send({ startedAt: '2026-11-23T07:00:00+05:30', timeZone: 'Asia/Kolkata' });
    const two = await request(app).post('/api/sessions').send({ startedAt: '2026-11-23T08:00:00+05:30', timeZone: 'Asia/Kolkata' });
    const choices = await request(app).post('/api/sessions/parse').send(body).expect(200);
    expect(choices.body.outcome).toBe('choose_session'); expect(choices.body.matches).toHaveLength(2);
    const selected = await request(app).post('/api/sessions/parse').send({ ...body, targetSessionId: two.body.session.id }).expect(200);
    expect(selected.body.sessionId).toBe(two.body.session.id);
    expect((await request(app).get(`/api/sessions/${one.body.session.id}`)).body.session.exercises).toHaveLength(0);
    expect((await request(app).get(`/api/sessions/${two.body.session.id}`)).body.session.exercises).toHaveLength(1);
  });
  it('sanitizes provider failures', async () => {
    const app = create({ parseWorkout: async () => { throw new Error('private key leaked'); } });
    const response = await request(app).post('/api/sessions/parse').send(body).expect(500);
    expect(JSON.stringify(response.body)).not.toContain('private key');
  });
});
