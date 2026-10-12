# KRSNA Product and Memory Specification

Last updated: 2026-10-12

## Document status and naming
- This specification describes the new KRSNA app and its server system.
- KRSNA is the only current product name for this project.
- Names appearing in pasted reference material (including ARX, NOVA, or KT2) are historical/reference labels only; they do not rename this project or define its architecture.
- These requirements are captured from conversation and are not proof that any feature has been implemented.
- The user is still explaining the full system. Unspecified server roles, tunnel technology, frameworks, and visual asset details remain open.

## Product purpose
Build a private Android AI application for approximately 2–5 authorized users. It is not intended as a commercial public app. The experience should be polished, animated, mode-driven, and backed by server-side access control and persistent memory.

## System topology — roles not yet confirmed
The intended system has:
1. One KRSNA Android APK.
2. Two servers.
3. One tunnel connecting the app and server infrastructure.
4. A private GitHub repository as the durable source for KRSNA project documentation and, later, KRSNA-specific source.

The responsibilities of each server, exact request paths, tunnel technology/termination, AI routing placement, and storage placement have not yet been specified. FreeLLMAPI was previously discussed as a possible separate upstream dependency, but its identity and role in the final KRSNA design must be confirmed before implementation.

## First launch and authorization flow
1. Show an animated entry/splash experience with the KRSNA name in bold uppercase and an attractive logo/name animation.
2. Generate a device identifier locally and submit it to the server as part of the initial access request.
3. Until access is approved, the main interface should display only NO PERMISSION; hide the dial, chat input, menu, and settings.
4. Provide a server-side control process to accept or reject initial device requests. Initial approval should be a one-time approval workflow.
5. Once approved, the app proceeds to the dial interface and should not show the initial permission gate on ordinary launches when the device remains authorized.
6. Validate authorization for every message on the server.
7. Support revocation while the app is open. If authorization is revoked during a session, deny subsequent work and immediately return the client to NO PERMISSION.
8. On every app reopen, check current authorization before allowing access. A revoked device must return to NO PERMISSION.

Security clarification: one-time approval does not mean never check again. Access remains revocable. A locally generated device ID alone is not strong authentication; design a server-issued credential or equivalent protection, secure transport, and server-side session/device revocation without changing the intended approval workflow. Never trust a client-supplied user ID or device ID without validating its binding to the authenticated identity.

## Main screen and rotating mode dial
The dial is the main screen's primary control. It should evoke a GTA weapon-selection HUD, customized for KRSNA, rather than a conventional home page.

Eight modes and their exact labels:
- FINANCE
- RELATIONSHIP
- ACADEMICS
- FAMILY
- FUTURE
- LOST
- EMOTIONS
- GROWTH

Behavior:
- Dial rotates continuously at approximately 3–4 RPM as a slow ambient animation.
- User can drag/touch to rotate it; faster dragging should produce faster rotation.
- Mode labels rotate with their segments.
- Selecting a segment stops the dial.
- The selected segment flashes red twice; exact palette values are pending the user's reference images.
- The other seven segments shatter/split outward toward their respective sides/corners.
- The selected segment's border zooms forward; its label disappears during the zoom.
- The same screen transitions into chat mode; this is not intended as a conventional separate chat page.
- Target selection transition duration is approximately one second, smooth and synchronized rather than abrupt.

When a mode is selected:
- Chat input slides in from the bottom.
- Three-line menu button slides in from the left.
- Back button appears beside the menu button.
- Settings button enters from the upper-right.
- KRSNA branding remains integrated in the upper/header area and the selected mode name appears beside it.

Back-to-dial behavior:
- Chat interface fades out.
- Brief transition with the screen clear for a very short interval if needed.
- Dial segments fly in from the directions corresponding to their positions, reassemble centrally, and resume rotation.
- Synchronize the transition; target duration is under or around one second where feasible.

Keep animation work independent from network requests. Provide sensible performance fallbacks for lower-powered devices and reduced-motion preferences without losing functionality.

## Chat interface and interaction
Input:
- Chat bar is anchored at the bottom.
- Tapping it positions it directly above the on-screen keyboard.
- It expands vertically as text grows, up to five visible lines.
- For longer messages, earlier lines scroll out at the top while new lines can be entered at the bottom.
- Preserve the entire message unless it exceeds a defined safe request limit; never silently claim a truncated message was fully processed.

