import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Send, Sparkles } from 'lucide-react';

interface CliLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  text: string;
  time: string;
}

export const CliConsole: React.FC = () => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<CliLine[]>([
    {
      id: '1',
      type: 'system',
      text: 'JARVIS KERNEL v1.0.0 (Debian 12 / Node 22) — Interactive Console Online.',
      time: new Date().toLocaleTimeString(),
    },
    {
      id: '2',
      type: 'system',
      text: 'Digite "help" para ver comandos disponíveis ou "organize-week" para o fluxo canônico.',
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const addLine = (type: CliLine['type'], text: string) => {
    setHistory((prev) => [
      ...prev,
      {
        id: `cli-${Date.now()}-${Math.random()}`,
        type,
        text,
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.trim();
    if (!cmd || isExecuting) return;

    addLine('input', `$ ${cmd}`);
    setCommand('');

    const parts = cmd.split(' ');
    const root = parts[0].toLowerCase();

    if (root === 'clear') {
      setHistory([]);
      return;
    }

    if (root === 'help') {
      addLine(
        'output',
        `Comandos Disponíveis:
  • help                  : Exibe esta lista de ajuda
  • organize-week         : Executa o fluxo canônico "Organize minha semana"
  • cycle <diretiva>      : Dispara o ciclo cognitivo completo de 9 fases
  • status                : Exibe telemetria do kernel e consumo de memória
  • audit                 : Verifica a integridade criptográfica da cadeia SHA-256
  • memory query <termo>  : Executa busca híbrida vetorial + BM25 com fusão RRF
  • tools                 : Lista ferramentas registradas no sandbox
  • policy <NÍVEL>        : Ajusta o limiar do PolicyEngine (LOW|MEDIUM|HIGH|CRITICAL)
  • clear                 : Limpa o console`
      );
      return;
    }

    setIsExecuting(true);

    try {
      if (root === 'organize-week') {
        addLine('output', 'Iniciando fluxo canônico "Organize minha semana"...');
        const res = await fetch('/api/canonical/organize-week', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userExplicitApproved: true }),
        });
        const data = await res.json();
        addLine('output', `[SUCESSO] ${data.summaryText}\nTraceId: ${data.cycleResponse.traceId}\nBlocos alocados: ${data.allocatedBlocksCount}`);
      } else if (root === 'cycle') {
        const goal = parts.slice(1).join(' ');
        if (!goal) {
          addLine('error', 'Erro: Especifique a diretiva. Exemplo: cycle consultar tarefas');
        } else {
          addLine('output', `Disparando ciclo cognitivo para diretiva: "${goal}"...`);
          const res = await fetch('/api/cognitive/cycle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goal, userExplicitApproved: true }),
          });
          const data = await res.json();
          addLine('output', `[SUCESSO] Trace: ${data.traceId}\nResposta: ${data.finalAnswer}`);
        }
      } else if (root === 'status') {
        const res = await fetch('/api/status');
        const data = await res.json();
        addLine(
          'output',
          `Status: ${data.status} (${data.mode})\nKernel: ${data.kernel}\nRAM Heap: ${data.memory.heapUsedMb} MB / ${data.memory.heapTotalMb} MB\nLimiar de Risco: ${data.policyThreshold}\nRegistros de Auditoria: ${data.auditLogCount}`
        );
      } else if (root === 'audit') {
        const res = await fetch('/api/audit-log');
        const data = await res.json();
        addLine(
          'output',
          `Cadeia SHA-256: ${data.integrity.valid ? '100% VÁLIDA' : 'FALHA'}\nTotal de blocos verificados: ${data.integrity.totalChecked}\nRegistros armazenados: ${data.count}`
        );
      } else if (root === 'tools') {
        const res = await fetch('/api/tools');
        const tools = await res.json();
        const list = tools.map((t: any) => `  - ${t.name} [${t.riskLevel}]: ${t.description}`).join('\n');
        addLine('output', `Ferramentas Registradas:\n${list}`);
      } else if (root === 'memory' && parts[1] === 'query') {
        const q = parts.slice(2).join(' ');
        const res = await fetch('/api/memory/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
        });
        const data = await res.json();
        addLine('output', `Busca Híbrida RRF para "${q}":\nEpisódios: ${data.episodic.length}, Semânticos: ${data.semantic.length}`);
      } else if (root === 'policy') {
        const lvl = parts[1]?.toUpperCase();
        const res = await fetch('/api/security/policy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threshold: lvl }),
        });
        const data = await res.json();
        if (data.error) {
          addLine('error', data.error);
        } else {
          addLine('output', `Limiar do PolicyEngine atualizado para: ${data.updatedThreshold}`);
        }
      } else {
        addLine('error', `Comando não reconhecido: "${root}". Digite "help" para ver comandos.`);
      }
    } catch (err) {
      addLine('error', `Erro na execução do comando: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs space-y-3 shadow-2xl">
      {/* Console Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-200 font-bold">JARVIS Interactive Shell (CLI)</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>CONNECTED (bash/ipc)</span>
        </div>
      </div>

      {/* Output Screen */}
      <div className="h-80 overflow-y-auto space-y-2 pr-1">
        {history.map((line) => (
          <div key={line.id} className="leading-relaxed">
            {line.type === 'input' && (
              <span className="text-cyan-300 font-bold">{line.text}</span>
            )}
            {line.type === 'output' && (
              <pre className="text-slate-200 whitespace-pre-wrap pl-2 border-l-2 border-slate-700 font-mono text-[11px]">
                {line.text}
              </pre>
            )}
            {line.type === 'system' && (
              <span className="text-slate-400 italic">{line.text}</span>
            )}
            {line.type === 'error' && (
              <span className="text-rose-400 font-bold">{line.text}</span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* CLI Input form */}
      <form onSubmit={handleCommand} className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <span className="text-cyan-400 font-bold">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="help, organize-week, cycle <diretiva>, status, audit..."
          disabled={isExecuting}
          className="flex-grow bg-transparent text-slate-100 placeholder-slate-600 outline-none font-mono text-xs"
        />
        <button
          type="submit"
          disabled={isExecuting || !command.trim()}
          className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold disabled:opacity-40 cursor-pointer text-xs"
        >
          {isExecuting ? '...' : <Send className="w-3.5 h-3.5" />}
        </button>
      </form>
    </div>
  );
};
