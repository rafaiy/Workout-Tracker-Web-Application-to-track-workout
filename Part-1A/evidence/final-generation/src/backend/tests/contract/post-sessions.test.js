import test from 'node:test'; import assert from 'node:assert/strict'; import { makeServer, json } from '../helpers.js';
test('POST /sessions returns a pending default title and rejects invalid bodies', async (t) => {
  const api = await makeServer(); t.after(api.close);
  const ok = await json(api.base, '/sessions', { method: 'POST', body: '{}' }); assert.equal(ok.response.status, 201); assert.equal(ok.body.status, 'PENDING'); assert.ok(ok.body.title);
  for (const body of ['{"title":"  "}', '{"startedAt":"yesterday"}', '{"unknown":1}']) assert.equal((await json(api.base, '/sessions', { method: 'POST', body })).response.status, 400);
});
