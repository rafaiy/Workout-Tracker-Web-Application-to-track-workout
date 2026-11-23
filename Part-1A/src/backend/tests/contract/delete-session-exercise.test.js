import test from 'node:test'; import assert from 'node:assert/strict'; import { makeServer, json } from '../helpers.js';
test('DELETE session exercise is bodyless and validates IDs', async (t) => {
  const api = await makeServer(); t.after(api.close); const s = await json(api.base, '/sessions', { method: 'POST', body: '{}' });
  const ex = await json(api.base, `/sessions/${s.body.id}/exercises`, { method: 'POST', body: JSON.stringify({ exerciseId: 1, sets: [{ setNumber: 1, weightKg: 20, reps: 10 }] }) });
  const del = await json(api.base, `/sessions/${s.body.id}/exercises/${ex.body.id}`, { method: 'DELETE' }); assert.equal(del.response.status, 204); assert.equal(del.body, null);
  assert.equal((await json(api.base, '/sessions/no/exercises/x', { method: 'DELETE' })).response.status, 400);
  assert.equal((await json(api.base, '/sessions/900/exercises/900', { method: 'DELETE' })).response.status, 404);
});
