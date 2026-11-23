import test from 'node:test'; import assert from 'node:assert/strict'; import { makeServer, json } from '../helpers.js';
test('PUT session exercise atomically replaces sets', async (t) => {
  const api = await makeServer(); t.after(api.close); const s = await json(api.base, '/sessions', { method: 'POST', body: '{}' });
  const ex = await json(api.base, `/sessions/${s.body.id}/exercises`, { method: 'POST', body: JSON.stringify({ exerciseId: 1, sets: [{ setNumber: 1, weightKg: 20, reps: 10 }] }) });
  const url = `/sessions/${s.body.id}/exercises/${ex.body.id}`;
  const good = await json(api.base, url, { method: 'PUT', body: JSON.stringify({ sets: [{ setNumber: 1, weightKg: 25.5, reps: 8 }] }) }); assert.equal(good.response.status, 200); assert.equal(good.body.sets[0].weightKg, 25.5);
  assert.equal((await json(api.base, url, { method: 'PUT', body: '{"sets":[]}' })).response.status, 400);
  assert.equal((await json(api.base, '/sessions/999/exercises/999', { method: 'PUT', body: '{"sets":[{"setNumber":1,"weightKg":1,"reps":1}]}' })).response.status, 404);
  assert.equal((await json(api.base, '/sessions/x/exercises/y', { method: 'PUT', body: '{"sets":[]}' })).response.status, 400);
});
