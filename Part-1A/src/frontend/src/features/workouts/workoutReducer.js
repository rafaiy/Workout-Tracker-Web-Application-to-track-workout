export const initialWorkoutState = { sessions: [], activeSession: null, draftSets: [{ setNumber: 1 }, { setNumber: 2 }, { setNumber: 3 }] };

export function workoutReducer(state, action) {
  switch (action.type) {
    case 'sessionsLoaded': return { ...state, sessions: action.sessions };
    case 'sessionStarted': return { ...state, activeSession: action.session, sessions: [action.session, ...state.sessions] };
    case 'sessionResumed': return { ...state, activeSession: action.session };
    case 'setsReset': return { ...state, draftSets: [{ setNumber: 1 }, { setNumber: 2 }, { setNumber: 3 }] };
    case 'setAdded': return { ...state, draftSets: [...state.draftSets, { setNumber: state.draftSets.length + 1 }] };
    case 'setRemoved':
      if (state.draftSets.length <= 1) return state;
      return { ...state, draftSets: state.draftSets.filter((_, index) => index !== action.index).map((set, index) => ({ ...set, setNumber: index + 1 })) };
    case 'setsChanged': return { ...state, draftSets: action.sets };
    case 'exerciseAdded':
      if (!state.activeSession) return state;
      return { ...state, activeSession: { ...state.activeSession, exercises: [...(state.activeSession.exercises || []), action.exercise] } };
    case 'sessionCompleted': {
      const session = action.session;
      return { ...state, activeSession: session, sessions: state.sessions.map((item) => item.id === session.id ? session : item) };
    }
    case 'sessionUpdated':
      return { ...state, activeSession: state.activeSession?.id === action.session.id ? action.session : state.activeSession, sessions: state.sessions.map((s) => s.id === action.session.id ? action.session : s) };
    case 'exerciseUpdated':
      if (!state.activeSession || state.activeSession.id !== action.sessionId) return state;
      return { ...state, activeSession: { ...state.activeSession, exercises: state.activeSession.exercises.map((e) => e.id === action.exercise.id ? action.exercise : e) } };
    case 'sessionDeleted':
      return { ...state, activeSession: state.activeSession?.id === action.id ? null : state.activeSession, sessions: state.sessions.filter((s) => s.id !== action.id) };
    default: return state;
  }
}
