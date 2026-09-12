import React, { useState, useEffect } from 'react';
import {
  Brain,
  HelpCircle,
  CheckCircle,
  XCircle,
  Sparkles,
  Search,
  Sliders,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { InferredPreference, SuggestedAutomation } from '../types.ts';

export const ContinuousLearningView: React.FC = () => {
  const [preferences, setPreferences] = useState<InferredPreference[]>([]);
  const [automations, setAutomations] = useState<SuggestedAutomation[]>([]);
  const [toolMetrics, setToolMetrics] = useState<Array<{ tool: string; calls: number; successRate: number }>>([]);
  const [explainQuery, setExplainQuery] = useState<string>('Alocar bloco de estudo às 08:30');
  const [explanation, setExplanation] = useState<any | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);

  const fetchLearningData = async () => {
    try {
      const res = await fetch('/api/learning/overview');
      const data = await res.json();
      setPreferences(data.preferences || []);
      setAutomations(data.automations || []);
      setToolMetrics(data.toolMetrics || []);
    } catch {
      // handled
    }
  };

  useEffect(() => {
    fetchLearningData();
  }, []);

  const handleConfirmPref = async (id: string) => {
    try {
      await fetch('/api/learning/confirm-pref', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchLearningData();
    } catch {
      // handled
    }
  };

  const handleUpdateAutomation = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await fetch('/api/learning/automation-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchLearningData();
    } catch {
      // handled
    }
  };

  const handleExplainAction = async () => {
    if (!explainQuery.trim()) return;
    setIsExplaining(true);
    try {
      const res = await fetch('/api/learning/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: explainQuery }),
      });
      const data = await res.json();
      setExplanation(data);
    } catch {
      // handled
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4" />
            <span>Aprendizado Contínuo & Explicabilidade Total</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Preferências Inferidas, Sugestões de Automação e Auditoria "Por que você fez isso?"
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            O aprendizado no JARVIS opera estritamente sobre DADOS versionados — nunca código
            auto-modificável. Toda decisão é reversível e explicável até a evidência de origem.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4" />
          <span>Controle Humano Mandatório</span>
        </div>
      </div>

      {/* Decision Explainability Inspector */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">
            Auditoria Explicativa ("Por que você tomou essa decisão?")
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            id="input-explain-query"
            type="text"
            value={explainQuery}
            onChange={(e) => setExplainQuery(e.target.value)}
            placeholder="Descreva a ação a ser auditada..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            id="btn-explain-action"
            onClick={handleExplainAction}
            disabled={isExplaining}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isExplaining ? 'Inspecionando...' : 'Explicar Decisão'}
          </button>
        </div>

        {explanation && (
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs space-y-2">
            <div className="flex items-center justify-between font-mono text-cyan-300 font-bold">
              <span>{explanation.rule}</span>
              <span>Confiança: {(explanation.confidence * 100).toFixed(0)}%</span>
            </div>
            <p className="text-slate-300"><b className="text-slate-400">Origem:</b> {explanation.origin}</p>
            <p className="text-slate-300"><b className="text-slate-400">Evidência:</b> {explanation.evidence}</p>
          </div>
        )}
      </div>

      {/* Grid: Preferences & Suggested Automations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inferred Preferences */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Preferências e Hábitos Observados</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Requer confirmação humana
            </span>
          </div>

          <div className="space-y-3">
            {preferences.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-100">{p.statement}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400">
                    {(p.confidence * 100).toFixed(0)}% conf
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Evidência: {p.originEvidence}
                </p>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Status: {p.userConfirmed ? 'Confirmado pelo Usuário' : 'Aguardando Aprovação'}
                  </span>
                  {!p.userConfirmed && (
                    <button
                      onClick={() => handleConfirmPref(p.id)}
                      className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[11px] font-mono font-bold cursor-pointer transition-all"
                    >
                      Confirmar Preferência
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Automations */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Automações Propostas pelo Sistema</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Gate explícito</span>
          </div>

          <div className="space-y-3">
            {automations.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-100">{a.title}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      a.status === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : a.status === 'REJECTED'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300">
                  <span className="text-slate-500 font-mono">Gatilho:</span> {a.triggerCondition}
                </div>
                <div className="text-[11px] text-slate-300">
                  <span className="text-slate-500 font-mono">Ação:</span> {a.proposedAction}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Evidência: {a.evidence}
                </div>

                {a.status === 'PROPOSED' && (
                  <div className="pt-2 border-t border-slate-900 flex justify-end gap-2">
                    <button
                      onClick={() => handleUpdateAutomation(a.id, 'REJECTED')}
                      className="px-3 py-1 rounded bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-300 text-[11px] font-mono border border-slate-800 cursor-pointer"
                    >
                      Rejeitar
                    </button>
                    <button
                      onClick={() => handleUpdateAutomation(a.id, 'APPROVED')}
                      className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[11px] font-mono font-bold cursor-pointer"
                    >
                      Aprovar Automação
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
