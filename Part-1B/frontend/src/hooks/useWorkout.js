import { useCallback, useReducer } from 'react';
import { initialWorkoutState, workoutReducer } from '../state/workoutReducer.js';
import { workoutApi } from '../services/apiClient.js';
import { captureLocalTime } from '../services/localTime.js';

export function useWorkout() {
  const [state, dispatch] = useReducer(workoutReducer, initialWorkoutState);
  const loadSessions = useCallback(async () => {
    dispatch({ type: 'loading' });
    try { const result = await workoutApi.sessions(); dispatch({ type: 'sessionsLoaded', sessions: result.sessions }); }
    catch (error) { dispatch({ type: 'failed', message: error.message }); }
  }, []);
  const createSession = useCallback(async () => {
    const captured = captureLocalTime();
    const result = await workoutApi.createSession({ startedAt: captured.instant, timeZone: captured.timeZone });
    dispatch({ type: 'sessionCreated', session: result.session });
    return result.session;
  }, []);
  return { state, dispatch, loadSessions, createSession };
}
