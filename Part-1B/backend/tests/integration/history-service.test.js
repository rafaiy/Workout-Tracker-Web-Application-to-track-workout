import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDatabase } from '../../src/db/connection.js';
import { seedCatalog } from '../../src/db/seeds/exercise-catalog.js';
import { createRepositories } from '../../src/repositories/index.js';
import { WorkoutService } from '../../src/services/workout.service.js';
let db; let repos; let service;
beforeEach(() => { db = createDatabase(':memory:'); seedCatalog(db); repos = createRepositories(db); service = new WorkoutService(repos); });
afterEach(() => db.close());
const firstTime = { startedAt: '2026-11-23T06:30:00+05:30', timeZone: 'Asia/Kolkata' };

describe('history persistence', () => {
  it('lists by status and reflects rename and time edits', () => {
    const pending = service.createSession(firstTime); const complete = service.createSession({ startedAt: '2026-11-22T18:30:00+05:30', timeZone: 'Asia/Kolkata' });
    service.completeSession(complete.id);
    expect(service.listSessions('PENDING')).toHaveLength(1); expect(service.listSessions('COMPLETED')).toHaveLength(1);
    const renamed = service.updateSession(pending.id, { title: 'Push day' }); expect(renamed.title).toBe('Push day');
    const moved = service.updateSession(pending.id, { startedAt: '2026-11-23T19:30:00+05:30', timeZone: 'Asia/Kolkata' });
    expect(moved.timeOfDay).toBe('evening');
  });
  it('updates and deletes an exercise with its sets', () => {
    const session = service.createSession(firstTime); const exercise = repos.catalog.byName('Chest fly');
    const added = service.addExercise(session.id, { exerciseId: exercise.id, sets: [{ weightKg: 25, reps: 15 }] });
    service.updateExercise(session.id, added.id, { exerciseId: exercise.id, sets: [{ weightKg: 30, reps: 12 }, { weightKg: 45, reps: 10 }] });
    expect(service.getSession(session.id).exercises[0].sets.map((s) => s.weightKg)).toEqual([30, 45]);
    service.deleteExercise(session.id, added.id); expect(service.getSession(session.id).exercises).toHaveLength(0);
    expect(db.prepare('SELECT COUNT(*) count FROM ExerciseSet').get().count).toBe(0);
  });
  it('returns missing resources as 404 and deletes the full session tree', () => {
    expect(() => service.getSession(999)).toThrow(/not found/);
    const session = service.createSession(firstTime); const exercise = repos.catalog.byName('Chest fly');
    service.addExercise(session.id, { exerciseId: exercise.id, sets: [{ weightKg: 25, reps: 12 }] });
    service.deleteSession(session.id);
    expect(db.prepare('SELECT COUNT(*) count FROM SessionExercise').get().count).toBe(0);
    expect(db.prepare('SELECT COUNT(*) count FROM ExerciseSet').get().count).toBe(0);
  });
});
