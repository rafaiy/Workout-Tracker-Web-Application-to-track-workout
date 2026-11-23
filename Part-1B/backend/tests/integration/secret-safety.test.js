import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createDatabase } from '../../src/db/connection.js';
import { createApp } from '../../src/app.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const dbs=[]; afterEach(()=>{while(dbs.length)dbs.pop().close()});
function sourceFiles(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? sourceFiles(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }

describe('LLM secret handling',()=>{
 it('keeps keys out of frontend source and checked-in runtime examples',()=>{
  const files=[...sourceFiles(path.join(root,'frontend/src')),path.join(root,'frontend/index.html')];
  const source=files.map((file)=>fs.readFileSync(file,'utf8')).join('\n');
  expect(source).not.toMatch(/LLM_API_KEY|OPENAI_API_KEY|sk-[A-Za-z0-9]{12,}/);
  const example=fs.readFileSync(path.join(root,'backend/.env.example'),'utf8');
  expect(example).toContain('LLM_API_KEY=replace-with-your-generated-key');
 });
 it('sanitizes provider exceptions and never returns the configured secret',async()=>{
  const db=createDatabase(':memory:');dbs.push(db);
  const secret='test-secret-not-for-output';
  const app=createApp({db,llmProvider:{parseWorkout:async()=>{throw new Error(`upstream echoed ${secret}`)}}});
  const result=await request(app).post('/api/sessions/parse').send({text:'I did some chest',timeZone:'Asia/Kolkata',submittedAt:'2026-11-23T06:30:00+05:30'}).expect(500);
  expect(JSON.stringify(result.body)).not.toContain(secret);
  expect(JSON.stringify(result.body)).not.toContain('upstream echoed');
 });
});
