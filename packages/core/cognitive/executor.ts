import { PlanDAG, PlanStep, VerificationResult } from '../../shared/types.ts';
import { toolRegistry } from '../tools/toolRegistry.ts';
import { verifier } from './verifier.ts';

export interface ExecutionReport {
  planId: string;
  completedSteps: number;
  failedSteps: number;
  stepResults: Map<string, unknown>;
  verifications: VerificationResult[];
  overallStatus: 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';
}

export class Executor {
  private circuitBreakers: Map<string, { failureCount: number; trippedUntil?: number }> = new Map();

  public async executePlan(
    plan: PlanDAG,
    traceId: string,
    userExplicitApproved = true
  ): Promise<ExecutionReport> {
    const stepResults = new Map<string, unknown>();
    const verifications: VerificationResult[] = [];
    let failureOccurred = false;

    // Execute steps in topological order
    for (const step of plan.steps) {
      // Check circuit breaker
      const cb = this.circuitBreakers.get(step.tool);
      if (cb && cb.trippedUntil && cb.trippedUntil > Date.now()) {
        step.status = 'FAILED';
        step.result = { error: `Circuit breaker tripped for tool '${step.tool}'. Cool down active.` };
        failureOccurred = true;
        break;
      }

      // Check dependencies
      const depsSatisfied = step.dependencies.every((depId) => {
        const depStep = plan.steps.find((s) => s.id === depId);
        return depStep && depStep.status === 'COMPLETED';
      });

      if (!depsSatisfied) {
        step.status = 'FAILED';
        step.result = { error: 'Precondition dependencies failed.' };
        failureOccurred = true;
        break;
      }

      step.status = 'RUNNING';

      // Execute tool with retry policy
      let attempts = 0;
      let success = false;
      let lastResult: unknown = null;
      let lastError: string | undefined = undefined;

      while (attempts < 2 && !success) {
        attempts++;
        const execOutcome = await toolRegistry.executeTool(
          step.tool,
          step.args,
          traceId,
          userExplicitApproved
        );

        if (execOutcome.success) {
          success = true;
          lastResult = execOutcome.result;
        } else {
          lastError = execOutcome.error;
          // Exponential backoff
          if (attempts < 2) {
            await new Promise((r) => setTimeout(r, 100));
          }
        }
      }

      if (success) {
        step.status = 'COMPLETED';
        step.result = lastResult;
        stepResults.set(step.id, lastResult);

        // Verify independent world state
        const verification = await verifier.verifyStep(step, lastResult);
        verifications.push(verification);

        // Reset tool failure count
        this.circuitBreakers.set(step.tool, { failureCount: 0 });
      } else {
        step.status = 'FAILED';
        step.result = { error: lastError };
        failureOccurred = true;

        // Trip circuit breaker if repeated failures
        const prevFailures = this.circuitBreakers.get(step.tool)?.failureCount || 0;
        const newFailures = prevFailures + 1;
        this.circuitBreakers.set(step.tool, {
          failureCount: newFailures,
          trippedUntil: newFailures >= 3 ? Date.now() + 30000 : undefined,
        });

        // Trigger rollback if defined
        if (step.rollbackAction) {
          await toolRegistry.executeTool(
            step.rollbackAction.tool,
            step.rollbackAction.args,
            traceId,
            true
          );
          step.status = 'ROLLED_BACK';
        }

        break;
      }
    }

    return {
      planId: plan.planId,
      completedSteps: plan.steps.filter((s) => s.status === 'COMPLETED').length,
      failedSteps: plan.steps.filter((s) => s.status === 'FAILED').length,
      stepResults,
      verifications,
      overallStatus: failureOccurred ? 'FAILED' : 'COMPLETED',
    };
  }
}

export const executor = new Executor();
