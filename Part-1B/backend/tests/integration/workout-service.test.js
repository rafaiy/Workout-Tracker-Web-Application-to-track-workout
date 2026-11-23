import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDatabase } from '../../src/db/connection.js';
import { seedCatalog } from '../../src/db/seeds/exercise-catalog.js';
import { createRepositories } from '../../src/repositories/index.js';
import { WorkoutService } from '../../src/services/workout.service.js';

let db; let repos; let service;
const start = { startedAt: '2026-11-23T06:30:00+05:30', timeZone: 'Asia/Kolkata' };
beforeEach(() => { db = createDatabase(':memory:'); seedCatalog(db); repos = createRepositories(db); service = new WorkoutService(repos); });
afterEach(() => db.close());

describe('WorkoutService', () => {
  it('creates a Pending session, saves variable sets, and completes it', () => {
    const session = service.createSession(start);
    expect(session.status).toBe('PENDING'); expect(session.timeOfDay).toBe('morning');
    const exercise = repos.catalog.byName('Dumbbell chest press');
    service.addExercise(session.id, { exerciseId: exercise.id, sets: [{ weightKg: 40, reps: 15 }, { weightKg: 45, reps: 12 }, { weightKg: 50, reps: 10 }] });
    expect(service.getSession(session.id).exercises[0].sets).toHaveLength(3);
    expect(service.completeSession(session.id).status).toBe('COMPLETED');
    expect(service.completeSession(session.id).completedAt).toBeTruthy();
  });

  it('generates a local-time title and keeps a no-exercise session pending', () => {
    const session = service.createSession(start);
    expect(session.title).toMatch(/Morning workout/); expect(session.exercises).toHaveLength(0);
    expect(service.listSessions('PENDING')[0].exerciseCount).toBe(0);
  });

  it('generates afternoon, evening, and night titles from the session local hour', () => {
    expect(service.createSession({ startedAt: '2026-11-23T13:30:00+05:30', timeZone: 'Asia/Kolkata' }).title).toMatch(/Afternoon workout/);
    expect(service.createSession({ startedAt: '2026-11-23T18:00:00+05:30', timeZone: 'Asia/Kolkata' }).title).toMatch(/Evening workout/);
    expect(service.createSession({ startedAt: '2026-11-23T23:00:00+05:30', timeZone: 'Asia/Kolkata' }).title).toMatch(/Night workout/);
  });

  it('rejects zero weight and unknown catalog entries before writing', () => {
    const session = service.createSession(start);
    const exercise = repos.catalog.byName('Chest fly');
    expect(() => service.addExercise(session.id, { exerciseId: exercise.id, sets: [{ weightKg: 0, reps: 10 }] })).toThrow(/greater than 0/);
    expect(() => service.addExercise(session.id, { exerciseId: 999, sets: [{ weightKg: 20, reps: 10 }] })).toThrow(/catalog/);
    expect(service.getSession(session.id).exercises).toHaveLength(0);
  });

  it('rolls back an exercise when any nested set insert fails', () => {
    const session = service.createSession(start);
    const exercise = repos.catalog.byName('Chest fly');
    expect(() => repos.exercises.add(session.id, exercise.id, [{ weightKg: 20, reps: 12 }, { weightKg: 0, reps: 10 }])).toThrow();
    expect(service.getSession(session.id).exercises).toHaveLength(0);
  });

  it('rolls back a natural-language session together with its child records on failure', () => {
    const exercise = repos.catalog.byName('Chest fly');
    expect(() => repos.sessions.createWithExercise({ title: 'Morning', ...start, exerciseId: exercise.id, sets: [{ weightKg: 0, reps: 10 }] })).toThrow();
    expect(db.prepare('SELECT COUNT(*) count FROM WorkoutSession').get().count).toBe(0);
    expect(db.prepare('SELECT COUNT(*) count FROM SessionExercise').get().count).toBe(0);
  });

  it('supports transactional replacement of an exercise set list and cascaded deletion', () => {
    const session = service.createSession(start); const exercise = repos.catalog.byName('Chest fly');
    const created = service.addExercise(session.id, { exerciseId: exercise.id, sets: [{ weightKg: 20, reps: 12 }] });
    service.updateExercise(session.id, created.id, { exerciseId: exercise.id, sets: [{ weightKg: 25, reps: 10 }, { weightKg: 30, reps: 8 }] });
    expect(service.getSession(session.id).exercises[0].sets).toHaveLength(2);
    service.deleteSession(session.id);
    expect(db.prepare('SELECT COUNT(*) count FROM ExerciseSet').get().count).toBe(0);
  });

  it('returns not-found errors for missing session, exercise, and completion targets', () => {
    expect(() => service.updateSession(999, { title: 'Missing' })).toThrow(/not found/);
    expect(() => service.completeSession(999)).toThrow(/not found/);
    const session = service.createSession(start);
    expect(() => service.updateExercise(session.id, 999, { exerciseId: repos.catalog.list()[0].id, sets: [{ weightKg: 10, reps: 5 }] })).toThrow(/not found/);
    expect(() => service.updateExercise(session.id, 999, { exerciseId: 999, sets: [{ weightKg: 10, reps: 5 }] })).toThrow(/catalog/);
  });

  it('rejects selecting a session that does not match the parsed local day and period', () => {
    const session = service.createSession(start);
    const exercise = repos.catalog.byName('Chest fly');
    expect(() => service.saveParsedWorkout({ exercise, sets: [{ weightKg: 10, reps: 5 }], startedAt: '2026-11-24T01:00:00.000Z', timeZone: 'Asia/Kolkata', targetSessionId: session.id })).toThrow(/matching sessions/);
  });
});
