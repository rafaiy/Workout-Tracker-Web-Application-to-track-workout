import express from 'express';
import { config } from './config.js';
import { createDatabase } from './db/connection.js';
import { seedCatalog } from './db/seeds/exercise-catalog.js';
import { notFoundHandler, errorHandler } from './api/errors.js';
import { createExerciseRoutes } from './api/routes/exercises.routes.js';
import { createSessionRoutes } from './api/routes/sessions.routes.js';
import { createParseRoutes } from './api/routes/parse.routes.js';
import { createRepositories } from './repositories/index.js';
import { WorkoutService } from './services/workout.service.js';
import { NlpParserService } from './services/nlp-parser.service.js';
import { createLlmProvider } from './integrations/llm/llm-provider.js';

export function createApp({ db = createDatabase(), llmProvider = createLlmProvider(config) } = {}) {
  seedCatalog(db);
  const repos = createRepositories(db);
  const workoutService = new WorkoutService(repos);
  const parserService = new NlpParserService({ llmProvider, workoutService, repos });
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', createParseRoutes(parserService));
  app.use('/api', createExerciseRoutes(workoutService));
  app.use('/api', createSessionRoutes(workoutService));
  app.use(notFoundHandler);
  app.use(errorHandler);
  app.locals.db = db;
  app.locals.workoutService = workoutService;
  return app;
}