Sending and generation:
- On send, dismiss the keyboard promptly and scroll the conversation to the bottom.
- Render the user's message immediately.
- Show an animated three-dot thinking indicator while waiting for the AI response.
- During generation, the send arrow becomes a square Stop control.
- Pressing Stop sends an abort/cancellation command to the server.
- Server must identify the exact active generation and cancel its work where supported, rather than only hiding the UI indicator.
- If no reply arrives within 30 seconds, display a timeout message and request server-side cancellation. Ignore or safely reconcile late responses after cancellation/timeout.
- Server should return to an idle/ready state for the next request after cancellation.

Messages:
- User messages appear in rounded-corner, translucent-black boxes.
- After an AI reply arrives, the user's message box and text fade/dim to move visual focus to the reply.
- AI messages have no surrounding bubble/box; they appear as open text.
- Long-pressing either a user message or an AI reply immediately copies its text.

Request reliability:
- Give every generation a unique request ID.
- Persist request state so retries, aborts, timeouts, and late replies are associated with the correct generation.
- Preserve streaming support if present in the eventual backend; do not mark streamed replies complete until the provider's completion signal.
- Avoid duplicate user messages on retries by using idempotency/request identifiers.

## Visual system and themes
The user has reference images for a central/background palette, dial appearance, red selection flash, and font. The images are not attached to this documentation update, so exact hex values and font identity are unknown and must not be invented.
- The palette's central/background colour should be the main screen background.
- Dial appearance should use translucent black.
- The specified red from the user's palette should be used for the selected-segment flash.
- Extract or closely match the font from the user's reference images for the chat area when those images are available.
- Keep KRSNA branding integrated/engraved consistently across the dial and chat areas.
- Two themes: light mode is default; dark mode should use an adapted/inverted treatment of the same underlying palette, not an unrelated palette.

## Menu, settings, profile, and updates
- Menu control: three horizontal lines, entering from the left during dial-to-chat transition. Further menu contents are not yet specified.
- Settings control: at the upper-right, enters during the same transition.
- Settings include a profile entry at the top, a light/dark theme control, a Check for Updates control at the bottom, and a small current-version display.
- Version display must reflect the installed build version.
- Update checking should use a trusted manifest/source, validate package identity and update integrity, and never silently install untrusted packages. Exact update mechanism remains open.

Profile:
- Profile screen asks approximately 10–15 predefined questions, including name, age, and other useful user details.
- At the end, provide a button to submit/update profile information to the server.
- Users may edit and submit their profile repeatedly.
- Exact questions remain to be supplied.
- Collect only fields that are useful, transmit securely, restrict access, and provide a clear retention/deletion policy.

## Mode-specific system scripts
Each of the eight modes will have a predefined custom instruction/script attached to every user message before the request reaches the LLM.
- The user will provide the exact scripts later.
- Do not invent or replace these scripts before the user supplies them.
- Keep authoritative instructions server-side where practical so a modified client cannot bypass server-enforced policy.
- Keep trusted system/developer instructions structurally separate from retrieved memories and quoted user content.

## Server message storage and observability
The user wants messages sent to the server to be stored with date and timestamp. Recommended record metadata includes:
- internal authenticated user/device reference;
- conversation ID and message ID;
- mode ID;
- role;
- original content;
- creation timestamp;
- request/generation ID and status;
- token-count value plus whether exact or estimated;
- summary coverage/summarization state when relevant.

Store both user messages and completed assistant responses unless the eventual retention decision says otherwise. Do not delete original messages after summarization. Avoid logging private message content by default. Never commit API keys, auth tokens, credentials, private profile data, raw response/header dumps, or runtime databases to Git.

## Server memory engine requirements (adapted from reference specification)
The pasted memory specification is a reference for KRSNA. Its source name is not the project identity. Adapt it after inspecting the real KRSNA backend; do not assume its schema or architecture already exists.

Goal: treat the model provider as stateless; KRSNA's server stores messages and reconstructs appropriate context for each AI request. Priority order:
1. Accurate, relevant memory recall.
2. Reliable message persistence.
3. Strict token-budget enforcement.
4. Isolation between users and modes.
5. Protection against memory corruption and prompt injection.
6. Simple, maintainable implementation for 2–5 users.

### Two memory levels
Shared base memory per authenticated user:
- Bounded durable profile facts such as preferred name, language, timezone, stable communication preferences, and other genuinely cross-mode preferences.
- Target approximately 15 pinned profile facts, with hard limits on fact length, total size, and tokens.
- One short digest per active mode, at most 25 tokens each, and at most eight active digests per user.
- If a ninth mode is activated, evict the least-recently-used digest deterministically; do not delete that mode's messages, facts, or summary.
- Never store entire conversations in shared profile memory.

