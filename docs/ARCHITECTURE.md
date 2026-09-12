# JARVIS System Architecture

## 1. System Topology Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTERACTION SURFACES                         │
│   Web Dashboard  │ Android App │ Windows Agent │ WhatsApp │ CLI │
└───────────────────────────┬─────────────────────────────────────┘
                            │  (REST / SSE / WebSockets)
┌───────────────────────────▼─────────────────────────────────────┐
│                        API GATEWAY                              │
│   AuthN/AuthZ · Rate Limiting · Trace ID · Request Validation   │
└───────────────────────────┬─────────────────────────────────────┘
┌───────────────────────────▼─────────────────────────────────────┐
│                        JARVIS CORE                              │
│  CognitiveLoop · ContextBuilder · Planner · Executor ·          │
│  Verifier · PolicyEngine · EventBus · MemoryManager             │
└──┬──────────┬──────────┬──────────┬──────────┬──────────────────┘
   │          │          │          │          │
┌──▼───┐ ┌───▼────┐ ┌───▼────┐ ┌───▼─────┐ ┌──▼─────────────┐
│MEMORY│ │ TOOL   │ │ORCHES- │ │ MODEL   │ │ PERCEPTION /   │
│LAYER │ │REGISTRY│ │TRATOR  │ │ ROUTER  │ │ INGESTION      │
└──┬───┘ └───┬────┘ └───┬────┘ └────┬────┘ └──┬──────────────┘
   │         │          │           │          │
┌──▼─────────▼──────────▼───────────▼──────────▼────────────────┐
│  PERSISTENCE & SECURITY: Memory Stores · Vault · Audit Log     │
└───────────────────────────────────────────────────────────────┘
```

## 2. Canonical Cognitive Loop

Every user request or autonomous perception trigger enters the 9-stage pipeline:

```
[1. PERCEPTION]   ──> Detect events from authorized sources (calendar, inputs, files, OS)
       │
[2. INGESTION]    ──> Parse, normalize, extract entities, compute checksums
       │
[3. MEMORY]       ──> Hybrid retrieve relevant context across 7 stores via RRF
       │
[4. CONTEXT]      ──> Assemble prioritized ContextBundle under strict token budget
       │
[5. REASONING]    ──> Evaluate intent, assess safety boundaries, formulate approach
       │
[6. PLANNING]     ──> Generate DAG of typed steps with pre/post-conditions & rollbacks
       │
[7. EXECUTION]    ──> Execute steps via ToolRegistry with sandboxing & circuit breaker
       │
[8. VERIFICATION] ──> Check actual world state (SUCCESS | PARTIAL | FAILED | UNVERIFIABLE)
       │
[9. RESULT MEMORY]──> Record episode, provenance, cost, latency, metrics in audit log
```

## 3. Memory Subsystem
See `docs/MEMORY.md` for complete schema and retrieval equations.
- **Working Memory**: Dynamic sliding window of current interaction.
- **Episodic Memory**: Event log with automatic hourly/daily/weekly aggregation.
- **Semantic Memory**: Knowledge graph connecting entities, concepts, and relationships.
- **Procedural Memory**: Playbooks and automation recipes with tracked success rates.
- **Preferences**: Explicit user preferences, constraints, and operational bounds.
- **Action History**: Immutable, append-only tool execution log.
- **Documents**: Ingested knowledge chunks with vector embeddings.
