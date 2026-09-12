import { RiskLevel } from '../../shared/types.ts';

export interface PolicyDecision {
  allowed: boolean;
  requiresUserConfirmation: boolean;
  requiresDryRunDiff: boolean;
  reason: string;
}

const RISK_HIERARCHY: Record<RiskLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

class PolicyEngine {
  private userThreshold: RiskLevel = 'MEDIUM'; // By default, HIGH and CRITICAL require explicit confirmation

  public setUserThreshold(level: RiskLevel): void {
    this.userThreshold = level;
  }

  public getUserThreshold(): RiskLevel {
    return this.userThreshold;
  }

  public evaluateAction(toolName: string, riskLevel: RiskLevel, userExplicitApproved = false): PolicyDecision {
    const actionRiskNum = RISK_HIERARCHY[riskLevel];
    const thresholdNum = RISK_HIERARCHY[this.userThreshold];

    // Critical actions ALWAYS require explicit authorization and dry run
    if (riskLevel === 'CRITICAL') {
      if (!userExplicitApproved) {
        return {
          allowed: false,
          requiresUserConfirmation: true,
          requiresDryRunDiff: true,
          reason: `CRITICAL action '${toolName}' strictly requires user confirmation before execution.`,
        };
      }
      return {
        allowed: true,
        requiresUserConfirmation: true,
        requiresDryRunDiff: true,
        reason: `CRITICAL action '${toolName}' authorized by user override.`,
      };
    }

    // High risk actions (calendar modifications, message sending, file alteration)
    if (riskLevel === 'HIGH') {
      if (actionRiskNum > thresholdNum && !userExplicitApproved) {
        return {
          allowed: false,
          requiresUserConfirmation: true,
          requiresDryRunDiff: true,
          reason: `Action '${toolName}' has HIGH risk and exceeds autonomous threshold (${this.userThreshold}). Needs approval.`,
        };
      }
      return {
        allowed: true,
        requiresUserConfirmation: false,
        requiresDryRunDiff: true,
        reason: `HIGH risk action permitted under current policy with dry-run diff requirement.`,
      };
    }

    // LOW and MEDIUM are auto-approved under normal operation
    return {
      allowed: true,
      requiresUserConfirmation: false,
      requiresDryRunDiff: false,
      reason: `Action '${toolName}' categorized as ${riskLevel}, within autonomous threshold.`,
    };
  }
}

export const policyEngine = new PolicyEngine();
