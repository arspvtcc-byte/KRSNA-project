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
