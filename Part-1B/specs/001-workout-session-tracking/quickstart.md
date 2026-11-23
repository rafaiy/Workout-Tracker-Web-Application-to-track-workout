# Quickstart: Validate Workout Session Tracking

This guide defines the local validation path. The repository currently contains planning artifacts only; implementation must provide the scripts below.

## Prerequisites

- Supported Node.js LTS and npm.
- Backend runtime configuration for the SQLite file, selected LLM provider/model, and generated API key. Keep the key in a backend-only ignored local environment file or OS environment; never use a Vite-exposed variable or commit the key.
- Local browser and server running on the same device. Both Vite and Express must bind to `127.0.0.1` only.

## Start the application

1. Install dependencies from the repository root: `npm install`.
2. Configure backend runtime values, including database path, provider, model, and secret key.
3. Run migrations and seed the predefined catalog: `npm run db:migrate`.
4. Start frontend and backend local servers: `npm run dev`.
5. Open the Vite local URL. Confirm the catalog loads and Pending badges are yellow while Completed badges are green.

## Manual end-to-end scenarios

1. Create a session. Confirm it uses the browser's local date/time and IANA zone and appears as Pending.
2. Add dumbbell chest press with three sets: 40 kg × 15, 45 kg × 12, 50 kg × 10. Add chest fly with four sets and confirm each set remains independently editable.
3. Leave the session and return through History. Confirm Pending remains resumable. Complete it and confirm the status changes to Completed.
4. Rename the session, edit its exercise sets, inspect the details, then delete a disposable session. Confirm deleted sessions and child records are absent.
5. Submit `I did 3 sets of chest press at 50kg for 10 reps`. Confirm the catalog match and values are saved to a new session or appended to the unique same-day/time-bucket match.
6. Submit `I did some chest today`. Confirm the app explains what is missing, preserves the original sentence for editing, and creates no guessed record.
7. Submit `I did chest press at -5kg for 10 reps`. Confirm a 400 JSON error and no database changes.
8. Create multiple sessions in one date/time bucket, submit a matching sentence, and confirm the app returns candidate sessions. Select one and resubmit the original sentence with that session; verify only the selected session changes.
9. Confirm requests from another device cannot reach either the frontend or API. Verify backend outbound requests to the configured LLM provider still work.

## Automated validation

- `npm test` runs unit, integration, and API contract tests with a mocked LLM provider for deterministic parser cases.
- `npm run coverage` reports backend service/validator and critical frontend reducer statement and branch coverage; the configured threshold is at least 85% for the specified scope.
- `npm run eval:parser` runs `.harness/evaluate.js` over `evals/dataset.json`, reports schema/invariant/semantic results by layer and failed case IDs, and exits PASS only when the all-layer case pass rate is at least 80%.
- `npm run db:check` or integration tests confirm foreign-key enforcement, cascades, positive set constraints, and transactional rollback on invalid nested writes.
- A local-boundary check confirms both server configurations bind to loopback, with no wildcard/LAN host.

## Set-entry usability check

With a Pending workout open, select an exercise and time the entry of one set from focusing its weight field through entering a valid weight and reps. Repeat for ten sets, record each duration and the median in `specs/001-workout-session-tracking/validation-report.md`, and confirm each set-entry action takes under five seconds. This measures the set-entry interaction rather than the external LLM response time.

See the [REST API contract](contracts/rest-api.md) and [data model](data-model.md) for request/response shape, validation, and relationships.
