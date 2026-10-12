# KRSNA Infrastructure Architecture Draft

Status: WORKING DRAFT — not implemented; choices remain provisional.
Last updated: 2026-10-12

## Purpose

Durable handoff for the KRSNA infrastructure design so a new AI chat or coding-agent session can resume without relying on conversation history.

## Confirmed by the user in planning

- Product/project identity: KRSNA.
- Rebuild the infrastructure cleanly: new KRSNA server setup, new tunnel configuration, new connection discovery mechanism, and a new updater design.
- Server 1: main KRSNA API, authentication/access control, chat orchestration, and memory.
- Server 2: LLM gateway using FreeLLMAPI.
- Tunnel provider: Cloudflare Tunnel.
- A Termux supervisor/daemon should start when Termux is launched or restarted. This does not currently mean guaranteed startup after a full Android device reboot.
- The APK should discover a changed server endpoint without requiring a new APK build for every tunnel URL change.
- App-version updates must be separate from endpoint/configuration refreshes.
- Planning only so far: do not implement until the architecture and unresolved decisions have been discussed.

## Proposed logical topology

1. KRSNA Android APK
   - Uses a stable bootstrap/configuration location to discover the current KRSNA API endpoint.
   - Calls Server 1, not FreeLLMAPI directly, unless later explicitly designed otherwise.
   - Checks a separate app-update manifest for version metadata and a trusted APK download.
2. GitHub-hosted connection manifest
   - Contains only non-secret endpoint/configuration metadata.
   - Updated by the Termux supervisor after the server and tunnel are healthy.
3. Cloudflare Tunnel
   - Exposes Server 1 through HTTPS.
   - The tunnel URL is published only after health checks succeed.
4. Server 1 — KRSNA Core
   - Authentication, device approval/revocation, chat API, mode-specific instructions, memory/context construction, persistence, and request orchestration.
   - Calls Server 2 over a local/private connection when possible.
5. Server 2 — FreeLLMAPI
   - Handles provider/model routing and LLM requests.
   - Exact API compatibility, port, authentication, and process lifecycle must be inspected before integration.
6. Termux supervisor/daemon
   - Starts/checks services and tunnel, monitors health, detects the active endpoint, safely updates the connection manifest, and retries transient failures.
   - Startup and process-survival behavior must account for Android/Termux lifecycle limits.

## Manifest and repository access constraint

The canonical repository, https://github.com/arspvtcc-byte/KRSNA-project, is currently private. An APK cannot anonymously read a file from a private GitHub repository. Before implementation, choose one safe design:
- a separate public, minimal repository containing only the non-secret connection manifest;
- another stable public HTTPS configuration endpoint; or
- an authenticated design that does not embed a long-lived GitHub credential in the APK.

Do not make the whole source repository public merely to expose one manifest without an explicit decision.

The Termux publisher needs write access to the manifest destination. Prefer a narrowly scoped credential stored only in Termux, never in APK source, manifest, logs, or committed files. Do not commit credentials.

## Health and failure handling (proposed)

- Do not publish a new endpoint until Server 1 and the tunnel are reachable and pass a health check.
- Validate the endpoint scheme/host and expected API identity before publishing or accepting it.
- Write the manifest atomically where the host supports it; preserve the last known-good manifest if publishing fails.
- Retry GitHub/network errors with bounded backoff; do not overwrite a valid endpoint with an empty or unhealthy value.
- APK should handle a stale endpoint and temporary GitHub unavailability gracefully.
- Do not treat the tunnel URL as an authentication secret. Server 1 still requires real authentication and authorization.
- Keep connection discovery, app-update metadata, and application binaries separate.
- Update downloads must verify package identity, version policy, and integrity/signature before installation. Android may require user confirmation or special management privileges to install an APK; silent installation is not assumed.
- Avoid exposing FreeLLMAPI directly to the public internet unless a separately reviewed requirement demands it.

## Unresolved decisions — discuss before implementation

1. Where should the connection manifest live, given the canonical source repository is private?
2. Should Server 1 and FreeLLMAPI run on the same Android/Termux device? If yes, determine the actual private/local API address and auth contract from the installed source.
3. Exact FreeLLMAPI repository/version, endpoints, configuration, and supported client protocol must be re-verified.
4. Server 1 language/framework, API contract, database, backup/recovery, and binding strategy.
5. Cloudflare Tunnel type/configuration, hostname strategy, and whether a stable named hostname is available. A stable hostname may reduce the need to publish changing trycloudflare URLs, if suitable for the user's account/setup.
6. How the Termux supervisor is installed, started, monitored, restarted, and stopped; whether Termux:Boot is later desired.
7. GitHub publishing credential strategy and least-privilege scope.
8. Authentication/session model, device approval and revocation, rate limits, TLS and abuse controls.
9. App updater manifest schema, release hosting, signing/integrity checks, downgrade policy, and install confirmation behavior.
10. Server data storage and backup/retention strategy for chats, profile, and memory.
11. How to avoid simultaneous daemon instances and prevent stale background jobs from publishing an obsolete endpoint.
12. Logging and health-check policy that does not leak chat content or credentials.

## Non-goals at this stage

- No implementation has been performed by this document.
- No Termux installation, service, tunnel, API, APK, updater, or daemon has been verified by this document.
- No claim that the endpoint currently changes or that auto-update already works.
- Do not invent the user's eight mode scripts, exact visual palette/font, profile questions, or remaining server details.

## Session handoff rule

At the start of every new coding-agent session, read:
- `AGENTS.md`
- `PROJECT_STATUS.md`
- `docs/DECISIONS.md`
- `docs/PRODUCT_SPEC.md`
- this file, `docs/ARCHITECTURE_DRAFT.md`
- `docs/BUG_HISTORY.md`

Before ending a meaningful task or whenever the conversation may be interrupted, update the durable project checkpoint with verified facts, changes, actual checks, open questions, and the next exact action. Conversation history is not the sole source of truth.
