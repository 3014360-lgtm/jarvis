import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Database,
  Search,
  Brain,
  GitPullRequest,
  Play,
  ShieldCheck,
  Archive,
} from 'lucide-react';
import { CognitiveStageLog, CognitiveStageName } from '../types.ts';

interface CognitiveLoopVisualizerProps {
  stages: CognitiveStageLog[];
  traceId?: string;
  isProcessing: boolean;
  activeStage?: string;
}

const STAGE_METADATA: Record<
  CognitiveStageName,
  { label: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  PERCEPTION: {
    label: '1. Percepção',
    description: 'Captura eventos normalizados de fontes autorizadas (Voz, Calendário, Android, Windows).',
    icon: Search,
  },
  INGESTION: {
    label: '2. Ingestão',
    description: 'Normalização estrutural, extração de texto, cálculo de checksum SHA-256 e deduplicação.',
    icon: Layers,
  },
  MEMORY: {
    label: '3. Memória',
    description: 'Recuperação híbrida RRF combinando busca vetorial densa, esparsa BM25 e decaimento temporal.',
    icon: Database,
  },
  CONTEXT: {
    label: '4. Contexto',
    description: 'Montagem priorizada em 9 camadas (L1 a L9) sob orçamento estrito de tokens.',
    icon: Layers,
  },
  REASONING: {
    label: '5. Raciocínio',
    description: 'Avaliação executiva de intenção e limites de segurança com modelo de fundação.',
    icon: Brain,
  },
  PLANNING: {
    label: '6. Planejamento',
    description: 'Geração de Grafo Direcionado Acíclico (DAG) com pré-condições, rollbacks e classificação de risco.',
    icon: GitPullRequest,
  },
  EXECUTION: {
    label: '7. Execução',
    description: 'Execução sequencial/paralela controlada com circuit breaker e sandboxing de ferramentas.',
    icon: Play,
  },
  VERIFICATION: {
    label: '8. Verificação',
    description: 'Reconsulta independente do estado do mundo real (não confia na saída da ferramenta).',
    icon: ShieldCheck,
  },
  RESULT_MEMORY: {
    label: '9. Memória do Resultado',
    description: 'Persistência do episódio, atualização da janela deslizante e selo criptográfico de auditoria.',
    icon: Archive,
  },
};

export const CognitiveLoopVisualizer: React.FC<CognitiveLoopVisualizerProps> = ({
  stages,
  traceId,
  isProcessing,
  activeStage,
}) => {
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});

  const toggleExpand = (stageName: string) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stageName]: !prev[stageName],
    }));
  };

  const orderedStageNames: CognitiveStageName[] = [
    'PERCEPTION',
    'INGESTION',
    'MEMORY',
    'CONTEXT',
    'REASONING',
    'PLANNING',
    'EXECUTION',
    'VERIFICATION',
    'RESULT_MEMORY',
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-cyan-900/40 bg-slate-900/80">
        <div>
          <h2 className="text-base font-mono font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Loop Cognitivo Canônico — 9 Fases Explícitas
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Cada ciclo é rastreado por um <code className="text-cyan-300 font-mono">trace_id</code> único que atravessa todas as camadas do JARVIS.
          </p>
        </div>

        {traceId && (
          <div className="flex items-center gap-2 font-mono text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-cyan-800/60">
            <span className="text-slate-400">Trace:</span>
            <span className="text-cyan-300 font-semibold">{traceId}</span>
          </div>
        )}
      </div>

      {/* 9 Stages Pipeline Flow */}
      <div className="space-y-3">
        {orderedStageNames.map((stageName, index) => {
          const meta = STAGE_METADATA[stageName];
          const Icon = meta.icon;
          const stageLog = stages.find((s) => s.stage === stageName);
          const isCurrentActive = isProcessing && activeStage === stageName;
          const isCompleted = Boolean(stageLog && stageLog.status === 'SUCCESS');
          const isFailed = Boolean(stageLog && stageLog.status === 'FAILED');
          const isExpanded = Boolean(expandedStages[stageName]);

          return (
            <div
              key={stageName}
              id={`stage-card-${stageName}`}
              className={`rounded-xl border transition-all duration-300 ${
                isCurrentActive
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : isCompleted
                  ? 'border-slate-800 bg-slate-900/60'
                  : isFailed
                  ? 'border-rose-900/70 bg-rose-950/20'
                  : 'border-slate-900 bg-slate-950/40 opacity-70'
              }`}
            >
              {/* Stage Summary Row */}
              <div
                onClick={() => toggleExpand(stageName)}
                className="flex items-center justify-between p-3.5 cursor-pointer select-none hover:bg-slate-800/30 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      isCompleted
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                        : isCurrentActive
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 animate-pulse'
                        : isFailed
                        ? 'bg-rose-950 border-rose-500 text-rose-400'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {meta.label}
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.2 rounded border border-emerald-800/50">
                          <CheckCircle2 className="w-3 h-3" />
                          CONCLUÍDO
                        </span>
                      )}
                      {isCurrentActive && (
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.2 rounded border border-cyan-600 animate-pulse">
                          EXECUTANDO...
                        </span>
                      )}
                      {isFailed && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-950/50 px-2 py-0.2 rounded border border-rose-800/50">
                          <AlertTriangle className="w-3 h-3" />
                          FALHA
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {stageLog ? stageLog.outputSummary : meta.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {stageLog && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      {stageLog.durationMs} ms
                    </span>
                  )}
                  <button type="button" className="text-slate-400 hover:text-slate-200">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable Technical Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 text-xs space-y-2 bg-slate-950/50 rounded-b-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block">
                        Entrada / Resumo:
                      </span>
                      <p className="font-mono text-[11px] text-slate-300 mt-1 bg-slate-900/90 p-2 rounded border border-slate-800">
                        {stageLog?.inputSummary || 'Aguardando inicialização do estágio...'}
                      </p>
                    </div>

                    <div>
                      <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block">
                        Saída / Resultado:
                      </span>
                      <p className="font-mono text-[11px] text-cyan-300 mt-1 bg-slate-900/90 p-2 rounded border border-slate-800">
                        {stageLog?.outputSummary || 'Aguardando processamento...'}
                      </p>
                    </div>
                  </div>

                  {stageLog?.details && (
                    <div className="mt-2">
                      <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block">
                        Payload Estruturado (Auditável):
                      </span>
                      <pre className="mt-1 p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-48">
                        {JSON.stringify(stageLog.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
