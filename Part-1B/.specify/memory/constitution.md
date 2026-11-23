<!--
Sync Impact Report
Version change: scaffold (unversioned) → 1.0.0
Modified principles: none; initial constitution established
Added sections: Core Principles; Technology and Architecture; Quality and Security
Removed sections: none
Follow-up TODOs: confirm original ratification date
-->
# Workout Tracker Constitution

## Core Principles

### I. Modular Architecture and Separation of Concerns
The application MUST use modular architecture. Frontend components, state management,
API routes, domain logic, persistence, and external service integrations MUST have
clear responsibilities and boundaries. Prefer the simplest maintainable design that
meets the product requirements; added complexity MUST have a documented need.

### II. Fast, Focused Workout Logging
The first release MUST focus on logging workout sessions, exercises within a session,
and sets containing weight and repetitions. Exercises generally have three sets, while
the data model MUST permit a different set count when the workout requires it. The
primary action of logging a set during a workout MUST take under five seconds in
usability acceptance checks. Features outside this flow require a separate specification.

### III. Safe Natural-Language Interpretation
The system MUST use an external LLM, such as Gemini or OpenAI, to parse natural-language
workout input. LLM calls MUST be made by the backend, and API keys MUST NOT be exposed
to clients or committed in source code. The LLM MUST return structured JSON only and
MUST NEVER write directly to the database. Backend domain logic MUST validate the
structured result before any persistence. The system MUST reject negative weights,
reject exercises outside the predefined catalog, and request clarification when input
is vague or cannot be mapped unambiguously.

### IV. Explicit API and Reusable UI Contracts
The frontend MUST use React with reusable components and maintainable state management.
The backend MUST use Node.js with Express. REST endpoints MUST use HTTP methods according
to resource semantics and return appropriate success, client-error, and server-error
status codes. Request and response shapes MUST be documented and validated at API
boundaries.

### V. Verified Behavior and Maintainability
Input validation and error handling MUST be applied at trust boundaries and failures
MUST be returned in a predictable form without leaking secrets. Critical domain logic,
including workout validation and LLM-result validation, MUST have automated tests.
Quality is measured by: all critical-logic tests passing; zero accepted negative weights
or non-catalog exercises; ambiguous input resulting in clarification; no client-visible
LLM secrets; and set logging completing in under five seconds in acceptance checks.

## Technology and Architecture

The required stack is React for the frontend and Node.js with Express for the backend.
Persistence MUST be performed only by trusted backend application logic after input
validation. External LLM provider access MUST be isolated behind a backend integration
boundary so provider details and credentials do not leak into frontend code or domain
rules.

## Quality and Security

All user and external-service input MUST be treated as untrusted. Validation failures
MUST prevent persistence and return actionable errors or clarification prompts. Secrets,
including LLM API keys, MUST be supplied through secure runtime configuration and MUST
NOT appear in source code, client bundles, logs, or API responses. Solutions MUST favor
simple, maintainable implementations and add complexity only to satisfy a stated need.

## Governance

This constitution governs feature specifications, implementation plans, code changes,
and reviews. Amendments MUST be documented in this file and reviewed for their impact
on existing requirements. Versioning follows semantic versioning: MAJOR for incompatible
governance changes, MINOR for new or materially expanded principles, and PATCH for
clarifications that do not change obligations. Every implementation review MUST check
applicable principles, validation and error behavior, security boundaries, and critical
logic tests. Quality standards stated here are acceptance criteria and MUST be verified
for changes that affect them.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2026-11-23
