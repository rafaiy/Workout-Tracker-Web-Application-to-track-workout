import test from 'node:test'; import assert from 'node:assert/strict'; import { makeServer, json } from '../helpers.js';
test('DELETE session is bodyless and removes its history', async (t) => {
  const api = await makeServer(); t.after(api.close); const s = await json(api.base, '/sessions', { method: 'POST', body: '{}' });
  const del = await json(api.base, `/sessions/${s.body.id}`, { method: 'DELETE' }); assert.equal(del.response.status, 204); assert.equal(del.body, null);
  assert.equal((await json(api.base, `/sessions/${s.body.id}`)).response.status, 404);
  assert.equal((await json(api.base, '/sessions/nope', { method: 'DELETE' })).response.status, 400);
  assert.equal((await json(api.base, '/sessions/98765', { method: 'DELETE' })).response.status, 404);
});
