# Feature Specification: Workout Session Tracking

**Feature Branch**: `001-workout-session-tracking`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "Build a workout tracker for individual users. Users can create sessions, record day/date/time, add catalog exercises with three or more sets, record weight and reps, finish or leave sessions pending, browse/edit/rename/delete history, and use natural-language input to create sessions or add an exercise to an existing same-day, same-time-of-day session."

## Clarifications

### Session 2026-11-23

- Q: Which local-time ranges should define the session labels used for history and matching natural-language entries? → A: Morning 05:00–11:59, afternoon 12:00–16:59, evening 17:00–20:59, and night 21:00–04:59.
- Q: How should the app identify the individual who owns a workout session? → A: Treat each installation as a single-user personal tracker with no sign-in.
- Q: When the parser asks for clarification, how should the user provide missing information or choose among matching sessions? → A: Submit the original sentence; save it if accepted, otherwise explain why it was not accepted so the user can modify it and resubmit.
- Q: Should a set with zero kilograms be accepted when repetitions are positive? → A: Require both weight and repetitions to be greater than zero.
- Q: Where should the app get the local date, time, and time zone when a workout description omits them? → A: Use the device's local date, time, and IANA time zone at submission.
- Q: Does local-only access mean other devices cannot reach the app, while the backend may still send workout text to the required external LLM? → A: Keep app access local-only inbound; permit backend outbound LLM calls using the user's generated key and selected model.
- Q: How should acceptance checks measure the 90% first-time completion target and the 30-second history target? → A: Define the measurement method after launch.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Log and Complete a Workout (Priority: P1)

As an individual user, I want to start a workout, add catalog exercises and their sets, and mark the workout complete so my workout is saved with its full details.

**Why this priority**: Recording workouts is the core value of the application.

**Independent Test**: Start a session, add two exercises with different set counts and values, complete it, and confirm the session and all set details are available in history.

**Acceptance Scenarios**:

1. **Given** the user is on the home page, **When** they start a session, **Then** a session is created with its calendar date, day, start time, and a time-of-day label such as morning or evening.
2. **Given** a session is in progress, **When** the user chooses an exercise from the predefined catalog and enters the number of sets, **Then** the session allows a weight and repetition count for every set before the exercise is added.
3. **Given** an exercise has its initial three sets, **When** the user needs more, **Then** they can add further sets and record a weight and repetitions for each.
4. **Given** a session has one or more exercises, **When** the user completes the workout, **Then** its status becomes Completed and its session and exercise details appear in history.

---

### User Story 2 - Review and Manage Workout History (Priority: P2)

As an individual user, I want to see completed and unfinished sessions and manage their details so my history stays useful and accurate.

**Why this priority**: Reviewing prior workouts and recovering unfinished sessions makes logging useful over time.

**Independent Test**: Create one completed and one unfinished session, find both in history with correct statuses, open details, then rename, edit, and delete a session.

**Acceptance Scenarios**:

1. **Given** the user has completed and unfinished sessions, **When** they open history, **Then** each session is listed with its date, time-of-day label, name, and Pending or Completed status.
2. **Given** the user selects a history item, **When** its detail view opens, **Then** it shows the session date and time and each exercise with its sets, weights, and repetitions.
3. **Given** a session is Pending, **When** the user leaves or returns to the application, **Then** it remains stored and visible as Pending in history until completed or deleted.
4. **Given** the user edits or renames a session, **When** they save the change, **Then** history and the detail view show the updated information.
5. **Given** the user chooses to delete a session, **When** they confirm deletion, **Then** the session and its associated exercises and sets are removed from their history.
6. **Given** the user views session history, **When** a session appears in the list, **Then** Pending sessions have a yellow badge and Completed sessions have a green badge.

---

### User Story 3 - Log by Describing a Workout (Priority: P1)

As an individual user, I want to describe what I did in natural language so the application can prepare the session or exercise for me without manual entry of every field.

**Why this priority**: Natural-language logging is a key requested way to reduce effort during a workout.

