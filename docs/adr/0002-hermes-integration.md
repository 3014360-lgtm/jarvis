# ADR 0002: Hermes Agent Integration Architecture

**Status:** Accepted  
**Date:** 2026-09-12  
**Deciders:** JARVIS Core Architecture Team

---

## Context

JARVIS is designed as an autonomous personal operating system. External task agents such as Hermes Agent provide complementary capabilities for specialized exploration, long-horizon deep navigation, or external tooling. However, unbounded integration of third-party autonomous agents presents high security, policy adherence, and non-determinism risks.

## Decision

We establish an explicit containment hierarchy for Hermes Agent within JARVIS:

```
JARVIS CORE
    ↓
CENTRAL ORCHESTRATOR
    ↓
[ HERMES ADAPTER | NATIVE TOOLS | SPECIALIZED AGENTS ]
```

1. **Discovery Probe:** JARVIS verifies environmental availability of the Hermes runtime (CLI binary, Python SDK, or local daemon). If absent, a compliant `NullHermesAdapter` activates gracefully, providing zero degradation of core JARVIS functions.
2. **ExternalAgentAdapter Contract:** Hermes operates behind a strongly-typed adapter interface:
   - `submitTask(task: ExternalTaskRequest): Promise<ExternalTaskResult>`
   - `streamProgress(taskId: string): AsyncIterable<ProgressEvent>`
   - `cancelTask(taskId: string): Promise<boolean>`
3. **Strict Containment:**
   - Hermes NEVER executes side-effects directly on the host system.
   - Any tool action proposed by Hermes must be routed back into the JARVIS `PolicyEngine` and `toolRegistry` for evaluation and permission verification.
   - Hermes requests are evaluated against the current system risk threshold (`BAIXO`, `MÉDIO`, `ALTO`, `CRÍTICO`).
4. **Zero-Duplicate Routing:** The Central Orchestrator routes tasks to Hermes strictly when specialized external exploration or long-horizon web automation is advantageous over native deterministic tools.

## Consequences

- **Positive:** Modular integration without vendor lock-in. System remains 100% operational when Hermes is not installed.
- **Security:** Complete compliance with JARVIS audit logging, secret zero-exposure, and user confirmation policies.
