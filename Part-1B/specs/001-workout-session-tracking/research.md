# Research: Workout Session Tracking

## Decisions

### Local application boundary

- **Decision**: Bind both the Express API and Vite development server explicitly to loopback (`127.0.0.1`). Do not use an unspecified host or a LAN-exposed preview server. The backend may still make outbound HTTPS requests to the selected LLM provider.
- **Rationale**: Node may bind an omitted host to an unspecified interface, exposing the service beyond the local device. Binding both listeners closes the inbound boundary specified by the user while preserving the necessary outbound LLM integration. Verify listener configuration and include a boundary check in implementation tests. See [Node.js net server listen](https://nodejs.org/api/net.html).
- **Alternatives considered**: Bind only Express while leaving Vite exposed; rejected because the frontend itself would remain reachable remotely. Disable all networking; rejected because external LLM parsing is required.

### Local date and time

- **Decision**: Capture the browser's current date/time and IANA time zone at session creation or natural-language submission. Send the offset-bearing instant and zone to the backend, validate both, persist the UTC instant and zone, and derive local calendar date, weekday, and time-of-day label from those values.
- **Rationale**: The browser is the user's local device and may use a different zone from the Node process. Retaining the zone makes display and date/bucket matching consistent after the session is logged. The browser exposes the resolved zone through `Intl.DateTimeFormat().resolvedOptions().timeZone`; see [MDN Intl resolvedOptions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions).
- **Alternatives considered**: Use only the server clock or server zone; rejected because it can differ from the device. Store only a formatted local timestamp; rejected because it cannot identify an instant reliably across zones or daylight-saving changes.

### SQLite integrity and transactions

- **Decision**: Keep a file-backed SQLite database behind backend repository interfaces. Use versioned migrations and an idempotent seed for the predefined exercise catalog. Enable foreign-key enforcement on every connection, add checks for positive weight and reps, and wrap each nested session/exercise/set write in a transaction.
- **Rationale**: This keeps persistence local and simple while database constraints protect relationships and prevent partial writes. See [SQLite foreign keys](https://www.sqlite.org/foreignkeys.html), [date/time functions](https://www.sqlite.org/lang_datefunc.html), and [transactions](https://www.sqlite.org/lang_transaction.html).
- **Alternatives considered**: Add a database server or ORM; rejected as unnecessary for the single-user MVP. Use only application-level validation; rejected because it cannot prevent orphan rows or invalid writes from every code path.

### SQLite driver

- **Decision**: Use `better-sqlite3` behind the repository boundary on the chosen Node.js LTS runtime.
- **Rationale**: Its mature synchronous API supports prepared statements and transactions that fit this local single-user workload. Transaction callbacks stay synchronous and short; see [better-sqlite3 API documentation](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md).
- **Alternatives considered**: Built-in `node:sqlite`; deferred because its API stability designation at planning time was release-candidate/stability 1.2. Expose driver-specific details to services; rejected to keep the persistence boundary replaceable.

### Installation ownership

- **Decision**: Treat the installation as the sole user's local tracker. Store no `userId`, require no authentication middleware, and scope history by the single local database rather than by account.
- **Rationale**: The clarified feature is a local, one-user MVP without login or account switching. Adding host identity or owner queries would introduce an unrequested auth dependency and conflict with the spec.
- **Alternatives considered**: Host-provided authenticated identity; rejected because there is no host auth layer in the local app. Full account management; out of scope.

### REST response and error conventions

- **Decision**: Return JSON for every endpoint response. Use 200 for reads/updates/append/clarification/deletion confirmation, 201 for new resources, 400 for malformed or domain-invalid data, 404 for missing resources, and sanitized 500 responses for unexpected errors. Normalize errors in Express error middleware.
- **Rationale**: This follows the user-specified status set and ensures the UI receives a predictable shape. Deletion uses 200 with `{ "deleted": true }` so the response remains JSON. See [Express error handling](https://expressjs.com/en/guide/error-handling/) and [routing](https://expressjs.com/en/guide/routing.html).
- **Alternatives considered**: 204 for deletion; conflicts with the requirement that endpoint responses be JSON. Framework-default errors; may expose stack traces or inconsistent response shapes.

### Natural-language parsing and persistence

- **Decision**: The backend LLM adapters support OpenAI and Gemini with provider/model/key from backend runtime configuration and user text plus the predefined catalog. They request JSON-only structured output and return it to `nlp-parser.service.js`, which applies Zod schema validation and deterministic domain checks. The parser has no repository dependency. Only a validated, unambiguous proposal is passed to the workout service for transactional persistence.
- **Rationale**: Structured output improves shape consistency but does not make the model trustworthy. Server-side catalog, date/time, positive-weight, positive-integer-reps, and session-match checks remain authoritative. The API key is backend-only runtime configuration, never source, client bundle, log, or response content. See [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output) and [OWASP LLM prompt injection prevention](https://genai.owasp.org/llmrisk/llm01-prompt-injection/).
- **Alternatives considered**: Give the model database tools; prohibited by the constitution. Trust provider output without validation; unsafe. Use regular expressions alone; insufficient for the requested natural-language flow. Persist the API key in SQLite; rejected because a secure runtime configuration is simpler and no encrypted key-store feature is specified. Add more provider adapters; defer until a concrete provider is requested.

### Matching sessions and user selection

- **Decision**: Match a parsed entry using its local calendar date and time-of-day bucket. With one match, append to it; with none, create a session; with multiple matches, return the candidate sessions without writing. The user selects a candidate and resubmits the original editable sentence with the selected session ID; the backend reparses and validates before writing.
- **Rationale**: This combines automatic same-period updates with the clarified requirement that ambiguous targets are never guessed or saved before selection. It also avoids keeping conversational clarification state on the backend.
- **Alternatives considered**: Select the newest matching session automatically; rejected because it silently guesses. Store a server-side conversation; rejected because resubmitting the sentence is the specified flow and needs no additional state.

### Automated tests and parser evaluation

- **Decision**: Use Vitest for unit and integration tests with mocked provider responses, and enforce at least 85% statement and branch coverage for backend services/validators and critical frontend workout reducers. Keep a versioned, secret-free `evals/dataset.json`; `.harness/evaluate.js` runs schema, invariant, and semantic layers and passes only when the all-layer case rate reaches 80%.
- **Rationale**: This tests safety, domain behavior, and meaning independently. Mocked providers make critical tests deterministic and do not require API keys. The three-layer harness catches valid-shaped but semantically incorrect output.
- **Alternatives considered**: Test only JSON parsing; misses invalid catalog selections and semantic errors. Use live provider calls in routine tests; slow, nondeterministic, and secret-dependent. Measure line coverage only; can miss branch behavior.

## Operational Assumptions

- Each installation has one local user, no account switching, and one local SQLite history.
- The predefined catalog is seeded and read-only in this release; catalog administration is out of scope.
- The user supplies the external LLM key and selects provider/model through backend runtime configuration. Key setup must not use a Vite-exposed variable or store the secret in the database.
- Browser-captured date/time and IANA zone are sent to the backend; the Node process's local time zone is not authoritative.
- The exact SQLite driver is chosen at implementation time based on supported Node LTS compatibility and stability.
- Parser responses that are incomplete, ambiguous, unsupported, invalid, or unavailable do not write data. The original sentence remains editable for correction and resubmission.
- Matching considers local date and fixed time buckets: morning 05:00–11:59, afternoon 12:00–16:59, evening 17:00–20:59, night 21:00–04:59.
