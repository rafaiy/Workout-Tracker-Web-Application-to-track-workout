import { request } from '../../shared/apiClient.js';

export const workoutApi = {
  exercises: () => request('/exercises').then((r) => r.data),
  sessions: () => request('/sessions').then((r) => r.data),
  createSession: () => request('/sessions', { method: 'POST', body: '{}' }),
  session: (id) => request(`/sessions/${id}`),
  addExercise: (id, exerciseId, sets) => request(`/sessions/${id}/exercises`, {
    method: 'POST', body: JSON.stringify({ exerciseId, sets })
  }),
  complete: (id) => request(`/sessions/${id}/complete`, { method: 'POST', body: '{}' }),
  update: (id, fields) => request(`/sessions/${id}`, { method: 'PATCH', body: JSON.stringify(fields) }),
  replaceSets: (id, exerciseId, sets) => request(`/sessions/${id}/exercises/${exerciseId}`, {
    method: 'PUT', body: JSON.stringify({ sets })
  }),
  deleteExercise: (id, exerciseId) => request(`/sessions/${id}/exercises/${exerciseId}`, { method: 'DELETE' }),
  deleteSession: (id) => request(`/sessions/${id}`, { method: 'DELETE' }),
};
