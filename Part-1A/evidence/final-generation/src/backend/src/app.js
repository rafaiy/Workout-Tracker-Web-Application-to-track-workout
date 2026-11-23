import express from 'express';
import { exerciseRouter } from './modules/exercises/exercise.routes.js';
import { createExerciseRepository } from './modules/exercises/exercise.repository.js';
import { createExerciseService } from './modules/exercises/exercise.service.js';
import { sessionRouter } from './modules/sessions/session.routes.js';
import { createSessionRepository } from './modules/sessions/session.repository.js';
import { createSessionService } from './modules/sessions/session.service.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp({ db }) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin === 'http://127.0.0.1:5173' || origin === 'http://localhost:5173') {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (req.method === 'OPTIONS') return res.status(204).end();
    next();
  });
  app.use(express.json({ limit: '64kb', strict: true }));
  const exerciseService = createExerciseService(createExerciseRepository(db));
  const sessionService = createSessionService(createSessionRepository(db));
  app.use('/api/exercises', exerciseRouter(exerciseService));
  app.use('/api/sessions', sessionRouter(sessionService));
  app.use((_req, _res, next) => next(Object.assign(new Error('Not found'), { status: 404, code: 'NOT_FOUND' })));
  app.use(errorHandler);
  return app;
}
