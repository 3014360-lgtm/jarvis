import React, { useState, useEffect } from 'react';
import {
  Network,
  Search,
  Filter,
  User,
  BookOpen,
  Calendar,
  Smartphone,
  Server,
  Sparkles,
} from 'lucide-react';
import { WorldEntity, WorldRelation } from '../types.ts';

export const WorldModelView: React.FC = () => {
  const [entities, setEntities] = useState<WorldEntity[]>([]);
  const [relations, setRelations] = useState<WorldRelation[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<WorldEntity | null>(null);

  const fetchWorldModel = async () => {
    try {
      const res = await fetch('/api/world-model');
      const data = await res.json();
      setEntities(data.entities || []);
      setRelations(data.relations || []);
      if (data.entities && data.entities.length > 0 && !selectedEntity) {
        setSelectedEntity(data.entities[0]);
      }
    } catch {
      // handled
    }
  };

  useEffect(() => {
    fetchWorldModel();
  }, []);

  const filteredEntities = entities.filter((e) => {
    const matchesType = selectedType === 'ALL' || e.type === selectedType;
    const matchesQuery =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(e.attributes).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'PERSON':
        return <User className="w-4 h-4 text-emerald-400" />;
      case 'COURSE':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      case 'DEADLINE':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'DEVICE':
        return <Smartphone className="w-4 h-4 text-sky-400" />;
      default:
        return <Server className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Network className="w-4 h-4" />
            <span>Grafo do Modelo de Mundo (World Model)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Entidades Pessoais, Relacionamentos & Proveniência
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Representação unificada do ambiente digital e físico do usuário. Todas as entidades
            mantêm pontuação de confiança, carimbo temporal e trilha de auditoria de proveniência.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Total Entidades: <b className="text-cyan-400">{entities.length}</b>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Relações: <b className="text-sky-400">{relations.length}</b>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar entidades por nome ou atributo..."
            className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {['ALL', 'PERSON', 'COURSE', 'DEADLINE', 'DEVICE'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedType === type
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Entities & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredEntities.map((e) => (
            <div
              key={e.id}
              onClick={() => setSelectedEntity(e)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                selectedEntity?.id === e.id
                  ? 'bg-slate-950 border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  {getEntityIcon(e.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">{e.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                      {e.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Origem: {e.provenance} • ID: {e.id}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  {(e.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] font-mono text-slate-500">confiança</div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Entity Inspector */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 h-fit space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Inspetor de Entidade
            </h3>
            {selectedEntity && (
              <span className="text-[10px] font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {selectedEntity.type}
              </span>
            )}
          </div>

          {selectedEntity ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] font-mono uppercase">Nome</span>
                <span className="font-semibold text-slate-100 text-sm">{selectedEntity.name}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] font-mono uppercase">Atributos</span>
                <pre className="mt-1 p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                  {JSON.stringify(selectedEntity.attributes, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] font-mono uppercase">Relações Ativas</span>
                <div className="mt-1 space-y-1.5">
                  {relations
                    .filter((r) => r.fromId === selectedEntity.id || r.toId === selectedEntity.id)
                    .map((r, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 flex items-center justify-between"
                      >
                        <span className="text-cyan-400">{r.relation}</span>
                        <span className="text-slate-500">
                          {r.fromId === selectedEntity.id ? `→ ${r.toId}` : `← ${r.fromId}`}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs font-mono">
              Selecione uma entidade para inspecionar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
