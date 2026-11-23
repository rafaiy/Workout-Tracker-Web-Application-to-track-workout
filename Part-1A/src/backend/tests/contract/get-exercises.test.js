import test from 'node:test'; import assert from 'node:assert/strict'; import { makeServer, json } from '../helpers.js';
test('GET /exercises returns the predefined catalog and rejects unknown query', async (t) => {
  const api = await makeServer(); t.after(api.close);
  const ok = await json(api.base, '/exercises'); assert.equal(ok.response.status, 200); assert.ok(ok.body.data.some((x) => x.name === 'Dumbbell Chest Press'));
  assert.equal((await json(api.base, '/exercises?search=press')).response.status, 400);
});
