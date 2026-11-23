import { normalizeTimestamp, timeOfDayLabel } from './time-of-day.js';

export function createSessionService(repository, clock = () => new Date()) {
  return {
    create(input = {}) {
      const startedAt = input.startedAt || normalizeTimestamp(clock());
      return repository.create({ startedAt, title: input.title || timeOfDayLabel(startedAt) });
    },
    get(id) {
      const session = repository.get(id);
      return session && { ...session, timeOfDayLabel: timeOfDayLabel(session.startedAt) };
    },
    list: () => repository.list().map((s) => ({ ...s, timeOfDayLabel: timeOfDayLabel(s.startedAt) })),
    addExercise: (sessionId, exerciseId, sets) => repository.addExercise(sessionId, exerciseId, sets),
    complete: (id) => repository.complete(id, normalizeTimestamp(clock())),
    update: (id, fields) => repository.update(id, fields),
    replaceSets: (sessionId, entryId, sets) => repository.replaceSets(sessionId, entryId, sets),
    deleteExercise: (sessionId, entryId) => repository.deleteExercise(sessionId, entryId),
    delete: (id) => repository.delete(id)
  };
}
