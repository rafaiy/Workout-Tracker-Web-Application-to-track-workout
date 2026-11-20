---
description: "Implementation task list for workout session tracking"
---

# Tasks: Workout Session Tracking

**Input**: Design documents from `/specs/001-workout-session-tracking/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Organization**: Tasks are grouped by user story. Tests are included because the specification requires automated tests and 85% statement coverage for critical areas.

## Checklist Format

- Every task has an unchecked checkbox, sequential ID, optional `[P]`, story label for story phases, and a concrete target path.
- `[P]` marks independent work in distinct files after its prerequisites are satisfied.

## Phase 1: Setup

**Purpose**: Initialize the frontend and backend projects and test tooling.

- [X] T001 Add the supported Node.js LTS version to `.nvmrc` and ignore `node_modules/`, databases, coverage output, build output, logs, and `.env*` in `.gitignore`.
- [X] T002 Initialize the Express backend package, runtime scripts, and server entry point in `backend/package.json` and `backend/src/server.js`.
- [X] T003 [P] Initialize the React/Vite frontend package, entry point, and development/build scripts in `frontend/package.json`, `frontend/vite.config.js`, `frontend/index.html`, and `frontend/src/main.jsx`.
- [X] T004 Configure backend `node:test` coverage and frontend Vitest/React Testing Library in `backend/package.json`, `backend/tests/coverage.config.js`, `frontend/package.json`, and `frontend/vitest.config.js`.

---

## Phase 2: Foundational

**Purpose**: Set up persistence, application boundaries, and common error handling required by every story.

- [X] T005 Create SQLite connection and migrations runner in `backend/src/db/connection.js` and `backend/src/db/migrate.js`; enable `PRAGMA foreign_keys = ON` on every connection before transactions.
- [X] T006 Create `backend/src/db/migrations/001-workout-schema.sql` with ExerciseCatalog `id` primary key, unique required `name`, required `muscleGroup`; WorkoutSession required `title`, status enum `PENDING|COMPLETED`, required offset-bearing `startedAt`, nullable `completedAt` with state consistency constraint; SessionExercise required FKs to session/catalog, non-negative `orderIndex` unique per session, cascade session deletion and restrict catalog deletion; ExerciseSet required cascading FK, positive `setNumber` unique per exercise, finite non-negative `weightKg` in 0.1 increments with no product maximum, and positive integer `reps`.
- [X] T007 Seed the six predefined exercises and primary muscle-group metadata in `backend/src/db/seed/exercises.js`; metadata is stored but not displayed or used for filtering in v1.
- [X] T008 Create Express app, loopback binding, JSON parsing, and centralized safe JSON errors in `backend/src/app.js`, `backend/src/server.js`, and `backend/src/middleware/error-handler.js`; 204 responses are bodyless and internal error details are not exposed.
- [X] T009 Create the frontend app shell, route handling, and shared API client in `frontend/src/app/App.jsx`, `frontend/src/app/routes.jsx`, and `frontend/src/shared/apiClient.js`.

**Checkpoint**: Application shells, schema, and common infrastructure are ready.

---

## Phase 3: User Story 1 — Log a workout session (P1, MVP)

**Goal**: Start a Pending session, log exercises and sets, and complete the workout.

**Independent Test**: Start a session, add exercises with one, three, and four sets using valid values, complete it, and confirm all persisted details and Completed status.

### Tests for User Story 1

- [X] T010 [P] [US1] Add session domain tests for create, add exercise, add/remove sets, invalid values, and complete transitions in `backend/tests/unit/session.service.test.js`.
- [X] T011 [P] [US1] Test `GET /exercises` success plus unsupported-query 400 in `backend/tests/contract/get-exercises.test.js`.
- [X] T012 [P] [US1] Test `POST /sessions` success plus invalid title/timestamp/body 400 in `backend/tests/contract/post-sessions.test.js`.
- [X] T013 [P] [US1] Test `GET /sessions/{sessionId}` success, malformed-ID 400, and missing-ID 404 in `backend/tests/contract/get-session.test.js`.
- [X] T014 [P] [US1] Test `POST /sessions/{sessionId}/exercises` success, invalid catalog/set/weight/reps 400, and missing session 404 in `backend/tests/contract/post-session-exercises.test.js`.
- [X] T015 [P] [US1] Test `POST /sessions/{sessionId}/complete` success, malformed-ID or non-empty-body 400, and missing session 404 in `backend/tests/contract/post-session-complete.test.js`.
- [X] T016 [P] [US1] Test frontend reducer creation, three default rows, removal down to one, adding rows, session exercise save, and completion in `frontend/tests/unit/workoutReducer.test.js`.
- [X] T017 [P] [US1] Test workout form entry for 0.1 kg increments, zero weight, invalid weight/reps feedback, and save success in `frontend/tests/integration/workout-entry.test.jsx`.

### Implementation for User Story 1

- [X] T018 [P] [US1] Implement catalog repository/service lookups in `backend/src/modules/exercises/exercise.repository.js` and `backend/src/modules/exercises/exercise.service.js`.
- [X] T019 [US1] Implement session repository operations for create, detail, atomic exercise-plus-set insertion, and completion in `backend/src/modules/sessions/session.repository.js`.
- [X] T020 [US1] Implement session domain service and default `title` equal to the local time-of-day label alone in `backend/src/modules/sessions/session.service.js` and `backend/src/modules/sessions/time-of-day.js`.
- [X] T021 [US1] Validate catalog/session identifiers, optional session title and timestamp, exercise selection, one-or-more sets, finite `weightKg` divisible by 0.1 and ≥0 with no product maximum, and positive integer `reps` in `backend/src/modules/sessions/session.validation.js`.
- [X] T022 [US1] Implement catalog GET and session POST/detail/complete/exercise POST routes matching `contracts/openapi.yaml` in `backend/src/modules/exercises/exercise.routes.js`, `backend/src/modules/sessions/session.routes.js`, and `backend/src/modules/sessions/session.controller.js`.
- [X] T023 [P] [US1] Implement pure workout reducer transitions for session creation, three default sets, remove-to-one, add-set, add-exercise, and completion in `frontend/src/features/workouts/workoutReducer.js`.
- [X] T024 [US1] Implement frontend API client calls for catalog, create/detail session, add exercise/sets, and complete in `frontend/src/features/workouts/workoutApi.js`.
- [X] T025 [US1] Build active session page and reusable exercise/set entry controls with removable rows, 0.1 kg step, validation, and visible save feedback in `frontend/src/features/workouts/pages/WorkoutSessionPage.jsx`, `frontend/src/features/workouts/components/ExerciseEntryForm.jsx`, and `frontend/src/features/workouts/components/SetRow.jsx`.
- [X] T026 [US1] Connect active session views to reducer and API client and show completion feedback in `frontend/src/features/workouts/WorkoutSessionFeature.jsx`.

**Checkpoint**: User Story 1 independently records and completes workouts.

---

## Phase 4: User Story 2 — Review history and resume sessions (P2)

**Goal**: Browse Pending and Completed history, inspect details, and resume or complete a Pending session.

**Independent Test**: Load Pending and Completed fixtures, inspect newest-first history and details, resume a Pending session, add an exercise, and verify its updated details.

### Tests for User Story 2

- [X] T027 [P] [US2] Test `GET /sessions` success plus unsupported-query 400 and newest-first ordering in `backend/tests/contract/get-sessions.test.js`.
- [X] T028 [P] [US2] Add UI tests for empty state, newest-first scroll list, title/date/time labels, text and color status badges, and session details in `frontend/tests/integration/session-history.test.jsx`.
- [X] T029 [P] [US2] Add local label boundary tests for 04:59, 05:00, 11:59, 12:00, 16:59, 17:00, 20:59, and 21:00 in `backend/tests/unit/time-of-day.test.js`.
- [X] T030 [P] [US2] Add frontend flow tests for independently resuming multiple Pending sessions and marking a resumed session Complete in `frontend/tests/integration/session-resume.test.jsx`.

### Implementation for User Story 2

- [X] T031 [US2] Implement newest-first history and ordered session detail queries in `backend/src/modules/sessions/session.repository.js`.
- [X] T032 [US2] Implement time-of-day ranges (05:00–11:59 Morning Workout; 12:00–16:59 Afternoon Workout; 17:00–20:59 Evening Workout; 21:00–04:59 Night Workout) in `backend/src/modules/sessions/time-of-day.js`.
- [X] T033 [US2] Implement `GET /sessions` success/validation behavior and response mapping in `backend/src/modules/sessions/session.controller.js` and `backend/src/modules/sessions/session.routes.js`.
- [X] T034 [P] [US2] Build text-labeled Pending/Completed badges with yellow/green styling in `frontend/src/features/workouts/components/SessionStatusBadge.jsx` and `frontend/src/features/workouts/components/SessionHistoryItem.jsx`.
- [X] T035 [US2] Build newest-first scrollable history and actionable empty state without search or filters in `frontend/src/features/workouts/pages/SessionHistoryPage.jsx`.
- [X] T036 [US2] Build session detail view for ordered exercise entries and weight/reps in `frontend/src/features/workouts/pages/SessionDetailPage.jsx`.
- [X] T037 [US2] Add resume and complete controls for Pending sessions and reconnect to the active session workflow in `frontend/src/features/workouts/pages/SessionDetailPage.jsx` and `frontend/src/features/workouts/WorkoutSessionFeature.jsx`.
- [ ] T038 [US2] Measure the 30-second history task with 10 representative users against a 100-session list and record at least 9/10 successes in `specs/001-workout-session-tracking/quickstart.md`.

**Checkpoint**: User Story 2 independently supports history, details, resume, and completion.

---

## Phase 5: User Story 3 — Maintain saved sessions (P3)

**Goal**: Rename/edit saved sessions and delete only after confirmation.

**Independent Test**: Edit a session title, time, and set values; cancel a delete and confirm preservation; then confirm another delete and verify children are removed.

### Tests for User Story 3

- [X] T039 [P] [US3] Add service tests for title/time editing, set-list replacement, and cascading deletion in `backend/tests/unit/session-maintenance.test.js`.
- [X] T040 [P] [US3] Test `PATCH /sessions/{sessionId}` success, malformed ID and invalid/empty body 400, and missing session 404 in `backend/tests/contract/patch-session.test.js`.
- [X] T041 [P] [US3] Test `DELETE /sessions/{sessionId}` success with bodyless 204, malformed ID 400, and missing session 404 in `backend/tests/contract/delete-session.test.js`.
- [X] T042 [P] [US3] Test `PUT /sessions/{sessionId}/exercises/{sessionExerciseId}` success, malformed IDs/invalid set list 400, and missing record 404 in `backend/tests/contract/put-session-exercise.test.js`.
- [X] T043 [P] [US3] Test `DELETE /sessions/{sessionId}/exercises/{sessionExerciseId}` success with bodyless 204, malformed IDs 400, and missing record 404 in `backend/tests/contract/delete-session-exercise.test.js`.
- [X] T044 [P] [US3] Add frontend reducer and UI tests for rename/edit and confirmed/canceled deletion in `frontend/tests/integration/session-maintenance.test.jsx`.

### Implementation for User Story 3

- [X] T045 [US3] Implement session title/start-time update and atomic set-list replacement in `backend/src/modules/sessions/session.repository.js` and `backend/src/modules/sessions/session.service.js`.
- [X] T046 [US3] Implement session/exercise deletion and use database cascades for dependent records in `backend/src/modules/sessions/session.repository.js` and `backend/src/modules/sessions/session.service.js`.
- [X] T047 [US3] Validate edit payloads and identifiers and map malformed input to 400 and missing records to 404 in `backend/src/modules/sessions/session.validation.js` and `backend/src/modules/sessions/session.controller.js`.
- [X] T048 [US3] Implement PATCH/PUT/DELETE maintenance routes matching `contracts/openapi.yaml` in `backend/src/modules/sessions/session.routes.js` and `backend/src/modules/sessions/session.controller.js`.
- [X] T049 [P] [US3] Build session title/date-time and exercise set edit forms in `frontend/src/features/workouts/components/SessionEditForm.jsx` and `frontend/src/features/workouts/components/ExerciseSetEditForm.jsx`.
- [X] T050 [US3] Build delete confirmation that preserves data on cancel in `frontend/src/features/workouts/components/DeleteSessionDialog.jsx` and `frontend/src/features/workouts/pages/SessionDetailPage.jsx`.
- [X] T051 [US3] Connect edit/delete forms to API and reducer updates and refresh history/detail views in `frontend/src/features/workouts/WorkoutSessionFeature.jsx` and `frontend/src/features/workouts/workoutApi.js`.

**Checkpoint**: User Story 3 independently maintains persisted history.

---

## Phase 6: Polish and Cross-Cutting Concerns

**Purpose**: Enforce quality gates and verify cross-story outcomes.

- [X] T052 [P] Configure separate ≥85% statement coverage gates for backend services, request validators, and the critical frontend workout reducer/state module in `backend/tests/coverage.config.js` and `frontend/vitest.config.js`.
- [X] T053 [P] Add keyboard labels, focus management, and status text that does not rely on color in `frontend/src/features/workouts/components/`.
- [ ] T054 Measure under-five-second set saving and first-attempt session completion with 10 representative users; record results in `specs/001-workout-session-tracking/quickstart.md`.
- [X] T055 Run the per-route contract matrix, all automated suites, data-entry cases, and end-to-end flows; record results in `specs/001-workout-session-tracking/quickstart.md`.
- [X] T056 Document startup commands and SQLite database location in `README.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup must finish before the foundation; the foundation blocks all stories.
- US1 depends on Setup and Foundation and is the MVP.
- US2 depends on the shared session schema and US1 operations; it can use seeded fixtures for independent history tests.
- US3 depends on the saved session model and is simplest after US1/US2 UI/data flows exist.
- Polish follows the desired user stories.

