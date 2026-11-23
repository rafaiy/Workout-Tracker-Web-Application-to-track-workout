# Tasks: Workout Session Tracking

**Input**: Design documents from `specs/001-workout-session-tracking/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/rest-api.md](contracts/rest-api.md), [quickstart.md](quickstart.md)

**Tests**: Included because the constitution and feature plan explicitly require critical-logic tests and ≥85% coverage for backend services/validators and critical frontend reducers.

**Organization**: Tasks are grouped by user story. Each task has a concrete path and a sequential ID. The application is local-only and single-user; no authentication or owner-ID tasks are included.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the React/Vite and Express application skeletons and local runtime commands.

- [X] T001 Create root npm workspace manifest and `dev`, `build`, `start`, `test`, `coverage`, `db:migrate`, `db:check`, and `eval:parser` scripts in `package.json`.
- [X] T002 [P] Scaffold the React/Vite application and its entry point in `frontend/package.json`, `frontend/index.html`, and `frontend/src/main.jsx`.
- [X] T003 [P] Configure Vite dev and preview servers to bind explicitly to `127.0.0.1` in `frontend/vite.config.js`.
- [X] T004 [P] Scaffold the Express backend package and server entry point in `backend/package.json` and `backend/src/server.js`.
- [X] T005 [P] Add safe backend configuration loading and `.env.example` for database path, LLM provider/model, and backend-only API key in `backend/src/config.js` and `backend/.env.example`; never commit real credentials or use Vite-exposed variable names.
- [X] T006 Add root ignore rules for local environment files, SQLite data, and generated coverage output in `.gitignore`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared database, validation, API, and test foundations before story work.

- [X] T007 Configure Vitest, Supertest, and scoped coverage collection in `vitest.config.js`; enforce at least 85% statement and branch coverage for backend services/validators and critical frontend workout reducers.
- [X] T008 Implement SQLite connection lifecycle, migration runner, and repository boundary in `backend/src/db/connection.js`, `backend/src/db/migrate.js`, and `backend/src/repositories/index.js`; enable `PRAGMA foreign_keys=ON` for every connection.
- [X] T009 Create versioned SQLite migration in `backend/src/db/migrations/001-initial-schema.sql` for ExerciseCatalog, WorkoutSession, SessionExercise, and ExerciseSet, with required/unique/foreign-key fields, cascades, ordered uniqueness, `status` limited to `PENDING`/`COMPLETED`, `weightKg > 0`, and positive integer `reps`.
- [X] T010 Implement idempotent predefined exercise catalog seed in `backend/src/db/seeds/exercise-catalog.js`; include the spec examples and expose no catalog mutation API.
- [X] T011 [P] Implement shared Zod request schemas and safe JSON error shapes in `backend/src/schemas/common.schema.js` and `backend/src/api/errors.js`; reject invalid values before service or repository calls.
- [X] T012 [P] Implement Express JSON parsing, route mounting, not-found handling, and sanitized error middleware in `backend/src/app.js`; ensure errors never include stack traces, prompts, provider payloads, or credentials.
- [X] T013 Add API listener configuration and a runtime assertion that the Express server host is `127.0.0.1` in `backend/src/server.js`; do not bind to wildcard or LAN interfaces.
- [X] T014 Implement browser API client and local time context helpers in `frontend/src/services/apiClient.js` and `frontend/src/services/localTime.js`; capture the device timestamp with offset and IANA zone using `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- [X] T015 Add shared app shell, navigation, and reusable status badge primitives in `frontend/src/components/AppShell.jsx`, `frontend/src/components/StatusBadge.jsx`, and `frontend/src/App.jsx`.

**Checkpoint**: Both servers run locally; database setup, shared error/validation boundaries, and coverage enforcement are ready.

---

## Phase 3: User Story 1 - Log and Complete a Workout (Priority: P1) 🎯 MVP

**Goal**: Start a session, select catalog exercises, enter variable sets, keep unfinished sessions Pending, and complete the workout.

**Independent Test**: Start a session, add two catalog exercises with different set counts and positive weights/reps, complete it, and verify the exact values and status persist in SQLite.

### Tests for User Story 1

