import {
  EpisodicEvent,
  HierarchicalSummary,
  ProceduralPlaybook,
  SemanticEntity,
  UserPreferences,
  WorkingMemoryItem,
} from '../../shared/types.ts';
import { HybridRetriever } from './hybridRetriever.ts';
import { HierarchicalSummarizer } from './summarizer.ts';

export interface IngestedDocumentChunk {
  id: string;
  docTitle: string;
  sourceUri: string;
  chunkIndex: number;
  content: string;
  tags: string[];
  timestamp: string;
  hash: string;
}

export class MemoryManager {
  private workingMemory: WorkingMemoryItem[] = [];
  private episodicEvents: EpisodicEvent[] = [];
  private semanticEntities: Map<string, SemanticEntity> = new Map();
  private proceduralPlaybooks: Map<string, ProceduralPlaybook> = new Map();
  private userPreferences: UserPreferences;
  private documents: IngestedDocumentChunk[] = [];
  private maxWorkingMemorySize = 12;

  constructor() {
    this.userPreferences = {
      wakeTime: '06:30',
      sleepTime: '23:00',
      deepWorkSlots: ['08:00 - 11:30', '14:00 - 17:00'],
      voiceFeedbackEnabled: true,
      autonomousActionThreshold: 'MEDIUM',
      primaryLanguage: 'pt-BR',
      academicSchedule: {
        semester: '2026.2',
        courses: ['Sistemas Distribuídos', 'Inteligência Artificial Autônoma', 'Compiladores'],
        examWeeks: ['2026-10-15 a 2026-10-22'],
      },
    };

    this.seedInitialMemory();
  }

  private seedInitialMemory(): void {
    // Initial Working Memory
    this.addWorkingTurn('system', 'JARVIS Kernel v1.0 online. Standby for directives.', 15);

    // Initial Episodic Memory
    this.addEpisodicEvent({
      id: 'ep-seed-01',
      timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      title: 'Configuração do Ambiente Digital Pessoal',
      description: 'Inicialização de pontes com Calendário, Tarefas e Gestor Acadêmico.',
      outcome: 'Integrado com sucesso. Permissões concedidas.',
      importance: 0.9,
      tags: ['setup', 'system', 'authorization'],
      traceId: 'trace-seed-001',
    });

    // Initial Semantic Entities
    this.setSemanticEntity({
      id: 'course-distrib',
      name: 'Sistemas Distribuídos',
      category: 'COURSE',
      properties: { professor: 'Dr. Carvalho', creditos: 4, prioridade: 'ALTA' },
      relations: [{ targetId: 'exam-distrib-p1', relation: 'TEM_PROVA' }],
      lastUpdated: new Date().toISOString(),
    });

    this.setSemanticEntity({
      id: 'exam-distrib-p1',
      name: 'Prova P1 Sistemas Distribuídos',
      category: 'DEADLINE',
      properties: { data: '2026-09-22', peso: '40%' },
      relations: [{ targetId: 'course-distrib', relation: 'PERTENCE_A' }],
      lastUpdated: new Date().toISOString(),
    });

    this.setSemanticEntity({
      id: 'user-profile',
      name: 'Perfil Usuário',
      category: 'PREFERENCE',
      properties: {
        energia_matutina: 'Alta',
        foco_estudos: 'Blocos de 90 minutos com técnica Pomodoro estendida',
        meta_semanal: 'Concluir relatório técnico e organizar cronograma acadêmico',
      },
      relations: [],
      lastUpdated: new Date().toISOString(),
    });

    // Initial Procedural Playbook
    this.setProceduralPlaybook({
      id: 'playbook-organize-week',
      name: 'Rotina Canônica de Otimização Semanal',
      description: 'Cruza compromissos do calendário, prazos acadêmicos e tarefas para compor agenda de alto rendimento.',
      triggerCondition: 'organize_week_requested',
      steps: [
        '1. Buscar eventos de calendário na janela t+0 a t+7 dias',
        '2. Coletar tarefas pendentes e prazos de exames na memória semântica',
        '3. Calcular janelas livres de atenção contínua',
        '4. Alocar blocos de estudo prioritários',
        '5. Exibir diff estruturado para validação do usuário',
        '6. Executar mutações e registrar no log episódico',
      ],
      successCount: 14,
      failureCount: 0,
      lastRun: new Date().toISOString(),
    });

    // Ingest initial document chunk
    this.addDocumentChunk({
      id: 'doc-syllabus-01',
      docTitle: 'Ementa e Calendário Acadêmico 2026',
      sourceUri: 'local://faculdade/ementa_2026.pdf',
      chunkIndex: 0,
      content: 'Ementa do curso de Sistemas Distribuídos: Modelos de consenso Raft e Paxos, relógios vetoriais de Lamport, replicação de estado e tolerância a falhas bizantinas. Avaliações nas semanas 5 e 10.',
      tags: ['academic', 'syllabus', 'exams'],
      timestamp: new Date().toISOString(),
      hash: 'sha256-initial-doc-syllabus',
    });
  }

