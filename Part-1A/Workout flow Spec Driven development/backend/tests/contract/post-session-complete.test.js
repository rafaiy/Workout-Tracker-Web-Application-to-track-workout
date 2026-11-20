import test from 'node:test'; import assert from 'node:assert/strict'; import { makeServer, json } from '../helpers.js';
test('POST complete transitions state once and rejects invalid input', async (t) => {
  const api = await makeServer(); t.after(api.close);
  const session = await json(api.base, '/sessions', { method: 'POST', body: '{}' });
  const complete = await json(api.base, `/sessions/${session.body.id}/complete`, { method: 'POST', body: '{}' });
  assert.equal(complete.response.status, 200); assert.equal(complete.body.status, 'COMPLETED');
  const again = await json(api.base, `/sessions/${session.body.id}/complete`, { method: 'POST', body: '{}' }); assert.equal(again.body.completedAt, complete.body.completedAt);
  assert.equal((await json(api.base, '/sessions/bad/complete', { method: 'POST', body: '{}' })).response.status, 400);
  assert.equal((await json(api.base, `/sessions/${session.body.id}/complete`, { method: 'POST', body: '{"no":1}' })).response.status, 400);
  assert.equal((await json(api.base, '/sessions/98444/complete', { method: 'POST', body: '{}' })).response.status, 404);
});
