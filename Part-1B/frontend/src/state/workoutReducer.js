export const initialWorkoutState = { sessions: [], activeSession: null, loading: false, error: null };

export function workoutReducer(state = initialWorkoutState, action) {
  switch (action.type) {
    case 'loading': return { ...state, loading: true, error: null };
    case 'sessionsLoaded': return { ...state, loading: false, sessions: action.sessions ?? [], error: null };
    case 'sessionCreated': return { ...state, activeSession: action.session, sessions: [action.session, ...state.sessions], loading: false };
    case 'sessionUpdated': return { ...state, activeSession: action.session, sessions: state.sessions.map((s) => s.id === action.session.id ? action.session : s) };
    case 'exerciseAdded': return state.activeSession ? { ...state, activeSession: { ...state.activeSession, exercises: [...state.activeSession.exercises, action.exercise] } } : state;
    case 'exerciseUpdated': return state.activeSession ? { ...state, activeSession: { ...state.activeSession, exercises: state.activeSession.exercises.map((e) => e.id === action.exercise.id ? action.exercise : e) } } : state;
    case 'exerciseRemoved': return state.activeSession ? { ...state, activeSession: { ...state.activeSession, exercises: state.activeSession.exercises.filter((e) => e.id !== action.id) } } : state;
    case 'completed': return state.activeSession ? { ...state, activeSession: { ...state.activeSession, status: 'COMPLETED', completedAt: action.completedAt } } : state;
    case 'pending': return state.activeSession ? { ...state, activeSession: { ...state.activeSession, status: 'PENDING', completedAt: null } } : state;
    case 'failed': return { ...state, loading: false, error: action.message };
    case 'clearError': return { ...state, error: null };
    default: return state;
  }
}
