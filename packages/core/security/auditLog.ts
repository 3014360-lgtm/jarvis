import crypto from 'crypto';
import { AuditLogEntry, RiskLevel } from '../../shared/types.ts';

/**
 * JARVIS Append-Only Cryptographic Audit Log
 * Each entry is linked to the previous entry via SHA-256 hash chaining.
 * Uses immutable frozen serialization to ensure idempotent verification.
 */
class AuditLogSystem {
  private entries: AuditLogEntry[] = [];
  private lastHash: string = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor() {
    this.recordEntry({
      traceId: 'sys-genesis',
      actor: 'SYSTEM',
      action: 'JARVIS_KERNEL_INITIALIZED',
      riskLevel: 'LOW',
      authorizedBy: 'POLICY_AUTO',
      inputPayload: { version: '1.0.0', state: 'ONLINE' },
      outputResult: { status: 'INITIALIZED' },
    });
  }

  private serializeEntry(entry: {
    id: string;
    traceId: string;
    timestamp: string;
    actor: string;
    action: string;
    toolName?: string;
    riskLevel: string;
    authorizedBy: string;
    inputPayload: Record<string, unknown>;
    outputResult: Record<string, unknown>;
    previousHash: string;
  }): string {
    return [
      entry.id,
      entry.traceId,
      entry.timestamp,
      entry.actor,
      entry.action,
      entry.toolName || '',
      entry.riskLevel,
      entry.authorizedBy,
      JSON.stringify(entry.inputPayload),
      JSON.stringify(entry.outputResult),
      entry.previousHash,
    ].join('|');
  }

  public recordEntry(params: {
    traceId: string;
    actor: 'JARVIS_AUTONOMOUS' | 'USER' | 'SYSTEM';
    action: string;
    toolName?: string;
    riskLevel: RiskLevel;
    authorizedBy: 'POLICY_AUTO' | 'USER_EXPLICIT';
    inputPayload: Record<string, unknown>;
    outputResult: Record<string, unknown>;
  }): AuditLogEntry {
    const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();
    const previousHash = this.lastHash;

    // Deep freeze payloads to prevent post-execution mutation divergence
    const frozenInput: Record<string, unknown> = JSON.parse(JSON.stringify(params.inputPayload || {}));
    const frozenOutput: Record<string, unknown> = JSON.parse(JSON.stringify(params.outputResult || {}));

    const rawString = this.serializeEntry({
      id,
      traceId: params.traceId,
      timestamp,
      actor: params.actor,
      action: params.action,
      toolName: params.toolName,
      riskLevel: params.riskLevel,
      authorizedBy: params.authorizedBy,
      inputPayload: frozenInput,
      outputResult: frozenOutput,
      previousHash,
    });

    const hash = crypto.createHash('sha256').update(rawString).digest('hex');
    this.lastHash = hash;

    const entry: AuditLogEntry = {
      id,
      traceId: params.traceId,
      timestamp,
      actor: params.actor,
      action: params.action,
      toolName: params.toolName,
      riskLevel: params.riskLevel,
      authorizedBy: params.authorizedBy,
      inputPayload: frozenInput,
      outputResult: frozenOutput,
      hash,
      previousHash,
    };

    this.entries.push(entry);
    return entry;
  }

  public append(params: {
    traceId: string;
    userAuthorized?: boolean;
    action: string;
    tool?: string;
    inputPayload?: Record<string, unknown>;
    outputPayload?: Record<string, unknown>;
    riskLevel?: RiskLevel;
    policyDecision?: string;
    durationMs?: number;
  }): AuditLogEntry {
    return this.recordEntry({
      traceId: params.traceId,
      actor: params.userAuthorized ? 'USER' : 'JARVIS_AUTONOMOUS',
      action: params.action,
      toolName: params.tool,
      riskLevel: params.riskLevel || 'LOW',
      authorizedBy: params.userAuthorized ? 'USER_EXPLICIT' : 'POLICY_AUTO',
      inputPayload: params.inputPayload || {},
      outputResult: params.outputPayload || {},
    });
  }

  public getEntries(limit = 100): AuditLogEntry[] {
    return this.entries.slice(-limit);
  }

  public verifyIntegrity(): { valid: boolean; totalChecked: number; brokenAtId?: string } {
    let prev = '0000000000000000000000000000000000000000000000000000000000000000';
    for (let i = 0; i < this.entries.length; i++) {
      const e = this.entries[i];
      if (e.previousHash !== prev) {
        return { valid: false, totalChecked: i, brokenAtId: e.id };
      }
      const rawString = this.serializeEntry({
        id: e.id,
        traceId: e.traceId,
        timestamp: e.timestamp,
        actor: e.actor,
        action: e.action,
        toolName: e.toolName,
        riskLevel: e.riskLevel,
        authorizedBy: e.authorizedBy,
        inputPayload: e.inputPayload,
        outputResult: e.outputResult,
        previousHash: e.previousHash,
      });
      const calculatedHash = crypto.createHash('sha256').update(rawString).digest('hex');
      if (calculatedHash !== e.hash) {
        return { valid: false, totalChecked: i, brokenAtId: e.id };
      }
      prev = e.hash;
    }
    return { valid: true, totalChecked: this.entries.length };
  }
}

export const auditLog = new AuditLogSystem();
