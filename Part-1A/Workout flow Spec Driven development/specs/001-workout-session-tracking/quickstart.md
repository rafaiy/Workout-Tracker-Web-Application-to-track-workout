# Quickstart: Workout Session Tracking

This guide records the implementation validation scenarios for the local
single-user application and the checks run against the current implementation.

## Prerequisites

- Node.js LTS supported by the selected SQLite driver.
- npm.
- A modern browser.

## Start the application

1. From `backend/`, install dependencies and run the development server. It
   binds to `127.0.0.1`, migrates SQLite, and seeds the exercise catalog.
2. From `frontend/`, install dependencies and start the Vite development server.
3. Open the local Vite URL. The frontend sends API requests to the loopback
   backend.

## Automated validation

- Run backend service/validator unit tests and SQLite integration tests using a
  temporary database.
- For **each method/path in `contracts/openapi.yaml`**, assert its successful
  response and one invalid-input response with the expected status. For
  collection GET routes, pass an unsupported query parameter and expect 400;
  for ID routes, pass a malformed identifier and expect 400; for body routes,
  pass an invalid body and expect 400. Also test valid-but-missing IDs as 404
  and simulated internal failures as safe JSON 500 responses.
- Verify the 204 DELETE operations return no response body; all other responses
  use JSON error or success bodies.
- Run frontend reducer tests for starting sessions, creating three default set
  rows, removing rows down to one, adding rows, editing saved sets, completion,
  rename, and deletion.
- Run frontend interaction tests for session logging, Pending resume, history
  details, text-labeled yellow/green status badges, scroll-only newest-first
  history, rename/edit, and confirmed/canceled deletion.
- Enforce at least 85% statement coverage separately in backend services,
  request validators, and the critical frontend workout reducer/state module.

## Data-entry scenarios

1. Start a session at a time in each label range and verify the default title is
   exactly its label: Morning Workout, Afternoon Workout, Evening Workout, or
   Night Workout.
2. Add one exercise and remove the prefilled rows until one set remains. Save
   weight `0 kg` and `1` rep; confirm the set is present in session detail.
3. Add another exercise with the default three sets. Save `40.0 kg × 15`,
   `45.0 kg × 12`, and `50.0 kg × 10`.
4. Add a four-set exercise and save `20.0`, `30.0`, `40.0`, and `50.0 kg` values
   with valid repetitions; confirm order and values persist after reload.
5. Save valid fractional weights such as `0.1 kg` and `12.3 kg`. Reject
   negative values, `12.35 kg`, non-finite numeric values, missing values,
   zero reps, and fractional reps with visible guidance and no saved entry.
6. Add the same catalog exercise twice and confirm each occurrence retains its
   own order and set list.

## Per-route contract matrix

Run both success and invalid-input checks for each operation below. For routes
with IDs, also check a valid but nonexistent ID returns 404.

| Method and path | Success | Invalid input |
|---|---|---|
| `GET /exercises` | 200 with catalog data | Unsupported query parameter → 400 |
| `GET /sessions` | 200 with newest-first list | Unsupported query parameter → 400 |
| `POST /sessions` | 201 with Pending session and default title | Invalid title/timestamp/body → 400 |
| `GET /sessions/{sessionId}` | 200 with details | Malformed ID → 400 |
| `PATCH /sessions/{sessionId}` | 200 with updated title/time | Empty or invalid fields → 400 |
| `DELETE /sessions/{sessionId}` | 204 with no body | Malformed ID → 400 |
| `POST /sessions/{sessionId}/complete` | 200 with Completed session | Malformed ID or non-empty body → 400 |
| `POST /sessions/{sessionId}/exercises` | 201 with exercise and sets | Invalid catalog ID/set list/value → 400 |
| `PUT /sessions/{sessionId}/exercises/{sessionExerciseId}` | 200 with replaced sets | Empty/invalid set list/value → 400 |
| `DELETE /sessions/{sessionId}/exercises/{sessionExerciseId}` | 204 with no body | Malformed ID → 400 |

## End-to-end acceptance scenarios

1. Start a workout and confirm it appears Pending with local date/time, the
   default title, and the matching time-of-day label.
2. Start a second workout before completing the first. Confirm both appear in
   the newest-first history list and can be resumed independently.
3. Add exercises with one, three, and four sets; complete one session and leave
   another Pending. Confirm history labels and details are accurate.
4. Verify exact time-label boundaries at 04:59, 05:00, 11:59, 12:00, 16:59,
   17:00, 20:59, and 21:00 local time.
5. Rename a session and edit its date/time and sets. Reload history and verify
   the changes. Cancel a deletion and verify the session remains; confirm
   another deletion and verify its exercise/set rows are removed.
6. Restart the local service and confirm saved session data remains available.

## Representative-user measurements

Use 10 representative participants for each criterion below; at least 9 of 10
must meet the target:

- Save one valid set in under five seconds, timed from opening the active
  session view to successful save feedback.
- Start a session, add an exercise with three sets, and complete it correctly
  on the first unaided attempt.
- Find a target session in a history containing 100 sessions, then identify its
  exercises and set values within 30 seconds using scrolling only.

## Expected results

- Session/set data persists across page reloads and application restarts.
- Exercise/set writes and set-list replacements are atomic; failed writes leave
  no partial records.
- Pending sessions can coexist, resume, and complete independently.
- Every API method/path has successful and invalid-input contract coverage.
- All specified coverage thresholds pass.

## Verification record

Run on 2026-11-20:

- Backend: all 16 unit and HTTP contract tests pass, including all 10 documented
  API method/path combinations, invalid inputs, 404 cases, and bodyless 204s.
- Backend statements: session service 100%; request validators 91.04%.
- Frontend: all 9 unit/integration tests pass; workout reducer statement
  coverage is 93.1%. Production Vite build succeeds.
- Data entry: tested zero and 0.1 kg, 40/45/50 kg three-set data, four-set
  20/30/40/50 kg data, invalid negative and fractional precision weights,
  invalid reps, set removal to one, and multiple independently pending sessions.
- Human timing/usability criteria (10 participants, 9/10 success thresholds)
  have not been measured. These remain an in-person follow-up; no user study is
  claimed by this automated verification.
