import { useEffect, useState } from 'react';
import { routeFor } from './routes.js';
import WorkoutSessionFeature from '../features/workouts/WorkoutSessionFeature.jsx';

export default function App() {
  const [route, setRoute] = useState(() => routeFor(window.location.pathname));
  useEffect(() => {
    const update = () => setRoute(routeFor(window.location.pathname));
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  return <WorkoutSessionFeature route={route} />;
}
