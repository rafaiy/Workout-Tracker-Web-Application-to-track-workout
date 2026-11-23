/** @vitest-environment jsdom */
import React, { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import HistoryPage from '../../src/pages/HistoryPage.jsx';
import SessionPage from '../../src/pages/SessionPage.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const sessionFixture = { id: 1, title: 'Morning workout', status: 'PENDING', startedAt: '2026-11-23T01:00:00.000Z', timeZone: 'Asia/Kolkata', timeOfDay: 'morning', completedAt: null, exercises: [{ id: 2, orderIndex: 0, exercise: { id: 3, name: 'Chest fly', muscleGroup: 'Chest' }, sets: [{ setNumber: 1, weightKg: 20, reps: 12 }] }] };
let root; let container; let fetchMock;
function response(payload) { return { ok: true, status: 200, json: async () => payload }; }
beforeEach(() => {
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  window.scrollTo = vi.fn();
  fetchMock = vi.fn(async (url, options = {}) => {
    if (url === '/api/sessions' || url.startsWith('/api/sessions?')) return response({ sessions: [{ ...sessionFixture, exerciseCount: 1 }, { ...sessionFixture, id: 2, title: 'Evening workout', status: 'COMPLETED' }] });
    if (url === '/api/exercises') return response({ exercises: [{ id: 3, name: 'Chest fly', muscleGroup: 'Chest' }] });
    if (url === '/api/sessions/1' && options.method === 'PATCH') return response({ session: { ...sessionFixture, title: JSON.parse(options.body).title } });
    if (url === '/api/sessions/1' && options.method !== 'PATCH') return response({ session: sessionFixture });
    if (url === '/api/sessions/1/exercises/2' && options.method === 'PUT') return response({ exercise: { ...sessionFixture.exercises[0], sets: JSON.parse(options.body).sets } });
    if (url === '/api/sessions/1' && options.method === 'DELETE') return response({ deleted: true });
    return response({});
  });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals(); });
async function render(element) { await act(async () => { root.render(element); await Promise.resolve(); await Promise.resolve(); }); }
async function setValue(input, value) { const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value').set; await act(async () => { setter.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); }); }

describe('history screens', () => {
  it('shows Pending and Completed badges and links to session detail', async () => {
    await render(<HistoryPage />);
    expect(container.textContent).toContain('Morning workout'); expect(container.textContent).toContain('Evening workout');
    expect(container.querySelectorAll('.status-pending')).toHaveLength(1); expect(container.querySelectorAll('.status-completed')).toHaveLength(1);
    expect(container.querySelector('a[href="#/session/1"]')).toBeTruthy();
  });
  it('renames a session and updates exercise sets from its detail view', async () => {
    await render(<SessionPage id="1" />);
    await act(async () => container.querySelector('.text-action').click());
    const title = container.querySelector('input[aria-label="Session name"]'); await setValue(title, 'Push day');
    await act(async () => container.querySelector('.rename-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(fetchMock).toHaveBeenCalledWith('/api/sessions/1', expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ title: 'Push day' }) }));
    await act(async () => container.querySelector('.exercise-actions .text-action').click());
    const weight = container.querySelector('input[aria-label="Set 1 weight in kilograms"]'); await setValue(weight, '30');
    await act(async () => container.querySelector('.exercise-editor')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(fetchMock.mock.calls.some(([url, opts]) => url === '/api/sessions/1/exercises/2' && opts.method === 'PUT')).toBe(true);
  });
  it('confirms deletion before removing session history', async () => {
    window.confirm = vi.fn(() => true);
    await render(<HistoryPage />);
    await act(async () => container.querySelector('[aria-label="Delete Morning workout"]').click());
    await act(async () => container.querySelector('.delete-popover button').click());
    expect(window.confirm).toHaveBeenCalled();
    expect(fetchMock.mock.calls.some(([url, opts]) => url === '/api/sessions/1' && opts.method === 'DELETE')).toBe(true);
  });
});