Mode-specific memory, keyed by authenticated user and mode:
- Original messages.
- One rolling summary/current summary with coverage marker.
- Structured mode facts.
- Optional embeddings/retrieval indexes if suitable and supported.
- Summarization progress markers and metadata.

A mode may access its own memory and its authenticated user's shared base memory. It must not read another mode's raw messages, facts, summaries, or embeddings. Mode-specific facts are not promoted automatically; only validated promotion logic may place eligible cross-cutting facts in shared memory.

### Logical data model
Inspect the existing database and migrate safely rather than replacing it. The following is a logical requirement, not a commitment to a specific SQL schema:
- messages: id, authenticated user reference, mode_id, role, original content, token count/count-kind, created_at, summarized state, request/order metadata.
- summaries: user reference, mode_id, summary content, covers_upto_msg_id, updated_at.
- mode_facts: user reference, mode_id, key, value, confidence, pinned, updated_at; optional embedding.
- base_facts: user reference, key, value, source_mode/provenance, updated_at.
- base_mode_digests: user reference, mode_id, digest, updated_at, LRU metadata.
Use safe migrations, indexes, uniqueness/upsert rules, foreign keys where appropriate, parameterized queries, transactions for coupled writes, and user/mode-scoped access. Never trust user_id supplied by the client without checking the authenticated session.

### Central context builder
Implement one well-defined equivalent of build_context(user, mode, query) using the project's existing conventions:
1. Validate authenticated user, mode, message format, and configured limits.
2. Load only that user's shared profile and active digests.
3. Retrieve relevant facts only from the current user/current mode. Prefer embeddings if already suitable; otherwise use a documented keyword/relevance fallback. Never let retrieval failure widen access.
4. Load the current mode's summary and coverage marker.
5. Load recent raw turns in chronological order and avoid unnecessary duplicate content already represented by the summary.
6. Assemble in a stable order: trusted system instructions/persona; shared profile facts; shared mode digests; current-mode summary; relevant current-mode facts; recent current-mode turns; current user message.
7. Enforce the input cap by trimming eligible context in this order: oldest raw turns; lowest-relevance non-pinned mode facts; excess summary text, preferably by regenerating a shorter summary rather than blind truncation.
8. Never silently drop system instructions, the current user message, or pinned base facts to satisfy an ordinary overflow. If protected content cannot fit, fail safely or use an explicitly designed chunking path.
9. Recount the final serialized provider-visible request and verify the maximum output reservation before calling the main model.
10. Return prompt messages plus internal safe metadata: input count, output cap, exact/estimated status, turns/facts included, trimming status, retrieval strategy. Do not expose private memory metadata to unauthorized clients.

### Token ceiling
The proposed reference limits are:
- Maximum assembled input: 8,400 tokens.
- Maximum reserved output: 1,500 tokens.
- Planned maximum total: 9,900 tokens.
- Final condition: input + maximum output must be strictly less than 10,000 tokens.

These are proposed starting limits; validate against the actual model/provider request format and limits before finalizing. Count all provider-visible components, including system/developer messages, formatting, tool definitions, and other request fields that consume context. Use the compatible actual tokenizer/provider counting API where available. If only an estimator is available, document it, use a conservative safety margin, and never falsely label the count exact. Configure output maximum at or below 1,500 unless later explicitly changed. Recount after every trim and on every request/retry. If the request cannot safely fit, fail with a clear error without silently truncating the current user message. Do not send an unverified/over-budget request.

Initial soft allocation targets from the reference (not requirements to fill): system/persona 500; shared profile 400; shared digests 250; relevant mode facts 700; mode summary 900; recent turns 5,000; current user message up to 500; 150 tokens remain under the 8,400 input cap. Actual context should be smaller when appropriate. Protected content may not be silently dropped.

### Message persistence and recovery
- Validate and persist incoming user messages reliably with correct user/mode/request association.
- Build context and call the model only after preflight validation.
- Persist assistant output only when received; distinguish completed, aborted, timed out, and failed responses.
- Make retries idempotent and preserve ordering.
- Handle provider errors, timeouts, and rate limits without corrupting history.
- Design recovery/reconciliation for a provider success followed by a server crash before assistant output is saved.
- Preserve streaming compatibility if present.
- Failed requests must not be represented as successful conversations.

