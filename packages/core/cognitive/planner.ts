import { PlanDAG, PlanStep, RiskLevel } from '../../shared/types.ts';

export class Planner {
  public generatePlan(goal: string, traceId: string): PlanDAG {
    const lower = goal.toLowerCase();
    const planId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Canonical Case: "Organize minha semana" or scheduling optimization
    if (lower.includes('organize') || lower.includes('semana') || lower.includes('agenda') || lower.includes('cronograma')) {
      return this.createOrganizeWeekPlan(planId, goal);
    }

    // Diagnostic & System check
    if (lower.includes('diagnostico') || lower.includes('sistema') || lower.includes('status') || lower.includes('saude')) {
      return this.createSystemDiagnosticPlan(planId, goal);
    }

    // Study & Academic Plan
    if (lower.includes('estudo') || lower.includes('prova') || lower.includes('disciplina') || lower.includes('revisar')) {
      return this.createStudyReviewPlan(planId, goal);
    }

    // Generic Autonomous Task Plan
    return this.createGeneralPlan(planId, goal);
  }

  private createOrganizeWeekPlan(planId: string, goal: string): PlanDAG {
    const steps: PlanStep[] = [
      {
        id: 'step-01',
        title: 'Consultar Calendário (Próximos 7 dias)',
        tool: 'calendar_tool',
        args: { action: 'list' },
        preconditions: ['Conexão com calendário ativa'],
        expectedOutcome: 'Lista de compromissos confirmados retornada com sucesso',
        riskLevel: 'LOW',
        dependencies: [],
        status: 'PENDING',
      },
      {
        id: 'step-02',
        title: 'Consultar Tarefas Pendentes e Matriz de Priorização',
        tool: 'task_tool',
        args: { action: 'prioritize_matrix' },
        preconditions: ['Acesso à base de tarefas'],
        expectedOutcome: 'Tarefas ordenadas por urgência x importância (Q1/Q2)',
        riskLevel: 'LOW',
        dependencies: [],
        status: 'PENDING',
      },
      {
        id: 'step-03',
        title: 'Consultar Provas e Prazos Acadêmicos',
        tool: 'study_tool',
        args: { action: 'query_deadlines' },
        preconditions: ['Memória semântica acadêmica carregada'],
        expectedOutcome: 'Prazos iminentes (P1 Sistemas Distribuídos) identificados',
        riskLevel: 'LOW',
        dependencies: [],
        status: 'PENDING',
      },
      {
        id: 'step-04',
        title: 'Calcular Janelas de Disponibilidade Real',
        tool: 'calendar_tool',
        args: { action: 'calculate_free_slots' },
        preconditions: ['Eventos do calendário coletados (step-01)'],
        expectedOutcome: 'Blocos livres de energia alta/pico mapeados',
        riskLevel: 'LOW',
        dependencies: ['step-01'],
        status: 'PENDING',
      },
      {
        id: 'step-05',
        title: 'Gerar e Inserir Bloco de Estudo: Prova P1 (Sistemas Distribuídos)',
        tool: 'calendar_tool',
        args: {
          action: 'create',
          event: {
            title: 'Foco Profundo: Revisão Raft/Paxos (P1 Sistemas Distribuídos)',
            start: '2026-09-15T08:30:00Z',
            end: '2026-09-15T10:30:00Z',
            category: 'DEEP_WORK',
          },
        },
        preconditions: ['Disponibilidade confirmada em step-04'],
        expectedOutcome: 'Evento criado na terça-feira no slot de pico de energia',
        riskLevel: 'HIGH', // Modifying calendar
        dependencies: ['step-02', 'step-03', 'step-04'],
        status: 'PENDING',
        rollbackAction: {
          tool: 'calendar_tool',
          args: { action: 'delete', eventId: 'cal-rollback-p1' },
        },
      },
      {
        id: 'step-06',
        title: 'Notificar Superfícies Conectadas (Windows & Android)',
        tool: 'desktop_tool',
        args: {
          action: 'send_notification',
          message: 'JARVIS: Cronograma da semana otimizado. 2 blocos de alta energia alocados para Sistemas Distribuídos.',
        },
        preconditions: ['step-05 executado'],
        expectedOutcome: 'Toast de confirmação emitido para desktop e mobile',
        riskLevel: 'LOW',
        dependencies: ['step-05'],
        status: 'PENDING',
      },
    ];

    return {
      planId,
      goal,
      steps,
      createdAt: new Date().toISOString(),
      totalRiskLevel: 'HIGH',
      diffSummary: {
        added: [
          'Bloco de Estudo: Revisão Raft/Paxos (Terça 08:30 - 10:30)',
          'Notificação multiplataforma de cronograma otimizado',
        ],
        modified: ['Janela de prioridade Q1/Q2 ajustada'],
        deleted: [],
      },
    };
  }

