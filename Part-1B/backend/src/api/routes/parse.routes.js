import { Router } from 'express';

export function createParseRoutes(parserService) {
  const router = Router();
  router.post('/sessions/parse', async (req, res, next) => {
    try {
      const result = await parserService.parse(req.body);
      res.status(result.outcome === 'saved' && result.created ? 201 : 200).json(result);
    } catch (error) { next(error); }
  });
  return router;
}