### Rolling summaries
Suggested trigger from reference: unsummarized buffer exceeds either 12 turns or 5,000 raw-message tokens. Confirm the project's definition of a turn (normally user message plus corresponding assistant reply).
- Summarize the oldest eligible messages not covered by the current summary.
- Combine prior summary with eligible messages.
- Preserve durable facts, preferences, decisions, unresolved questions, commitments, and relationships.
- Save new summary and correct coverage marker before marking messages summarized.
- Keep original messages unless a separately approved retention policy says otherwise.
- Prefer asynchronous summarization if supported; do not block every response unnecessarily.
- Use locking/optimistic concurrency/transactions to prevent concurrent or stale jobs from corrupting a summary.
- Failed jobs must not advance coverage markers; retries must be safe and idempotent; older jobs must not overwrite newer summaries.
- A temporary model failure must preserve the last valid summary.

### Promotion gate and mode digests
Run at session end or on a suitable scheduled/background trigger, using a cheaper suitable model if available:
- Keep mode-specific facts local by default.
- Promote only durable facts useful across modes, such as a stable language or response preference.
- Distinguish explicit user statements from model inferences.
- Do not promote temporary moods/plans, unnecessary sensitive details, or facts belonging only to one mode.
- Require structured output and validate schema, key/value lengths, confidence, eligibility, provenance, and profile size.
- Use deterministic upserts and preserve provenance.
- Regenerate the active mode's digest; it must describe the mode's current state in at most 25 tokens and exclude unrelated/private mode details.
- Validate before replacing an existing digest. If generation fails or output is invalid, preserve the last valid digest and retry later.
- Treat model output and all saved memory as untrusted data. Never execute stored text as instructions.

### Prompt-injection and privacy safety
- Keep trusted system instructions separate from summaries, facts, and quoted user content.
- Treat retrieved memory as untrusted contextual data, never as privileged instructions.
- Enforce user/mode isolation in application code, not merely via prompt wording.
- Validate structured model output.
- Apply authorization to all endpoints and background jobs.
- Do not log full private conversations by default.
- Exclude secrets, credentials, private user data, raw headers/bodies, and runtime DB files from Git.

### Prefix stability
Keep stable prompt sections in deterministic order to support provider caching when available. A stable prefix does not guarantee a cache hit. Do not build a custom cache unless inspection shows it is needed. Correctness and freshness take precedence over cache optimization.

### Memory tests required
Use the existing test framework and report actual results:
- Basic recall of earlier name/preferences after intervening conversation.
- Long history at 20, 100, and 1,000 messages, preserving originals and retrieving relevant older facts.
- Mode isolation across all eight modes.
- Cross-user isolation for messages, facts, summaries, embeddings, and digests, including endpoints and background jobs.
- Token budget for empty, short, long, oversized history/message/facts/summary, tool definitions, maximum output, and tokenizer failure.
- Verify every main-model call is strictly below 10,000 tokens including output reservation; protected-content overflow fails safely.
- Summary success/failure/retry/duplicate/concurrent/stale-job behavior and coverage markers.
- Promotion eligibility, schema validation, size limits, failure preservation, LRU digest eviction without raw-data deletion, and duplicate prevention.
- Prompt-injection tests for malicious-looking stored text.
- Regression tests for existing chat behavior.
Never claim tests passed without running them.

### Suggested phased delivery
Phase 1: inspect project; safe migrations; reliable message persistence; shared profile facts; one mode's summary/history; context assembly; token preflight; basic recall and isolation tests.
Phase 2: relevant fact retrieval; optional embeddings; rolling summaries; asynchronous jobs/retries; long-history tests.
Phase 3: promotion gate; cross-mode durable facts; validated digests; max-eight/LRU behavior; security/concurrency tests.
Verify each phase before proceeding. Keep existing architecture and dependencies where possible. Do not rewrite the backend wholesale or add distributed infrastructure for 2–5 users without evidence it is necessary.

## Profile questions and data handling
The user will later specify the 10–15 profile questions. Do not invent the final questionnaire now. Allow profile updates and define appropriate secure storage, access controls, and retention/deletion behavior before production use.

## Explicitly undecided
- Exact duties of the two servers and request flow between them.
- Tunnel provider/technology and termination.
- Whether/where FreeLLMAPI is used; confirm intended repository and API before integrating.
- Android package/application ID, UI framework, minimum Android version, build system.
- Backend language/framework and database after inspecting real source.
- Exact palette hex values, font, and dial reference assets.
- Exact menu contents.
- Exact profile questions.
- Eight mode scripts.
- Chat retention/deletion policy and whether histories sync to local storage.
- Update manifest/hosting and package installation strategy.
- Tokenizer availability and final provider-specific counting method.

## Implementation policy
This document records requirements, proposals, and open questions. It does not mean the app, server, memory engine, tunnel, authorization service, database schema, or tests already exist. Inspect the actual code first, produce a scoped plan, make reversible changes, run tests, and report real evidence.