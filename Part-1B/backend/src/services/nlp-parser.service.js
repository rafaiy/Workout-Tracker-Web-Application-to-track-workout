import { nlpResultSchema } from '../schemas/nlp-result.schema.js';
import { parseOrThrow, parseRequestSchema } from '../schemas/common.schema.js';

function serviceError(status, code, message) { const error = new Error(message); error.status = status; error.code = code; return error; }
export function containsNegativeWeight(text) { return /-\s*\d+(?:[.,]\d+)?\s*(?:kg|kilograms?)\b/i.test(text); }

export class NlpParserService {
  constructor({ llmProvider, workoutService, repos }) { this.llmProvider = llmProvider; this.workoutService = workoutService; this.repos = repos; }

  async interpret(input) {
    const request = parseOrThrow(parseRequestSchema, input);
    if (containsNegativeWeight(request.text)) throw serviceError(400, 'INVALID_WEIGHT', 'Weight must be greater than 0 kg. Nothing was saved. Edit the weight and try again.');
    const raw = await this.llmProvider.parseWorkout({ text: request.text, catalog: this.repos.catalog.list(), timeZone: request.timeZone, submittedAt: request.submittedAt });
    const parsed = nlpResultSchema.safeParse(raw);
    if (!parsed.success) throw serviceError(502, 'LLM_INVALID_RESPONSE', 'The workout parser returned data in an unexpected format. Nothing was saved. Try again or log manually.');
    const result = parsed.data;
    if (result.outcome === 'needs_clarification') return { ...result, originalText: request.text };
    if (result.outcome === 'unsupported_exercise') return { ...result, originalText: request.text };
    if (result.outcome === 'invalid_input') return { ...result, originalText: request.text };

    const exercise = this.repos.catalog.byName(result.exerciseName);
    if (!exercise) return { outcome: 'unsupported_exercise', exerciseName: result.exerciseName, message: `“${result.exerciseName}” is not in the exercise catalog. Choose a catalog exercise and resubmit your sentence.`, originalText: request.text };
    const invalidSet = result.sets.findIndex((set) => !Number.isFinite(set.weightKg) || set.weightKg <= 0 || !Number.isInteger(set.reps) || set.reps <= 0);
    if (invalidSet >= 0) throw serviceError(400, 'INVALID_SET', `Set ${invalidSet + 1} must have a weight greater than 0 kg and a whole number of reps greater than 0. Nothing was saved.`);

    let startedAt;
    try { startedAt = this.workoutService.resolveTime({ ...result, submittedAt: request.submittedAt, timeZone: request.timeZone }); }
    catch { return { outcome: 'needs_clarification', reason: 'invalid_date_time', message: 'That date or time is invalid in your local time zone. Edit the sentence and try again.', originalText: request.text }; }
    return { outcome: 'parsed', exercise, sets: result.sets, startedAt, timeZone: request.timeZone, targetSessionId: request.targetSessionId, title: result.title, originalText: request.text };
  }

  async parse(input) {
    const proposal = await this.interpret(input);
    if (proposal.outcome === 'needs_clarification') return proposal;
    if (proposal.outcome === 'unsupported_exercise') throw serviceError(400, 'UNSUPPORTED_EXERCISE', proposal.message);
    if (proposal.outcome === 'invalid_input') throw serviceError(400, 'INVALID_INPUT', `${proposal.message} Edit the sentence and try again.`);
    const { outcome, originalText, ...workout } = proposal;
    return this.workoutService.saveParsedWorkout(workout);
  }
}
