# KRSNA Project Status

Last updated: 2026-10-12

## Purpose
Build an Android application named KRSNA with a planned Termux-hosted local server and integration with FreeLLMAPI. This file is the durable handoff point for future AI agents and development sessions.

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
- [ ] Confirm Termux/toolchain reinstall and inspect current local files.
- [ ] Confirm that the FreeLLMAPI repository previously identified is the intended dependency.
- [ ] Define and record the KRSNA Android UI, package ID, minimum Android version, server API contract, local-network/security model, and persistence requirements.
- [ ] Add the initial KRSNA source tree only after inspecting existing local work and excluding secrets/generated artifacts.
- [ ] Run real build/tests and record exact results; do not mark them complete without evidence.

## Next recommended action
On the device, provide fresh output for:
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
