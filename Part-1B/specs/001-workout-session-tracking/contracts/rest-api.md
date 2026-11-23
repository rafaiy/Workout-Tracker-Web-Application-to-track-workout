# REST API Contract: Workout Session Tracking

Base path: `/api`. All bodies use JSON. The backend is local to one installation; it does not accept requests from other devices. The API has no authentication or owner identity fields.

## Shared Conventions

- JSON errors use `{ "error": { "code": "...", "message": "...", "details": [] } }`.
- `400` means malformed input or domain validation failure. Negative and zero weights are rejected and never persisted.
- `404` means the requested local resource does not exist.
- `500` is a sanitized unexpected error; stack traces, provider responses, prompts, and secrets are never returned.
- Successful deletion returns `200` with `{ "deleted": true }` to provide a JSON body.
- Date/time input includes an ISO-8601 local timestamp with offset and an IANA `timeZone` captured by the browser. Omitted date/time in natural-language input defaults to the device's date/time at submission.
- Ordered arrays reflect `orderIndex` or `setNumber`.

## Endpoints

### `GET /api/exercises`

Returns the predefined read-only catalog.

- **200**: `{ "exercises": [{ "id": 1, "name": "Chest press machine", "muscleGroup": "Chest" }] }`
- **500**: Standard JSON error.

### `POST /api/sessions`

Creates an empty Pending session. The client supplies the browser-captured local start time and IANA zone. If title is omitted, the service creates a readable title from the local date and time-of-day label.

Request:

```json
{
  "title": "Morning workout",
  "startedAt": "2026-11-23T06:30:00+05:30",
  "timeZone": "Asia/Kolkata"
}
```

- **201**: `{ "session": { "id": 42, "title": "Morning workout", "status": "PENDING", "startedAt": "2026-11-23T01:00:00.000Z", "timeZone": "Asia/Kolkata", "completedAt": null, "exercises": [] } }`
- **400**: Invalid date/time, title, or IANA time-zone value.
- **500**: Standard JSON error.

### `GET /api/sessions?status=PENDING|COMPLETED`

Lists local sessions, newest first. `status` is optional.

- **200**: `{ "sessions": [{ "id": 42, "title": "Morning workout", "status": "PENDING", "startedAt": "2026-11-23T01:00:00.000Z", "timeZone": "Asia/Kolkata", "timeOfDay": "morning", "exerciseCount": 0 }] }`
- **400**: Invalid status filter.
- **500**: Standard JSON error.

### `GET /api/sessions/{sessionId}`

Returns session details, ordered exercises, and sets.

- **200**: `{ "session": { "id": 42, "title": "Morning workout", "status": "COMPLETED", "startedAt": "2026-11-23T01:00:00.000Z", "timeZone": "Asia/Kolkata", "timeOfDay": "morning", "completedAt": "2026-11-23T02:00:00.000Z", "exercises": [{ "id": 91, "exercise": { "id": 7, "name": "Dumbbell chest press", "muscleGroup": "Chest" }, "orderIndex": 0, "sets": [{ "setNumber": 1, "weightKg": 40, "reps": 15 }] }] } }`
- **404**: Session does not exist in this installation.
- **500**: Standard JSON error.

### `PATCH /api/sessions/{sessionId}`

Updates session metadata. At least one field is required. `title` may be renamed; `startedAt` and `timeZone` may be edited together. Status changes only through the completion operation.

Request example: `{ "title": "Push day" }`

- **200**: `{ "session": { "id": 42, "title": "Push day", "status": "PENDING", "startedAt": "2026-11-23T01:00:00.000Z", "timeZone": "Asia/Kolkata", "completedAt": null } }`
- **400**: Invalid or empty patch.
- **404**: Session does not exist.
- **500**: Standard JSON error.

### `POST /api/sessions/{sessionId}/exercises`

Adds a catalog exercise and its complete set list atomically. `orderIndex` is assigned by the service.

Request:

```json
{
  "exerciseId": 7,
  "sets": [
    { "weightKg": 40, "reps": 15 },
    { "weightKg": 45, "reps": 12 },
    { "weightKg": 50, "reps": 10 }
  ]
}
```

