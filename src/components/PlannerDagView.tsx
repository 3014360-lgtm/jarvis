import React from 'react';
import {
  GitFork,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Layers,
  FileCheck,
} from 'lucide-react';
import { PlanDAG, VerificationResult } from '../types.ts';

interface PlannerDagViewProps {
  plan: PlanDAG | null;
  verifications: VerificationResult[];
  onExecuteApprovedPlan?: () => void;
  isProcessing?: boolean;
}

export const PlannerDagView: React.FC<PlannerDagViewProps> = ({
  plan,
  verifications,
  onExecuteApprovedPlan,
  isProcessing,
}) => {
  if (!plan) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
        <GitFork className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="font-mono text-sm font-bold text-slate-300">Nenhum Plano DAG em Memória Ativa</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 font-sans">
          Execute uma diretiva no deck de comando (como "Organizar minha semana") para que o JARVIS sintetize um novo grafo acíclico direcionado de execução.
        </p>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300';
      case 'MEDIUM':
        return 'bg-amber-950/80 border-amber-500/50 text-amber-300';
      case 'HIGH':
        return 'bg-orange-950/80 border-orange-500/50 text-orange-300';
      case 'CRITICAL':
        return 'bg-rose-950/80 border-rose-500/50 text-rose-300';
      default:
        return 'bg-slate-900 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 rounded-xl border border-cyan-900/40 bg-slate-900/70">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-cyan-400" />
            <h2 className="font-mono text-sm font-bold text-slate-100">
              Grafo de Execução (Plan DAG)
            </h2>
            <span className="font-mono text-xs text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
              {plan.planId}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Meta: <span className="text-slate-200">"{plan.goal}"</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold ${getRiskColor(plan.totalRiskLevel)}`}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Risco Total: {plan.totalRiskLevel}</span>
          </div>

          <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800">
            {plan.steps.length} Passos no Grafo
          </span>
        </div>
      </div>

      {/* Diff Preview if available */}
      {plan.diffSummary && (
        <div className="p-4 rounded-xl border border-cyan-800/40 bg-cyan-950/20 space-y-3">
          <div className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Diff das Mutações Autorizadas no Estado Digital
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">
                + Adições ({plan.diffSummary.added.length})
              </span>
              {plan.diffSummary.added.map((item, idx) => (
                <div key={idx} className="text-slate-300 text-[11px] py-0.5">
                  • {item}
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">
                ~ Modificações ({plan.diffSummary.modified.length})
              </span>
              {plan.diffSummary.modified.map((item, idx) => (
                <div key={idx} className="text-slate-300 text-[11px] py-0.5">
                  • {item}
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
              <span className="text-rose-400 font-bold block mb-1">
                - Exclusões ({plan.diffSummary.deleted.length})
              </span>
              {plan.diffSummary.deleted.length === 0 ? (
                <span className="text-slate-500 text-[11px]">Nenhuma exclusão prevista.</span>
              ) : (
                plan.diffSummary.deleted.map((item, idx) => (
                  <div key={idx} className="text-slate-300 text-[11px] py-0.5">
                    • {item}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DAG Steps Sequence */}
      <div className="space-y-4">
        <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
          Etapas do Grafo e Verificações de Estado
        </h3>

        <div className="space-y-3">
          {plan.steps.map((step, idx) => {
            const verification = verifications.find((v) => v.stepId === step.id);
            const isCompleted = step.status === 'COMPLETED';

            return (
              <div
                key={step.id}
                id={`dag-step-${step.id}`}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-600 flex items-center justify-center font-mono text-[10px] text-cyan-300 font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-200">{step.title}</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {step.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getRiskColor(step.riskLevel)}`}>
                      {step.riskLevel}
                    </span>
                    <span className="font-mono text-[11px] text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/80">
                      tool: {step.tool}
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                        <CheckCircle2 className="w-3 h-3" />
                        EXECUTADO
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block">
                      Parâmetros / Argumentos:
                    </span>
                    <pre className="mt-1 p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-[10px] text-slate-300 overflow-x-auto">
                      {JSON.stringify(step.args, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block">
                      Resultado Esperado:
                    </span>
                    <p className="mt-1 p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300">
                      {step.expectedOutcome}
                    </p>

                    {step.rollbackAction && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                        <RotateCcw className="w-3 h-3 text-amber-400" />
                        <span>Rollback:</span>
                        <code className="text-amber-300">{step.rollbackAction.tool}</code>
                      </div>
                    )}
                  </div>
                </div>

                {/* Independent Verification Report */}
                {verification && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">Verificação Independente:</span>
                      <span className="text-slate-300">{verification.actualState}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                      STATUS: {verification.status}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
