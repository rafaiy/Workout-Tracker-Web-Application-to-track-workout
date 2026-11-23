/** @vitest-environment jsdom */
import React, { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import NlpParserInput from '../../src/components/NlpParserInput.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root; let container;
beforeEach(() => { container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); });
async function render(props) { await act(async () => root.render(<NlpParserInput {...props} />)); }
async function setValue(element, value) {
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value').set;
  await act(async () => { setter.call(element, value); element.dispatchEvent(new Event('input', { bubbles: true })); });
}

describe('NlpParserInput', () => {
  it('keeps the original sentence editable after a rejected response', async () => {
    const onSubmit = vi.fn(); await render({ onSubmit });
    const input = container.querySelector('textarea'); const text = 'I did some chest today';
    await setValue(input, text);
    await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(onSubmit).toHaveBeenCalledWith({ text });
    await render({ onSubmit, error: 'Weight must be greater than 0 kg.' });
    expect(container.querySelector('textarea').value).toBe(text);
    expect(container.textContent).toContain('Edit the sentence and try again');
  });
  it('lets the user select a matching session and resubmit the unchanged sentence', async () => {
    const onSubmit = vi.fn(); const result = { outcome: 'choose_session', message: 'Which session?', matches: [{ sessionId: 12, title: 'Morning workout', startedAt: '2026-11-23T01:30:00Z', timeZone: 'Asia/Kolkata', status: 'PENDING' }] };
    await render({ onSubmit, result }); const text = 'I did chest fly'; await setValue(container.querySelector('textarea'), text);
    await act(async () => container.querySelector('.choice-card').click());
    await act(async () => container.querySelector('.session-choices .button').click());
    expect(onSubmit).toHaveBeenCalledWith({ text, targetSessionId: 12 });
    expect(container.querySelector('textarea').value).toBe(text);
  });
  it('clears the sentence after a saved response', async () => {
    const onSubmit = vi.fn(); const result = { outcome: 'saved', created: true, exercise: { name: 'Chest fly' } };
    await render({ onSubmit, result });
    expect(container.querySelector('textarea').value).toBe('');
    expect(container.textContent).toContain('Chest fly added to your new workout.');
  });
});
