# Developer Guide: Extending JARVIS

This document provides complete instructions for extending the JARVIS Autonomous AI OS with new tools, agents, connectors, and protocols.

---

## 1. Adding a New Tool

All agent actions execute through the strict `ToolDefinition` contract in `packages/core/tools/toolRegistry.ts`.

### 1.1 Tool Specification Requirements

Every tool MUST declare:
```typescript
interface ToolDefinition {
  name: string;                   // snake_case, unique identifier
  version: string;                // semver, e.g. "1.0.0"
  description: string;            // Model-oriented description
  parametersSchema: object;       // JSON Schema strict (additionalProperties: false)
  outputSchema?: object;          // Output verification schema
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiredPermissions?: string[]; // e.g. ['calendar:write', 'filesystem:write']
  sideEffects?: 'none' | 'read' | 'write' | 'destructive' | 'external';
  idempotencyKeyFn?: (args: any) => string;
  timeoutMs?: number;             // Default 30000ms
  requiresBackup?: boolean;       // True for file modifications or deletions
  rollback?: (args: any, context: any) => Promise<boolean>;
  verify?: (result: any) => Promise<boolean>;
  dryRun?: (args: any) => Promise<any>;
  execute: (args: Record<string, unknown>, context?: ToolExecutionContext) => Promise<unknown>;
}
```

### 1.2 Scaffold a New Tool

You can generate a scaffolded tool with tests using the CLI tool generator:
```bash
npm run jarvis -- tools new --name my_custom_tool --risk MEDIUM
```

### 1.3 Step-by-Step Implementation

1. **Implement Class/Definition:** In `packages/core/tools/implementations/`, create `myCustomTool.ts`.
2. **Register in Tool Registry:** Register with `toolRegistry.registerTool(myCustomTool)`.
3. **Write Unit Test:** Add contract tests in `tests/tools/myCustomTool.test.ts`.
4. **Define Policy:** Assign appropriate `riskLevel` and permissions in `packages/core/security/policyEngine.ts`.
5. **Verify Contract:** Run `npm test` to ensure all 45+ mandatory tools remain green.

---

## 2. Adding a Specialized Agent

To add a new specialized agent under `packages/core/agents/`:
1. Implement `SpecializedAgent` interface with `name`, `systemPrompt`, `allowedTools`, and `handleTask(task)`.
2. Register the agent inside the `CentralOrchestrator` router.
3. Add delegation trace metrics to OpenTelemetry spans.

---

## 3. Adding an Ingestion Connector

To add perception connectors in `packages/core/perception/`:
1. Implement `PerceptionConnector` with `id`, `name`, `optInStatus`, `pollInterval`, and `fetchEvents()`.
2. Ensure PII redaction and non-instructional tag wrapping (`<<UNTRUSTED_CONTENT>>`) before committing to the `WorldModel`.
