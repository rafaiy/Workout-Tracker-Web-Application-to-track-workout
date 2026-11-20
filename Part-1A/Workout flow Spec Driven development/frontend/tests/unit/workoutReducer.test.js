import { describe, expect, it } from 'vitest';
import { initialWorkoutState, workoutReducer } from '../../src/features/workouts/workoutReducer.js';

describe('workoutReducer', () => {
  it('starts a session and maintains three removable default sets', () => {
    const session = { id: 1, status: 'PENDING', exercises: [] };
    let state = workoutReducer(initialWorkoutState, { type: 'sessionStarted', session });
    expect(state.activeSession).toEqual(session);
    expect(state.draftSets).toHaveLength(3);
    state = workoutReducer(state, { type: 'setRemoved', index: 0 });
    expect(state.draftSets.map((s) => s.setNumber)).toEqual([1, 2]);
    state = workoutReducer(state, { type: 'setRemoved', index: 1 });
    state = workoutReducer(state, { type: 'setRemoved', index: 0 });
    expect(state.draftSets).toHaveLength(1);
  });
  it('adds sets and records exercise/completion and updates/deletion', () => {
    let state = workoutReducer(initialWorkoutState, { type: 'sessionStarted', session: { id: 1, status: 'PENDING', exercises: [] } });
    state = workoutReducer(state, { type: 'setAdded' }); expect(state.draftSets).toHaveLength(4);
    const ex = { id: 3, sets: [{ setNumber: 1, weightKg: 0.1, reps: 10 }] };
    state = workoutReducer(state, { type: 'exerciseAdded', exercise: ex }); expect(state.activeSession.exercises).toEqual([ex]);
    const completed = { ...state.activeSession, status: 'COMPLETED' };
    state = workoutReducer(state, { type: 'sessionCompleted', session: completed }); expect(state.sessions[0].status).toBe('COMPLETED');
    const updated = { ...completed, title: 'Updated' };
    state = workoutReducer(state, { type: 'sessionUpdated', session: updated }); expect(state.activeSession.title).toBe('Updated');
    state = workoutReducer(state, { type: 'sessionDeleted', id: 1 }); expect(state.sessions).toHaveLength(0); expect(state.activeSession).toBeNull();
    expect(workoutReducer(state, { type: 'unknown' })).toEqual(state);
  });
  it('loads session summaries and resets draft sets', () => {
    let state = workoutReducer(initialWorkoutState, { type: 'sessionsLoaded', sessions: [{ id: 1 }] });
    expect(state.sessions).toHaveLength(1);
    state = workoutReducer(state, { type: 'setsChanged', sets: [{ setNumber: 1, weightKg: '10' }] });
    state = workoutReducer(state, { type: 'setsReset' }); expect(state.draftSets).toHaveLength(3);
    state = workoutReducer(state, { type: 'sessionResumed', session: { id: 1, status: 'PENDING' } }); expect(state.activeSession.id).toBe(1);
  });
  it('updates an exercise and ignores exercise updates for another session', () => {
    const original = { id: 7, status: 'PENDING', exercises: [{ id: 3, sets: [] }] };
    let state = workoutReducer(initialWorkoutState, { type: 'sessionStarted', session: original });
    const updatedExercise = { id: 3, sets: [{ setNumber: 1, weightKg: 25, reps: 12 }] };
    state = workoutReducer(state, { type: 'exerciseUpdated', sessionId: 7, exercise: updatedExercise });
    expect(state.activeSession.exercises[0]).toEqual(updatedExercise);
    expect(workoutReducer(state, { type: 'exerciseUpdated', sessionId: 8, exercise: { id: 3 } })).toEqual(state);
  });
});