**Independent Test**: Submit a clear sentence describing an exercise and its sets, verify a matching catalog exercise and values are recorded, then submit vague and invalid examples and verify they are not saved without resolution.

**Acceptance Scenarios**:

1. **Given** a valid sentence identifies a catalog exercise, set count, and set values, **When** the user submits it, **Then** the application creates a session with the described exercise and set data and confirms what was recorded.
2. **Given** a sentence contains a negative weight such as "-5 kg", **When** the user submits it, **Then** the application rejects it with a clear validation message and does not save the invalid data.
3. **Given** a sentence is vague, such as "I did some chest today", **When** the user submits it, **Then** the application does not guess or save an unconfirmed exercise, explains what information is missing or ambiguous, and leaves the original sentence available for editing and resubmission.
4. **Given** the user describes an exercise and a session already exists for that same calendar day and time-of-day period, **When** the description is submitted, **Then** the exercise is added to that existing session rather than creating a duplicate session.
5. **Given** a description names an exercise that is not in the predefined catalog, **When** the user submits it, **Then** the application rejects it, explains why it was not accepted, and lets the user modify and resubmit the sentence.
6. **Given** multiple sessions match the described date and time-of-day period, **When** the user submits the sentence, **Then** the application explains that the target session is ambiguous, presents the matching sessions for selection, and saves nothing until the user selects one.

### Edge Cases

- A session is started but contains no exercises when the user leaves; it remains Pending and visible in history.
- A set has missing, zero, negative, or malformed weight or repetition values; incomplete or invalid sets are not accepted as complete records, and the user sees which value needs correction.
- A description names a supported exercise but omits a required value such as reps; the application explains the missing value, preserves the original sentence for editing, and records nothing until the user resubmits a complete sentence.
- Multiple sessions already exist on the same day and time-of-day period; the application explains the ambiguity and presents matching sessions for selection rather than silently choosing one.
- A description maps to more than one catalog exercise; the application explains the ambiguity and lets the user modify and resubmit the sentence rather than guessing.
- Each installation has one local user and no account switching; its workout history belongs only to that user.
- A request from another device or the public internet attempts to reach the locally running application; it receives no session data and cannot change sessions. This restriction does not block backend outbound requests to the user's configured LLM provider.
- The natural-language interpretation service is unavailable or returns unusable content; no unvalidated session data is saved and the user receives a recoverable error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST let an individual user start a workout session and record its calendar day, date, and start time in the device's local time zone at session creation.
- **FR-002**: The system MUST assign a time-of-day label based on the session start time in the user's local time: morning is 05:00–11:59, afternoon is 12:00–16:59, evening is 17:00–20:59, and night is 21:00–04:59.
- **FR-003**: The system MUST allow the user to add any number of exercises to a session by selecting from a predefined catalog that includes options such as chest press machine, back extension, and cable bench press.
- **FR-004**: The system MUST let the user specify the set count for each exercise, defaulting to three sets while allowing additional sets.
- **FR-005**: The system MUST record a weight in kilograms greater than zero and a whole-number repetition count greater than zero for each set, and associate each set with its exercise and session.
- **FR-006**: The system MUST preserve a started session as Pending until the user marks it complete; completing it MUST change its status to Completed.
- **FR-007**: The system MUST show Pending and Completed sessions in a history list with enough date and time information to distinguish sessions.
- **FR-008**: The system MUST show session details including all exercises and each set's weight and repetitions.
- **FR-009**: The system MUST allow the user to edit and rename their sessions and delete a session with its associated exercises and sets.
- **FR-010**: The system MUST accept natural-language workout descriptions and interpret them into session, exercise, and set information for the user.
- **FR-011**: The system MUST save and confirm a natural-language description only when its interpretation is complete, unambiguous, catalog-valid, and passes workout-rule validation. Otherwise, it MUST save nothing and return a clear reason and correction path.
- **FR-012**: The system MUST reject negative weights with a clear error and MUST NOT save the invalid workout data.
- **FR-013**: When a description is vague, incomplete, ambiguous, or identifies an unsupported exercise, the system MUST explain why it was not accepted, identify the information needed to correct it, keep the original sentence editable, and allow the user to resubmit it. The system MUST NOT invent missing details or save uncertain data.
- **FR-014**: If exactly one session exists for the user's described calendar day and matching time-of-day period, the system MUST add the described exercise to that session. If no matching session exists, it MUST create one. If multiple sessions match, it MUST explain the ambiguity, present the matching sessions for selection, and save nothing until the user selects one.
- **FR-015**: Each installation MUST support one local user without sign-in or account switching. The frontend and backend MUST run on the same device and MUST NOT accept session operations from other devices over a network. This inbound restriction MUST NOT block backend outbound requests to the user's configured external LLM provider.
- **FR-016**: If natural-language interpretation is unavailable or invalid, the system MUST preserve existing session data, save no unvalidated content, and present a clear error that allows retry or manual entry.
- **FR-017**: The history list MUST show Pending sessions with a yellow badge and Completed sessions with a green badge.
- **FR-018**: The natural-language parser MUST use the user's configured external LLM provider and selected model. The user-generated API key MUST be supplied only through secure backend configuration and MUST NOT appear in frontend code, source code, logs, or responses. The workout sentence submitted for parsing is sent from the backend to that configured provider.

