import test from 'node:test'; import assert from 'node:assert/strict'; import { makeServer, json } from '../helpers.js';
test('multiple pending sessions remain independent in history and can complete separately', async (t) => {
  const api = await makeServer(); t.after(api.close);
  const first = await json(api.base, '/sessions', { method: 'POST', body: JSON.stringify({ startedAt: '2026-11-20T08:00:00+05:30' }) });
  const second = await json(api.base, '/sessions', { method: 'POST', body: JSON.stringify({ startedAt: '2026-11-20T19:00:00+05:30' }) });
  const list = await json(api.base, '/sessions'); assert.equal(list.body.data.length, 2); assert.equal(list.body.data[0].id, second.body.id); assert.equal(list.body.data[0].status, 'PENDING');
  await json(api.base, `/sessions/${first.body.id}/complete`, { method: 'POST', body: '{}' });
  const again = await json(api.base, '/sessions');
  assert.equal(again.body.data.find((s) => s.id === first.body.id).status, 'COMPLETED');
  assert.equal(again.body.data.find((s) => s.id === second.body.id).status, 'PENDING');
});
