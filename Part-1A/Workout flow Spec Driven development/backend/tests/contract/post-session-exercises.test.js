import test from 'node:test'; import assert from 'node:assert/strict'; import { makeServer, json } from '../helpers.js';
test('POST session exercise saves valid zero/fractional sets and rejects invalid input', async (t) => {
  const api = await makeServer(); t.after(api.close);
  const session = await json(api.base, '/sessions', { method: 'POST', body: '{}' });
  const added = await json(api.base, `/sessions/${session.body.id}/exercises`, { method: 'POST', body: JSON.stringify({ exerciseId: 4, sets: [
    { setNumber: 1, weightKg: 40, reps: 15 }, { setNumber: 2, weightKg: 45, reps: 12 }, { setNumber: 3, weightKg: 50, reps: 10 }
  ] }) });
  assert.equal(added.response.status, 201); assert.deepEqual(added.body.sets.map((s) => [s.weightKg, s.reps]), [[40,15],[45,12],[50,10]]);
  const fourSetSession = await json(api.base, '/sessions', { method: 'POST', body: '{}' });
  const fourSets = await json(api.base, `/sessions/${fourSetSession.body.id}/exercises`, { method: 'POST', body: JSON.stringify({ exerciseId: 2, sets: [
    { setNumber: 1, weightKg: 20, reps: 15 }, { setNumber: 2, weightKg: 30, reps: 12 },
    { setNumber: 3, weightKg: 40, reps: 10 }, { setNumber: 4, weightKg: 50, reps: 8 }
  ] }) });
  assert.equal(fourSets.body.sets.length, 4); assert.deepEqual(fourSets.body.sets.map((s) => s.weightKg), [20, 30, 40, 50]);
  for (const value of [-1, 12.35, 'NaN']) {
    const result = await json(api.base, `/sessions/${session.body.id}/exercises`, { method: 'POST', body: JSON.stringify({ exerciseId: 1, sets: [{ setNumber: 1, weightKg: value, reps: 8 }] }) });
    assert.equal(result.response.status, 400);
  }
  for (const reps of [0, 1.5, '12']) {
    const result = await json(api.base, `/sessions/${session.body.id}/exercises`, { method: 'POST', body: JSON.stringify({ exerciseId: 1, sets: [{ setNumber: 1, weightKg: 10, reps }] }) });
    assert.equal(result.response.status, 400);
  }
});
