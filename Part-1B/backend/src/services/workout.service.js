import { exerciseInputSchema, parseOrThrow, sessionCreateSchema, sessionPatchSchema } from '../schemas/common.schema.js';
import { localDateAndPeriod, localDateTimeFromIso, localDateTimeToIso } from './time.js';

function fail(status, code, message) {
  const error = new Error(message); error.status = status; error.code = code; return error;
}

function sessionTitle(startedAt, timeZone) {
  const { date } = localDateAndPeriod(startedAt, timeZone);
  const [year, month, day] = date.split('-').map(Number);
  const label = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
  const time = new Intl.DateTimeFormat('en', { hour: '2-digit', hour12: true, timeZone }).format(new Date(startedAt)).toLowerCase();
  const hour = Number(new Intl.DateTimeFormat('en', { hour: '2-digit', hourCycle: 'h23', timeZone }).format(new Date(startedAt)));
  const period = hour >= 5 && hour < 12 ? 'Morning' : hour < 17 && hour >= 12 ? 'Afternoon' : hour < 21 && hour >= 17 ? 'Evening' : 'Night';
  return `${period} workout · ${label} · ${time}`;
}

export class WorkoutService {
  constructor(repos) { this.repos = repos; }

  listExercises() { return this.repos.catalog.list(); }

  createSession(input) {
    const data = parseOrThrow(sessionCreateSchema, input);
    const startedAt = new Date(data.startedAt).toISOString();
    const id = this.repos.sessions.create({ ...data, title: data.title ?? sessionTitle(startedAt, data.timeZone), startedAt });
    return this.getSession(id);
  }

  listSessions(status) { return this.repos.sessions.list(status); }

  getSession(id) {
    const session = this.repos.sessions.get(id);
    if (!session) throw fail(404, 'NOT_FOUND', 'This workout session was not found.');
    return session;
  }

  updateSession(id, input) {
    const data = parseOrThrow(sessionPatchSchema, input);
    if (!this.repos.sessions.update(id, data)) throw fail(404, 'NOT_FOUND', 'This workout session was not found.');
    return this.getSession(id);
  }

  addExercise(sessionId, input) {
    this.getSession(sessionId);
    const data = parseOrThrow(exerciseInputSchema, input);
    const exercise = this.repos.catalog.byId(data.exerciseId);
    if (!exercise) throw fail(400, 'UNSUPPORTED_EXERCISE', 'Choose an exercise from the available catalog.');
    const id = this.repos.exercises.add(sessionId, exercise.id, data.sets);
    return this.getSession(sessionId).exercises.find((item) => item.id === id);
  }

  updateExercise(sessionId, exerciseId, input) {
    this.getSession(sessionId);
    const data = parseOrThrow(exerciseInputSchema, input);
    if (!this.repos.catalog.byId(data.exerciseId)) throw fail(400, 'UNSUPPORTED_EXERCISE', 'Choose an exercise from the available catalog.');
    if (!this.repos.exercises.update(sessionId, exerciseId, data.exerciseId, data.sets)) throw fail(404, 'NOT_FOUND', 'This exercise was not found in the session.');
    return this.getSession(sessionId).exercises.find((item) => item.id === exerciseId);
  }

  deleteExercise(sessionId, exerciseId) {
    this.getSession(sessionId);
    if (!this.repos.exercises.delete(sessionId, exerciseId)) throw fail(404, 'NOT_FOUND', 'This exercise was not found in the session.');
    return true;
  }

  completeSession(id) {
    if (!this.repos.sessions.complete(id)) throw fail(404, 'NOT_FOUND', 'This workout session was not found.');
    return this.getSession(id);
  }

  deleteSession(id) {
    if (!this.repos.sessions.delete(id)) throw fail(404, 'NOT_FOUND', 'This workout session was not found.');
    return true;
  }

  resolveTime({ localDate, localTime, submittedAt, timeZone }) {
    const fallback = localDateTimeFromIso(submittedAt, timeZone);
    return localDateTimeToIso(localDate ?? fallback.date, localTime ?? fallback.time, timeZone);
  }

  findMatchingSessions(startedAt, timeZone) { return this.repos.sessions.findMatches(startedAt, timeZone); }

  saveParsedWorkout({ exercise, sets, startedAt, timeZone, targetSessionId, title }) {
    const matches = this.findMatchingSessions(startedAt, timeZone);
    if (targetSessionId) {
      const session = this.getSession(targetSessionId);
      if (!matches.some((match) => match.sessionId === session.id)) throw fail(400, 'SESSION_MISMATCH', 'Choose one of the matching sessions before saving this workout.');
      const added = this.addExercise(session.id, { exerciseId: exercise.id, sets });
      return { outcome: 'saved', sessionId: session.id, created: false, exercise: added };
    }
    if (matches.length > 1) return { outcome: 'choose_session', message: 'Which session should receive this exercise?', matches };
    if (matches.length === 1) {
      const added = this.addExercise(matches[0].sessionId, { exerciseId: exercise.id, sets });
      return { outcome: 'saved', sessionId: matches[0].sessionId, created: false, exercise: added };
    }
    const normalizedTitle = title ?? sessionTitle(startedAt, timeZone);
    const sessionId = this.repos.sessions.createWithExercise({ title: normalizedTitle, startedAt, timeZone, exerciseId: exercise.id, sets });
    const session = this.getSession(sessionId);
    return { outcome: 'saved', sessionId: session.id, created: true, exercise: session.exercises[0] };
  }
}