- **201**: `{ "exercise": { "id": 91, "exerciseId": 7, "orderIndex": 0, "sets": [{ "setNumber": 1, "weightKg": 40, "reps": 15 }] } }`
- **400**: Unsupported exercise, empty/malformed sets, non-positive/non-finite weight, or non-positive/non-integer reps.
- **404**: Session does not exist.
- **500**: Standard JSON error.

### `PUT /api/sessions/{sessionId}/exercises/{sessionExerciseId}`

Replaces one exercise occurrence's catalog selection and complete ordered set list. Other session exercises retain their order.

- **Request**: `{ "exerciseId": 7, "sets": [{ "weightKg": 25, "reps": 15 }, { "weightKg": 30, "reps": 12 }, { "weightKg": 45, "reps": 10 }] }`
- **200**: `{ "exercise": { "id": 91, "exerciseId": 7, "orderIndex": 0, "sets": [...] } }`
- **400**: Invalid catalog reference or set values.
- **404**: Session or exercise does not exist in the session.
- **500**: Standard JSON error.

### `DELETE /api/sessions/{sessionId}/exercises/{sessionExerciseId}`

Removes one exercise occurrence and its sets.

- **200**: `{ "deleted": true }`
- **404**: Session or exercise does not exist in the session.
- **500**: Standard JSON error.

### `POST /api/sessions/{sessionId}/complete`

Marks a Pending session Completed and sets `completedAt`. Repeating the request for an already completed session returns its current completed state.

- **200**: `{ "session": { "id": 42, "status": "COMPLETED", "completedAt": "2026-11-23T02:00:00.000Z" } }`
- **404**: Session does not exist.
- **500**: Standard JSON error.

### `DELETE /api/sessions/{sessionId}`

Deletes the session and cascades to its session exercises and sets.

- **200**: `{ "deleted": true }`
- **404**: Session does not exist.
- **500**: Standard JSON error.

### `POST /api/sessions/parse`

Parses the original natural-language text, validates it, then persists a valid workout or returns a reason/clarification without writing. The backend supplies the catalog and user-selected provider/model to the LLM adapter. The model returns structured JSON only and has no database access. Zod validation and deterministic domain checks happen before persistence.

Request:

```json
{
  "text": "I did 3 sets of chest press at 50kg for 10 reps",
  "timeZone": "Asia/Kolkata",
  "submittedAt": "2026-11-23T06:30:00+05:30"
}
```

`submittedAt` and `timeZone` are captured by the browser on every submission. The parser uses date/time stated in the sentence when present and otherwise uses this captured submission time. `targetSessionId` is optional and is used when the user selects one of multiple matching sessions; the original sentence is resubmitted with that ID. The backend reparses and revalidates before saving.

- **201**: New session created: `{ "outcome": "saved", "sessionId": 42, "created": true, "exercise": { "name": "Chest press machine", "sets": [...] } }`
- **200**: Existing session updated: `{ "outcome": "saved", "sessionId": 42, "created": false, "exercise": { "name": "Chest press machine", "sets": [...] } }`.
- **200**: More information is needed: `{ "outcome": "needs_clarification", "reason": "missing_reps", "message": "How many repetitions did you complete?", "originalText": "..." }`. No data is written.
- **200**: Multiple sessions match: `{ "outcome": "choose_session", "message": "Which session should receive this exercise?", "matches": [{ "sessionId": 42, "title": "Morning workout", "startedAt": "...", "status": "PENDING" }] }`. No data is written until the selected ID and original text are resubmitted.
- **400**: Negative/non-positive weight, unsupported exercise, malformed request, or invalid set values. No workout data is written; response explains the correction.
- **404**: Explicit target session does not exist.
- **500**: Sanitized provider or internal failure. No unvalidated content is written.

### LLM Output Validation Boundary

The LLM result uses a Zod discriminated union for parsed, clarification, unsupported exercise, and invalid input outcomes. Parsed data includes catalog exercise identifier(s), set values, and optional date/time details. The provider adapter and parser have no repository dependency. After schema parsing, the workout service verifies catalog IDs, finite positive weights, positive integer reps, set ordering, target-session existence, and match cardinality before one database transaction. Any failed validation prevents writes.
