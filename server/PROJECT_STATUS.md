# KRSNA Project Status

## Checkpoint: Server 1 Memory Engine & Mode Directives Verified
- **Date**: October 12, 2026
- **Architecture**: WebSocket Server 1 (port 3000) bridging to upstream FreeLLMAPI (port 3001).
- **Database**: SQLite WAL mode at `data/krsna_memory.db`.
- **Context Builder**: 7-layer context assembly with token guard enforcing < 8,400 input tokens.
- **Modes**: All 8 modes active with custom directives (`COMPANION`, `ACADEMICS`, `FINANCE`, `GROWTH`, `LOST`, `RELATIONSHIP`, `FAMILY`, `FUTURE`).
- **Memory Subsystems**:
  - `memoryPuller.js`: Priority-based ranker (pinned > term-overlap > recency).
  - `memoryWorker.js`: Background fact distillation (Hinglish -> normalized keys), 12-turn rolling summaries, and debounced mode digests.
- **Status**: Live, verified, and operational.
