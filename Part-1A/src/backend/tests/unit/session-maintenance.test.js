import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from '../../src/db/migrate.js';
import { seedExercises } from '../../src/db/seed/exercises.js';
import { createSessionRepository } from '../../src/modules/sessions/session.repository.js';
import { createSessionService } from '../../src/modules/sessions/session.service.js';

test('updates session metadata, replaces sets atomically, and cascades deletion', () => {
  const db = new DatabaseSync(':memory:'); migrate(db); seedExercises(db);
  const service = createSessionService(createSessionRepository(db));
  const session = service.create({ title: 'Morning Workout', startedAt: '2026-11-20T08:00:00+05:30' });
  const entry = service.addExercise(session.id, 1, [{ setNumber: 1, weightKg: 30, reps: 10 }]).exercise;
  const updated = service.update(session.id, { title: 'Push', startedAt: '2026-11-20T17:15:00+05:30' });
  assert.equal(updated.title, 'Push'); assert.equal(updated.startedAt, '2026-11-20T17:15:00+05:30');
  const replacement = service.replaceSets(session.id, entry.id, [{ setNumber: 1, weightKg: 35, reps: 8 }, { setNumber: 2, weightKg: 40, reps: 6 }]);
  assert.deepEqual(replacement.sets.map((set) => [set.weightKg, set.reps]), [[35, 8], [40, 6]]);
  assert.equal(service.delete(session.id), true);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM ExerciseSet').get().n, 0);
  db.close();
});
