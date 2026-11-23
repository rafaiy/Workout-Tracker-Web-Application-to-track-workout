import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedExercises } from '../../src/db/seed/exercises.js';
import { createSessionRepository } from '../../src/modules/sessions/session.repository.js';
import { createSessionService } from '../../src/modules/sessions/session.service.js';

test('creates, records variable sets transactionally, and completes a session', () => {
  const db = new DatabaseSync(':memory:'); db.exec('PRAGMA foreign_keys = ON');
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/db');
  db.exec(readFileSync(resolve(root, 'migrations/001-workout-schema.sql'), 'utf8')); seedExercises(db);
  const service = createSessionService(createSessionRepository(db), () => new Date('2026-11-20T06:30:00Z'));
  const session = service.create({ startedAt: '2026-11-20T06:30:00+05:30' });
  assert.equal(session.title, 'Morning Workout'); assert.equal(session.status, 'PENDING');
  const exercise = service.addExercise(session.id, 1, [
    { setNumber: 1, weightKg: 40, reps: 15 }, { setNumber: 2, weightKg: 45.1, reps: 12 },
    { setNumber: 3, weightKg: 50, reps: 10 }, { setNumber: 4, weightKg: 55, reps: 8 }
  ]);
  assert.equal(exercise.exercise.sets.length, 4);
  assert.equal(service.get(session.id).exercises[0].sets[1].weightKg, 45.1);
  const completed = service.complete(session.id);
  assert.equal(completed.status, 'COMPLETED'); assert.ok(completed.completedAt);
  assert.deepEqual(service.complete(session.id), completed);
  assert.equal(service.addExercise(session.id, 1, [{ setNumber: 1, weightKg: 1, reps: 1 }]).completed, true);
  db.close();
});

test('orders time labels by local wall-clock and handles all periods', async () => {
  const { timeOfDayLabel } = await import('../../src/modules/sessions/time-of-day.js');
  for (const [time, label] of [['04:59','Night Workout'],['05:00','Morning Workout'],['11:59','Morning Workout'],['12:00','Afternoon Workout'],['16:59','Afternoon Workout'],['17:00','Evening Workout'],['20:59','Evening Workout'],['21:00','Night Workout']]) {
    assert.equal(timeOfDayLabel(`2026-11-20T${time}:00+05:30`), label);
  }
});