- [X] T016 [P] [US1] Add unit tests for local date/time labels, session defaults, and set validation (weight `> 0`; reps positive whole number) in `backend/tests/unit/workout-validation.test.js`.
- [X] T017 [P] [US1] Add repository/service integration tests for session creation, variable sets, transactional rollback, and Pending-to-Completed transition in `backend/tests/integration/workout-service.test.js`.
- [X] T018 [P] [US1] Add Express contract tests for catalog, session creation, adding exercises, completion, 400 validation errors, and 404 missing sessions in `backend/tests/contract/sessions-api.test.js`.
- [X] T019 [P] [US1] Add reducer tests for session creation, adding variable sets, and completion/pending state in `frontend/tests/reducers/workoutReducer.test.js`.

### Implementation for User Story 1

- [X] T020 [US1] Implement ExerciseCatalog, WorkoutSession, SessionExercise, and ExerciseSet repository operations in `backend/src/repositories/exercise.repository.js` and `backend/src/repositories/session.repository.js`; persist UTC instants with IANA `timeZone`, required title, status, completion time, ordered exercises/sets, and cascades per `data-model.md`.
- [X] T021 [US1] Implement workout domain validation, session creation, exercise add/edit, and completion services in `backend/src/services/workout.service.js`; require `weightKg > 0`, finite values, integer `reps > 0`, and catalog membership before persistence.
- [X] T022 [US1] Implement REST routes for `GET /api/exercises`, `POST/GET /api/sessions`, `GET/PATCH /api/sessions/{sessionId}`, `POST /api/sessions/{sessionId}/exercises`, `PUT /api/sessions/{sessionId}/exercises/{sessionExerciseId}`, `POST /api/sessions/{sessionId}/complete`, and session deletion in `backend/src/api/routes/exercises.routes.js` and `backend/src/api/routes/sessions.routes.js`.
- [X] T023 [US1] Implement a reducer and API hooks for creating sessions, adding/editing exercises and sets, and completing sessions in `frontend/src/state/workoutReducer.js` and `frontend/src/hooks/useWorkout.js`.
- [X] T024 [US1] Implement reusable set rows and an exercise editor that asks for set count, defaults to three sets, supports adding/removing sets, and validates values inline in `frontend/src/components/SetRow.jsx` and `frontend/src/components/ExerciseEditor.jsx`.
- [X] T025 [US1] Implement session start and active workout screens in `frontend/src/pages/HomePage.jsx` and `frontend/src/pages/SessionPage.jsx`; submit browser-captured `startedAt` and IANA `timeZone`, add exercises only from the catalog, and allow Pending or Completed state handling.
- [X] T026 [US1] Verify migration/seed and the independent US1 journey against `specs/001-workout-session-tracking/quickstart.md`; correct any discrepancies in the US1 implementation files.

**Checkpoint**: A user can manually log and complete a workout without the history-management or NLP stories.

---

## Phase 4: User Story 3 - Log by Describing a Workout (Priority: P1)

**Goal**: Parse natural-language workout text through a configured backend LLM, validate it, then create a session or append an exercise only when safe and unambiguous.

**Independent Test**: Submit a valid sentence and verify persisted values; submit negative, unsupported, vague, incomplete, and multi-match examples and verify no write occurs until correction or session selection.

### Tests for User Story 3

- [X] T027 [P] [US3] Add mocked LLM adapter and parser service tests for valid structured JSON, malformed output, provider failure, unsupported catalog names, and missing/ambiguous values in `backend/tests/unit/nlp-parser.service.test.js`.
- [X] T028 [P] [US3] Add parse endpoint contract tests for saved new/existing sessions, 400 invalid weights, clarification response, target selection, and no-write guarantees in `backend/tests/contract/parse-api.test.js`.
- [X] T029 [P] [US3] Add frontend tests for retaining/editing original input and selecting a matching session before resubmission in `frontend/tests/components/NlpParserInput.test.jsx`.

### Implementation for User Story 3

