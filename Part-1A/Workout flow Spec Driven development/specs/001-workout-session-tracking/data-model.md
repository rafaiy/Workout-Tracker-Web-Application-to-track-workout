# Data Model: Workout Session Tracking

The model follows the user's schema. SQLite constraints protect relational and
value invariants; API validators provide user-facing feedback before writes.

## ExerciseCatalog

Represents a predefined movement selectable when building a session.

| Field | Type / rule | Meaning |
|---|---|---|
| `id` | Integer primary key | Stable catalog item identifier. |
| `name` | Required unique text | Display name, such as Dumbbell Chest Press. |
| `muscleGroup` | Required text | Primary muscle group stored as metadata only; v1 does not display or filter by it. |

Seed the catalog with chest press machine, back extension, cable bench press,
dumbbell chest press, chest fly, and shoulder press. Assign primary groups from
the existing catalog data; group values do not affect v1 selection behavior.
Users cannot create or edit catalog entries in v1.

## WorkoutSession

Represents one started workout. Multiple Pending sessions may coexist.

| Field | Type / rule | Meaning |
|---|---|---|
| `id` | Integer primary key | Stable session identifier. |
| `title` | Required text | User-editable session title; defaults to the time-of-day label alone. |
| `status` | `PENDING` or `COMPLETED` | Lifecycle state. |
| `startedAt` | Required ISO 8601 timestamp with UTC offset | Start instant and original local clock context. |
| `completedAt` | Nullable ISO 8601 timestamp with UTC offset | Null while Pending; set on completion. |

**Constraints and transitions**:

- New sessions are `PENDING` with `completedAt = null`.
- Completing a Pending session changes status to `COMPLETED` and sets
  `completedAt`. Repeating completion returns the current completed record
  without changing its original completion time.
- A completed session has non-null `completedAt`; a Pending session has null
  `completedAt`.
- A session may be completed with zero exercises, so an accidentally started
  workout can be closed.
- The default `title` is the time-of-day label at session creation. It is a
  title snapshot; changing `startedAt` later does not automatically rename it.
- Local date, displayed start time, and time-of-day label derive from
  `startedAt`. Labels use half-open ranges: [05:00, 12:00) Morning Workout,
  [12:00, 17:00) Afternoon Workout, [17:00, 21:00) Evening Workout, and
  [21:00, 05:00) Night Workout.

## SessionExercise

Represents one ordered occurrence of a catalog item in a workout. Repeated
occurrences of the same exercise are distinct rows.

| Field | Type / rule | Meaning |
|---|---|---|
| `id` | Integer primary key | Stable session exercise identifier. |
| `sessionId` | Required foreign key to `WorkoutSession.id`, cascade on delete | Owning workout. |
| `exerciseId` | Required foreign key to `ExerciseCatalog.id`, restrict catalog deletion | Selected movement. |
| `orderIndex` | Required non-negative integer, unique within `sessionId` | Display order within the session. |

The application assigns `orderIndex` in the order entries are added.

## ExerciseSet

Represents one recorded set for a session exercise.

| Field | Type / rule | Meaning |
|---|---|---|
| `id` | Integer primary key | Stable set identifier. |
| `sessionExerciseId` | Required foreign key to `SessionExercise.id`, cascade on delete | Parent exercise entry. |
| `setNumber` | Required positive integer, unique within `sessionExerciseId` | Display order within the exercise. |
| `weightKg` | Required finite numeric value, non-negative, multiple of 0.1; no product-defined maximum | Set weight in kilograms; zero is allowed. |
| `reps` | Required positive integer | Repetition count. |

Each session exercise MUST have at least one set. The form starts with three
rows, allows removal down to one, and permits any number of added sets.

## Relationships and deletion

```text
ExerciseCatalog 1 ─── * SessionExercise * ─── 1 WorkoutSession
                              │
                              1
                              │
                              * ExerciseSet
```

Deleting a workout cascades to its session exercise and set records. Catalog
items are seeded and cannot be deleted through the user-facing API. Adding an
exercise and its complete set list is one transaction; a failed set insert
rolls the whole operation back. Replacing a set list is also atomic.

## User identity and ownership

V1 has one local user per device and no sign-in. Ownership is provided by the
local application boundary rather than a `userId` column. The service binds to
loopback and stores its SQLite database on that device. Multi-user and
cross-device synchronization require a future model change.
