import React, { useState, useEffect } from 'react';
import { HudHeader } from './components/HudHeader.tsx';
import { CommandDeck } from './components/CommandDeck.tsx';
import { CognitiveLoopVisualizer } from './components/CognitiveLoopVisualizer.tsx';
import { PlannerDagView } from './components/PlannerDagView.tsx';
import { MemoryMatrixView } from './components/MemoryMatrixView.tsx';
import { SecurityAuditView } from './components/SecurityAuditView.tsx';
import { MultiplatformHub } from './components/MultiplatformHub.tsx';
import { CliConsole } from './components/CliConsole.tsx';
import { StudyView } from './components/StudyView.tsx';
import { ProtocolsView } from './components/ProtocolsView.tsx';
import { WorldModelView } from './components/WorldModelView.tsx';
import { ContinuousLearningView } from './components/ContinuousLearningView.tsx';
import { DocumentationView } from './components/DocumentationView.tsx';
import {
  ActiveTab,
  CognitiveCycleResponse,
  CognitiveStageLog,
  RiskLevel,
  SystemStatusData,
} from './types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('command');
  const [systemStatus, setSystemStatus] = useState<SystemStatusData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeStage, setActiveStage] = useState<string | undefined>(undefined);
  const [latestResponse, setLatestResponse] = useState<CognitiveCycleResponse | null>(null);
  const [stages, setStages] = useState<CognitiveStageLog[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setSystemStatus(data);
    } catch {
      // fetch error handled
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);

    // Setup SSE live stream
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/traces/stream');
      eventSource.addEventListener('cycle_start', (e) => {
        setIsProcessing(true);
        setActiveStage('PERCEPTION');
        showToast('Novo ciclo cognitivo iniciado...');
      });
      eventSource.addEventListener('cycle_complete', (e) => {
        setIsProcessing(false);
        setActiveStage(undefined);
        fetchStatus();
      });
    } catch {
      // SSE fallback
    }

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleExecuteGoal = async (goal: string, source: 'USER_INPUT' | 'VOICE' = 'USER_INPUT') => {
    setIsProcessing(true);
    setActiveStage('PERCEPTION');
    try {
      const res = await fetch('/api/cognitive/cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, source, userExplicitApproved: true }),
      });
      const data: CognitiveCycleResponse = await res.json();
      setLatestResponse(data);
      setStages(data.stages || []);
      showToast('Ciclo cognitivo concluído com sucesso!');
      fetchStatus();
    } catch (err) {
      showToast(`Erro na execução: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
      setActiveStage(undefined);
    }
  };

  const handleRunCanonicalOrganizeWeek = async () => {
    setIsProcessing(true);
    setActiveStage('PERCEPTION');
    showToast('Executando fluxo canônico: Organize Minha Semana...');
    try {
      const res = await fetch('/api/canonical/organize-week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userExplicitApproved: true }),
      });
      const data = await res.json();
      if (data.cycleResponse) {
        setLatestResponse(data.cycleResponse);
        setStages(data.cycleResponse.stages || []);
      }
      showToast('Semana organizada! Blocos de foco alocados no calendário.');
      fetchStatus();
    } catch (err) {
      showToast(`Erro no fluxo: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
      setActiveStage(undefined);
    }
  };

  const handleUpdatePolicy = async (policy: RiskLevel) => {
    try {
      const res = await fetch('/api/security/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: policy }),
      });
      const data = await res.json();
      if (data.updatedThreshold) {
        showToast(`Limiar do PolicyEngine atualizado para: ${data.updatedThreshold}`);
        fetchStatus();
      }
    } catch (err) {
      showToast(`Erro ao atualizar política: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* HUD Header */}
      <HudHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
        isProcessing={isProcessing}
        onRunCanonicalOrganizeWeek={handleRunCanonicalOrganizeWeek}
        onRunDiagnostics={fetchStatus}
        onRefreshStatus={fetchStatus}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900/95 border border-cyan-500/70 text-cyan-200 text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md animate-bounce">
            {toastMessage}
          </div>
        )}

        {/* Dynamic Tab Views */}
        {activeTab === 'command' && (
          <div className="space-y-8">
            <CommandDeck
              isProcessing={isProcessing}
              activeStage={activeStage}
              onExecuteGoal={handleExecuteGoal}
              latestResponse={latestResponse}
            />

            {/* If stages exist, display brief preview */}
            {stages.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                    Último Rastreamento de Fases Cognitivas
                  </h3>
                  <button
                    onClick={() => setActiveTab('cognitive_loop')}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Ver Inspeção Completa (9 Fases) →
                  </button>
                </div>
                <CognitiveLoopVisualizer
                  stages={stages}
                  traceId={latestResponse?.traceId}
                  isProcessing={isProcessing}
                  activeStage={activeStage}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'cognitive_loop' && (
          <CognitiveLoopVisualizer
            stages={stages}
            traceId={latestResponse?.traceId}
            isProcessing={isProcessing}
            activeStage={activeStage}
          />
        )}

        {activeTab === 'planner' && (
          <PlannerDagView
            plan={latestResponse?.plan || null}
            verifications={latestResponse?.verifications || []}
          />
        )}

        {activeTab === 'memory' && <MemoryMatrixView />}

        {activeTab === 'study' && <StudyView />}

        {activeTab === 'protocols' && <ProtocolsView />}

        {activeTab === 'world_model' && <WorldModelView />}

        {activeTab === 'learning' && <ContinuousLearningView />}

        {activeTab === 'audit' && (
          <SecurityAuditView
            currentPolicy={systemStatus?.policyThreshold || 'MEDIUM'}
            onUpdatePolicy={handleUpdatePolicy}
          />
        )}

        {activeTab === 'platforms' && <MultiplatformHub />}

        {activeTab === 'terminal' && <CliConsole />}

        {activeTab === 'docs' && <DocumentationView />}
      </main>

      {/* Cybernetic Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 px-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>JARVIS Autonomous AI OS — Núcleo Cognitivo & Segurança Ativa</span>
          <span className="text-cyan-600">Debian 12 • Node 22 • Express • Vite • Gemini 3.8</span>
        </div>
      </footer>
    </div>
  );
}
