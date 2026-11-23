import { Router } from 'express';
import { HttpError, parseId, rejectUnknownQuery, validateExerciseInput, validateSessionInput, validateSetList } from './session.validation.js';

function requireFound(value, label = 'Session') {
  if (!value) throw new HttpError(404, 'NOT_FOUND', `${label} not found`);
  return value;
}

export function sessionRouter(service) {
  const router = Router();
  router.get('/', (req, res, next) => {
    try { rejectUnknownQuery(req.query); res.json({ data: service.list() }); }
    catch (error) { next(error); }
  });
  router.post('/', (req, res, next) => {
    try { res.status(201).json(service.create(validateSessionInput(req.body || {}))); }
    catch (error) { next(error); }
  });
  router.get('/:sessionId', (req, res, next) => {
    try { res.json(requireFound(service.get(parseId(req.params.sessionId)))); }
    catch (error) { next(error); }
  });
  router.patch('/:sessionId', (req, res, next) => {
    try {
      const id = parseId(req.params.sessionId);
      const update = validateSessionInput(req.body, true);
      res.json(requireFound(service.update(id, update)));
    } catch (error) { next(error); }
  });
  router.delete('/:sessionId', (req, res, next) => {
    try {
      const id = parseId(req.params.sessionId);
      if (!service.delete(id)) throw new HttpError(404, 'NOT_FOUND', 'Session not found');
      res.status(204).end();
    } catch (error) { next(error); }
  });
  router.post('/:sessionId/complete', (req, res, next) => {
    try {
      const id = parseId(req.params.sessionId);
      if (req.body && Object.keys(req.body).length) throw new HttpError(400, 'INVALID_BODY', 'Completion does not accept a request body');
      res.json(requireFound(service.complete(id)));
    } catch (error) { next(error); }
  });
  router.post('/:sessionId/exercises', (req, res, next) => {
    try {
      const sessionId = parseId(req.params.sessionId);
      const input = validateExerciseInput(req.body);
      const result = service.addExercise(sessionId, input.exerciseId, input.sets);
      if (result.missing === 'session') throw new HttpError(404, 'NOT_FOUND', 'Session not found');
      // A well-formed exercise entry that references an ID outside the
      // predefined catalog is invalid client input, like invalid set values.
      if (result.missing === 'exercise') throw new HttpError(400, 'INVALID_EXERCISE', 'Exercise is not in the predefined catalog');
      if (result.completed) throw new HttpError(400, 'SESSION_COMPLETED', 'Completed sessions cannot be changed');
      res.status(201).json(result.exercise);
    } catch (error) { next(error); }
  });
  router.put('/:sessionId/exercises/:sessionExerciseId', (req, res, next) => {
    try {
      const sessionId = parseId(req.params.sessionId);
      const entryId = parseId(req.params.sessionExerciseId, 'sessionExerciseId');
      const sets = validateSetList(req.body);
      res.json(requireFound(service.replaceSets(sessionId, entryId, sets), 'Exercise entry'));
    } catch (error) { next(error); }
  });
  router.delete('/:sessionId/exercises/:sessionExerciseId', (req, res, next) => {
    try {
      const sessionId = parseId(req.params.sessionId);
      const entryId = parseId(req.params.sessionExerciseId, 'sessionExerciseId');
      if (!service.deleteExercise(sessionId, entryId)) throw new HttpError(404, 'NOT_FOUND', 'Exercise entry not found');
      res.status(204).end();
    } catch (error) { next(error); }
  });
  return router;
}
