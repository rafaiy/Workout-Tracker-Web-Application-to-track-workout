<!--
Sync Impact Report
Version change: unresolved → 1.0.0 (initial adoption)
Modified principles: none (initial constitution)
Added sections: Core Principles; Technology and Security; Quality Standards;
  Governance
Removed sections: none
Follow-up TODOs: Confirm the original ratification date and replace
  TODO(RATIFICATION_DATE).
-->
# Workout Tracker Constitution

## Core Principles

### I. Modular Architecture and Separation of Concerns
The application MUST use modular architecture with clear boundaries between
frontend, backend, domain logic, and persistence. React components MUST be
reusable and focused; state management MUST keep state ownership explicit and
use the simplest maintainable approach that supports the feature. Node.js with
Express MUST provide the backend. Changes MUST keep UI, business rules, and
transport concerns independently understandable.

### II. RESTful, Predictable APIs
Backend endpoints MUST follow REST resource semantics, use appropriate HTTP
methods, and return standard, meaningful status codes. Request and response
contracts MUST be consistent and documented alongside the feature. Invalid
input and operational failures MUST produce safe, actionable error responses
without exposing internal details.

### III. Fast Workout Logging
The primary workflow MUST let a user log a workout session and add exercises to
that session. Each exercise MUST support a default of three sets, while allowing
the user to record each set's weight and repetitions. Logging one set during an
active workout MUST take under five seconds in usability evaluation. The v1
interface MUST prioritize this workflow and avoid features that add friction to
it.

### IV. Validated Behavior and Critical Tests
All external input MUST be validated at the application boundary, including
set weight and repetition values. Critical domain logic MUST have automated
tests, including workout/session association and set recording. Tests MUST
verify expected behavior and important invalid-input and error cases. Changes
MUST preserve a practical way to run the relevant test suite.

### V. Security and Simplicity
Secrets MUST NOT be committed to source code; configuration containing secrets
MUST be supplied through an appropriate runtime mechanism. The implementation
MUST prefer the smallest maintainable design that meets the product needs.
Dependencies, abstractions, and features MUST have a clear current use; speculative
complexity requires documented justification.

## Technology and Security

The frontend MUST use React. The backend MUST use Node.js and Express. All
persisted or transmitted workout data MUST be handled through validated
contracts. Error messages and logs MUST NOT include secrets. Any authentication
or authorization added to the product MUST be enforced on the server for
protected workout data.

## Quality Standards

- In usability evaluation, at least 90% of representative participants MUST
  record a set in under five seconds, measured from opening the active session
  view to successful save feedback.
- All critical workout domain rules MUST have automated test coverage; the
  critical test suite MUST pass before a change is considered complete.
- Every API route MUST have coverage for its success response and invalid-input
  response, with status codes asserted.
- Valid set entries MUST persist and be reflected in the session after save;
  failed saves MUST provide visible feedback and MUST NOT appear as successful.
- Source control and release artifacts MUST contain zero committed credentials
  or secret values.

## Development Workflow

Feature work MUST preserve the principles and quality standards in this
constitution. Reviews MUST check architecture boundaries, API semantics,
validation, errors, critical tests, secret handling, and the set-logging time
target when the primary workflow changes. Any exception MUST document its
scope, reason, and follow-up plan in the relevant feature documentation.

## Governance

This constitution governs product and engineering decisions for the workout
tracker. Amendments MUST be made as a reviewed change to this document and MUST
include a version update and updated amendment date. Versioning follows
semantic versioning: MAJOR for incompatible governance changes, MINOR for new
principles or materially expanded requirements, and PATCH for clarifications
that do not change requirements. Every feature review MUST assess compliance
with the applicable principles and measurable standards. Exceptions require
documented rationale and a follow-up plan.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original date unknown | **Last Amended**: 2026-11-20
