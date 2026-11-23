import { Router } from 'express';

function idParam(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) { const error = new Error('Session IDs must be positive integers.'); error.status = 400; error.code = 'VALIDATION_ERROR'; throw error; }
  return id;
}

export function createSessionRoutes(workoutService) {
  const router = Router();
  router.post('/sessions', (req, res, next) => {
    try { res.status(201).json({ session: workoutService.createSession(req.body) }); } catch (error) { next(error); }
  });
  router.get('/sessions', (req, res, next) => {
    try {
      const status = req.query.status;
      if (status !== undefined && !['PENDING', 'COMPLETED'].includes(status)) {
        const error = new Error('Status must be PENDING or COMPLETED.'); error.status = 400; error.code = 'VALIDATION_ERROR'; throw error;
      }
      res.json({ sessions: workoutService.listSessions(status) });
    } catch (error) { next(error); }
  });
  router.get('/sessions/:sessionId', (req, res, next) => {
    try { res.json({ session: workoutService.getSession(idParam(req.params.sessionId)) }); } catch (error) { next(error); }
  });
  router.patch('/sessions/:sessionId', (req, res, next) => {
    try { res.json({ session: workoutService.updateSession(idParam(req.params.sessionId), req.body) }); } catch (error) { next(error); }
  });
  router.post('/sessions/:sessionId/exercises', (req, res, next) => {
    try { res.status(201).json({ exercise: workoutService.addExercise(idParam(req.params.sessionId), req.body) }); } catch (error) { next(error); }
  });
  router.put('/sessions/:sessionId/exercises/:exerciseId', (req, res, next) => {
    try { res.json({ exercise: workoutService.updateExercise(idParam(req.params.sessionId), idParam(req.params.exerciseId), req.body) }); } catch (error) { next(error); }
  });
  router.delete('/sessions/:sessionId/exercises/:exerciseId', (req, res, next) => {
    try { workoutService.deleteExercise(idParam(req.params.sessionId), idParam(req.params.exerciseId)); res.json({ deleted: true }); } catch (error) { next(error); }
  });
  router.post('/sessions/:sessionId/complete', (req, res, next) => {
    try { res.json({ session: workoutService.completeSession(idParam(req.params.sessionId)) }); } catch (error) { next(error); }
  });
  router.delete('/sessions/:sessionId', (req, res, next) => {
    try { workoutService.deleteSession(idParam(req.params.sessionId)); res.json({ deleted: true }); } catch (error) { next(error); }
  });
  return router;
}
