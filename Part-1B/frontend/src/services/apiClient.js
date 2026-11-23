export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.error?.message ?? 'The request could not be completed.');
    error.status = response.status;
    error.code = payload?.error?.code;
    error.details = payload?.error?.details ?? [];
    throw error;
  }
  return payload;
}

export const workoutApi = {
  exercises: () => api('/exercises'),
  sessions: (status) => api(`/sessions${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  session: (id) => api(`/sessions/${id}`),
  createSession: (body) => api('/sessions', { method: 'POST', body }),
  updateSession: (id, body) => api(`/sessions/${id}`, { method: 'PATCH', body }),
  addExercise: (id, body) => api(`/sessions/${id}/exercises`, { method: 'POST', body }),
  updateExercise: (sessionId, exerciseId, body) => api(`/sessions/${sessionId}/exercises/${exerciseId}`, { method: 'PUT', body }),
  deleteExercise: (sessionId, exerciseId) => api(`/sessions/${sessionId}/exercises/${exerciseId}`, { method: 'DELETE' }),
  complete: (id) => api(`/sessions/${id}/complete`, { method: 'POST', body: {} }),
  deleteSession: (id) => api(`/sessions/${id}`, { method: 'DELETE' }),
  parse: (body) => api('/sessions/parse', { method: 'POST', body }),
};
