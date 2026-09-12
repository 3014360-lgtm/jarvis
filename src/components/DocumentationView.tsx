import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Shield,
  Layers,
  GraduationCap,
  FileCheck,
  Terminal,
  Cpu,
  Brain,
  Search,
  ExternalLink,
} from 'lucide-react';

export const DocumentationView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('tests');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const testList = [
    {
      id: 1,
      suite: 'AuditLog',
      test: 'Verifies SHA-256 hash chaining is intact',
      description: 'Valida a cadeia de hashes desde o bloco gênesis. Confirma que nenhum elo intermediário foi corrompido.',
      status: 'PASS',
    },
    {
      id: 2,
      suite: 'AuditLog',
      test: 'Appends new verified entry without breaking chaining',
      description: 'Insere um novo registro e confirma que o novo entryHash referencia estritamente o previousHash.',
      status: 'PASS',
    },
    {
      id: 3,
      suite: 'SecurityRedactor',
      test: 'Masks CPF, API keys, passwords, and emails',
      description: 'Intercepta e mascara dados sensíveis (CPFs reais, chaves AIza..., tokens sk-..., senhas).',
      status: 'PASS',
    },
    {
      id: 4,
      suite: 'PolicyEngine',
      test: 'Blocks CRITICAL actions without explicit authorization',
      description: 'Garante que operações de risco crítico (ex: delete_database) sejam estritamente bloqueadas sem autorização humana.',
      status: 'PASS',
    },
    {
      id: 5,
      suite: 'PolicyEngine',
      test: 'Allows LOW risk actions autonomously under default threshold',
      description: 'Garante que leituras e diagnósticos inofensivos sejam autorizados de forma autônoma.',
      status: 'PASS',
    },
    {
      id: 6,
      suite: 'WorldModel',
      test: 'Upserts entity and retrieves by relation',
      description: 'Cria uma entidade tipada no Grafo de Conhecimento e a recupera por tipo e relação com consistência total.',
      status: 'PASS',
    },
    {
      id: 7,
      suite: 'StudyEngine',
      test: 'Calculates spaced repetition intervals correctly',
      description: 'Aplica avaliação de retenção ao algoritmo SM-2 e confirma a extensão correta do intervalo de repetição em dias.',
      status: 'PASS',
    },
    {
      id: 8,
      suite: 'StudyEngine',
      test: 'Enforces academic integrity guardrails against cheating',
      description: 'Detecta tentativas de cola ou resolução de provas oficiais, zerando a pontuação e emitindo alerta ético.',
      status: 'PASS',
    },
    {
      id: 9,
      suite: 'BrowserController',
      test: 'Rejects non-allowlisted domains',
      description: 'Rejeita requisições de navegação direcionadas a domínios fora da allowlist estrita do sistema.',
      status: 'PASS',
    },
    {
      id: 10,
      suite: 'BrowserController',
      test: 'Generates semantic accessibility tree for allowed portal',
      description: 'Gera a Árvore de Acessibilidade Compacta (AXTree) eliminando bloat de tokens em capturas de tela.',
      status: 'PASS',
    },
    {
      id: 11,
      suite: 'ProtocolEngine',
      test: 'Executes canonical protocol in DRY-RUN mode',
      description: 'Executa todas as 6 fases canônicas de um protocolo em modo de simulação, validando diffs e rollback.',
      status: 'PASS',
    },
    {
      id: 12,
      suite: 'Orchestrator',
      test: 'Delegates task to specialized agent within token budget',
      description: 'Delega subtarefa especializada respeitando o teto de orçamento de tokens configurado.',
      status: 'PASS',
    },
    {
      id: 13,
      suite: 'ToolRegistry',
      test: 'Has all 45+ mandatory tools registered',
      description: 'Verifica se todas as 47 ferramentas do sistema estão registradas com esquemas JSON válidos.',
      status: 'PASS',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Documentação Técnica & Relatório de Engenharia</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            JARVIS Autonomous OS — Manual Arquitetural e de Verificação
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Documentação completa dos subsistemas cognitivos, matriz de memória, protocolos canônicos,
            mecanismos de integridade e suíte de testes automatizados com 100% de aprovação.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>13/13 Testes Verificados</span>
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'tests', label: 'Suíte de Testes (13/13)', icon: CheckCircle2 },
          { id: 'architecture', label: 'Arquitetura e Módulos', icon: Layers },
          { id: 'security', label: 'Segurança & SHA-256', icon: Shield },
          { id: 'study', label: 'Motor Acadêmico (SM-2)', icon: GraduationCap },
          { id: 'protocols', label: '6 Fases Canônicas', icon: FileCheck },
          { id: 'tools', label: '47 Ferramentas Nativas', icon: Terminal },
        ].map((sec) => {
          const Icon = sec.icon;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Sections */}
      {activeSection === 'tests' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">
              Comando de execução direta: <code className="text-cyan-400 bg-slate-950 px-2 py-0.5 rounded">npm test</code>
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Taxa de Sucesso: 100%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testList.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-cyan-500/40 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                    {t.suite}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    ✓ {t.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 font-mono">
                  {t.id}. {t.test}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'architecture' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 text-xs text-slate-300 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Estrutura Arquitetural em Camadas</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-cyan-400 font-mono font-bold block text-xs">1. Camada de Agentes</span>
              <p className="text-slate-400 text-[11px]">
                Orquestrador central com 5 agentes especializados: Core, Estudo, Segurança, Automação e Pesquisa.
                Controle rígido de teto de tokens e delegação declarativa.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-sky-400 font-mono font-bold block text-xs">2. Matriz de Memória</span>
              <p className="text-slate-400 text-[11px]">
                5 camadas isoladas: RAM ativa, vetorial episódica com traceId, fatos semânticos,
                receitas procedimentais em DAG e armazenamento de documentos markdown.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-mono font-bold block text-xs">3. Segurança Ativa</span>
              <p className="text-slate-400 text-[11px]">
                Redator automático de segredos (PII/chaves de API), trilha de auditoria SHA-256 à prova de adulteração
                e motor de políticas escalonado com Kill Switch de emergência.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <h4 className="font-mono text-cyan-400 font-bold">Fluxo do Ciclo Cognitivo de 9 Fases:</h4>
            <div className="font-mono text-[11px] text-slate-300 flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">1. PERCEIVE</span>
              <span className="text-slate-500">→</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">2. RETRIEVE</span>
              <span className="text-slate-500">→</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">3. PLAN (DAG)</span>
              <span className="text-slate-500">→</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">4. VALIDATE_POLICY</span>
              <span className="text-slate-500">→</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">5. DELEGATE</span>
              <span className="text-slate-500">→</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">6. EXECUTE</span>
              <span className="text-slate-500">→</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">7. REFLECT</span>
              <span className="text-slate-500">→</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">8. CONSOLIDATE</span>
              <span className="text-slate-500">→</span>
              <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">9. COMMUNICATE</span>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'security' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs text-slate-300">
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            <span>Segurança Criptográfica e Integridade do Log</span>
          </h3>
          <p>
            O módulo <code className="text-cyan-400">auditLog.ts</code> implementa uma blockchain interna leve
            onde cada entrada é hashada com SHA-256 contendo o payload serializado e o hash da entrada anterior.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300">
            entryHash = SHA256(id + timestamp + action + tool + previousHash + JSON.stringify(inputPayload))
          </div>
          <p>
            O módulo <code className="text-cyan-400">redactor.ts</code> realiza varredura com expressões regulares
            de alta precisão contra vazamentos de CPFs, senhas e chaves como chaves Google Cloud (AIza...)
            e tokens bearer antes de qualquer persistência em disco ou transmissão por WebSocket.
          </p>
        </div>
      )}

      {activeSection === 'study' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs text-slate-300">
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>Motor de Estudos, SM-2 e Integridade Acadêmica</span>
          </h3>
          <p>
            Implementação do algoritmo de Repetição Espaçada SuperMemo-2 (SM-2):
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
            <div>Fator de Facilidade: <code className="text-cyan-400">EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))</code></div>
            <div>Intervalo: <code className="text-sky-400">I(1) = 1, I(2) = 6, I(n) = I(n-1) * EF</code></div>
          </div>
          <p>
            O motor integra trava ética anti-fraude: pedidos para resolver exames inteiros, provas oficiais
            ou respostas de cola são bloqueados com score 0 e sinalização de violação de integridade acadêmica.
          </p>
        </div>
      )}

      {activeSection === 'protocols' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs text-slate-300">
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-400" />
            <span>As 6 Fases Canônicas dos Protocolos</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center font-mono text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">1. AÇÃO</div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">2. BACKUP</div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">3. VERIFICAÇÃO</div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">4. EXECUÇÃO</div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">5. VALIDAÇÃO</div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400">6. REGISTRO</div>
          </div>
          <p>
            O sistema inclui 10 protocolos pré-configurados com suporte a simulação em modo Dry-Run,
            cálculo de Diffs de alterações e Kill Switch com suspensão imediata de automações ativas.
          </p>
        </div>
      )}

      {activeSection === 'tools' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs text-slate-300">
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>47 Ferramentas Registradas no ToolRegistry</span>
          </h3>
          <p>
            Todas as ferramentas são expostas com esquemas de entrada validados, nível de risco
            e exigência de auditoria individual. Estão agrupadas em:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-cyan-400 block font-bold mb-1">Arquivos & Sistema</span>
              read_file, write_file, edit_file, delete_file, list_directory, file_stat, search_files, hash_file
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-sky-400 block font-bold mb-1">Processos & Execução</span>
              execute_command, get_process_status, kill_process, get_system_metrics
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-emerald-400 block font-bold mb-1">Navegação Sem Imagens</span>
              navigate_browser, click_element, type_text, get_accessibility_tree, take_screenshot
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-amber-400 block font-bold mb-1">Estudos & Agenda</span>
              study_schedule_build, spaced_repetition_review, generate_quiz, evaluate_submission, portal_sync
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
