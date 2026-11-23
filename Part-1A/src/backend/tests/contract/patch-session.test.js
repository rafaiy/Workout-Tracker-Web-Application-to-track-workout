import test from 'node:test'; import assert from 'node:assert/strict'; import { makeServer, json } from '../helpers.js';
test('PATCH session updates and validates title/start time', async (t) => {
  const api = await makeServer(); t.after(api.close); const s = await json(api.base, '/sessions', { method: 'POST', body: '{}' });
  const good = await json(api.base, `/sessions/${s.body.id}`, { method: 'PATCH', body: JSON.stringify({ title: 'Push day', startedAt: '2026-11-20T17:15:00+05:30' }) }); assert.equal(good.response.status, 200); assert.equal(good.body.title, 'Push day');
  assert.equal((await json(api.base, `/sessions/${s.body.id}`, { method: 'PATCH', body: '{}' })).response.status, 400);
  assert.equal((await json(api.base, `/sessions/${s.body.id}`, { method: 'PATCH', body: '{"title":" "}' })).response.status, 400);
  assert.equal((await json(api.base, '/sessions/99999', { method: 'PATCH', body: '{"title":"A"}' })).response.status, 404);
});
