# Feature Specification: Workout Session Tracking

**Feature Branch**: `001-workout-session-tracking`

**Created**: 2026-11-20

**Status**: Draft

## Clarifications

### Session 2026-11-20

- Q: What field name and default text should a new workout session use? → A: Use `title`; default it to the time-of-day label alone, such as “Morning Workout.”
- Q: How should users find older sessions as their history grows? → A: Use a newest-first list with scrolling; do not add search or filters.
- Q: How should `muscleGroup` affect exercise selection? → A: Store the primary muscle group as catalog metadata only; do not display or filter by it in v1.
- Q: Can an exercise have fewer than three sets, or does it require at least three? → A: Allow one or more sets; prefill three and let users remove rows.
- Q: What weight precision should users be able to enter in kilograms? → A: Allow finite weights in 0.1 kg increments, zero or greater, with no product-defined maximum.

- Q: Can a user have multiple Pending sessions at once, or only one active session at a time? → A: A user can have several unfinished (Pending) sessions at once.
- Q: How should the app identify the individual user whose workout history it stores? → A: One user per device; no sign-in in v1.

**Input**: User description: "Build a workout tracker for individual users. Users can create a session, record its day, date, and time, add predefined exercises and choose a number of sets (three by default, with more allowed), enter weight and reps for each set, add multiple exercises, complete a workout, and review, rename, edit, or delete sessions in history. Started but unfinished sessions remain in history as Pending; completed sessions show as Completed. Sessions are labeled by time of day, such as morning or evening."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Log a workout session (Priority: P1)

As an individual user, I want to start a session, record exercises and their sets, and finish the workout so I can accurately capture what I did.

**Why this priority**: Recording a workout is the core value of the product and is useful without historical editing features.

**Independent Test**: Start a session, add two different exercises with different set counts and weight/repetition values, and complete it. The session and all entered values are available in history as Completed.

**Acceptance Scenarios**:

1. **Given** the user is ready to work out, **When** they start a session, **Then** a session is created with its local day, date, and start time and appears in history as Pending.
2. **Given** an active session, **When** the user chooses a predefined exercise, **Then** three sets are prefilled, the user can remove rows down to one set or add more, and they can enter the resulting sets before adding the exercise.
3. **Given** an exercise being entered, **When** the user records weight and repetitions for each set and adds the exercise, **Then** the exercise and its sets appear in the session.
4. **Given** an active session with one or more exercises, **When** the user completes the workout, **Then** its status becomes Completed and all session details are retained.
5. **Given** the user is entering a set, **When** they save valid weight and repetition values, **Then** the set is recorded with visible save feedback in under five seconds.

---

### User Story 2 - Review workout history (Priority: P2)

As an individual user, I want to browse completed and unfinished sessions and inspect their details so I can recall my training.

**Why this priority**: History makes logged workouts useful over time and ensures unfinished work is not lost.

**Independent Test**: Create one completed and one pending session, open history, and inspect each session's status and details.

**Acceptance Scenarios**:

1. **Given** the user has sessions, **When** they open history, **Then** each session is listed with its title, local date/time, time-of-day label, and Pending or Completed status.
2. **Given** a session in history, **When** the user opens its details, **Then** they can see its exercises and each set's weight and repetitions.
3. **Given** a session was started but not completed, **When** the user opens history, **Then** it remains listed as Pending with its saved details.
4. **Given** a Pending session in history, **When** the user chooses Resume, **Then** they can continue adding exercises and sets to that session or mark it Complete.
5. **Given** no sessions exist, **When** the user opens history, **Then** an empty state explains how to start a session.

---

### User Story 3 - Maintain a saved session (Priority: P3)

As an individual user, I want to rename, edit, or delete a session so my history remains accurate and organized.

**Why this priority**: Session maintenance improves the usefulness of history but is secondary to dependable logging and review.

**Independent Test**: Rename a session, change its recorded details, verify the changes in history, and delete a session after confirming the action.

**Acceptance Scenarios**:

1. **Given** a saved session, **When** the user renames it, **Then** the new name is shown in the history list and details.
2. **Given** a saved session, **When** the user edits its date/time or exercise/set details and saves, **Then** history and session details show the updated values.
3. **Given** a saved session, **When** the user chooses delete and confirms, **Then** the session and its associated exercises and sets are removed from their history.
4. **Given** the user begins deleting a session, **When** they cancel the confirmation, **Then** the session remains unchanged.

### Edge Cases