- [X] T030 [US3] Implement provider/model selection and backend-only API-key loading from runtime configuration in `backend/src/config.js` and `backend/.env.example`; keep credentials out of SQLite, logs, API output, and all frontend bundles.
- [X] T031 [US3] Implement the external provider adapter in `backend/src/integrations/llm/llm-provider.js`; send only the workout sentence and catalog context, request structured JSON, and expose no repository/database functions to the model.
- [X] T032 [US3] Implement the strict Zod discriminated-union response schema in `backend/src/schemas/nlp-result.schema.js` for parsed, clarification, unsupported-exercise, and invalid-input outcomes.
- [X] T033 [US3] Implement natural-language parsing and deterministic catalog/set/date/time validation in `backend/src/services/nlp-parser.service.js`; reject `weightKg <= 0`, non-finite weights, `reps <= 0`, non-integer reps, and unsupported exercises without writes.
- [X] T034 [US3] Extend workout domain service to resolve local date/time-bucket matches: append on exactly one match, create a session on no match, and return candidate summaries without writing on multiple matches in `backend/src/services/workout.service.js`.
- [X] T035 [US3] Implement `POST /api/sessions/parse` in `backend/src/api/routes/parse.routes.js`; return JSON 400 for invalid weights/unsupported input, JSON clarification with a correction reason for vague input, and `choose_session` candidates for multiple matches; require original text plus `targetSessionId` on selection resubmission and reparse before saving.
- [X] T036 [US3] Implement the NLP input panel and correction/session-selection flow in `frontend/src/components/NlpParserInput.jsx` and `frontend/src/pages/HomePage.jsx`; retain the original editable sentence and show saved/clarification/error outcomes.
- [X] T037 [US3] Add a secret-free parser evaluation dataset covering schema, invariants, semantic outcomes, and multi-session choices in `evals/dataset.json`.
- [X] T038 [US3] Implement `.harness/evaluate.js` with Layer 1 schema, Layer 2 invariant, and Layer 3 semantic checks; report each layer, failed case IDs, and PASS only when at least 80% of all dataset cases pass all applicable layers.

**Checkpoint**: Natural-language entries are either validated and saved or rejected with a reason and a safe correction/selection path.

---

## Phase 5: User Story 2 - Review and Manage Workout History (Priority: P2)

**Goal**: Browse Pending and Completed history, inspect exercise details, resume Pending workouts, rename/edit sessions, and delete sessions.

**Independent Test**: With one Pending and one Completed session, verify list badges and details, resume/edit/rename each, and delete one with all child records removed.

### Tests for User Story 2

- [X] T039 [P] [US2] Add service integration tests for history ordering/filtering, session metadata edits, exercise edits/deletes, and session cascades in `backend/tests/integration/history-service.test.js`.
- [X] T040 [P] [US2] Add contract tests for history list/detail, rename, edit, delete, and 404 responses in `backend/tests/contract/history-api.test.js`.
- [X] T041 [P] [US2] Add UI tests for Pending yellow and Completed green badges, details, rename, resume, and delete confirmation in `frontend/tests/components/history.test.jsx`.

### Implementation for User Story 2

- [X] T042 [US2] Implement session history ordering/filter and full-detail retrieval in `backend/src/repositories/session.repository.js` and `backend/src/services/workout.service.js`; include derived local date/time bucket and exercise counts.
- [X] T043 [US2] Implement history list and detail pages in `frontend/src/pages/HistoryPage.jsx` and `frontend/src/pages/SessionDetailPage.jsx`; show date/time, all exercises/sets, and yellow Pending versus green Completed badges.
- [X] T044 [US2] Implement resume, rename, session metadata edit, exercise/set edit, and delete confirmation interactions in `frontend/src/components/SessionCard.jsx`, `frontend/src/components/SessionEditForm.jsx`, and `frontend/src/pages/SessionDetailPage.jsx`.
- [X] T045 [US2] Ensure API deletion cascades from session to exercises and sets and returns `{ "deleted": true }` in `backend/src/repositories/session.repository.js` and `backend/src/api/routes/sessions.routes.js`.

**Checkpoint**: The user can find, inspect, resume, edit, rename, and delete local workout history.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm security, local-only operation, measurable quality, and documentation across all stories.

