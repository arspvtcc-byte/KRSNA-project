# KRSNA Project Status

Last updated: 2026-10-12

## Purpose
Build an Android application named KRSNA with a Termux-hosted KRSNA core backend and integration with FreeLLMAPI. This file is the durable handoff point for future AI agents and development sessions.

## Verified repository state
- Canonical repository: https://github.com/arspvtcc-byte/KRSNA-project
- Repository visibility: private.
- Default branch: main.
- This repository was empty when the initial project documentation was added.
- No KRSNA application source or KRSNA APK has been committed here yet.

## Known from earlier session reports — re-verify before relying on it
- A Termux checkout at ~/freellmapi was reported to use remote https://github.com/tashfeenahmed/freellmapi.git, branch main, at upstream version/tag v0.13.10 (commit bae85413), with a clean working tree at that time.
- A FreeLLMAPI server was previously reported at http://localhost:3001 and its dashboard at http://localhost:5173.
- A previous test request using model auto reportedly routed to electronhub/minimax-m2.5.
- Termux was deleted/reinstalled or in the process of being reinstalled; successful restoration of the development environment has not been confirmed.
- A setup script named krsna_setup.sh was reported in the home directory.
- A local workspace ~/KRSNA was reported with subdirectories android/, downloads/, freellm/, logs/, server/, and tools/; its PROJECT_STATE.md was reported as empty and the workspace was not a Git repository at that time.

These are historical reports, not current runtime verification. Ask for fresh command output before treating any environment, process, path, or checkout state as current.

## Project separation
- KRSNA: this repository; future KRSNA-specific app/server code and project documentation.
- FreeLLMAPI: upstream dependency at https://github.com/tashfeenahmed/freellmapi. Do not modify its upstream checkout as a side effect of KRSNA work.
- ARX legacy updater: https://github.com/arspvtcc-byte/arx-config. Keep it separate; it is not the KRSNA repository.

## Current checkpoint
- [x] Create private GitHub repository.
- [x] Add agent instructions, status checkpoint, decision log, bug-history log, and repository ignore rules.
- [x] Capture the user's product and memory-engine requirements in docs/PRODUCT_SPEC.md.
- [x] Record the provisional two-server / Cloudflare Tunnel / Termux supervisor architecture in docs/ARCHITECTURE_DRAFT.md.
- [ ] Decide where the APK can read the connection manifest, because the canonical KRSNA repository is private.
- [ ] Verify the restored Termux environment and inspect current local files.
- [ ] Confirm the exact FreeLLMAPI repository/version and inspect its actual API/configuration before integration.
- [ ] Resolve remaining infrastructure, security, persistence, and updater decisions before implementation.
- [ ] Add KRSNA source only after inspecting existing local work and excluding secrets/generated artifacts.
- [ ] Run real build/tests and record exact results; do not mark them complete without evidence.

## Current architecture checkpoint — provisional, not implemented
- Server 1: KRSNA Core API, authentication/access control, chat orchestration, and memory.
- Server 2: FreeLLMAPI LLM gateway.
- Tunnel provider: Cloudflare Tunnel.
- Termux supervisor/daemon: starts when Termux is launched/restarted; automatic start after a full Android reboot is not yet requested or guaranteed.
- APK endpoint discovery: intended to use a stable connection manifest that can change without rebuilding the APK.
- App-version update metadata and APK delivery must be separate from endpoint refresh.
- Server 1 should call FreeLLMAPI over a local/private connection if both run on the same device and inspection confirms this is supported.
- Critical unresolved item: the canonical repository is private, so the APK cannot anonymously fetch its manifest from that repository. Choose a separate public minimal manifest repository, another public HTTPS host, or a deliberately authenticated design; never embed a long-lived GitHub write token in the APK.
- Health-check the backend and tunnel before publishing an endpoint; preserve the last known-good value on failures.

## Product requirements captured — 2026-10-12
- Added [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md), capturing the user's current KRSNA product, UI/interaction, access-control, logging, profile/settings/update, mode-script, and server-memory requirements.
- Naming clarification: KRSNA is the new project's product name. Other project names appearing in pasted reference material are references only and must not be treated as KRSNA's identity or as instructions to switch projects.
- User-described product requirements are recorded as requirements, not evidence of implementation. The reference memory engine's schema and token limits must be adapted after inspecting the actual backend.
- Confirmed product intent: private Android app for about 2–5 users; one APK, two servers, one tunnel (server roles and tunnel technology now provisionally specified below); eight dial modes: FINANCE, RELATIONSHIP, ACADEMICS, FAMILY, FUTURE, LOST, EMOTIONS, GROWTH.
- Key UX requirements captured: animated splash; permission gate; rotating/shatter-transition mode dial; same-screen chat transition; expanding five-line composer; thinking animation; Stop/abort; 30-second timeout/cancellation; long-press copy; settings/profile/theme/update controls; default light theme and adapted dark theme.
- Memory requirements captured: per-user shared profile/digests plus per-user/per-mode isolated memory; original message retention; summaries with coverage markers; bounded facts/digests; retrieval; promotion gate; prompt-injection safeguards; reliable persistence; and strict preflight token accounting. Proposed reference limits are 8,400 input tokens plus up to 1,500 output tokens, with total strictly below 10,000; provider-specific feasibility remains to be verified.
- No app source, server code, database, tunnel, APK, or runtime behavior was changed or tested by this documentation update.

## Next recommended action
Continue planning; do not implement yet. First resolve the connection-manifest hosting/access issue and inspect the real FreeLLMAPI setup. Request fresh device output only when ready to verify:
```sh
pwd
ls -la ~
ls -la ~/KRSNA
ls -la ~/freellmapi
git -C ~/freellmapi status --short --branch
git -C ~/freellmapi remote -v
```
Do not paste API keys, tokens, private keys, or full provider response/header dumps. Redact credentials from any diagnostic output.

## Verification policy
A GitHub documentation commit confirms only that the documentation was committed. It does not verify Termux installation, server availability, Android compilation, APK installation, or runtime behavior.
