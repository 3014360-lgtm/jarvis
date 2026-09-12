# ADR 0001: Technology Stack & Architectural Decisions

## Status
**ACCEPTED** (2026-09-12)

## Context
Project "JARVIS" is an autonomous personal AI operating system operating across multiple interaction surfaces (Web, Android, Windows Desktop, WhatsApp, Voice, and CLI). The canonical cognitive loop requires:
`PERCEPTION → INGESTION → MEMORY → CONTEXT → REASONING → PLANNING → EXECUTION → VERIFICATION → RESULT MEMORY`.

The host runtime was evaluated during Stage 0 (`docs/environment-report.md`):
- Node.js 22.23.2 + npm 10.9.8 + Python 3.10.12 available on Debian 12 (gVisor container).
- Port 3000 is the sole externally routed ingress port.
- Gemini API (`GEMINI_API_KEY`) is active in the environment.

## Decision
1. **Core Orchestration & Gateway**:
   - Built on Node.js 22 / TypeScript + Express to unify the backend API, real-time WebSocket/SSE telemetry, and Vite-served futuristic UI within port 3000.
   - Strict separation of concerns across canonical packages: `packages/core/`, `packages/shared/`, `packages/browser/`, `packages/web/`, `apps/android/`, `apps/windows-agent/`.

2. **Cognitive Loop (Canonical 9-Stage Pipeline)**:
   - Implemented as typed asynchronous pipeline with explicit interfaces for every stage.
   - Every execution assigns an end-to-end `trace_id`, execution span tracking, and audit logging.

3. **Memory Layer**:
   - Partitioned into 7 distinct stores:
     - `WorkingMemory`: active session sliding window with progressive compression.
     - `EpisodicMemory`: append-only events with hourly/daily/weekly hierarchical summaries.
     - `SemanticMemory`: knowledge graph of facts, concepts, entities, and relationships.
     - `ProceduralMemory`: versioned automation recipes and success-rated routines.
     - `PreferencesStore`: typed user settings and constraints.
     - `ActionHistory`: immutable audit log of tool calls with risk classifications.
     - `DocumentStore`: ingested files, chunking, and vector index.
   - Hybrid Retrieval: Reciprocal Rank Fusion (RRF) combining vector cosine distance + BM25 text match + recency/importance decay.

4. **Safety & Policy Engine**:
   - 4-Tier Risk Categorization (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
   - High/Critical actions (e.g. system alterations, calendar writes) require explicit user confirmation or dry-run inspection.
   - AI model never receives secrets or credentials directly.

5. **Multiplatform Surfaces**:
   - **Web Dashboard**: Futuristic HUD dashboard with live HUD visualizer, real-time cognitive trace stream, memory inspector, plan DAG viewer, interactive voice agent, and CLI console.
   - **Android**: Jetpack Compose + Foreground Service + Wake Word contract specification and bridge.
   - **Windows Agent**: .NET 8 / C# Windows Service IPC contract and automation bridge.
   - **WhatsApp**: Official Cloud API webhook gateway and template handler.
   - **Voice**: Web Speech API + SpeechSynthesis / Gemini audio integration.

## Consequences
- Fast cold-start, single-port compliance for container sandbox.
- Complete type safety across shared contracts (`packages/shared/types.ts`).
- Full adherence to the prompt rules: no stubs, real executable code, verifiable endpoints.
