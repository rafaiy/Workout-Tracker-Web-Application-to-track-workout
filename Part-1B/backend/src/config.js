import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = path.dirname(fileURLToPath(import.meta.url));

export function loadConfig(env = process.env) {
  const port = Number(env.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port');
  const databasePath = path.resolve(process.cwd(), env.DATABASE_PATH ?? path.join(backendDir, '../data/workouts.sqlite'));
  return {
    port,
    host: '127.0.0.1',
    databasePath,
    llmProvider: (env.LLM_PROVIDER ?? 'openai').trim().toLowerCase(),
    llmModel: (env.LLM_MODEL ?? '').trim(),
    llmApiKey: env.LLM_API_KEY ?? '',
    openAiBaseUrl: (env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, ''),
    geminiBaseUrl: (env.GEMINI_BASE_URL ?? 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, ''),
    llmEndpoint: (env.LLM_ENDPOINT ?? '').replace(/\/$/, ''),
    llmTimeoutMs: Number(env.LLM_TIMEOUT_MS ?? 20000),
  };
}

export const config = loadConfig();