  private createSystemDiagnosticPlan(planId: string, goal: string): PlanDAG {
    const steps: PlanStep[] = [
      {
        id: 'step-diag-01',
        title: 'Coletar Telemetria do Sistema e Memória Node.js',
        tool: 'system_tool',
        args: { action: 'telemetry' },
        preconditions: [],
        expectedOutcome: 'Dados de heap, rss e uptime',
        riskLevel: 'LOW',
        dependencies: [],
        status: 'PENDING',
      },
      {
        id: 'step-diag-02',
        title: 'Verificar Estado da Ponte Desktop Windows',
        tool: 'desktop_tool',
        args: { action: 'get_system_state' },
        preconditions: [],
        expectedOutcome: 'Status mTLS da ponte Windows retornado',
        riskLevel: 'LOW',
        dependencies: [],
        status: 'PENDING',
      },
      {
        id: 'step-diag-03',
        title: 'Verificar Estado da Ponte Mobile Android',
        tool: 'android_tool',
        args: { action: 'get_telemetry' },
        preconditions: [],
        expectedOutcome: 'Status do Foreground Service e WakeWord retornado',
        riskLevel: 'LOW',
        dependencies: [],
        status: 'PENDING',
      },
    ];

    return {
      planId,
      goal,
      steps,
      createdAt: new Date().toISOString(),
      totalRiskLevel: 'LOW',
    };
  }

  private createStudyReviewPlan(planId: string, goal: string): PlanDAG {
    const steps: PlanStep[] = [
      {
        id: 'step-std-01',
        title: 'Consultar Prazos e Datas de Exames',
        tool: 'study_tool',
        args: { action: 'query_deadlines' },
        preconditions: [],
        expectedOutcome: 'Mapeamento de avaliações pendentes',
        riskLevel: 'LOW',
        dependencies: [],
        status: 'PENDING',
      },
      {
        id: 'step-std-02',
        title: 'Gerar Recomendações de Blocos de Aprendizagem',
        tool: 'study_tool',
        args: { action: 'generate_study_blocks' },
        preconditions: ['step-std-01'],
        expectedOutcome: 'Técnica de estudos e duração sugerida',
        riskLevel: 'LOW',
        dependencies: ['step-std-01'],
        status: 'PENDING',
      },
    ];

    return {
      planId,
      goal,
      steps,
      createdAt: new Date().toISOString(),
      totalRiskLevel: 'LOW',
    };
  }

  private createGeneralPlan(planId: string, goal: string): PlanDAG {
    const steps: PlanStep[] = [
      {
        id: 'step-gen-01',
        title: `Avaliar contexto para: ${goal.substring(0, 50)}`,
        tool: 'system_tool',
        args: { action: 'telemetry' },
        preconditions: [],
        expectedOutcome: 'Validação de parâmetros',
        riskLevel: 'LOW',
        dependencies: [],
        status: 'PENDING',
      },
      {
        id: 'step-gen-02',
        title: 'Emitir Notificação de Operação Concluída',
        tool: 'desktop_tool',
        args: { action: 'send_notification', message: `JARVIS: Processado "${goal.substring(0, 40)}..."` },
        preconditions: ['step-gen-01'],
        expectedOutcome: 'Notificação despachada com sucesso',
        riskLevel: 'LOW',
        dependencies: ['step-gen-01'],
        status: 'PENDING',
      },
    ];

    return {
      planId,
      goal,
      steps,
      createdAt: new Date().toISOString(),
      totalRiskLevel: 'LOW',
    };
  }
}

export const planner = new Planner();
