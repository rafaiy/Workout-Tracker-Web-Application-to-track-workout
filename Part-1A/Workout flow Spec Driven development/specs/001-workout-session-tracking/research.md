# Research: Workout Session Tracking

## Decisions

### Frontend layout and workout state

- **Decision**: Use the standard React template supplied by Vite. Keep workout
  transitions in a pure reducer; use local component state for temporary input
  and add Context only if distant components need shared state. The reducer
  supports adding and removing sets while keeping at least one set.
- **Rationale**: Session creation, variable sets, completion, edits, and deletion
  are related transitions that benefit from one explicit state model. A
  separate state library adds complexity without a demonstrated v1 need.
- **Alternatives considered**: Component-local duplicated transition logic or a
  third-party global store. The former risks inconsistent transitions; the
  latter is unnecessary for the single-user v1 scope.
- **References**: [Vite guide](https://vite.dev/guide/),
  [React: Managing State](https://react.dev/learn/managing-state),
  [React: Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context).

### Backend routing, errors, and API test coverage

- **Decision**: Group routes by resource with Express routers. Validate
  parameters, query strings, and bodies at the request boundary. Every HTTP
  method/path MUST have contract tests for a successful response and invalid
  input with asserted status codes. Collection routes accept no query
  parameters; unexpected query parameters return 400, providing a defined
  invalid-input case. Malformed path identifiers return 400; valid but missing
  identifiers return 404.
- **Rationale**: This meets the constitution's per-route testing requirement
  and keeps route, domain, and persistence failures distinguishable.
- **Alternatives considered**: Testing route groups with only representative
  cases; rejected because it does not guarantee the constitution's coverage for
  every operation.
- **References**: [Express routing](https://expressjs.com/en/guide/routing/),
  [Express error handling](https://expressjs.com/en/guide/error-handling/),
  [Node.js test runner](https://nodejs.org/api/test.html).

### SQLite integrity and write behavior

- **Decision**: Enable foreign-key enforcement on every SQLite connection; use
  NOT NULL, CHECK, and UNIQUE constraints as a second validation layer; save an
  exercise and its complete set list in one transaction; cascade session
  deletion to its exercise and set rows.
- **Rationale**: These rules preserve relational integrity and prevent partial
  exercise saves or orphaned history when a write fails.
- **Alternatives considered**: Application-only checks and separate writes;
  rejected because they permit invalid data and partial saves.
- **References**: [SQLite foreign keys](https://www.sqlite.org/foreignkeys.html),
  [SQLite CREATE TABLE](https://www.sqlite.org/lang_createtable.html),
  [SQLite transactions](https://www.sqlite.org/lang_transaction.html).

### Weight and set validation

- **Decision**: Accept finite `weightKg` values that are zero or greater and
  multiples of 0.1 kg, with no product-defined maximum. Validate in the API and
  enforce the same invariant in persistence. Each exercise has at least one
  set; the UI starts with three rows and permits removing rows down to one.
- **Rationale**: A 0.1 kg increment is precise enough for common gym weights and
  gives form controls and tests a deterministic rule. The lower bound and
  minimum set count match the clarification.
- **Alternatives considered**: Whole kilograms only (too restrictive) and any
  arbitrary decimal (no consistent step for validation or form behavior).

### Session titles, local time, and history

- **Decision**: Use `title` as the canonical field. Default it to the time-of-day
  label alone at creation. Store `startedAt` as ISO 8601 with UTC offset, and
  derive the local date/time and label from its recorded offset. Show a
  newest-first scrollable history list without search or filters.
- **Rationale**: The title rule and history behavior now match the clarified
  requirements. Offset-bearing timestamps preserve the local clock context
  used by the label boundaries if the user later changes device time zone.
- **Alternatives considered**: Bare UTC interpreted in the current time zone
  (could shift historical labels) and adding search/filter controls (explicitly
  out of v1 scope).

### Exercise catalog metadata

- **Decision**: Store each catalog item's primary `muscleGroup` in SQLite and
  include it in catalog/session detail data, but do not present it in the v1 UI
  or use it to filter exercise choices.
- **Rationale**: Preserves the supplied schema without adding interaction
  complexity beyond the predefined exercise picker.

### Local single-user API boundary

- **Decision**: Run the API on loopback and keep the SQLite file local to that
  service. Do not add sign-in or expose the API to the local network by default.
- **Rationale**: The v1 scope is one user per device without sign-in; loopback
  limits access to that device.
- **Alternatives considered**: Network-accessible API without authentication;
  rejected because another device could access or alter private history.

## Implementation selections

- **Runtime version**: Use the Node.js LTS release supported by the environment
  when implementation begins and pin it in the project runtime configuration.
- **Frontend test tooling**: Vitest with React Testing Library for reducer and
  user-visible interaction tests.
- **Backend test tooling**: Node's built-in test runner for unit and integration
  tests, with an HTTP test client for Express contract tests.
- **SQLite driver**: Select a maintained driver compatible with the pinned
  Node.js LTS runtime. Keep repositories independent of driver-specific APIs.

Package versions and driver choice are implementation setup decisions, not
product behavior decisions, and do not block the design.