- If a session has no exercises, it remains Pending until completed; completion is available only when the user explicitly finishes the session. A user may have several unfinished Pending sessions at once.
- If the user leaves or closes the app during a session, previously saved session data remains Pending and is available on return.
- A set requires a finite weight in 0.1 kg increments, zero or greater, and a positive whole-number rep count; there is no product-defined weight maximum. Zero supports bodyweight or unloaded movements. Invalid or incomplete values cannot be saved; the displayed unit is kg for v1.
- If the same exercise is added more than once, each entry remains distinct and keeps its own sets and order.
- Sessions use the user's local date and time; the time-of-day label is derived from the session start time and remains consistent if the session is later completed.
- History is a newest-first scrollable list; users locate older sessions by scrolling. Search and filters are outside v1 scope.
- Deletion requires explicit confirmation to prevent accidental loss.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The user MUST be able to start a workout session without entering a title; the default title MUST be the session’s time-of-day label alone (for example, “Morning Workout”).
- **FR-002**: The system MUST record a session's local calendar day, date, and start time.
- **FR-003**: A newly started session MUST appear in history with Pending status before completion. A user MAY have multiple Pending sessions at the same time.
- **FR-004**: The user MUST be able to choose exercises from a predefined catalog that includes chest press machine, back extension, cable bench press, dumbbell chest press, chest fly, and shoulder press. Each catalog item MUST include a primary `muscleGroup` value stored as metadata; v1 MUST NOT display or filter by this field.
- **FR-005**: The user MUST be able to record one or more sets per exercise. Three set rows MUST be prefilled by default; the user MUST be able to remove rows down to one or add more before adding the exercise.
- **FR-006**: Each set MUST store a finite weight in kilograms in 0.1 kg increments, zero or greater with no product-defined maximum, and a repetition count.
- **FR-007**: The system MUST validate that set weight is finite, non-negative, and a multiple of 0.1 kg, and that repetitions are a positive whole number, before saving.
- **FR-008**: The user MUST be able to add any number of exercises to a session, including separate entries for repeated exercises.
- **FR-009**: The user MUST be able to add a fully entered exercise and its sets to the active session, and see the recorded data in that session.
- **FR-010**: The user MUST be able to complete an active session; completion MUST change its status from Pending to Completed and retain the session details.
- **FR-011**: The user MUST be able to view a newest-first, scrollable history list of their sessions, including both Pending and Completed sessions. Search and filters are outside v1 scope.
- **FR-012**: Each history item MUST display its title, date, start time, time-of-day label, and Pending or Completed status.
- **FR-013**: The time-of-day label MUST be derived from the session's local start time using these ranges: 05:00–11:59 Morning Workout; 12:00–16:59 Afternoon Workout; 17:00–20:59 Evening Workout; 21:00–04:59 Night Workout.
- **FR-021**: Pending sessions MUST be displayed with a yellow badge labeled Pending, and Completed sessions with a green badge labeled Completed.
- **FR-022**: The user MUST be able to resume a Pending session to add exercises and sets or mark it Complete.
- **FR-014**: The user MUST be able to open a session's detail view and inspect its exercises and each set's weight and repetitions.
- **FR-015**: The user MUST be able to rename a session by editing its title, edit its recorded date/time and exercise/set details, and save the changes.
- **FR-016**: The user MUST be able to delete a session only after confirming the deletion; canceling MUST preserve the session.
- **FR-017**: A session and its saved data MUST remain available in the user's history after leaving the active workout and returning later.
- **FR-018**: The system MUST provide clear validation and failure feedback and MUST NOT represent a failed save as successful.
- **FR-019**: The system MUST present an actionable empty state when the user has no sessions.
- **FR-020**: In v1, the application MUST support one individual user per device without sign-in, and session, exercise, and set data MUST remain within that user's local history.

### Key Entities

- **User**: The one individual using the app on a device in v1; no account or sign-in is required, and data is kept in that device's history.
- **Workout Session**: A workout record with a title, local date, start time, status (Pending or Completed), time-of-day label, and ordered exercise entries.
- **Exercise Catalog Item**: A predefined selectable movement, such as dumbbell chest press or back extension, with a primary muscle-group metadata value that is stored but not displayed or used for filtering in v1.
- **Session Exercise**: One occurrence of an exercise within a session, with an order and a collection of sets. Repeated catalog exercises create separate entries.
- **Set**: An ordered record within a session exercise containing a finite, non-negative weight in kilograms in 0.1 kg increments and a positive whole-number repetition count.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of representative users can save a set in under five seconds, measured from viewing the active session to receiving successful save feedback.
- **SC-002**: At least 90% of representative users can start a session, add an exercise with three sets, and complete it without assistance on their first attempt.
- **SC-003**: 100% of valid set entries in acceptance testing are displayed with the same weight and repetition values after save and when reopened from history.
- **SC-004**: 100% of sessions started in acceptance testing appear in history with the correct Pending or Completed status and local start date/time.
- **SC-005**: At least 90% of representative users can locate a target session in the newest-first, scrollable history list and identify its exercises and set values within 30 seconds; search and filters are not included in v1.
- **SC-006**: 100% of invalid set entries in acceptance testing are rejected with visible guidance and are not recorded as saved.
- **SC-007**: Automated unit and integration tests MUST achieve at least 85% statement coverage in each of these areas: backend services, request validators, and critical frontend workout state transitions, including session creation, variable set counts, pending/completed status, history edits, and deletion.

## Assumptions

- V1 serves one individual user per device without sign-in; account creation, sign-in, cross-device synchronization, and multi-user administration are outside this feature's scope.
- Sessions are saved as Pending when started, and saved changes remain available if the user leaves before completing.
- The default session title is the time-of-day label alone (for example, “Morning Workout”); the user can edit it at any time.
- The application derives Morning Workout (05:00–11:59), Afternoon Workout (12:00–16:59), Evening Workout (17:00–20:59), or Night Workout (21:00–04:59) from local start time.
- Kilograms are the only weight unit in v1; unit conversion and custom units are outside scope.
- Exercise catalog options are maintained as a predefined product list in v1; user-created catalog items are outside scope.
- A session can be completed even if it has no exercises, to avoid blocking users who need to close an accidentally started session.
- Session history is retained until the user deletes a session; no automatic expiry is applied.
- The active session may be edited before and after completion; edits do not change the original start time unless the user edits date/time explicitly.
