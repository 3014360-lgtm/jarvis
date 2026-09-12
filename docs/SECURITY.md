# JARVIS Security Architecture & Risk Policies

## 1. Zero Trust AI Architecture
1. **Model Isolation**: LLMs are treated as untrusted reasoning components. They **NEVER** receive raw API keys, session tokens, or private credentials.
2. **Deterministic Tool Boundaries**: The model only produces structured tool calls matching validated schemas.
3. **Execution Gatekeeper (PolicyEngine)**: Every tool invocation is intercepted by the `PolicyEngine` before reaching the execution layer.

## 2. Risk Classification Levels
| Level | Scope | Behavior |
|---|---|---|
| **LOW** | Read-only operations, public info lookups, local calculations | Auto-approved |
| **MEDIUM** | Creating temporary files, local scratchpad updates, reading personal files | Audited and permitted |
| **HIGH** | Modifying user calendars, sending messages, altering persistent files | Requires dry-run diff preview & explicit authorization |
| **CRITICAL** | Deleting databases, executing shell commands, altering system configs | Strictly quarantined; requires hardware confirmation |

## 3. Audit Log (Append-Only)
- Every action receives an immutable trace hash: `sha256(timestamp + tool + input + result + risk_level)`.
- Reversible actions define an explicit rollback function.
