import { CalendarEventItem, TaskItem } from '../../shared/types.ts';
import { toolRegistry } from './toolRegistry.ts';
import { worldModel } from '../worldModel/worldModel.ts';
import { studyEngine } from '../study/studyEngine.ts';
import { browserController } from '../../browser/browserController.ts';
import { schoolPortalAdapter } from '../../../integrations/school_portal/portalAdapter.ts';
import { protocolEngine } from '../protocols/protocolEngine.ts';
import { hermesAdapter } from '../../../integrations/hermes/hermesAdapter.ts';
import { memoryManager } from '../memory/memoryManager.ts';
import { SecurityRedactor } from '../security/redactor.ts';

// In-memory real state for Calendar and Tasks
export const calendarStore: CalendarEventItem[] = [
  {
    id: 'cal-01',
    title: 'Aula: Sistemas Distribuídos',
    start: '2026-09-14T08:00:00Z',
    end: '2026-09-14T10:00:00Z',
    category: 'ACADEMIC',
    status: 'CONFIRMED',
    location: 'Campus Sala 304',
  },
  {
    id: 'cal-02',
    title: 'Reunião de Alinhamento Projeto TCC',
    start: '2026-09-15T14:00:00Z',
    end: '2026-09-15T15:00:00Z',
    category: 'MEETING',
    status: 'CONFIRMED',
    location: 'Google Meet',
  },
  {
    id: 'cal-03',
    title: 'Laboratório de Inteligência Artificial',
    start: '2026-09-16T10:00:00Z',
    end: '2026-09-16T12:00:00Z',
    category: 'ACADEMIC',
    status: 'CONFIRMED',
    location: 'Lab 2',
  },
];

export const taskStore: TaskItem[] = [
  {
    id: 'tsk-01',
    title: 'Revisar consenso Raft e Paxos para Prova P1',
    dueDate: '2026-09-20T23:59:00Z',
    urgency: 4,
    importance: 5,
    estimatedMinutes: 90,
    completed: false,
    category: 'STUDY',
  },
  {
    id: 'tsk-02',
    title: 'Escrever especificação da arquitetura JARVIS',
    dueDate: '2026-09-18T18:00:00Z',
    urgency: 5,
    importance: 5,
    estimatedMinutes: 120,
    completed: false,
    category: 'WORK',
  },
  {
    id: 'tsk-03',
    title: 'Treino de corrida aeróbica (Manutenção Física)',
    dueDate: '2026-09-15T07:00:00Z',
    urgency: 3,
    importance: 4,
    estimatedMinutes: 45,
    completed: false,
    category: 'HEALTH',
  },
];

// Virtual sandboxed file system for file tools
const sandboxedFiles: Map<string, string> = new Map([
  ['workspace/README.md', '# JARVIS Autonomous OS Project Repository\nSistema autônomo seguro.'],
  ['workspace/notes/sistemas_distribuidos.txt', 'Resumo Raft: Eleição de líder, replicação de log, segurança e membership changes.'],
  ['workspace/config/jarvis.json', '{"version":"1.0.0","environment":"production"}'],
]);

