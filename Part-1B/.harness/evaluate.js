import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../backend/src/config.js';
import { createDatabase } from '../backend/src/db/connection.js';
import { seedCatalog } from '../backend/src/db/seeds/exercise-catalog.js';
import { createRepositories } from '../backend/src/repositories/index.js';
import { WorkoutService } from '../backend/src/services/workout.service.js';
import { NlpParserService } from '../backend/src/services/nlp-parser.service.js';
import { createLlmProvider } from '../backend/src/integrations/llm/llm-provider.js';
import { nlpResultSchema } from '../backend/src/schemas/nlp-result.schema.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataset = JSON.parse(fs.readFileSync(path.join(root, 'evals/dataset.json'), 'utf8'));
if (!config.llmApiKey || !config.llmModel) {
  console.error('Parser evaluation needs LLM_API_KEY and LLM_MODEL in backend/.env. No provider requests were made.');
  process.exit(2);
}
const db = createDatabase(':memory:'); seedCatalog(db);
const repos = createRepositories(db); const workoutService = new WorkoutService(repos);
const provider = createLlmProvider(config);
let applicable = { schema: 0, invariants: 0, semantic: 0 };
let passed = { schema: 0, invariants: 0, semantic: 0, all: 0 };
const failures = [];

function semanticMatches(expected, proposal, error) {
  if (expected.outcome === 'rejected') return Boolean(error && (expected.code === error.code || (expected.code === 'UNSUPPORTED_EXERCISE' && proposal?.outcome === 'unsupported_exercise')));
  if (error) return false;
  if (proposal?.outcome !== expected.outcome) return false;
  if (expected.outcome === 'parsed') {
    return proposal.exercise.name === expected.exerciseName && JSON.stringify(proposal.sets) === JSON.stringify(expected.sets);
  }
  return true;
}

for (const item of dataset) {
  let raw = null; let proposal = null; let error = null;
  const tappingProvider = { async parseWorkout(args) { raw = await provider.parseWorkout(args); return raw; } };
  const parser = new NlpParserService({ llmProvider: tappingProvider, workoutService, repos });
  try { proposal = await parser.interpret(item); } catch (caught) { error = caught; }

  const schemaApplicable = raw !== null;
  const schemaOk = !schemaApplicable || nlpResultSchema.safeParse(raw).success;
  const invariantApplicable = item.expected.outcome !== 'rejected' || item.expected.code !== 'INVALID_WEIGHT' || Boolean(error);
  let invariantOk = invariantApplicable;
  if (proposal?.outcome === 'parsed') {
    invariantOk = repos.catalog.byId(proposal.exercise.id)?.name === proposal.exercise.name
      && proposal.sets.length > 0
      && proposal.sets.every((set) => Number.isFinite(set.weightKg) && set.weightKg > 0 && Number.isInteger(set.reps) && set.reps > 0);
  } else if (proposal?.outcome === 'unsupported_exercise') invariantOk = !repos.catalog.byName(proposal.exerciseName);
  const semanticOk = semanticMatches(item.expected, proposal, error);
  if (schemaApplicable) { applicable.schema += 1; if (schemaOk) passed.schema += 1; }
  if (invariantApplicable) { applicable.invariants += 1; if (invariantOk) passed.invariants += 1; }
  applicable.semantic += 1; if (semanticOk) passed.semantic += 1;
  const allOk = schemaOk && invariantOk && semanticOk;
  if (allOk) passed.all += 1;
  else failures.push({ id: item.id, schema: schemaApplicable ? schemaOk : 'n/a', invariants: invariantOk, semantic: semanticOk, error: error?.code ?? null });
}

const rate = (layer) => applicable[layer] ? passed[layer] / applicable[layer] : 1;
const totalRate = passed.all / dataset.length;
const report = {
  threshold: 0.8,
  layers: Object.fromEntries(['schema', 'invariants', 'semantic'].map((key) => [key, { passed: passed[key], total: applicable[key], rate: Number(rate(key).toFixed(3)) }])),
  overall: { passed: passed.all, total: dataset.length, rate: Number(totalRate.toFixed(3)) },
  failures,
};
console.log(JSON.stringify(report, null, 2));
db.close();
if (totalRate < 0.8) process.exitCode = 1;
