# KRSNA — Agent Instructions

## Project identity
- Project name: KRSNA.
- Canonical repository: https://github.com/arspvtcc-byte/KRSNA-project
- This repository is the source of truth for KRSNA documentation, decisions, checkpoints, and eventually its own application/server source.
- Keep KRSNA separate from the legacy ARX project and the upstream FreeLLMAPI repository.

## Non-negotiable working rules
1. Read PROJECT_STATUS.md, docs/DECISIONS.md, and docs/BUG_HISTORY.md before making project changes.
2. Distinguish verified facts from historical reports, assumptions, and unknowns. Never claim a build, test, installation, server, or APK was verified unless evidence is available.
3. Do not overwrite or delete existing files without inspecting their current contents and understanding their purpose.
4. Keep changes narrowly scoped to the requested task. Report every file changed and every test actually run.
5. Never commit secrets: API keys, tokens, passwords, private SSH keys, signing credentials, .env files, session data, or provider response/header dumps that may contain credentials.
6. Do not expose secrets in logs, screenshots, commits, generated prompts, or documentation. Use placeholders such as YOUR_API_KEY in examples.
7. Before adding files, inspect them for credentials and personal data. Keep local runtime databases, generated artifacts, and user data out of Git.
8. Preserve the upstream FreeLLMAPI checkout and its Git remote. Do not change upstream files or remotes unless explicitly requested.
9. Do not reuse the legacy arspvtcc-byte/arx-config repository for KRSNA. It belongs to the old ARX updater and is intentionally separate.
10. Never report that an operation succeeded until its actual tool/command result confirms success.

## Expected architecture (planned, not a claim of current implementation)
- Android client application named KRSNA.
- A local server/runtime hosted in Termux on the Android device.
- Integration with FreeLLMAPI for access to supported LLM providers/models.
- Verify the exact client/server design, API routes, security boundaries, and upstream compatibility against source before implementing or documenting them as final.

## Git and repository hygiene
- Make focused commits with descriptive messages.
- Keep generated APKs, build output, signing keys, local configuration, databases, logs, and secrets out of the repository.
- Never force-push, rewrite history, or perform destructive repository operations without explicit authorization.
- If the repository's existing state conflicts with these instructions, inspect and preserve existing work; ask before destructive changes.

## Required checkpoint updates
After a meaningful task, update PROJECT_STATUS.md with the verified state, changed paths, tests/results, and next action. Record durable architecture choices in docs/DECISIONS.md and notable bugs plus verified fixes in docs/BUG_HISTORY.md. Do not record guesses as facts.

## Environment limitations
GitHub file edits do not execute Termux commands, build Android APKs, or validate behavior on the user's device. State these limitations plainly and provide exact commands for device-side verification when needed.

## Product identity and reference material
- KRSNA is the new project's product name. Do not rename this project or its app because a user-provided reference prompt mentions ARX, NOVA, KT2, or another project.
- The current user requirements and memory-engine reference are documented in docs/PRODUCT_SPEC.md.
- Treat that spec as requirements and proposals, not proof of existing implementation. The user is still defining the two-server/tunnel architecture.
- Do not invent the eight mode scripts, exact palette/font, profile questions, server responsibilities, or tunnel technology. Wait for user-provided details or mark them explicitly as unresolved.
- Do not modify unrelated repositories or legacy projects as a side effect.
