export function errorBody(code, message, details = []) {
  return { error: { code, message, details } };
}

export function notFoundHandler(_req, res) {
  res.status(404).json(errorBody('NOT_FOUND', 'The requested local resource was not found.'));
}

export function errorHandler(err, _req, res, _next) {
  const status = Number.isInteger(err.status) ? err.status : 500;
  // Provider/configuration errors already have safe, actionable messages. Keep
  // those intact; only hide details for unexpected server errors.
  const expectedUpstreamError = status >= 500 && status < 600
    && typeof err.code === 'string'
    && (err.code.startsWith('LLM_') || err.code === 'UPSTREAM_ERROR');
  const unexpectedServerError = status >= 500 && !expectedUpstreamError;
  const code = unexpectedServerError ? 'INTERNAL_ERROR' : (err.code ?? 'REQUEST_ERROR');
  const message = unexpectedServerError ? 'Something went wrong. Try again.' : err.message;
  const details = unexpectedServerError ? [] : (err.details ?? []);
  res.status(status).json(errorBody(code, message, details));
}
