import { describe, expect, it, vi } from 'vitest';
import { createLlmProvider } from '../../src/integrations/llm/llm-provider.js';

const catalog = [{ id: 1, name: 'Chest fly', muscleGroup: 'Chest' }];
const input = { text: 'I did chest fly at 20kg for 12 reps', catalog, timeZone: 'Asia/Kolkata', submittedAt: '2026-11-23T18:00:00+05:30' };

describe('external LLM adapter', () => {
  it('uses configured model and backend-only bearer credential and returns structured JSON', async () => {
    const fetchMock = vi.fn(async (_url, _options) => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ outcome: 'needs_clarification', reason: 'missing_sets', message: 'How many sets?' }) } }] }) }));
    const provider = createLlmProvider({ llmProvider: 'openai', llmModel: 'test-model', llmApiKey: 'private-key', openAiBaseUrl: 'https://example.test/v1', llmTimeoutMs: 2000 }, fetchMock);
    const result = await provider.parseWorkout(input);
    expect(result.outcome).toBe('needs_clarification');
    expect(fetchMock.mock.calls[0][0]).toBe('https://example.test/v1/chat/completions');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer private-key');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).model).toBe('test-model');
  });
  it('fails without exposing credentials when configuration or provider responses are unusable', async () => {
    await expect(createLlmProvider({ llmProvider: 'openai', llmModel: '', llmApiKey: '' }).parseWorkout(input)).rejects.toMatchObject({ status: 503 });
    const provider = createLlmProvider({ llmProvider: 'openai', llmModel: 'model', llmApiKey: 'private-key', openAiBaseUrl: 'https://example.test/v1', llmTimeoutMs: 2000 }, async () => ({ ok: false }));
    await expect(provider.parseWorkout(input)).rejects.toMatchObject({ status: 502 });
    const unsupported = createLlmProvider({ llmProvider: 'unknown', llmModel: 'model', llmApiKey: 'private-key' });
    await expect(unsupported.parseWorkout(input)).rejects.toMatchObject({ status: 503 });
  });
  it('uses Gemini structured JSON mode with the credential in a request header', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({ outcome: 'needs_clarification', reason: 'missing_reps', message: 'How many reps?' }) }] } }] }) }));
    const provider = createLlmProvider({ llmProvider: 'gemini', llmModel: 'gemini-test', llmApiKey: 'gemini-private-key', geminiBaseUrl: 'https://generativelanguage.example/v1beta', llmTimeoutMs: 2000 }, fetchMock);
    const result = await provider.parseWorkout(input);
    expect(result.outcome).toBe('needs_clarification');
    expect(fetchMock.mock.calls[0][0]).toBe('https://generativelanguage.example/v1beta/models/gemini-test:generateContent');
    expect(fetchMock.mock.calls[0][1].headers['x-goog-api-key']).toBe('gemini-private-key');
    expect(fetchMock.mock.calls[0][0]).not.toContain('gemini-private-key');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).generationConfig.responseMimeType).toBe('application/json');
  });
});
