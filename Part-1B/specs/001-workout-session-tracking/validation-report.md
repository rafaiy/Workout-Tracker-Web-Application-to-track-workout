# Workout Tracker Validation Report

**Date**: 2026-11-23  
**Runtime**: Node.js v26.13.0, npm 11.20.0

## Completed checks

| Check | Result |
|---|---|
| Automated unit, integration, API contract, and UI component tests | PASS — 51 tests across 14 files |
| Scoped statement coverage | PASS — 100% (194/194) |
| Scoped branch coverage | PASS — 100% (124/124) |
| Scoped function and line coverage | PASS — 100% |
| Production dependency audit | PASS — 0 vulnerabilities |
| Full dependency audit after test-runner upgrade | PASS — npm reported 0 vulnerabilities |
| SQLite migration/catalog/foreign-key check | PASS — 17 catalog exercises, foreign keys enabled |
| Frontend production build | PASS |
| Local development startup and API health/catalog smoke check | PASS — Vite selected `127.0.0.1:5174` because `5173` was occupied; Express responded on `127.0.0.1:3001` |
| Local inbound boundary and secret-safety tests | PASS |
| OpenAI and Gemini adapter tests | PASS — provider headers, model configuration, JSON modes, and sanitized failures covered |

## Pending checks

- **Live parser evaluation**: Not completed. `backend/.env` does not contain `LLM_API_KEY` or `LLM_MODEL`. The harness now exits with a setup message and makes no provider requests when either is missing. Configure the backend environment, then run `npm run eval:parser`; the all-layer pass threshold is 80%.
- **Set-entry usability timing**: Not measured. Follow the ten-set timing procedure in `quickstart.md` on the target device and record each duration and the median here. The browser automation host was unavailable in this session, so no UI timing was collected.
- **Interactive browser walkthrough**: Not completed. Both loopback servers started and the health/catalog endpoints responded, but the browser automation host was unavailable for a visual/manual walkthrough.
