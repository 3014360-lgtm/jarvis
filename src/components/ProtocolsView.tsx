import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Play,
  ShieldAlert,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layers,
  Terminal,
} from 'lucide-react';
import { ProtocolReport, ProtocolType } from '../types.ts';

export const ProtocolsView: React.FC = () => {
  const [protocols, setProtocols] = useState<Array<{ type: ProtocolType; description: string; risk: string }>>([]);
  const [history, setHistory] = useState<ProtocolReport[]>([]);
  const [dryRun, setDryRun] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeReport, setActiveReport] = useState<ProtocolReport | null>(null);
  const [emergencyModal, setEmergencyModal] = useState<boolean>(false);
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  const fetchProtocols = async () => {
    try {
      const res = await fetch('/api/protocols');
      const data = await res.json();
      setProtocols(data.available || []);
      setHistory(data.history || []);
      if (data.history && data.history.length > 0 && !activeReport) {
        setActiveReport(data.history[0]);
      }
    } catch {
      // handled
    }
  };

  useEffect(() => {
    fetchProtocols();
  }, []);

  const handleExecuteProtocol = async (type: ProtocolType) => {
    setIsExecuting(true);
    setAlertNotice(null);
    try {
      const res = await fetch('/api/protocols/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol: type, dryRun }),
      });
      const report: ProtocolReport = await res.json();
      setActiveReport(report);
      setAlertNotice(`Protocolo ${type} finalizado com sucesso (${dryRun ? 'DRY-RUN' : 'ATIVO'}).`);
      fetchProtocols();
    } catch (err) {
      setAlertNotice(`Falha na execução do protocolo: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleEmergencyKillSwitch = async () => {
    setEmergencyModal(false);
    setIsExecuting(true);
    try {
      const res = await fetch('/api/security/kill-switch', { method: 'POST' });
      const data = await res.json();
      if (data.report) setActiveReport(data.report);
      setAlertNotice('KILL SWITCH ATIVADO: Todas as execuções autônomas foram suspensas!');
      fetchProtocols();
    } catch {
      setAlertNotice('Erro ao disparar Kill Switch de Emergência.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Emergency Kill Switch */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <FileCheck className="w-4 h-4" />
            <span>Motor de Protocolos Canônicos (6 Fases Obrigatórias)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            AÇÃO → BACKUP → VERIFICAÇÃO → EXECUÇÃO → VALIDAÇÃO → REGISTRO
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Toda operação estruturada segue a sequência canônica imutável. Modos de simulação (Dry-Run)
            permitem verificar diffs e impactos antes de aplicar mudanças reais.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Dry Run Toggle */}
          <label className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <span className={dryRun ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
              Modo Dry-Run (Simulação)
            </span>
          </label>

          {/* Panic Kill Switch */}
          <button
            id="btn-emergency-kill-switch"
            onClick={() => setEmergencyModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-xs transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Kill Switch Global</span>
          </button>
        </div>
      </div>

      {alertNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{alertNotice}</span>
        </div>
      )}

      {/* Emergency Confirmation Modal */}
      {emergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-rose-500/70 shadow-[0_0_30px_rgba(244,63,94,0.3)] space-y-4">
            <div className="flex items-center gap-3 text-rose-400 font-mono font-bold text-sm">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
              <span>CONFIRMAR PROTOCOLO DE EMERGÊNCIA</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              O acionamento do Kill Switch suspenderá imediatamente todas as automações, fechará sessões do navegador,
              trancará o cofre e emitirá snapshot forense para auditoria. Deseja prosseguir?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEmergencyModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-mono cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleEmergencyKillSwitch}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono cursor-pointer shadow-lg shadow-rose-900/50"
              >
                Sim, Executar Kill Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canonical 10 Protocols Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {protocols.map((proto) => (
          <div
            key={proto.type}
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold text-cyan-400">
                  {proto.type}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    proto.risk === 'CRITICAL'
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                      : proto.risk === 'HIGH'
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {proto.risk}
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-4">{proto.description}</p>
            </div>

            <button
              id={`btn-exec-proto-${proto.type.toLowerCase()}`}
              onClick={() => handleExecuteProtocol(proto.type)}
              disabled={isExecuting}
              className="w-full py-2 px-3 rounded-lg bg-slate-950 hover:bg-cyan-600 hover:text-slate-950 text-slate-200 font-mono text-xs font-semibold border border-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Executar ({dryRun ? 'Dry-Run' : 'Ativo'})</span>
            </button>
          </div>
        ))}
      </div>

      {/* Active Protocol Lifecycle Inspection (6 Stages) */}
      {activeReport && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold text-slate-100">
                  Relatório do Protocolo: {activeReport.protocolType}
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    activeReport.dryRun
                      ? 'bg-amber-950/50 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {activeReport.dryRun ? 'SIMULAÇÃO (DRY-RUN)' : 'MODO ATIVO'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{activeReport.summary}</p>
            </div>

            <span className="text-[11px] font-mono text-slate-500">
              ID: {activeReport.id}
            </span>
          </div>

          {/* 6 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {activeReport.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center space-y-1.5"
              >
                <div className="text-[10px] font-mono text-cyan-400 font-bold">
                  {idx + 1}. {step.stepName}
                </div>
                <div className="flex justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[11px] text-slate-300 leading-tight line-clamp-2" title={step.detail}>
                  {step.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Diff Summary */}
          {activeReport.diffSummary && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
              <div className="text-slate-400 mb-1">Diff de Modificações do Protocolo:</div>
              <div className="flex flex-wrap gap-4 text-[11px]">
                <span className="text-emerald-400">
                  + Adicionados: {activeReport.diffSummary.added.length > 0 ? activeReport.diffSummary.added.join(', ') : '0'}
                </span>
                <span className="text-amber-400">
                  ~ Modificados: {activeReport.diffSummary.modified.length > 0 ? activeReport.diffSummary.modified.join(', ') : '0'}
                </span>
                <span className="text-rose-400">
                  - Deletados: {activeReport.diffSummary.deleted.length > 0 ? activeReport.diffSummary.deleted.join(', ') : '0'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