### User Story Order

1. US1 — create, log, and complete sessions.
2. US2 — history, detail, resume, and pending completion.
3. US3 — edit, rename, and delete.

### Parallel Opportunities

- T003 can proceed alongside T002 after T001.
- US1 contract tests T011–T015 and frontend tests T016–T017 target separate files; T018 catalog lookup can proceed alongside T023 reducer work after the schema is ready.
- US2 tests T027–T030 are separate files; T034 can proceed alongside backend query/time work.
- US3 tests T040–T044 are separate files; T049 can proceed alongside backend implementation after contract behavior is fixed.
- Stories still follow the priority order for a coherent MVP because resume and maintenance connect to the active session and history flows.

## Parallel Example: User Story 1

```text
After Phase 2:
T011 GET exercises contract test
T012 POST sessions contract test
T013 GET session detail contract test
T014 POST session exercise contract test
T015 POST session completion contract test
T016 frontend reducer tests
T017 frontend entry interaction tests
```

## Implementation Strategy

### MVP First

1. Complete Setup and Foundation.
2. Complete US1, including every US1 operation's success and invalid-input contract tests.
3. Validate saved data, status transitions, set removal, 0.1 kg rules, and the five-second target.
4. Add history/resume (US2), then editing/deletion (US3).

### Incremental Delivery

Keep each story's tests and acceptance criteria green before advancing. Enforce
the 85% statement coverage threshold separately for each named critical area.

## Notes

- The task IDs are sequential and every task line follows the checklist format.
- Test tasks precede implementation tasks in each story.
- API contract tests cover success and invalid input for every method/path in `contracts/openapi.yaml`, including 400 and applicable 404 responses.
- The reviewer-owned `checklists/workout-requirements.md` remains a separate requirements-quality review artifact.
