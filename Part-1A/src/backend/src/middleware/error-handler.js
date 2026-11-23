import { HttpError } from '../modules/sessions/session.validation.js';

export function errorHandler(error, _req, res, _next) {
  if (res.headersSent) return;
  const malformedJson = error?.type === 'entity.parse.failed';
  const status = malformedJson ? 400 : (error instanceof HttpError ? error.status : (error.status === 404 ? 404 : 500));
  const code = malformedJson ? 'INVALID_JSON' : (error instanceof HttpError ? error.code : (status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR'));
  const message = status === 500 ? 'An unexpected error occurred' : (malformedJson ? 'Request body must be valid JSON' : error.message);
  res.status(status).json({ error: { code, message } });
}
