export function errorBody(code, message, details = []) {
  return { error: { code, message, details } };
}

export function notFoundHandler(_req, res) {
  res.status(404).json(errorBody('NOT_FOUND', 'The requested local resource was not found.'));
}

export function errorHandler(err, _req, res, _next) {
  const status = Number.isInteger(err.status) ? err.status : 500;
  const code = status >= 500 ? 'INTERNAL_ERROR' : (err.code ?? 'REQUEST_ERROR');
  const message = status >= 500 ? 'Something went wrong. Try again.' : err.message;
  const details = status >= 500 ? [] : (err.details ?? []);
  res.status(status).json(errorBody(code, message, details));
}
