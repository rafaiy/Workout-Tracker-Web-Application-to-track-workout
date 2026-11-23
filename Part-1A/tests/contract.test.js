import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/app.js'; // Import the AI's server

let server;
let baseUrl;

before(async () => {
    // Start on an ephemeral (random) port to avoid collisions[reference:6]
    server = await createServer(); 
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
});

after(async () => {
    await new Promise((resolve) => server.close(resolve));
});

test('POST /tasks with valid payload returns 201 and exact schema', async () => {
    const res = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Task' })
    });
    
    assert.strictEqual(res.status, 201); // Exact status assertion
    const body = await res.json();
    assert.strictEqual(typeof body.id, 'string');
    assert.strictEqual(body.title, 'Test Task');
});

test('POST /tasks with missing title returns 400', async () => {
    const res = await fetch(`${baseUrl}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Missing mandatory field
    });
    assert.strictEqual(res.status, 400);
});