- [X] T046 [P] Add a local listener configuration test proving both Express and Vite bind to `127.0.0.1` and not wildcard/LAN interfaces in `backend/tests/integration/local-boundary.test.js` and `frontend/tests/local-boundary.test.js`.
- [X] T047 [P] Add secret-safety tests or static checks ensuring API keys are absent from frontend bundles, API responses, and application logs in `backend/tests/integration/secret-safety.test.js`.
- [X] T048 Review and enforce the ≥85% scoped statement/branch coverage report for backend services/validators and critical frontend reducers; adjust only missing critical-logic coverage in `vitest.config.js` and relevant tests.
- [X] T049 [P] Update local setup, backend key/model configuration, migration, and manual validation instructions in `README.md` using `specs/001-workout-session-tracking/quickstart.md` as the acceptance guide.
- [X] T050 Run the full implementation validation flow from `specs/001-workout-session-tracking/quickstart.md`, including `npm test`, `npm run coverage`, `npm run eval:parser`, and `npm run db:check`; record outcomes in `specs/001-workout-session-tracking/validation-report.md`.
- [ ] T051 Measure the primary set-entry interaction in usability acceptance checks and record that logging a set takes under five seconds in `specs/001-workout-session-tracking/validation-report.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately; T002–T005 can proceed in parallel after root workspace task T001.
- **Foundational (Phase 2)**: Depends on Setup. Database, shared API boundaries, local time capture, and coverage configuration block story implementation.
- **User Story 1 (Phase 3)**: Depends on Foundational. Establishes manual workout persistence and the domain service used by NLP and history.
- **User Story 3 (Phase 4)**: Depends on US1's catalog/session/set domain operations because accepted parser output reuses the same validated workout service.
- **User Story 2 (Phase 5)**: Depends on US1's session and exercise persistence. After US1, US2 and US3 can be implemented in parallel if separate contributors coordinate shared service files.
- **Polish (Phase 6)**: Depends on all selected stories.

### User Story Dependencies

- **US1 (P1)**: Requires only the foundational phase; it is the suggested MVP scope.
- **US3 (P1)**: Requires US1 workout-domain persistence and catalog lookup; no history UI dependency.
- **US2 (P2)**: Requires US1 persistence and session APIs; NLP is not required.

### Parallel Opportunities

- Setup tasks T002–T005 touch distinct app/config files and can proceed alongside one another after T001.
- Foundation tasks T011–T012 are independent by file and can proceed alongside database work after T008 begins.
- US1 test tasks T016–T019 are separate files and can be written in parallel. UI tasks T023–T025 can proceed in parallel after shared interfaces are agreed.
- US3 tests T027–T029 and parser dataset task T037 touch distinct files. Provider, schema, and input UI work can be split after the contract is fixed.
- After US1, US2 and US3 may proceed in parallel with careful coordination around `workout.service.js` and `sessions.routes.js`.
- US2 test tasks T039–T041 touch distinct files and can run in parallel.

## Parallel Example: User Story 1

```text
Task: T016 backend workout validation tests in backend/tests/unit/workout-validation.test.js
Task: T018 REST contract tests in backend/tests/contract/sessions-api.test.js
Task: T019 reducer tests in frontend/tests/reducers/workoutReducer.test.js

After interfaces are agreed:
Task: T023 reducer/hooks in frontend/src/state/workoutReducer.js and frontend/src/hooks/useWorkout.js
Task: T024 set/exercise editor in frontend/src/components/SetRow.jsx and frontend/src/components/ExerciseEditor.jsx
Task: T020 repositories in backend/src/repositories/exercise.repository.js and backend/src/repositories/session.repository.js
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational phases.
2. Complete US1 manual session, catalog exercise, variable set, and completion flow.
3. Validate the US1 independent scenario and core validation/transaction logic.
4. Deliver/demo the manual tracker as the first usable increment.

### Incremental Delivery

1. Setup + Foundational → local application and persistence foundation.
2. US1 → manual workout logging and completion MVP.
3. US3 → validated natural-language logging, correction flow, and match selection.
4. US2 → history browsing and management.
5. Polish → local-boundary, secret, coverage, harness, and quickstart verification.

## Format Validation

All actionable tasks use `- [ ] T###`, include `[US#]` only in user-story phases, include `[P]` only for independent parallel work, and name one or more concrete repository file paths.
