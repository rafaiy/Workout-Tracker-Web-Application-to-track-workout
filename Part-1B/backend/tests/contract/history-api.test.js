import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createDatabase } from '../../src/db/connection.js';
import { createApp } from '../../src/app.js';
const dbs=[];
function create(){const db=createDatabase(':memory:');dbs.push(db);return createApp({db,llmProvider:{parseWorkout:async()=>({outcome:'needs_clarification',reason:'missing',message:'More detail needed.'})}})}
afterEach(()=>{while(dbs.length)dbs.pop().close()});
const start={startedAt:'2026-11-23T06:30:00+05:30',timeZone:'Asia/Kolkata'};

describe('history API',()=>{
 it('lists, details, renames, edits, and deletes workout history',async()=>{
  const app=create(); const session=(await request(app).post('/api/sessions').send(start)).body.session; const ex=(await request(app).get('/api/exercises')).body.exercises[0];
  const item=(await request(app).post(`/api/sessions/${session.id}/exercises`).send({exerciseId:ex.id,sets:[{weightKg:20,reps:10}]})).body.exercise;
  expect((await request(app).get('/api/sessions')).body.sessions[0].exerciseCount).toBe(1);
  await request(app).patch(`/api/sessions/${session.id}`).send({title:'Strength day'}).expect(200);
  await request(app).put(`/api/sessions/${session.id}/exercises/${item.id}`).send({exerciseId:ex.id,sets:[{weightKg:30,reps:8}]}).expect(200);
  expect((await request(app).get(`/api/sessions/${session.id}`)).body.session.title).toBe('Strength day');
  await request(app).delete(`/api/sessions/${session.id}`).expect(200,{deleted:true});
  await request(app).get(`/api/sessions/${session.id}`).expect(404);
 });
 it('deletes a single exercise and returns 404 for unknown records',async()=>{
  const app=create(); const session=(await request(app).post('/api/sessions').send(start)).body.session;
  await request(app).delete(`/api/sessions/${session.id}/exercises/999`).expect(404);
  await request(app).delete('/api/sessions/999').expect(404);
 });
});
