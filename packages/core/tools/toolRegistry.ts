import { RiskLevel } from '../../shared/types.ts';
import { policyEngine } from '../security/policyEngine.ts';
import { auditLog } from '../security/auditLog.ts';

export interface ToolDefinition {
  name: string;
  description: string;
  riskLevel: RiskLevel;
  parametersSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>, traceId: string) => Promise<unknown>;
}

class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  public registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  public listTools(): Array<{ name: string; description: string; riskLevel: RiskLevel; parametersSchema: Record<string, unknown> }> {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      riskLevel: t.riskLevel,
      parametersSchema: t.parametersSchema,
    }));
  }

  public async executeTool(
    name: string,
    args: Record<string, unknown>,
    traceId: string,
    userExplicitApproved = false
  ): Promise<{ success: boolean; result?: unknown; error?: string; riskLevel: RiskLevel }> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        error: `Tool '${name}' not found in registry.`,
        riskLevel: 'LOW',
      };
    }

    // Policy check
    const policyDecision = policyEngine.evaluateAction(tool.name, tool.riskLevel, userExplicitApproved);
    if (!policyDecision.allowed) {
      // Audit blocked action
      auditLog.recordEntry({
        traceId,
        actor: 'JARVIS_AUTONOMOUS',
        action: `BLOCKED_${tool.name}`,
        toolName: tool.name,
        riskLevel: tool.riskLevel,
        authorizedBy: 'POLICY_AUTO',
        inputPayload: args,
        outputResult: { error: policyDecision.reason, blocked: true },
      });

      return {
        success: false,
        error: policyDecision.reason,
        riskLevel: tool.riskLevel,
      };
    }

    try {
      const result = await tool.execute(args, traceId);

      // Audit successful execution
      auditLog.recordEntry({
        traceId,
        actor: userExplicitApproved ? 'USER' : 'JARVIS_AUTONOMOUS',
        action: `EXECUTE_${tool.name}`,
        toolName: tool.name,
        riskLevel: tool.riskLevel,
        authorizedBy: userExplicitApproved ? 'USER_EXPLICIT' : 'POLICY_AUTO',
        inputPayload: args,
        outputResult: { success: true, preview: typeof result === 'object' ? result : String(result) },
      });

      return { success: true, result, riskLevel: tool.riskLevel };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      auditLog.recordEntry({
        traceId,
        actor: 'JARVIS_AUTONOMOUS',
        action: `FAILED_${tool.name}`,
        toolName: tool.name,
        riskLevel: tool.riskLevel,
        authorizedBy: 'POLICY_AUTO',
        inputPayload: args,
        outputResult: { success: false, error: errorMsg },
      });

      return { success: false, error: errorMsg, riskLevel: tool.riskLevel };
    }
  }
}

export const toolRegistry = new ToolRegistry();
