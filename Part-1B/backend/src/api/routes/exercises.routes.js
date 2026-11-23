import { Router } from 'express';

export function createExerciseRoutes(workoutService) {
  const router = Router();
  router.get('/exercises', (_req, res) => res.json({ exercises: workoutService.listExercises() }));
  return router;
}
