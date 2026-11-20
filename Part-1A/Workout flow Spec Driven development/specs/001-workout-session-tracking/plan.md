# Implementation Plan: Workout Session Tracking

**Branch**: `001-workout-session-tracking` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-workout-session-tracking/spec.md`

## Summary

Build a single-user workout tracker with a React/Vite frontend, Node.js/Express
JSON API, and SQLite persistence. Sessions use the `title` field, defaulted to
the time-of-day label alone. Exercise entries support one or more sets, three
prefilled but removable rows, and weights in 0.1 kg increments. History is a
newest-first scrollable list without search or filters. The delivery target
includes at least 85% statement coverage in each critical coverage area and
success plus invalid-input tests for every API method/path.

## Technical Context

**Language/Version**: JavaScript (ES modules); Node.js LTS; browser JavaScript

**Primary Dependencies**: React, Vite, Express; a maintained SQLite driver; React
reducer for workout state; Vitest and React Testing Library for frontend tests;
Node test runner and coverage tooling for backend tests

**Storage**: SQLite database stored locally for the single-device v1 application

**Testing**: Backend service/validator unit tests, per-operation API contract
tests, frontend reducer and user-facing workflow tests; at least 85% statement
coverage separately in backend services, request validators, and critical
frontend workout state transitions

**Target Platform**: Modern desktop and mobile browsers on the same device that
stores the local application data; no cross-device sync in v1

**Project Type**: Web application with separate frontend and backend projects

**Performance Goals**: At least 90% of representative users save a set in under
five seconds and locate a target session and identify its details in under 30
seconds. At least 90% can complete the first workout without assistance.

**Constraints**: REST resource semantics and JSON responses; standard status
codes 200, 201, 204, 400, 404, and 500. A 204 response has no body; all other
responses use JSON. Every API method/path has success and invalid-input test
coverage with status assertions. Inputs are validated in the API and core
invariants are enforced in SQLite. Exercise/set writes are atomic. One user per
device without sign-in; multiple Pending sessions are allowed. History has no
search or filters in v1.

**Scale/Scope**: One local user, a predefined exercise catalog, and no
product-defined limit on sessions, exercise entries, or sets.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Modular architecture**: PASS. Frontend UI/state, API routing, domain
  services, validation, and persistence are separate modules.
- **Stack**: PASS. React with Vite; Node.js with Express; SQLite.
- **RESTful APIs**: PASS. Resource-based JSON endpoints use standard methods and
  status codes; 204 deletion responses are bodyless by definition.
- **Fast logging**: PASS. The active-session workflow prioritizes set entry and
  must meet the under-five-second usability criterion.
- **Validation and testing**: PASS. Boundary validation and SQLite constraints
  enforce set rules; every API operation has success and invalid-input contract
  coverage; critical areas have separate ≥85% statement coverage targets.
- **Security and simplicity**: PASS. The local API binds to loopback; v1 has no
  sign-in or secret configuration and uses the smallest maintainable design.

No constitution gate violations identified after design review.

## Project Structure

### Documentation (this feature)

```text
specs/001-workout-session-tracking/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md                 # Regenerate with $speckit-tasks after this plan
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── db/
│   │   ├── connection.js
│   │   ├── migrations/
│   │   └── seed/
│   ├── modules/
│   │   ├── exercises/
│   │   └── sessions/
│   │       ├── session.routes.js
│   │       ├── session.controller.js
│   │       ├── session.service.js
│   │       ├── session.repository.js
│   │       └── session.validation.js
│   └── middleware/
│       └── error-handler.js
└── tests/
    ├── unit/
    ├── integration/
    └── contract/

frontend/
├── src/
│   ├── app/
│   ├── features/
│   │   └── workouts/
│   │       ├── components/
│   │       ├── pages/
│   │       ├── workoutReducer.js
│   │       └── workoutApi.js
│   └── shared/
└── tests/
    ├── unit/
    └── integration/
```

**Structure Decision**: Use separate `frontend/` and `backend/` projects to
preserve frontend/backend separation. Organize backend code by domain, with a
service boundary between HTTP handlers and SQLite access. Keep workout
transitions in a reducer; add shared context only if state crosses distant
component boundaries.

## Complexity Tracking

No constitution violations require justification.
