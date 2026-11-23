# Form & Function — Local Workout Tracker

A private, single-user workout tracker that runs on one device. The React/Vite interface and Express API bind to `127.0.0.1`; workout history is stored in a local SQLite file. There is no login or inbound LAN access.

## Requirements

- Node.js LTS and npm.
- Optional external LLM configuration for natural-language logging. The API key belongs only in the backend runtime environment.

## Run locally

```sh
npm install
cp backend/.env.example backend/.env
# Edit backend/.env with your own model and generated key.
npm run db:migrate
npm run dev
```

Open the local Vite address printed in the terminal (default `http://127.0.0.1:5173`). The API runs at `http://127.0.0.1:3001`. Both listeners are loopback-only. The backend can make outbound requests to the configured OpenAI-compatible LLM endpoint.

`backend/.env` is ignored by Git. Never put an API key in a `VITE_` variable, frontend source, logs, or an API request/response. Configure `LLM_PROVIDER=openai` or `LLM_PROVIDER=gemini`, the provider's model name, and `LLM_API_KEY`; set `OPENAI_BASE_URL` or `GEMINI_BASE_URL` only if you use a compatible custom endpoint. If no key/model is set, manual workout logging remains available and text logging explains how to configure the parser.

The local SQLite database defaults to `backend/data/workouts.sqlite`; set `DATABASE_PATH` to change it. Migrations and the read-only exercise catalog seed run via `npm run db:migrate`.

## Validate

```sh
npm test
npm run coverage
npm run db:check
npm run eval:parser
npm run build
```

The coverage command enforces at least 85% statement and branch coverage over backend services/validators and critical frontend workout reducers. The parser evaluator calls the configured external provider, validates schema, invariants, and expected semantics against `evals/dataset.json`, and passes at an all-layer case rate of 80% or higher. Configure a valid backend key/model before running the evaluator.

See `specs/001-workout-session-tracking/quickstart.md` for end-to-end scenarios and the API contract in `specs/001-workout-session-tracking/contracts/rest-api.md`.
