import test from 'node:test';
import assert from 'node:assert/strict';

// Run from the backend package so these tests exercise its isolated SQLite API.
import { makeServer, json } from '../src/backend/tests/helpers.js';

test('session lifecycle records pending sessions, retains set details, and completes', async (t) => {
  const api = await makeServer();
  t.after(api.close);

  const startedAt = '2026-11-20T10:15:00+05:30';
  const created = await json(api.base, '/sessions', {
    method: 'POST',
    body: JSON.stringify({ startedAt })
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.body.title, 'Morning Workout');
  assert.equal(created.body.status, 'PENDING');
  assert.equal(created.body.startedAt, startedAt);

  const history = await json(api.base, '/sessions');
  assert.equal(history.response.status, 200);
  assert.ok(history.body.data.some((session) => session.id === created.body.id));

  const exercise = await json(api.base, `/sessions/${created.body.id}/exercises`, {
    method: 'POST',
    body: JSON.stringify({
      exerciseId: 4,
      sets: [
        { setNumber: 1, weightKg: 0, reps: 12 },
        { setNumber: 2, weightKg: 20.5, reps: 10 },
        { setNumber: 3, weightKg: 25, reps: 8 }
      ]
    })
  });
  assert.equal(exercise.response.status, 201);
  assert.deepEqual(exercise.body.sets.map(({ weightKg, reps }) => [weightKg, reps]), [
    [0, 12], [20.5, 10], [25, 8]
  ]);

  const completed = await json(api.base, `/sessions/${created.body.id}/complete`, {
    method: 'POST',
    body: '{}'
  });
  assert.equal(completed.response.status, 200);
  assert.equal(completed.body.status, 'COMPLETED');

  const detail = await json(api.base, `/sessions/${created.body.id}`);
  assert.equal(detail.response.status, 200);
  assert.equal(detail.body.status, 'COMPLETED');
  assert.equal(detail.body.exercises.length, 1);
  assert.deepEqual(detail.body.exercises[0].sets.map(({ weightKg, reps }) => [weightKg, reps]), [
    [0, 12], [20.5, 10], [25, 8]
  ]);
});

test('session creation rejects invalid dates and unsupported fields', async (t) => {
  const api = await makeServer();
  t.after(api.close);

  for (const body of [
    '{"startedAt":"not-a-date"}',
    '{"unexpected":true}'
  ]) {
    const result = await json(api.base, '/sessions', { method: 'POST', body });
    assert.equal(result.response.status, 400);
  }
});

test('history is newest first and rejects search or filter query parameters', async (t) => {
  const api = await makeServer();
  t.after(api.close);

  for (const startedAt of ['2026-11-19T10:00:00+05:30', '2026-11-20T10:00:00+05:30']) {
    const result = await json(api.base, '/sessions', {
      method: 'POST', body: JSON.stringify({ startedAt })
    });
    assert.equal(result.response.status, 201);
  }

  const history = await json(api.base, '/sessions');
  assert.equal(history.response.status, 200);
  assert.equal(history.body.data[0].startedAt, '2026-11-20T10:00:00+05:30');
  assert.equal((await json(api.base, '/sessions?status=PENDING')).response.status, 400);
  assert.equal((await json(api.base, '/sessions?search=morning')).response.status, 400);
});
