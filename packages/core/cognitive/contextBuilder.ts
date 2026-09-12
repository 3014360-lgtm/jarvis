import { UserPreferences, WorkingMemoryItem } from '../../shared/types.ts';
import { memoryManager } from '../memory/memoryManager.ts';
import { toolRegistry } from '../tools/toolRegistry.ts';

export interface ContextBundleItem {
  layer: string;
  provenance: string;
  content: string;
  tokenEstimate: number;
}

export interface ContextBundle {
  traceId: string;
  totalTokensEstimate: number;
  maxTokenBudget: number;
  items: ContextBundleItem[];
  compressed: boolean;
}

export class ContextBuilder {
  private maxBudget: number;

  constructor(maxBudget = 6000) {
    this.maxBudget = maxBudget;
  }

  public assembleContext(goal: string, traceId: string): ContextBundle {
    const items: ContextBundleItem[] = [];

    // Helper estimate: ~4 chars per token
    const estTokens = (str: string) => Math.ceil(str.length / 4);

    // Layer 1: Agent Identity and Core Directives
    const identityContent = `IDENTIDADE: JARVIS (Just A Rather Very Intelligent System).
PAPEL: Sistema Operacional Pessoal Autônomo e Assistente Executivo.
DIRETRIZES FUNDAMENTAIS:
1. Nunca inventar dados silenciosamente. Se ausente, declarar 'não disponível'.
2. Seguir a separação estrita entre Raciocínio, Ação, Credenciais e Sessão.
3. Respeitar limites de risco. Toda mutação de alto risco exige plano e diff verificável.`;
    items.push({
      layer: 'L1_IDENTITY_POLICIES',
      provenance: 'jarvis_core://system/identity.md',
      content: identityContent,
      tokenEstimate: estTokens(identityContent),
    });

    // Layer 2: System State
    const systemState = `ESTADO DO SISTEMA: Online | Runtime: Node 22 / TypeScript | TraceId: ${traceId} | Timestamp: ${new Date().toISOString()}`;
    items.push({
      layer: 'L2_SYSTEM_STATE',
      provenance: 'jarvis_core://telemetry/kernel',
      content: systemState,
      tokenEstimate: estTokens(systemState),
    });

    // Layer 3: User Profile & Preferences
    const prefs: UserPreferences = memoryManager.getPreferences();
    const prefsContent = `PREFERÊNCIAS DO USUÁRIO:
Horário de Acordar: ${prefs.wakeTime} | Dormir: ${prefs.sleepTime}
Slots de Foco Profundo: ${prefs.deepWorkSlots.join(', ')}
Semestre: ${prefs.academicSchedule.semester} | Disciplinas: ${prefs.academicSchedule.courses.join(', ')}
Limite Autônomo de Risco: ${prefs.autonomousActionThreshold}`;
    items.push({
      layer: 'L3_USER_PREFERENCES',
      provenance: 'jarvis_core://memory/preferences',
      content: prefsContent,
      tokenEstimate: estTokens(prefsContent),
    });

    // Layer 4: Task Goal
    const goalContent = `OBJETIVO ATUAL DO USUÁRIO: "${goal}"`;
    items.push({
      layer: 'L4_TASK_GOAL',
      provenance: 'user://input/current_goal',
      content: goalContent,
      tokenEstimate: estTokens(goalContent),
    });

    // Layer 5: Working Memory (Recent Turns)
    const workingTurns: WorkingMemoryItem[] = memoryManager.getWorkingMemory();
    const workingContent = workingTurns.map((t) => `${t.role.toUpperCase()}: ${t.content}`).join('\n');
    items.push({
      layer: 'L5_WORKING_MEMORY',
      provenance: 'jarvis_core://memory/working_turns',
      content: workingContent,
      tokenEstimate: estTokens(workingContent),
    });

    // Layer 6: Hierarchical Summary
    const summary = memoryManager.getHierarchicalSummary('daily');
    const summaryContent = `RESUMO DIÁRIO RECENTE: ${summary.headline}\nFATOS RELEVANTES: ${summary.extractedFacts.join('; ')}`;
    items.push({
      layer: 'L6_HIERARCHICAL_SUMMARY',
      provenance: 'jarvis_core://memory/summary_daily',
      content: summaryContent,
      tokenEstimate: estTokens(summaryContent),
    });

    // Layer 7: Hybrid Retrieved Knowledge
    const retrieved = memoryManager.hybridQuery(goal, 3);
    const retrievedDetails = [
      ...retrieved.episodic.map((e) => `[EPISÓDICO ${e.provenance}] ${e.item.title}: ${e.item.outcome}`),
      ...retrieved.semantic.map((s) => `[SEMÂNTICO ${s.provenance}] ${s.item.name} (${s.item.category})`),
      ...retrieved.documents.map((d) => `[DOCUMENTO ${d.provenance}] ${d.item.docTitle}: ${d.item.content}`),
    ].join('\n');
    items.push({
      layer: 'L7_HYBRID_RETRIEVAL',
      provenance: 'jarvis_core://retriever/rrf_fusion',
      content: retrievedDetails || 'Nenhum registro prévio altamente correlacionado.',
      tokenEstimate: estTokens(retrievedDetails || ''),
    });

    // Layer 8: Available Tools
    const tools = toolRegistry.listTools();
    const toolsSummary = tools.map((t) => `- ${t.name} [Risco: ${t.riskLevel}]: ${t.description}`).join('\n');
    items.push({
      layer: 'L8_AVAILABLE_TOOLS',
      provenance: 'jarvis_core://tools/registry',
      content: `FERRAMENTAS DISPONÍVEIS:\n${toolsSummary}`,
      tokenEstimate: estTokens(toolsSummary),
    });

    // Layer 9: Risk Constraints
    const riskContent = `RESTRIÇÕES DE RISCO: Ações de risco HIGH ou CRITICAL requerem geração de plano com steps de reversão e diff explícito.`;
    items.push({
      layer: 'L9_RISK_CONSTRAINTS',
      provenance: 'jarvis_core://security/policy_engine',
      content: riskContent,
      tokenEstimate: estTokens(riskContent),
    });

    // Enforce Token Budget
    let totalTokens = items.reduce((acc, i) => acc + i.tokenEstimate, 0);
    let compressed = false;

    if (totalTokens > this.maxBudget) {
      compressed = true;
      // Truncate lowest priority items (L7, L5) until within budget
      for (let i = items.length - 1; i >= 0; i--) {
        if (items[i].layer === 'L7_HYBRID_RETRIEVAL' || items[i].layer === 'L5_WORKING_MEMORY') {
          items[i].content = items[i].content.substring(0, Math.floor(items[i].content.length * 0.5)) + '... [truncado pelo orçamento de tokens]';
          items[i].tokenEstimate = estTokens(items[i].content);
        }
      }
      totalTokens = items.reduce((acc, i) => acc + i.tokenEstimate, 0);
    }

    return {
      traceId,
      totalTokensEstimate: totalTokens,
      maxTokenBudget: this.maxBudget,
      items,
      compressed,
    };
  }
}

export const contextBuilder = new ContextBuilder();