  // --- 1. Working Memory (Sliding Window & Compression) ---
  public addWorkingTurn(role: 'user' | 'assistant' | 'system' | 'tool', content: string, tokensEstimate = 20): void {
    const item: WorkingMemoryItem = {
      id: `wm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role,
      content,
      timestamp: new Date().toISOString(),
      tokensEstimate,
    };
    this.workingMemory.push(item);
    if (this.workingMemory.length > this.maxWorkingMemorySize) {
      // Compress older turns into a concise summary entry
      this.compressWorkingMemory();
    }
  }

  private compressWorkingMemory(): void {
    const toCompress = this.workingMemory.splice(0, 4);
    const summaryText = `[Resumo de contexto anterior: ${toCompress.map((c) => `${c.role}: ${c.content.substring(0, 40)}...`).join(' | ')}]`;
    this.workingMemory.unshift({
      id: `wm-compressed-${Date.now()}`,
      role: 'system',
      content: summaryText,
      timestamp: new Date().toISOString(),
      tokensEstimate: 30,
    });
  }

  public getWorkingMemory(): WorkingMemoryItem[] {
    return [...this.workingMemory];
  }

  // --- 2. Episodic Memory ---
  public addEpisodicEvent(event: EpisodicEvent): void {
    this.episodicEvents.push(event);
  }

  public appendEpisodicEvent(event: {
    id: string;
    timestamp: string;
    description: string;
    importanceScore: number;
    source: string;
  }): void {
    this.episodicEvents.push({
      id: event.id,
      timestamp: event.timestamp,
      title: event.description.substring(0, 40),
      description: event.description,
      outcome: 'Gravado na memória',
      importance: event.importanceScore / 5,
      tags: [event.source],
      traceId: `trace-${event.id}`,
    });
  }

  public getEpisodicEvents(limit = 20): EpisodicEvent[] {
    return [...this.episodicEvents].slice(-limit);
  }

  public getHierarchicalSummary(period: 'hourly' | 'daily' | 'weekly'): HierarchicalSummary {
    return HierarchicalSummarizer.rollupEvents(period, this.episodicEvents);
  }

  // --- 3. Semantic Memory (Knowledge Graph) ---
  public setSemanticEntity(entity: SemanticEntity): void {
    this.semanticEntities.set(entity.id, entity);
  }

  public getSemanticEntities(): SemanticEntity[] {
    return Array.from(this.semanticEntities.values());
  }

  // --- 4. Procedural Memory ---
  public setProceduralPlaybook(playbook: ProceduralPlaybook): void {
    this.proceduralPlaybooks.set(playbook.id, playbook);
  }

  public getProceduralPlaybooks(): ProceduralPlaybook[] {
    return Array.from(this.proceduralPlaybooks.values());
  }

  // --- 5. Preferences ---
  public getPreferences(): UserPreferences {
    return { ...this.userPreferences };
  }

  public updatePreferences(updates: Partial<UserPreferences>): UserPreferences {
    this.userPreferences = { ...this.userPreferences, ...updates };
    return this.userPreferences;
  }

  // --- 6. Documents & Ingestion Chunks ---
  public addDocumentChunk(chunk: IngestedDocumentChunk): void {
    this.documents.push(chunk);
  }

  public getDocuments(): IngestedDocumentChunk[] {
    return [...this.documents];
  }

  // --- Hybrid Cross-Store Retrieval ---
  public hybridSearch(query: string, topK = 4) {
    return this.hybridQuery(query, topK);
  }

  public hybridQuery(query: string, topK = 4) {
    // 1. Search across episodic
    const episodicMatches = HybridRetriever.fuseRRF(
      this.episodicEvents,
      (e) => `${e.title} ${e.description} ${e.outcome} ${e.tags.join(' ')}`,
      query,
      topK
    );

    // 2. Search across semantic entities
    const semanticItems = Array.from(this.semanticEntities.values());
    const semanticMatches = HybridRetriever.fuseRRF(
      semanticItems,
      (e) => `${e.name} ${e.category} ${JSON.stringify(e.properties)}`,
      query,
      topK
    );

    // 3. Search across documents
    const docMatches = HybridRetriever.fuseRRF(
      this.documents,
      (d) => `${d.docTitle} ${d.content} ${d.tags.join(' ')}`,
      query,
      topK
    );

    return {
      query,
      episodic: episodicMatches,
      semantic: semanticMatches,
      documents: docMatches,
    };
  }
}

export const memoryManager = new MemoryManager();
