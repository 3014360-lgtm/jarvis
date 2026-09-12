import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  BookOpen,
  Calendar,
  CheckSquare,
  Sparkles,
  Layers,
  History,
  FileText,
  Clock,
} from 'lucide-react';
import {
  WorkingMemoryItem,
  EpisodicEvent,
  SemanticEntity,
  ProceduralPlaybook,
  UserPreferences,
  DocumentItem,
  HybridSearchResult,
} from '../types.ts';

type MemorySubTab =
  | 'working'
  | 'episodic'
  | 'summary'
  | 'semantic'
  | 'procedural'
  | 'preferences'
  | 'search';

export const MemoryMatrixView: React.FC = () => {
  const [subTab, setSubTab] = useState<MemorySubTab>('episodic');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HybridSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // States for stores
  const [workingTurns, setWorkingTurns] = useState<WorkingMemoryItem[]>([]);
  const [episodicEvents, setEpisodicEvents] = useState<EpisodicEvent[]>([]);
  const [semanticEntities, setSemanticEntities] = useState<SemanticEntity[]>([]);
  const [proceduralPlaybooks, setProceduralPlaybooks] = useState<ProceduralPlaybook[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [summaryData, setSummaryData] = useState<string>('');

  const fetchStoreData = async () => {
    try {
      const [wRes, eRes, sRes, pRes, prefRes, sumRes] = await Promise.all([
        fetch('/api/memory/working').then((r) => r.json()),
        fetch('/api/memory/episodic').then((r) => r.json()),
        fetch('/api/memory/semantic').then((r) => r.json()),
        fetch('/api/memory/procedural').then((r) => r.json()),
        fetch('/api/memory/preferences').then((r) => r.json()),
        fetch('/api/memory/summary?period=daily').then((r) => r.json()),
      ]);

      setWorkingTurns(wRes || []);
      setEpisodicEvents(eRes || []);
      setSemanticEntities(sRes || []);
      setProceduralPlaybooks(pRes || []);
      setPreferences(prefRes || null);
      setSummaryData(sumRes || '');
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/memory/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });
      const data = await res.json();
      setSearchResults(data);
    } catch {
      // search error
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-navigation */}
      <div className="p-5 rounded-xl border border-cyan-900/40 bg-slate-900/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-mono text-base font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              Arquitetura de Memória em 7 Camadas
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Camadas com decaimento exponencial, sumarização hierárquica e busca híbrida vetorial + BM25 com fusão RRF.
            </p>
          </div>

          <button
            onClick={fetchStoreData}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 hover:border-cyan-700 transition-colors"
          >
            Sincronizar Lojas
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
          {[
            { id: 'episodic' as MemorySubTab, label: 'Episódica', icon: History, count: episodicEvents.length },
            { id: 'working' as MemorySubTab, label: 'Janela Operacional', icon: Clock, count: workingTurns.length },
            { id: 'summary' as MemorySubTab, label: 'Sumarização Hierárquica', icon: Layers },
            { id: 'semantic' as MemorySubTab, label: 'Semântica & Entidades', icon: BookOpen, count: semanticEntities.length },
            { id: 'procedural' as MemorySubTab, label: 'Procedural (Playbooks)', icon: FileText, count: proceduralPlaybooks.length },
            { id: 'preferences' as MemorySubTab, label: 'Preferências do Usuário', icon: Sparkles },
            { id: 'search' as MemorySubTab, label: 'Busca Híbrida (RRF)', icon: Search },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mem-tab-${tab.id}`}
                onClick={() => setSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-tab: Episodic */}
      {subTab === 'episodic' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Eventos Episódicos Persistidos ({episodicEvents.length})</span>
            <span>Decaimento: Meia-vida = 7 dias</span>
          </div>

          <div className="space-y-3">
            {episodicEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-100">{event.title}</span>
                    <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {event.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      Imp: {Math.round(event.importance * 100)}%
                    </span>
                    <span>{new Date(event.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans">{event.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Resultado: <span className="text-slate-200 font-sans">{event.outcome}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {event.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab: Working Memory */}
      {subTab === 'working' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Janela Operacional Ativa (Últimos {workingTurns.length} turnos)</span>
            <span>Orçamento Máximo: 2.000 tokens</span>
          </div>

          <div className="space-y-2">
            {workingTurns.map((turn) => (
              <div
                key={turn.id}
                className={`p-3 rounded-lg border text-xs ${
                  turn.role === 'user'
                    ? 'bg-slate-900 border-slate-700 text-slate-200'
                    : 'bg-cyan-950/30 border-cyan-800/40 text-cyan-200'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-1">
                  <span className="uppercase font-bold text-cyan-400">{turn.role}</span>
                  <span>{new Date(turn.timestamp).toLocaleTimeString('pt-BR')}</span>
                </div>
                <p className="font-sans leading-relaxed">{turn.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab: Summary */}
      {subTab === 'summary' && (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Sumarização Hierárquica Contínua (Rollup Diário)</span>
          </div>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
            {summaryData || 'Carregando sumarização hierárquica da memória...'}
          </div>
        </div>
      )}

      {/* Sub-tab: Semantic */}
      {subTab === 'semantic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {semanticEntities.map((ent) => (
            <div key={ent.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-100">{ent.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                  {ent.type}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-slate-950 p-2.5 rounded border border-slate-800/80">
                {Object.entries(ent.properties).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-500">{k}:</span>
                    <span className="text-slate-200">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-tab: Procedural */}
      {subTab === 'procedural' && (
        <div className="space-y-3">
          {proceduralPlaybooks.map((play) => (
            <div key={play.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-100">{play.title}</span>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Taxa Sucesso: {Math.round(play.successRate * 100)}%
                  </span>
                  <span className="text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    v{play.version}
                  </span>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-300 space-y-1">
                {play.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px]">
                    <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-tab: Preferences */}
      {subTab === 'preferences' && preferences && (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-4">
          <h3 className="font-mono text-xs font-bold text-slate-200">
            Diretrizes Operacionais e Limites do Usuário
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase">Janela de Foco Profundo:</span>
              <span className="text-cyan-300 font-bold">{preferences.deepWorkHours}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase">Estilo de Comunicação:</span>
              <span className="text-cyan-300 font-bold">{preferences.communicationStyle}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase">Risco de Ação Sem Confirmação:</span>
              <span className="text-cyan-300 font-bold">{preferences.riskThresholdWithoutApproval}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase">Canais de Notificação:</span>
              <span className="text-cyan-300 font-bold">{preferences.notificationChannels.join(', ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab: Hybrid Search (RRF) */}
      {subTab === 'search' && (
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite uma busca na memória (ex: Sistemas Distribuídos, Raft, prova)..."
              className="flex-grow px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-800/50 text-slate-100 placeholder-slate-500 text-xs font-mono outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSearching ? 'Buscando...' : 'Fusão RRF'}
            </button>
          </form>

          {searchResults && (
            <div className="space-y-3">
              <span className="font-mono text-xs text-slate-400">
                Resultados Combinados (RRF Score = 1 / (60 + DenseRank) + 1 / (60 + SparseRank)):
              </span>

              <div className="space-y-2">
                {searchResults.episodic.map((ep, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-mono text-[10px] text-cyan-400 mb-1">
                      <span>EPISÓDICA • {ep.item.title}</span>
                      <span>RRF Score: {ep.score.toFixed(4)}</span>
                    </div>
                    <p className="text-slate-300 font-sans">{ep.item.description}</p>
                  </div>
                ))}

                {searchResults.semantic.map((sem, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-mono text-[10px] text-sky-400 mb-1">
                      <span>SEMÂNTICA • {sem.item.name} [{sem.item.type}]</span>
                      <span>RRF Score: {sem.score.toFixed(4)}</span>
                    </div>
                    <pre className="text-slate-300 font-mono text-[10px] mt-1">
                      {JSON.stringify(sem.item.properties)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
