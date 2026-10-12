# KRSNA Decision Log

Record decisions that affect architecture, security, workflow, or compatibility. Label unconfirmed ideas as proposals rather than final decisions.

## D-001 — Keep KRSNA in its own private repository
- Status: Accepted
- Date: 2026-10-12
- Decision: Use arspvtcc-byte/KRSNA-project as the canonical private repository for KRSNA.
- Reason: Keep new application work and its persistent AI handoff notes separate from the legacy ARX updater and the upstream FreeLLMAPI project.
- Consequences: KRSNA-specific source, configuration templates, documentation, and tests belong here. Secrets and runtime artifacts do not.

## D-002 — Treat FreeLLMAPI as a separate upstream dependency
- Status: Accepted as a workflow boundary; technical integration remains to be verified
- Date: 2026-10-12
- Decision: Keep the upstream repository and remote independent. Do not silently fork, edit, or repoint the local upstream checkout during KRSNA tasks.
- Reason: Avoid accidental changes to upstream code and make ownership of KRSNA-specific changes explicit.
- Open question: Confirm the intended upstream repository and inspect its current API/installation contract before integration.

## D-003 — Use explicit, evidence-based project checkpoints
- Status: Accepted
- Date: 2026-10-12
- Decision: Maintain PROJECT_STATUS.md, this decision log, and docs/BUG_HISTORY.md.
- Reason: Make handoffs between AI sessions reliable and prevent historical reports from being mistaken for current verification.
- Consequence: Every meaningful task should record changed paths, actual test results, remaining unknowns, and the next action.

## Proposed architecture — not yet locked
- Android client app branded KRSNA.
- A local server/runtime in Termux on the Android device.
- Integration with FreeLLMAPI to route requests to supported LLM providers/models.
- Details still to decide/verify: Android application ID, build system, UI framework, server implementation/language, API routes, authentication, provider key storage, network binding, background execution, persistence, model selection/fallback behavior, and distribution/update strategy.

Do not silently convert these proposals into accepted decisions. Confirm them against user requirements and source code first.

## D-004 — KRSNA is the sole current product identity
- Status: Accepted
- Date: 2026-10-12
- Decision: The new app and its system are named KRSNA. Other names appearing in pasted prompts or legacy project discussions are reference material only unless the user explicitly says otherwise.
- Reason: Avoid cross-project confusion and prevent a copied specification from renaming or redirecting KRSNA work.
- Consequence: Use KRSNA consistently in project-specific source, UI, docs, package metadata when later confirmed, and server naming. Keep ARX/other legacy projects and upstream dependencies separate.

## D-005 — Capture user requirements before implementation
- Status: Accepted
- Date: 2026-10-12
- Decision: Treat docs/PRODUCT_SPEC.md as the working record of product behavior and memory-engine requirements supplied so far. Distinguish user-confirmed requirements from proposed engineering safeguards and unresolved architecture questions.
- Reason: The user is still explaining the system; implementation must follow the actual KRSNA design rather than assume roles for the two servers or the tunnel.
- Consequence: Inspect real source before selecting schemas/frameworks. Do not claim any documented feature is implemented or tested solely because it is in the spec.

## D-006 — Memory-engine design is a reference requirement, not a verified existing implementation
- Status: Accepted
- Date: 2026-10-12
- Decision: Adapt the supplied two-level memory, retrieval, summarization, promotion, isolation, and token-budget design to KRSNA only after inspecting the actual backend.
- Reason: The supplied prompt is detailed but does not establish the current code, database, tokenizer, or provider request format.
- Consequence: The 8,400 input / 1,500 output / below-10,000 total limits are proposed starting limits; verify the complete provider-visible request and actual counting method before treating them as enforceable in production.
