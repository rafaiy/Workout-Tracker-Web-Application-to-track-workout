import test from 'node:test';
import assert from 'node:assert/strict';

import { makeServer, json } from '../src/backend/tests/helpers.js';

test('exercise catalog contains the specified predefined movements', async (t) => {
  const api = await makeServer();
  t.after(api.close);

  const result = await json(api.base, '/exercises');
  assert.equal(result.response.status, 200);

  const names = result.body.data.map((exercise) => exercise.name);
  for (const name of [
    'Chest Press Machine',
    'Back Extension',
    'Cable Bench Press',
    'Dumbbell Chest Press',
    'Chest Fly',
    'Shoulder Press'
  ]) {
    assert.ok(names.includes(name), `catalog should include ${name}`);
  }

  for (const exercise of result.body.data) {
    assert.ok(exercise.muscleGroup, `${exercise.name} should have muscle-group metadata`);
  }
});

test('exercise catalog does not support search or filtering in v1', async (t) => {
  const api = await makeServer();
  t.after(api.close);

  assert.equal((await json(api.base, '/exercises?search=press')).response.status, 400);
  assert.equal((await json(api.base, '/exercises?muscleGroup=chest')).response.status, 400);
});

test('exercise entries preserve repeats and allow one or more sets', async (t) => {
  const api = await makeServer();
  t.after(api.close);
  const session = await json(api.base, '/sessions', { method: 'POST', body: '{}' });
  assert.equal(session.response.status, 201);

  const add = async (sets) => json(api.base, `/sessions/${session.body.id}/exercises`, {
    method: 'POST',
    body: JSON.stringify({ exerciseId: 4, sets })
  });

  const oneSet = await add([{ setNumber: 1, weightKg: 12.3, reps: 6 }]);
  assert.equal(oneSet.response.status, 201);
  assert.equal(oneSet.body.sets.length, 1);
  assert.equal(oneSet.body.sets[0].weightKg, 12.3);

  const repeated = await add([
    { setNumber: 1, weightKg: 15, reps: 8 },
    { setNumber: 2, weightKg: 17.5, reps: 6 },
    { setNumber: 3, weightKg: 20, reps: 4 },
    { setNumber: 4, weightKg: 22.5, reps: 2 }
  ]);
  assert.equal(repeated.response.status, 201);
  assert.notEqual(repeated.body.id, oneSet.body.id);
  assert.equal(repeated.body.sets.length, 4);
  assert.deepEqual(repeated.body.sets.map((set) => set.weightKg), [15, 17.5, 20, 22.5]);

  const detail = await json(api.base, `/sessions/${session.body.id}`);
  assert.equal(detail.response.status, 200);
  assert.equal(detail.body.exercises.length, 2);
});

test('set validation rejects invalid weights, reps, and missing sets without saving', async (t) => {
  const api = await makeServer();
  t.after(api.close);
  const session = await json(api.base, '/sessions', { method: 'POST', body: '{}' });
  const path = `/sessions/${session.body.id}/exercises`;

  const invalidPayloads = [
    { exerciseId: 1, sets: [] },
    { exerciseId: 1, sets: [{ setNumber: 1, weightKg: -0.1, reps: 8 }] },
    { exerciseId: 1, sets: [{ setNumber: 1, weightKg: 12.35, reps: 8 }] },
    { exerciseId: 1, sets: [{ setNumber: 1, weightKg: 'NaN', reps: 8 }] },
    { exerciseId: 1, sets: [{ setNumber: 1, weightKg: 10, reps: 0 }] },
    { exerciseId: 1, sets: [{ setNumber: 1, weightKg: 10, reps: 1.5 }] },
    { exerciseId: 1, sets: [{ setNumber: 1, weightKg: 10, reps: '8' }] },
    { exerciseId: 99999, sets: [{ setNumber: 1, weightKg: 10, reps: 8 }] }
  ];

  for (const payload of invalidPayloads) {
    const result = await json(api.base, path, {
      method: 'POST', body: JSON.stringify(payload)
    });
    assert.equal(result.response.status, 400);
  }

  const detail = await json(api.base, `/sessions/${session.body.id}`);
  assert.equal(detail.response.status, 200);
  assert.equal(detail.body.exercises.length, 0);
});

test('an exercise entry cannot be created without at least one set', async (t) => {
  const api = await makeServer();
  t.after(api.close);
  const session = await json(api.base, '/sessions', { method: 'POST', body: '{}' });
  assert.equal(session.response.status, 201);

  const result = await json(api.base, `/sessions/${session.body.id}/exercises`, {
    method: 'POST',
    body: JSON.stringify({ exerciseId: 4, sets: [] })
  });

  assert.equal(result.response.status, 400);
  const detail = await json(api.base, `/sessions/${session.body.id}`);
  assert.equal(detail.body.exercises.length, 0);
});
