import { describe, expect, it } from 'vitest';
import { initialWorkoutState, workoutReducer } from '../../src/state/workoutReducer.js';

const session = { id: 1, status: 'PENDING', exercises: [] };
describe('workoutReducer', () => {
  it('handles loading, list load, creation, and metadata update', () => {
    expect(workoutReducer(initialWorkoutState, { type: 'loading' }).loading).toBe(true);
    expect(workoutReducer(initialWorkoutState, { type: 'sessionsLoaded', sessions: [session] }).sessions).toEqual([session]);
    expect(workoutReducer(initialWorkoutState, { type: 'sessionCreated', session }).activeSession).toEqual(session);
    const updated = { ...session, title: 'Renamed' };
    expect(workoutReducer({ ...initialWorkoutState, sessions: [session] }, { type: 'sessionUpdated', session: updated }).sessions[0].title).toBe('Renamed');
  });
  it('adds, updates, and removes exercises and transitions completion state', () => {
    let state = { ...initialWorkoutState, activeSession: session };
    const exercise = { id: 2, sets: [{ weightKg: 20, reps: 8 }] };
    state = workoutReducer(state, { type: 'exerciseAdded', exercise });
    expect(state.activeSession.exercises).toHaveLength(1);
    state = workoutReducer(state, { type: 'exerciseUpdated', exercise: { ...exercise, sets: [{ weightKg: 25, reps: 7 }] } });
    expect(state.activeSession.exercises[0].sets[0].weightKg).toBe(25);
    state = workoutReducer(state, { type: 'exerciseUpdated', exercise: { id: 999, sets: [] } });
    expect(state.activeSession.exercises[0].id).toBe(2);
    state = workoutReducer(state, { type: 'completed', completedAt: 'now' });
    expect(state.activeSession.status).toBe('COMPLETED');
    state = workoutReducer(state, { type: 'pending' }); expect(state.activeSession.completedAt).toBeNull();
    state = workoutReducer(state, { type: 'exerciseRemoved', id: 2 }); expect(state.activeSession.exercises).toHaveLength(0);
  });
  it('handles failures, clear, null active state, and unknown actions safely', () => {
    expect(workoutReducer(initialWorkoutState, { type: 'failed', message: 'Nope' }).error).toBe('Nope');
    expect(workoutReducer({ ...initialWorkoutState, error: 'x' }, { type: 'clearError' }).error).toBeNull();
    expect(workoutReducer(initialWorkoutState, { type: 'exerciseAdded', exercise: {} })).toEqual(initialWorkoutState);
    expect(workoutReducer(initialWorkoutState, { type: 'unknown' })).toEqual(initialWorkoutState);
    expect(workoutReducer(initialWorkoutState, { type: 'sessionsLoaded' }).sessions).toEqual([]);
    expect(workoutReducer({ ...initialWorkoutState, sessions: [session] }, { type: 'sessionUpdated', session: { ...session, id: 2 } }).sessions).toEqual([session]);
    for (const action of [
      { type: 'exerciseAdded', exercise: {} },
      { type: 'exerciseUpdated', exercise: {} },
      { type: 'exerciseRemoved', id: 2 },
      { type: 'completed', completedAt: 'now' },
      { type: 'pending' },
    ]) expect(workoutReducer(initialWorkoutState, action)).toEqual(initialWorkoutState);
  });
});