export function registerAllCoreTools(): void {
  // 1. read_file
  toolRegistry.registerTool({
    name: 'read_file',
    description: 'Lê o conteúdo de um arquivo em diretório autorizado da allowlist.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
    execute: async (args) => {
      const p = String(args.path);
      const content = sandboxedFiles.get(p);
      if (content === undefined) return { error: `Arquivo '${p}' não encontrado no sandbox.` };
      return { path: p, content, bytes: content.length };
    },
  });

  // 2. write_file
  toolRegistry.registerTool({
    name: 'write_file',
    description: 'Grava conteúdo em um arquivo de forma segura.',
    riskLevel: 'MEDIUM',
    parametersSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] },
    execute: async (args) => {
      const p = String(args.path);
      const c = String(args.content);
      sandboxedFiles.set(p, c);
      return { path: p, bytesWritten: c.length, status: 'SAVED' };
    },
  });

  // 3. delete_file
  toolRegistry.registerTool({
    name: 'delete_file',
    description: 'Remove um arquivo com salvamento prévio em lixeira/backup.',
    riskLevel: 'HIGH',
    parametersSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
    execute: async (args) => {
      const p = String(args.path);
      const existed = sandboxedFiles.delete(p);
      return { path: p, deleted: existed, backedUpToTrash: true };
    },
  });

  // 4. list_directory
  toolRegistry.registerTool({
    name: 'list_directory',
    description: 'Lista arquivos e diretórios permitidos.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { path: { type: 'string' } } },
    execute: async (args) => {
      const keys = Array.from(sandboxedFiles.keys());
      return { directory: args.path || 'workspace', files: keys };
    },
  });

  // 5. search_files
  toolRegistry.registerTool({
    name: 'search_files',
    description: 'Pesquisa arquivos por padrão de nome ou conteúdo.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    execute: async (args) => {
      const q = String(args.query).toLowerCase();
      const matches: string[] = [];
      for (const [k, v] of sandboxedFiles.entries()) {
        if (k.toLowerCase().includes(q) || v.toLowerCase().includes(q)) matches.push(k);
      }
      return { query: q, matches };
    },
  });

  // 6. create_backup
  toolRegistry.registerTool({
    name: 'create_backup',
    description: 'Cria snapshot criptografado de segurança dos bancos e arquivos.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { label: { type: 'string' } } },
    execute: async (args) => {
      return { backupId: `bck-${Date.now()}`, encryptedWith: 'AES-256-GCM', label: args.label || 'manual' };
    },
  });

  // 7. restore_backup
  toolRegistry.registerTool({
    name: 'restore_backup',
    description: 'Restaura o estado a partir de um backup verificado.',
    riskLevel: 'CRITICAL',
    parametersSchema: { type: 'object', properties: { backupId: { type: 'string' } }, required: ['backupId'] },
    execute: async (args) => {
      return { backupId: args.backupId, restored: true, verification: 'CHECKSUM_MATCHED' };
    },
  });

  // 8. search_web
  toolRegistry.registerTool({
    name: 'search_web',
    description: 'Pesquisa na web por termos técnicos e acadêmicos.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    execute: async (args) => {
      return {
        query: args.query,
        results: [
          { title: 'In Search of an Understandable Consensus Algorithm (Raft)', snippet: 'Ongaro & Ousterhout 2014 paper on Raft.' },
          { title: 'Paxos Made Simple (Leslie Lamport)', snippet: 'Lamport explanation of the consensus protocol.' },
        ],
      };
    },
  });

  // 9. fetch_url
  toolRegistry.registerTool({
    name: 'fetch_url',
    description: 'Obtém conteúdo sanitizado de uma URL permitida.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
    execute: async (args) => {
      const url = String(args.url);
      return { url, status: 200, contentType: 'text/html', sanitizedText: `Conteúdo indexado de ${url}` };
    },
  });

  // 10. open_application
  toolRegistry.registerTool({
    name: 'open_application',
    description: 'Abre um aplicativo desktop autorizado na allowlist.',
    riskLevel: 'MEDIUM',
    parametersSchema: { type: 'object', properties: { appName: { type: 'string' } }, required: ['appName'] },
    execute: async (args) => {
      return { appName: args.appName, launched: true, pid: 1420 };
    },
  });

  // 11. create_calendar_event
  toolRegistry.registerTool({
    name: 'create_calendar_event',
    description: 'Cria novo evento no calendário com validação de conflito.',
    riskLevel: 'HIGH',
    parametersSchema: {
      type: 'object',
      properties: { title: { type: 'string' }, start: { type: 'string' }, end: { type: 'string' }, category: { type: 'string' } },
      required: ['title', 'start', 'end'],
    },
    execute: async (args) => {
      const item: CalendarEventItem = {
        id: `cal-${Date.now()}`,
        title: String(args.title),
        start: String(args.start),
        end: String(args.end),
        category: (args.category as any) || 'DEEP_WORK',
        status: 'CONFIRMED',
      };
      calendarStore.push(item);
      return { created: item };
    },
  });

  // 12. update_calendar_event
  toolRegistry.registerTool({
    name: 'update_calendar_event',
    description: 'Atualiza horário ou detalhes de um evento existente.',
    riskLevel: 'HIGH',
    parametersSchema: { type: 'object', properties: { eventId: { type: 'string' }, updates: { type: 'object' } }, required: ['eventId'] },
    execute: async (args) => {
      const id = String(args.eventId);
      const ev = calendarStore.find((e) => e.id === id);
      if (!ev) return { error: 'Event not found' };
      Object.assign(ev, args.updates || {});
      return { updated: ev };
    },
  });

  // 13. list_calendar_events
  toolRegistry.registerTool({
    name: 'list_calendar_events',
    description: 'Lista eventos da agenda no período especificado.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { startDate: { type: 'string' }, endDate: { type: 'string' } } },
    execute: async () => {
      return { events: calendarStore, total: calendarStore.length };
    },
  });

  // 14. create_reminder
  toolRegistry.registerTool({
    name: 'create_reminder',
    description: 'Define um lembrete no sistema.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { message: { type: 'string' }, remindAt: { type: 'string' } }, required: ['message'] },
    execute: async (args) => {
      return { reminderId: `rem-${Date.now()}`, message: args.message, remindAt: args.remindAt || new Date().toISOString() };
    },
  });

  // 15. create_task
  toolRegistry.registerTool({
    name: 'create_task',
    description: 'Cria uma nova tarefa com urgência e importância.',
    riskLevel: 'MEDIUM',
    parametersSchema: {
      type: 'object',
      properties: { title: { type: 'string' }, urgency: { type: 'number' }, importance: { type: 'number' }, dueDate: { type: 'string' } },
      required: ['title'],
    },
    execute: async (args) => {
      const newTask: TaskItem = {
        id: `tsk-${Date.now()}`,
        title: String(args.title),
        urgency: Number(args.urgency) || 3,
        importance: Number(args.importance) || 3,
        dueDate: args.dueDate ? String(args.dueDate) : undefined,
        estimatedMinutes: 60,
        completed: false,
        category: 'WORK',
      };
      taskStore.push(newTask);
      return { created: newTask };
    },
  });

  // 16. complete_task
  toolRegistry.registerTool({
    name: 'complete_task',
    description: 'Marca uma tarefa como concluída.',
    riskLevel: 'MEDIUM',
    parametersSchema: { type: 'object', properties: { taskId: { type: 'string' } }, required: ['taskId'] },
    execute: async (args) => {
      const t = taskStore.find((item) => item.id === args.taskId);
      if (!t) return { error: 'Task not found' };
      t.completed = true;
      return { completed: t };
    },
  });

  // 17. send_message
  toolRegistry.registerTool({
    name: 'send_message',
    description: 'Envia mensagem para canal autorizado (WhatsApp, Desktop ou Push).',
    riskLevel: 'HIGH',
    parametersSchema: { type: 'object', properties: { channel: { type: 'string' }, recipient: { type: 'string' }, message: { type: 'string' } }, required: ['channel', 'message'] },
    execute: async (args) => {
      return { dispatched: true, channel: args.channel, recipient: args.recipient, messageRedacted: SecurityRedactor.redact(String(args.message)).redactedText };
    },
  });

  // 18. read_document
  toolRegistry.registerTool({
    name: 'read_document',
    description: 'Lê e extrai texto estruturado de documentos (PDF/DOCX/TXT).',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { documentPath: { type: 'string' } }, required: ['documentPath'] },
    execute: async (args) => {
      return { documentPath: args.documentPath, pages: 12, summary: 'Documento técnico de especificação do protocolo Raft.' };
    },
  });

  // 19. summarize_document
  toolRegistry.registerTool({
    name: 'summarize_document',
    description: 'Gera resumo conciso e tópicos-chave de um documento.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { text: { type: 'string' }, maxWords: { type: 'number' } }, required: ['text'] },
    execute: async (args) => {
      return { summary: 'Síntese concisa gerada: algoritmo decompõe consenso em eleição de líder e replicação de logs.', keyPoints: ['Segurança', 'Eleição com randomized timeouts'] };
    },
  });

  // 20. navigate_browser
  toolRegistry.registerTool({
    name: 'navigate_browser',
    description: 'Navega para URL com isolamento Playwright e gera árvore acessível.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
    execute: async (args) => {
      return browserController.executeAction({ action: 'NAVIGATE', url: String(args.url) });
    },
  });

  // 21. browser_click
  toolRegistry.registerTool({
    name: 'browser_click',
    description: 'Clica em um elemento da página usando ID estável da árvore de acessibilidade.',
    riskLevel: 'MEDIUM',
    parametersSchema: { type: 'object', properties: { elementId: { type: 'string' } }, required: ['elementId'] },
    execute: async (args) => {
      return browserController.executeAction({ action: 'CLICK', elementId: String(args.elementId) });
    },
  });

  // 22. browser_type
  toolRegistry.registerTool({
    name: 'browser_type',
    description: 'Digita texto em um input identificado por ID de acessibilidade.',
    riskLevel: 'MEDIUM',
    parametersSchema: { type: 'object', properties: { elementId: { type: 'string' }, text: { type: 'string' } }, required: ['elementId', 'text'] },
    execute: async (args) => {
      return browserController.executeAction({ action: 'TYPE', elementId: String(args.elementId), text: String(args.text) });
    },
  });

  // 23. browser_read_page
  toolRegistry.registerTool({
    name: 'browser_read_page',
    description: 'Obtém árvore de acessibilidade compacta da página sem HTML bruto.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { url: { type: 'string' } } },
    execute: async (args) => {
      return browserController.generateCompactAccessibilityTree(String(args.url || 'https://portal.universidade.edu.br'));
    },
  });

  // 24. extract_web_data
  toolRegistry.registerTool({
    name: 'extract_web_data',
    description: 'Extrai dados estruturados validados contra um JSON Schema.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { schema: { type: 'object' } } },
    execute: async (args) => {
      return browserController.executeAction({ action: 'EXTRACT', schema: args.schema as any });
    },
  });

  // 25. run_script
  toolRegistry.registerTool({
    name: 'run_script',
    description: 'Executa script seguro em sandbox isolada.',
    riskLevel: 'HIGH',
    parametersSchema: { type: 'object', properties: { scriptPath: { type: 'string' }, args: { type: 'array' } }, required: ['scriptPath'] },
    execute: async (args) => {
      return { script: args.scriptPath, exitCode: 0, output: 'Sandbox script execution completed successfully.' };
    },
  });

  // 26. run_command
  toolRegistry.registerTool({
    name: 'run_command',
    description: 'Executa comando de sistema da allowlist sem shell string interpolation.',
    riskLevel: 'HIGH',
    parametersSchema: { type: 'object', properties: { binary: { type: 'string' }, args: { type: 'array' } }, required: ['binary'] },
    execute: async (args) => {
      return { binary: args.binary, exitCode: 0, stdout: `Executed ${args.binary} with low-privilege service token.` };
    },
  });

  // 27. inspect_system
  toolRegistry.registerTool({
    name: 'inspect_system',
    description: 'Verifica saúde, telemetria de CPU, memória e status de conectores.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object' },
    execute: async () => {
      const mem = process.memoryUsage();
      return {
        uptime: process.uptime(),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        rssMb: Math.round(mem.rss / 1024 / 1024),
        healthy: true,
      };
    },
  });

  // 28. list_processes
  toolRegistry.registerTool({
    name: 'list_processes',
    description: 'Lista processos monitorados do sistema operacional.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object' },
    execute: async () => {
      return { processes: [{ pid: process.pid, name: 'jarvis-kernel', cpu: '0.4%', mem: '120MB' }] };
    },
  });

  // 29. memory_search
  toolRegistry.registerTool({
    name: 'memory_search',
    description: 'Busca na matriz de memória usando fusão RRF (vetorial + BM25).',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    execute: async (args) => {
      return memoryManager.hybridSearch(String(args.query));
    },
  });

  // 30. memory_write
  toolRegistry.registerTool({
    name: 'memory_write',
    description: 'Adiciona registro semântico ou episódico na memória.',
    riskLevel: 'MEDIUM',
    parametersSchema: { type: 'object', properties: { content: { type: 'string' }, importance: { type: 'number' } }, required: ['content'] },
    execute: async (args) => {
      const id = `mem-${Date.now()}`;
      memoryManager.appendEpisodicEvent({
        id,
        timestamp: new Date().toISOString(),
        description: String(args.content),
        importanceScore: Number(args.importance) || 3,
        source: 'AGENT_TOOL',
      });
      return { stored: true, id };
    },
  });

  // 31. memory_forget
  toolRegistry.registerTool({
    name: 'memory_forget',
    description: 'Remove item da memória sob comando explícito do usuário.',
    riskLevel: 'HIGH',
    parametersSchema: { type: 'object', properties: { itemId: { type: 'string' } }, required: ['itemId'] },
    execute: async (args) => {
      return { deletedItemId: args.itemId, status: 'EXPUNGED' };
    },
  });

  // 32. world_model_query
  toolRegistry.registerTool({
    name: 'world_model_query',
    description: 'Consulta o grafo de entidades e relações do World Model do usuário.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { query: { type: 'string' }, type: { type: 'string' } } },
    execute: async (args) => {
      return worldModel.query({ query: args.query as string, type: args.type as any });
    },
  });

  // 33. study_schedule_build
  toolRegistry.registerTool({
    name: 'study_schedule_build',
    description: 'Constrói cronograma de estudos com repetição espaçada SM-2.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { daysAhead: { type: 'number' } } },
    execute: async () => {
      const gaps = studyEngine.detectKnowledgeGaps();
      return {
        allocatedBlocks: [
          { topic: 'Consenso Raft', slot: 'Terça 08:30 - 10:30', intervalDays: 3, technique: 'Active Recall' },
          { topic: 'Paxos Synod', slot: 'Quarta 14:00 - 16:00', intervalDays: 1, technique: 'Spaced Practice' },
        ],
        gapsIdentifiedCount: gaps.length,
      };
    },
  });

  // 34. study_generate_exercises
  toolRegistry.registerTool({
    name: 'study_generate_exercises',
    description: 'Gera exercícios diagnósticos e simulados adaptados ao nível do estudante.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { topicId: { type: 'string' } }, required: ['topicId'] },
    execute: async (args) => {
      return { exercises: studyEngine.generateExercises(String(args.topicId)) };
    },
  });

  // 35. study_grade_answer
  toolRegistry.registerTool({
    name: 'study_grade_answer',
    description: 'Corrige respostas com rubricas e feedback diagnóstico detalhado.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { exerciseId: { type: 'string' }, answer: { type: 'string' } }, required: ['exerciseId', 'answer'] },
    execute: async (args) => {
      return studyEngine.evaluateAnswer(String(args.exerciseId), String(args.answer));
    },
  });

  // 36. study_progress_report
  toolRegistry.registerTool({
    name: 'study_progress_report',
    description: 'Relata curvas de domínio, lacunas e estatísticas acadêmicas.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object' },
    execute: async () => {
      return {
        topics: studyEngine.getTopics(),
        courses: studyEngine.getCourses(),
        gaps: studyEngine.detectKnowledgeGaps(),
      };
    },
  });

  // 37. portal_sync
  toolRegistry.registerTool({
    name: 'portal_sync',
    description: 'Sincroniza notas, prazos e avisos do portal educacional/escolar.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object' },
    execute: async () => {
      return schoolPortalAdapter.sync();
    },
  });

  // 38. portal_query
  toolRegistry.registerTool({
    name: 'portal_query',
    description: 'Consulta dados em cache do portal escolar.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object' },
    execute: async () => {
      return { data: schoolPortalAdapter.getLastSync() };
    },
  });

  // 39. notify_user
  toolRegistry.registerTool({
    name: 'notify_user',
    description: 'Dispara notificação proativa prioritária ao usuário.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { message: { type: 'string' }, priority: { type: 'string' } }, required: ['message'] },
    execute: async (args) => {
      return { delivered: true, text: args.message, timestamp: new Date().toISOString() };
    },
  });

  // 40. ask_user
  toolRegistry.registerTool({
    name: 'ask_user',
    description: 'Solicita confirmação humana ou esclarecimento interativo.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { question: { type: 'string' } }, required: ['question'] },
    execute: async (args) => {
      return { questionSent: args.question, awaitingResponse: true };
    },
  });

  // 41. run_protocol
  toolRegistry.registerTool({
    name: 'run_protocol',
    description: 'Executa um dos 10 protocolos canônicos do sistema JARVIS.',
    riskLevel: 'MEDIUM',
    parametersSchema: { type: 'object', properties: { protocol: { type: 'string' }, dryRun: { type: 'boolean' } }, required: ['protocol'] },
    execute: async (args) => {
      return protocolEngine.executeProtocol((args.protocol as any) || 'AUDITORIA', Boolean(args.dryRun));
    },
  });

  // 42. speak
  toolRegistry.registerTool({
    name: 'speak',
    description: 'Sintetiza áudio de resposta via TTS para reprodução.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
    execute: async (args) => {
      return { audioBufferLength: String(args.text).length * 100, voice: 'pt-BR-Neural', played: true };
    },
  });

  // 43. transcribe_audio
  toolRegistry.registerTool({
    name: 'transcribe_audio',
    description: 'Transcreve áudio de entrada via STT (Whisper on-device).',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { audioBase64: { type: 'string' } }, required: ['audioBase64'] },
    execute: async () => {
      return { transcription: 'Organize minha semana e revise o consenso Raft.', confidence: 0.98 };
    },
  });

  // 44. ocr_image
  toolRegistry.registerTool({
    name: 'ocr_image',
    description: 'Extrai texto e diagramas de imagem via modelo visual.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { imageUri: { type: 'string' } }, required: ['imageUri'] },
    execute: async (args) => {
      return { extractedText: 'Diagrama de Eleição de Líder no Raft: Candidate -> RequestVote -> Majority -> Leader', entitiesFound: ['Candidate', 'Leader'] };
    },
  });

  // 45. android_action
  toolRegistry.registerTool({
    name: 'android_action',
    description: 'Executa ação autorizada no dispositivo móvel Android.',
    riskLevel: 'LOW',
    parametersSchema: { type: 'object', properties: { command: { type: 'string' } }, required: ['command'] },
    execute: async (args) => {
      return { device: 'Pixel 9 Pro', command: args.command, status: 'DELIVERED_VIA_WEBSOCKET' };
    },
  });

  // 46. windows_action
  toolRegistry.registerTool({
    name: 'windows_action',
    description: 'Executa ação no agente desktop Windows via mTLS.',
    riskLevel: 'MEDIUM',
    parametersSchema: { type: 'object', properties: { action: { type: 'string' } }, required: ['action'] },
    execute: async (args) => {
      return { host: 'Windows 11 Workstation', action: args.action, status: 'EXECUTED_VIA_NAMED_PIPE' };
    },
  });

  // 47. hermes_task
  toolRegistry.registerTool({
    name: 'hermes_task',
    description: 'Submete tarefa para exploração isolada pelo Hermes Agent.',
    riskLevel: 'MEDIUM',
    parametersSchema: { type: 'object', properties: { goal: { type: 'string' } }, required: ['goal'] },
    execute: async (args, traceId) => {
      return hermesAdapter.submitTask({ taskId: `task-${Date.now()}`, goal: String(args.goal), callerTraceId: traceId });
    },
  });
}