### Key Entities *(include if feature involves data)*

- **Local User**: The sole individual using one installation; no sign-in or account switching is provided.
- **Workout Session**: A local user's workout with a date, start time, the device's IANA time zone at session creation, a time-of-day label, optional name, status, and ordered exercises.
- **Exercise Catalog Entry**: A predefined supported exercise with a user-facing name.
- **Session Exercise**: An occurrence of a catalog exercise in a particular session, with its own ordered sets.
- **Set**: One exercise effort recorded with a weight in kilograms and a repetition count.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In usability acceptance checks, users can record a set during an active workout in under five seconds.
- **SC-002**: The post-launch usability target is for at least 90% of first-time users to create a session, add an exercise with three sets, and complete it without assistance. Define the participant cohort and measurement method after launch.
- **SC-003**: 100% of tested negative-weight and unsupported-exercise descriptions are rejected without saving invalid workout data.
- **SC-004**: 100% of tested vague or incomplete descriptions are rejected without saving uncertain data and return a clear reason plus the information needed for the user to edit and resubmit.
- **SC-005**: The post-launch usability target is for users to distinguish Pending from Completed sessions and find a selected session's exercise and set details in under 30 seconds. Define the participant cohort and measurement method after launch.
- **SC-006**: The application MUST accept session operations only from the same device; requests from other devices or the public internet MUST NOT read or change workout data. Backend outbound requests to the configured external LLM provider remain permitted for parsing.

## Assumptions

- Each application installation is used by one individual on one device; its frontend and backend run locally. Account creation, sign-in, account switching, and inbound network access are outside this feature.
- The local user supplies a generated API key and selects an external LLM model; the key is configured for backend-only use and natural-language workout text is sent to that provider for parsing.
- The evaluation protocol and participant cohort for the SC-002 and SC-005 post-launch usability targets will be defined after launch.
- Weight is entered and displayed in kilograms for this release; unit conversion is outside this feature.
- Weights are numeric values greater than zero; repetitions are whole-number counts greater than zero. Bodyweight and unloaded exercises are outside this release's set-weight rules.
- Three sets are the default, not a limit. The user may enter fewer or more sets.
- A session's time-of-day label is derived from its recorded start time using the device's local time zone captured at session creation and the fixed ranges in FR-002.
- For natural-language descriptions, an omitted date defaults to the device's current local date at submission, and an omitted time defaults to the device's current local time at submission. The device's IANA time zone is used for the session and for matching exercise additions.
- When multiple sessions match the same day and time-of-day period, the application presents the matching sessions and the user selects the intended session before saving.
- Natural-language submission saves a valid, fully specified interpretation after validation. If it is rejected, the original sentence remains editable and the user resubmits a corrected complete sentence; the application does not retain conversational clarification state.
- The feature requires an available external natural-language interpretation service. If it is unavailable, manual logging remains available.
