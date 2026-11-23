import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDatabase } from '../../src/db/connection.js';
import { seedCatalog } from '../../src/db/seeds/exercise-catalog.js';
import { createRepositories } from '../../src/repositories/index.js';
import { WorkoutService } from '../../src/services/workout.service.js';
import { NlpParserService } from '../../src/services/nlp-parser.service.js';

let db; let repos; let workout; let provider; let parser;
const requestBody = { text: 'I did 3 sets of chest press at 50kg for 10 reps', timeZone: 'Asia/Kolkata', submittedAt: '2026-11-23T06:30:00+05:30' };
const valid = { outcome: 'parsed', exerciseName: 'Chest press machine', sets: [{ weightKg: 50, reps: 10 }, { weightKg: 50, reps: 10 }, { weightKg: 50, reps: 10 }] };
beforeEach(() => { db = createDatabase(':memory:'); seedCatalog(db); repos = createRepositories(db); workout = new WorkoutService(repos); provider = { parseWorkout: vi.fn(async () => valid) }; parser = new NlpParserService({ llmProvider: provider, workoutService: workout, repos }); });
afterEach(() => db.close());

describe('NlpParserService', () => {
  it('saves valid structured output to a new session', async () => {
    const result = await parser.parse(requestBody);
    expect(result.outcome).toBe('saved'); expect(result.created).toBe(true);
    expect(workout.getSession(result.sessionId).exercises[0].sets).toHaveLength(3);
  });
  it('rejects negative weights before the LLM call', async () => {
    await expect(parser.parse({ ...requestBody, text: 'I did chest press at -5kg for 10 reps' })).rejects.toMatchObject({ status: 400, code: 'INVALID_WEIGHT' });
    expect(provider.parseWorkout).not.toHaveBeenCalled();
  });
  it('rejects a parsed zero weight and unsupported catalog exercise without creating a session', async () => {
    provider.parseWorkout.mockResolvedValueOnce({ ...valid, sets: [{ weightKg: 0, reps: 10 }] });
    await expect(parser.parse(requestBody)).rejects.toMatchObject({ status: 400, code: 'INVALID_SET' });
    provider.parseWorkout.mockResolvedValueOnce({ ...valid, exerciseName: 'Cable curl machine' });
    await expect(parser.parse(requestBody)).rejects.toMatchObject({ status: 400, code: 'UNSUPPORTED_EXERCISE' });
    expect(workout.listSessions()).toHaveLength(0);
  });
  it('returns clarification without writing incomplete or vague input', async () => {
    provider.parseWorkout.mockResolvedValueOnce({ outcome: 'needs_clarification', reason: 'missing_reps', message: 'How many reps?' });
    const result = await parser.parse({ ...requestBody, text: 'I did some chest today' });
    expect(result.outcome).toBe('needs_clarification'); expect(result.originalText).toBe('I did some chest today');
    expect(workout.listSessions()).toHaveLength(0);
  });
  it('rejects explicit unsupported and invalid-input outcomes from the model', async () => {
    provider.parseWorkout.mockResolvedValueOnce({ outcome: 'unsupported_exercise', exerciseName: 'Pec deck', message: 'That movement is not listed.' });
    await expect(parser.parse(requestBody)).rejects.toMatchObject({ status: 400, code: 'UNSUPPORTED_EXERCISE' });
    provider.parseWorkout.mockResolvedValueOnce({ outcome: 'invalid_input', message: 'The values cannot be read.' });
    await expect(parser.parse(requestBody)).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
    expect(workout.listSessions()).toHaveLength(0);
  });
  it('fails closed on malformed provider output and invalid set data', async () => {
    provider.parseWorkout.mockResolvedValueOnce({ outcome: 'parsed', exerciseName: 'Chest press machine', sets: [] });
    await expect(parser.parse(requestBody)).rejects.toMatchObject({ status: 502 });
    provider.parseWorkout.mockResolvedValueOnce({ ...valid, sets: [{ weightKg: 30, reps: 2.5 }] });
    await expect(parser.parse(requestBody)).rejects.toMatchObject({ status: 400, code: 'INVALID_SET' });
    expect(workout.listSessions()).toHaveLength(0);
  });
  it('appends to a unique local day/period match and asks when multiple matches exist', async () => {
    const first = workout.createSession({ startedAt: '2026-11-23T07:00:00+05:30', timeZone: 'Asia/Kolkata' });
    const one = await parser.parse(requestBody);
    expect(one.created).toBe(false); expect(one.sessionId).toBe(first.id);
    workout.createSession({ startedAt: '2026-11-23T08:00:00+05:30', timeZone: 'Asia/Kolkata' });
    const ambiguous = await parser.parse(requestBody);
    expect(ambiguous.outcome).toBe('choose_session'); expect(ambiguous.matches).toHaveLength(2);
    expect(workout.listSessions().reduce((sum, s) => sum + s.exerciseCount, 0)).toBe(1);
    const chosen = await parser.parse({ ...requestBody, targetSessionId: ambiguous.matches[1].sessionId });
    expect(chosen.sessionId).toBe(ambiguous.matches[1].sessionId);
  });
  it('returns clarification for a nonexistent local daylight-saving time', async () => {
    provider.parseWorkout.mockResolvedValueOnce({ ...valid, localDate: '2026-03-08', localTime: '02:30' });
    const result = await parser.parse({ ...requestBody, timeZone: 'America/New_York' });
    expect(result.outcome).toBe('needs_clarification'); expect(result.reason).toBe('invalid_date_time');
  });
});
