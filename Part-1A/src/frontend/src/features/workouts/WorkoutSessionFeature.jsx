import { useEffect, useReducer, useState } from 'react';
import { navigate } from '../../app/routes.js';
import { initialWorkoutState, workoutReducer } from './workoutReducer.js';
import { workoutApi } from './workoutApi.js';
import WorkoutSessionPage from './pages/WorkoutSessionPage.jsx';
import SessionHistoryPage from './pages/SessionHistoryPage.jsx';
import SessionDetailPage from './pages/SessionDetailPage.jsx';

export default function WorkoutSessionFeature({ route }) {
  const [state, dispatch] = useReducer(workoutReducer, initialWorkoutState);
  const [exercises, setExercises] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  async function refreshHistory() {
    const sessions = await workoutApi.sessions();
    dispatch({ type: 'sessionsLoaded', sessions });
  }
  useEffect(() => {
    Promise.all([workoutApi.exercises(), workoutApi.sessions()]).then(([items, sessions]) => {
      setExercises(items); dispatch({ type: 'sessionsLoaded', sessions });
    }).catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (route.page === 'detail') workoutApi.session(route.sessionId).then(setDetail).catch((e) => { setDetail(null); setError(e.message); });
    else setDetail(null);
  }, [route.page, route.sessionId]);
  async function startWorkout() {
    setError('');
    try { const session = await workoutApi.createSession(); dispatch({ type: 'sessionStarted', session }); navigate('/workout'); }
    catch (e) { setError(e.message); }
  }
  async function resume(session) {
    try { const full = await workoutApi.session(session.id); dispatch({ type: 'sessionResumed', session: full }); navigate('/workout'); }
    catch (e) { setError(e.message); }
  }
  async function addExercise(exerciseId, sets) {
    const exercise = await workoutApi.addExercise(state.activeSession.id, exerciseId, sets);
    dispatch({ type: 'exerciseAdded', exercise });
    dispatch({ type: 'setsReset' });
    setNotice('Exercise added to your session.');
    setTimeout(() => setNotice(''), 2200);
  }
  async function complete(session = state.activeSession) {
    if (!session) return;
    setBusy(true);
    try {
      const saved = await workoutApi.complete(session.id);
      dispatch({ type: 'sessionCompleted', session: saved });
      await refreshHistory();
      setNotice('Workout completed. Nice work.');
      navigate(`/sessions/${session.id}`);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function rename(fields) {
    const updated = await workoutApi.update(detail.id, fields);
    setDetail(updated); dispatch({ type: 'sessionUpdated', session: updated }); await refreshHistory();
  }
  async function saveSets(exerciseId, sets) {
    const exercise = await workoutApi.replaceSets(detail.id, exerciseId, sets);
    dispatch({ type: 'exerciseUpdated', sessionId: detail.id, exercise });
    setDetail((current) => ({ ...current, exercises: current.exercises.map((e) => e.id === exerciseId ? exercise : e) }));
  }
  async function deleteExercise(exerciseId) {
    await workoutApi.deleteExercise(detail.id, exerciseId);
    setDetail((current) => ({ ...current, exercises: current.exercises.filter((e) => e.id !== exerciseId) }));
  }
  async function removeSession() {
    await workoutApi.deleteSession(detail.id);
    dispatch({ type: 'sessionDeleted', id: detail.id });
    navigate('/'); await refreshHistory();
  }
  let page;
  if (route.page === 'workout') page = state.activeSession
    ? <WorkoutSessionPage session={state.activeSession} exercises={exercises} onSaveExercise={addExercise} onComplete={() => complete()} busy={busy}/>
    : <div className="history-empty"><h3>No active workout</h3><button className="primary-button" onClick={startWorkout}>Start a workout</button></div>;
  else if (route.page === 'detail') page = <SessionDetailPage session={detail} onResume={() => detail && resume(detail)} onRename={rename} onDelete={removeSession} onSaveSets={saveSets} onDeleteExercise={deleteExercise}/>;
  else page = <SessionHistoryPage sessions={state.sessions} onOpen={(id) => navigate(`/sessions/${id}`)} onStart={startWorkout}/>;
  return <div className="app-shell"><header className="topbar"><button className="brand" onClick={() => navigate('/')} aria-label="Repbook home"><span className="brand-mark">r</span><span>repbook<span className="brand-period">.</span></span></button><nav><button className={route.page === 'history' ? 'nav-active' : ''} onClick={() => navigate('/')}>History</button>{state.activeSession && <button className={route.page === 'workout' ? 'nav-active' : ''} onClick={() => navigate('/workout')}>Current workout</button>}</nav><div className="topbar-right"><span className="local-indicator"><i/> LOCAL LOG</span><span className="avatar">Y</span></div></header>{error && <div className="global-error" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}{notice && <div className="toast" role="status">{notice}<span>✓</span></div>}{page}</div>;
}
