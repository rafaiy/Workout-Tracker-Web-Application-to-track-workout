# Data Model: Workout Session Tracking

## Entities

### ExerciseCatalog

Represents one supported, seeded exercise. It is read-only through the MVP API.

| Field | Type / constraint | Notes |
|---|---|---|
| `id` | Integer primary key | Stable identifier used in session records and validated parser output. |
| `name` | Text, required, unique | Canonical display name; seed includes chest press machine, back extension, cable bench press, dumbbell chest press, chest fly, and shoulder press. |
| `muscleGroup` | Text, required | Catalog grouping for display and parser context. |

### WorkoutSession

Represents a workout in this installation's sole local user's history. No account or owner identity is stored.

| Field | Type / constraint | Notes |
|---|---|---|
| `id` | Integer primary key | Session identifier. |
| `title` | Text, required | User-editable; generated on creation from local date and time-of-day label when not supplied. |
| `status` | Enum `PENDING` / `COMPLETED`, required | New sessions start Pending. |
| `startedAt` | ISO-8601 UTC text, required | Start instant derived from the browser-captured local date/time and offset. |
| `timeZone` | IANA zone name, required | Captured from the browser at creation; used to derive the session's local date and time bucket. |
| `completedAt` | ISO-8601 UTC text, nullable | Null while Pending; set when completed. |
| `createdAt` | ISO-8601 UTC text, required | Record creation timestamp. |
| `updatedAt` | ISO-8601 UTC text, required | Updated on edits and completion. |

### SessionExercise

Represents an occurrence of a catalog exercise in one session. Repeating the same catalog exercise in a session is allowed as a separate occurrence.

| Field | Type / constraint | Notes |
|---|---|---|
| `id` | Integer primary key | Session exercise identifier. |
| `sessionId` | Integer, required, FK to `WorkoutSession.id` | Delete cascades from session. |
| `exerciseId` | Integer, required, FK to `ExerciseCatalog.id` | Must resolve to a seeded catalog entry. |
| `orderIndex` | Integer, required, non-negative | Unique within a session; preserves display order. |

### ExerciseSet

Represents one set belonging to a session exercise.

| Field | Type / constraint | Notes |
|---|---|---|
| `id` | Integer primary key | Set identifier. |
| `sessionExerciseId` | Integer, required, FK to `SessionExercise.id` | Delete cascades through session exercise. |
| `setNumber` | Integer, required, positive | Unique within one session exercise; determines display order. |
| `weightKg` | Real, required, finite, `> 0` | Zero, negative, NaN, and infinite values are rejected. |
| `reps` | Integer, required, `> 0` | Whole-number repetition count. |

## Relationships and Constraints

- This installation has one local user's history. There is no `userId`, authentication identity, or account-switching model.
- One session has ordered session exercises; each occurrence references one catalog entry and contains one or more ordered sets when committed.
- `UNIQUE(sessionId, orderIndex)` preserves exercise ordering; `UNIQUE(sessionExerciseId, setNumber)` preserves set ordering.
- Enable SQLite foreign-key enforcement for every connection. Use cascading deletion from session to exercise to set; catalog deletion is not exposed in v1.
- Database checks enforce valid status, non-negative order indices, positive set numbers, finite positive weight (application-level finite check plus `CHECK(weightKg > 0)`), and positive reps. Validate IANA zones and timestamps in application schemas.
- New sessions have `status=PENDING` and `completedAt=NULL`. Completion changes status to `COMPLETED` and sets `completedAt`. Editing or deletion of completed sessions is allowed; reopening is not defined in v1.
- Persist a session and all child rows in one transaction. Any validation or insert failure rolls back the complete write.
- Derive local date, weekday, and time-of-day label from `startedAt` plus `timeZone`. Buckets are morning 05:00–11:59, afternoon 12:00–16:59, evening 17:00–20:59, and night 21:00–04:59.
- Suggested indexes: `WorkoutSession(startedAt DESC)`, `WorkoutSession(status, startedAt DESC)`, `SessionExercise(sessionId, orderIndex)`, and `ExerciseSet(sessionExerciseId, setNumber)`.

## Natural-Language Parse Result

This is an unpersisted validated service/API shape. It is a discriminated union:

- `parsed`: catalog exercise identifier, ordered set values, optional explicit local date/time, and enough context to resolve a session.
- `needs_clarification`: user-facing reason and required missing/ambiguous detail; contains no write instruction.
- `unsupported_exercise`: user-facing message and optional catalog suggestions; contains no write instruction.
- `invalid_input`: safe validation issue list; contains no write instruction.
- `choose_session`: matching session summaries for the user to choose from; contains no write instruction until a session ID is resubmitted with the original sentence.

Zod validates the provider response. Deterministic domain validation then checks catalog membership, finite positive weight, positive integer reps, date/time interpretation, and session match cardinality. The parser has no repository dependency. Only a valid proposal reaches the workout service for persistence.
