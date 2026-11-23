import { Router } from 'express';
import { rejectUnknownQuery } from '../sessions/session.validation.js';

export function exerciseRouter(service) {
  const router = Router();
  router.get('/', (req, res, next) => {
    try { rejectUnknownQuery(req.query); res.json({ data: service.list() }); }
    catch (error) { next(error); }
  });
  return router;
}
