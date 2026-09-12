import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  Hash,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCode,
} from 'lucide-react';
import { AuditLogEntry, RiskLevel } from '../types.ts';

interface SecurityAuditViewProps {
  currentPolicy: string;
  onUpdatePolicy: (policy: RiskLevel) => Promise<void>;
}

export const SecurityAuditView: React.FC<SecurityAuditViewProps> = ({
  currentPolicy,
  onUpdatePolicy,
}) => {
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [integrity, setIntegrity] = useState<{ valid: boolean; totalChecked: number; brokenAtId?: string } | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAuditData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/audit-log');
      const data = await res.json();
      setAuditEntries(data.entries || []);
      setIntegrity(data.integrity || null);
    } catch {
      // error handling
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const riskLevels: { level: RiskLevel; desc: string; color: string }[] = [
    { level: 'LOW', desc: 'Leituras e consultas seguras (executa sem confirmação)', color: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/30' },
    { level: 'MEDIUM', desc: 'Criação reversível de eventos/tarefas (executa sob limiar padrão)', color: 'text-amber-400 border-amber-500/50 bg-amber-950/30' },
    { level: 'HIGH', desc: 'Mutações externas e comandos de SO (exige confirmação explícita)', color: 'text-orange-400 border-orange-500/50 bg-orange-950/30' },
    { level: 'CRITICAL', desc: 'Exclusão irreversível e operações de infraestrutura', color: 'text-rose-400 border-rose-500/50 bg-rose-950/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Cryptographic Verification Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl border border-cyan-900/40 bg-slate-900/80">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="font-mono text-base font-bold text-slate-100">
              Cofre de Segurança & Trilha Criptográfica de Auditoria
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Cada ação é assinada e encadeada por SHA-256 no estilo hash chain. O modelo de IA nunca recebe credenciais.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {integrity && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold ${
                integrity.valid
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
              }`}
            >
              {integrity.valid ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>
                {integrity.valid
                  ? `Integridade Válida: ${integrity.totalChecked} Nós Verificados`
                  : `Cadeia Quebrada no Nó: ${integrity.brokenAtId}`}
              </span>
            </div>
          )}

          <button
            onClick={fetchAuditData}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Recalcular hashes"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Security Policies Matrix */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Limiar de Autonomia do Policy Engine (Gating de Risco)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Limiar Ativo: <strong className="text-cyan-300">{currentPolicy}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {riskLevels.map((item) => {
            const isSelected = currentPolicy === item.level;
            return (
              <button
                key={item.level}
                onClick={() => onUpdatePolicy(item.level)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? `${item.color} ring-2 ring-cyan-400 shadow-md`
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs font-bold mb-1">
                  <span>{item.level}</span>
                  {isSelected && <span className="text-[10px] font-mono uppercase text-cyan-300">Ativo</span>}
                </div>
                <p className="text-[11px] font-sans leading-relaxed">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Trilha de Auditoria AuditLog (Últimos {auditEntries.length} registros)</span>
          <span>SHA-256 Encadeado</span>
        </div>

        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {auditEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                selectedEntry?.id === entry.id
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-md'
                  : 'border-slate-800/90 bg-slate-900/60 hover:bg-slate-900'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-mono font-bold text-slate-200">{entry.action}</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {entry.actor}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                  <span className="px-2 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    {entry.riskLevel}
                  </span>
                  <span>{new Date(entry.timestamp).toLocaleTimeString('pt-BR')}</span>
                </div>
              </div>

              {/* Hash Fingerprint */}
              <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/80">
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="text-slate-500">Hash:</span>
                  <span className="text-cyan-300 truncate max-w-[200px]">{entry.hash}</span>
                </div>
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="text-slate-500">PrevHash:</span>
                  <span className="text-slate-400 truncate max-w-[200px]">{entry.previousHash.substring(0, 16)}...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Entry Inspector Modal / Drawer */}
      {selectedEntry && (
        <div className="p-5 rounded-xl border border-cyan-800/70 bg-slate-950/90 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-mono text-xs font-bold text-cyan-300">
              Inspeção Criptográfica do Registro: {selectedEntry.id}
            </span>
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-500 block mb-1">Payload de Entrada (Congelado):</span>
              <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 overflow-x-auto max-h-40">
                {JSON.stringify(selectedEntry.inputPayload, null, 2)}
              </pre>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Resultado de Saída (Auditor):</span>
              <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-cyan-300 overflow-x-auto max-h-40">
                {JSON.stringify(selectedEntry.outputResult, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
