import test from 'node:test'; import assert from 'node:assert/strict'; import { makeServer, json } from '../helpers.js';
test('GET sessions lists newest first and rejects query parameters', async (t) => {
  const api = await makeServer(); t.after(api.close);
  await json(api.base, '/sessions', { method: 'POST', body: JSON.stringify({ startedAt: '2026-11-19T10:00:00+05:30' }) });
  await json(api.base, '/sessions', { method: 'POST', body: JSON.stringify({ startedAt: '2026-11-20T10:00:00+05:30' }) });
  const list = await json(api.base, '/sessions'); assert.equal(list.response.status, 200); assert.equal(list.body.data[0].startedAt, '2026-11-20T10:00:00+05:30');
  assert.equal((await json(api.base, '/sessions?status=PENDING')).response.status, 400);
});
