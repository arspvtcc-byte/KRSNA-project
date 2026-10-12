# KRSNA Bug and Incident History

Only record issues with enough context to be useful. Separate confirmed fixes from workarounds and unverified observations. Never paste credentials, session cookies, private keys, or sensitive response dumps.

## B-001 — Termux environment reset / restoration not confirmed
- Date reported: 2026-10 (exact date not confirmed)
- Symptom/context: Termux had been deleted, and development tools were being reinstalled.
- Status: Open — current state unknown.
- Impact: Local source, dependencies, server processes, and build tools may not be present even if they existed in a prior session.
- Next diagnostic: Inspect home/workspace contents, verify Git checkouts/remotes/status, and check installed tool versions before attempting a build.
- Fix: None verified.

## B-002 — KRSNA workspace was not a Git repository at last inspection
- Date reported: 2026-10-12 context (exact inspection time not independently verified here)
- Symptom/context: ~/KRSNA was reported as a workspace with empty subdirectories and a zero-byte PROJECT_STATE.md; it was not a Git repository at that time.
- Status: Historical observation — re-check current state.
- Impact: Local work could be untracked or incomplete.
- Next diagnostic: Run git -C ~/KRSNA status --short --branch and inspect files before initializing, copying, or replacing anything.
- Fix: This private GitHub repository now holds the durable documentation checkpoint; local workspace synchronization has not been performed or verified.

## B-003 — Prior FreeLLMAPI routing test
- Date reported: 2026-10 (exact date not confirmed)
- Symptom/context: A prior test with model auto reportedly returned X-Routed-Via: electronhub/minimax-m2.5 and model minimax-m2.5.
- Status: Historical successful request report; current behavior not verified.
- Impact: This single report does not establish simultaneous multi-model execution, general fallback behavior, or current service health.
- Next diagnostic: Inspect current routing implementation and run a fresh request with sanitized output.
- Fix: No code fix was required or verified from the historical report.

## Recording new entries
For each issue, include date, symptom, exact sanitized error/output, environment, reproduction steps, status, root cause (only when established), fix/commit, and verification performed.
