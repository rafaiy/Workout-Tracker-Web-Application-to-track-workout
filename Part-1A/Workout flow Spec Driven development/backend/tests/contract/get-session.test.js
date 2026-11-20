import test from 'node:test'; import assert from 'node:assert/strict'; import { makeServer, json } from '../helpers.js';
test('GET session supports detail and distinguishes malformed and missing IDs', async (t) => {
  const api = await makeServer(); t.after(api.close);
  const created = await json(api.base, '/sessions', { method: 'POST', body: '{}' });
  assert.equal((await json(api.base, `/sessions/${created.body.id}`)).response.status, 200);
  assert.equal((await json(api.base, '/sessions/nope')).response.status, 400);
  assert.equal((await json(api.base, '/sessions/987654')).response.status, 404);
});
