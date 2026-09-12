import React from 'react';
import {
  Activity,
  BookOpen,
  Brain,
  Cpu,
  Database,
  FileCheck,
  GitFork,
  GraduationCap,
  HardDrive,
  Layers,
  Network,
  Radio,
  RefreshCw,
  Shield,
  Smartphone,
  Terminal,
} from 'lucide-react';
import { ActiveTab, SystemStatusData } from '../types.ts';

interface HudHeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  systemStatus: SystemStatusData | null;
  isProcessing: boolean;
  onRunCanonicalOrganizeWeek: () => void;
  onRunDiagnostics: () => void;
  onRefreshStatus: () => void;
}

export const HudHeader: React.FC<HudHeaderProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  isProcessing,
  onRunCanonicalOrganizeWeek,
  onRunDiagnostics,
  onRefreshStatus,
}) => {
  const tabs = [
    { id: 'command' as ActiveTab, label: 'Comando & Voz', icon: Radio },
    { id: 'cognitive_loop' as ActiveTab, label: 'Loop Cognitivo (9 Fases)', icon: Layers },
    { id: 'planner' as ActiveTab, label: 'Planejador DAG', icon: GitFork },
    { id: 'memory' as ActiveTab, label: 'Matriz de Memória', icon: Database },
    { id: 'study' as ActiveTab, label: 'Estudos & Portal', icon: GraduationCap },
    { id: 'protocols' as ActiveTab, label: 'Protocolos Canônicos', icon: FileCheck },
    { id: 'world_model' as ActiveTab, label: 'World Model', icon: Network },
    { id: 'learning' as ActiveTab, label: 'Aprendizado & Decisões', icon: Brain },
    { id: 'audit' as ActiveTab, label: 'Segurança & Auditoria', icon: Shield },
    { id: 'platforms' as ActiveTab, label: 'Multiplataforma', icon: Smartphone },
    { id: 'terminal' as ActiveTab, label: 'Console CLI', icon: Terminal },
    { id: 'docs' as ActiveTab, label: 'Documentação', icon: BookOpen },
  ];

  return (
    <header className="border-b border-cyan-900/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner with Telemetry */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Brand & Kernel identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <h1 className="font-mono text-base font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-sky-200 bg-clip-text text-transparent">
              JARVIS OS
            </h1>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-[10px] font-mono text-cyan-300">
            v1.0.0 AUTONOMOUS
          </span>
          <span className="hidden md:inline-block text-slate-400 font-mono text-[11px]">
            {systemStatus?.kernel || 'JARVIS Kernel v1.0.0'}
          </span>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-3 sm:gap-4 font-mono text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>RAM:</span>
            <span className="text-cyan-300 font-semibold">
              {systemStatus?.memory ? `${systemStatus.memory.heapUsedMb} MB` : '120 MB'}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
            <HardDrive className="w-3.5 h-3.5 text-sky-400" />
            <span>Audit:</span>
            <span className="text-sky-300 font-semibold">{systemStatus?.auditLogCount ?? 8} logs</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Uptime:</span>
            <span className="text-emerald-300 font-semibold">
              {systemStatus?.uptimeSeconds ? `${systemStatus.uptimeSeconds}s` : 'active'}
            </span>
          </div>

          {/* Quick Actions */}
          <button
            id="btn-quick-organize-week"
            onClick={onRunCanonicalOrganizeWeek}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all disabled:opacity-50 text-[11px] cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.4)]"
            title="Executar fluxo canônico 'Organize Minha Semana'"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Organizar Semana</span>
          </button>

          <button
            id="btn-refresh-status"
            onClick={onRefreshStatus}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
            title="Atualizar telemetria"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <nav className="border-t border-cyan-900/30 bg-slate-950/90 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
