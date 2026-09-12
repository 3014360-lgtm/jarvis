/**
 * JARVIS Shared Type Definitions and Contracts
 * Used across Core, Web Dashboard, Android Bridge, and Windows Agent.
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CognitiveStageName =
  | 'PERCEPTION'
  | 'INGESTION'
  | 'MEMORY'
  | 'CONTEXT'
  | 'REASONING'
  | 'PLANNING'
  | 'EXECUTION'
  | 'VERIFICATION'
  | 'RESULT_MEMORY';

export type VerificationStatus = 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'UNVERIFIABLE';

export interface TraceContext {
  traceId: string;
  parentTraceId?: string;
  startedAt: string;
  finishedAt?: string;
  currentStage: CognitiveStageName;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  userAuthorized: boolean;
  costEstimateUsd: number;
  tokensUsed: number;
}

export interface CognitiveStageLog {
  stage: CognitiveStageName;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  status: 'SUCCESS' | 'SKIPPED' | 'FAILED';
  inputSummary: string;
  outputSummary: string;
  details: Record<string, unknown>;
  error?: string;
}

export interface PerceptionEvent {
  id: string;
  source: 'CALENDAR' | 'TASK' | 'ANDROID' | 'WINDOWS' | 'WHATSAPP' | 'VOICE' | 'USER_INPUT' | 'FILE_WATCHER';
  eventType: string;
  payload: Record<string, unknown>;
  timestamp: string;
  sensitivity: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED';
}

export interface PlanStep {
  id: string;
  title: string;
  tool: string;
  args: Record<string, unknown>;
  preconditions: string[];
  expectedOutcome: string;
  riskLevel: RiskLevel;
  dependencies: string[];
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';
  result?: unknown;
  rollbackAction?: {
    tool: string;
    args: Record<string, unknown>;
  };
}

export interface PlanDAG {
  planId: string;
  goal: string;
  steps: PlanStep[];
  createdAt: string;
  totalRiskLevel: RiskLevel;
  diffSummary?: {
    added: string[];
    modified: string[];
    deleted: string[];
  };
}

export interface VerificationResult {
  stepId?: string;
  status: VerificationStatus;
  expectedState: string;
  actualState: string;
  remediationPlan?: string;
  verifiedAt: string;
}

export interface AuditLogEntry {
  id: string;
  traceId: string;
  timestamp: string;
  actor: 'JARVIS_AUTONOMOUS' | 'USER' | 'SYSTEM';
  action: string;
  toolName?: string;
  riskLevel: RiskLevel;
  authorizedBy: 'POLICY_AUTO' | 'USER_EXPLICIT';
  inputPayload: Record<string, unknown>;
  outputResult: Record<string, unknown>;
  hash: string;
  previousHash: string;
}

export interface WorkingMemoryItem {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  tokensEstimate: number;
}

export interface EpisodicEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  outcome: string;
  importance: number; // 0.0 - 1.0
  tags: string[];
  traceId: string;
}

export interface HierarchicalSummary {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  headline: string;
  keyEvents: string[];
  extractedFacts: string[];
  sourceEventIds: string[];
}

export interface SemanticEntity {
  id: string;
  name: string;
  category: 'PERSON' | 'PROJECT' | 'COURSE' | 'DEADLINE' | 'PREFERENCE' | 'DEVICE';
  properties: Record<string, string | number | boolean>;
  relations: Array<{
    targetId: string;
    relation: string;
  }>;
  lastUpdated: string;
}

export interface ProceduralPlaybook {
  id: string;
  name: string;
  description: string;
  triggerCondition: string;
  steps: string[];
  successCount: number;
  failureCount: number;
  lastRun?: string;
}

export interface UserPreferences {
  wakeTime: string;
  sleepTime: string;
  deepWorkSlots: string[];
  voiceFeedbackEnabled: boolean;
  autonomousActionThreshold: RiskLevel;
  primaryLanguage: string;
  academicSchedule: {
    semester: string;
    courses: string[];
    examWeeks: string[];
  };
}

export interface CalendarEventItem {
  id: string;
  title: string;
  start: string;
  end: string;
  category: 'DEEP_WORK' | 'ACADEMIC' | 'MEETING' | 'PERSONAL' | 'ROUTINE';
  status: 'CONFIRMED' | 'TENTATIVE' | 'PROPOSED';
  location?: string;
  notes?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate?: string;
  urgency: number; // 1 - 5
  importance: number; // 1 - 5
  estimatedMinutes: number;
  completed: boolean;
  category: 'STUDY' | 'WORK' | 'PERSONAL' | 'HEALTH';
}

export interface CognitiveCycleResponse {
  traceId: string;
  inputGoal: string;
  success: boolean;
  stages: CognitiveStageLog[];
  finalAnswer: string;
  plan?: PlanDAG;
  verifications: VerificationResult[];
  auditEntryId: string;
  memoryUpdate: {
    workingCount: number;
    episodicCount: number;
    semanticCount: number;
  };
}

// ==========================================
// 7. WORLD MODEL (Grafo do Mundo do Usuário)
// ==========================================

export type WorldEntityType =
  | 'PERSON'
  | 'COURSE'
  | 'PROFESSOR'
  | 'PROJECT'
  | 'DEVICE'
  | 'FILE'
  | 'APPLICATION'
  | 'ACCOUNT'
  | 'HABIT'
  | 'DEADLINE'
  | 'COMMITMENT';

export interface WorldEntity {
  id: string;
  type: WorldEntityType;
  name: string;
  attributes: Record<string, unknown>;
  confidence: number; // 0.0 to 1.0
  provenance: string; // e.g., 'calendar_sync', 'user_declared', 'school_portal'
  createdAt: string;
  updatedAt: string;
}

export interface WorldRelation {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType:
    | 'TEACHES'
    | 'ENROLLED_IN'
    | 'DEPENDS_ON'
    | 'LOCATED_AT'
    | 'OWNS'
    | 'ASSOCIATED_WITH'
    | 'PREREQUISITE_FOR'
    | 'DEADLINE_FOR';
  confidence: number;
  provenance: string;
  updatedAt: string;
}

export interface WorldModelGraph {
  entities: WorldEntity[];
  relations: WorldRelation[];
}

// ==========================================
// 8. MÓDULO DE ESTUDOS (study/) & SM-2/FSRS
// ==========================================

export interface CourseEntity {
  id: string;
  code: string;
  name: string;
  professorId: string;
  period: string; // e.g. "2026/2"
  schedule: string[];
  classroom: string;
}

export interface AcademicEvaluation {
  id: string;
  courseId: string;
  title: string;
  type: 'PROVA' | 'TRABALHO' | 'SEMINARIO' | 'PROJETO';
  date: string;
  weight: number;
  score?: number;
  maxScore: number;
  topics: string[];
}

export interface StudyTopic {
  id: string;
  courseId: string;
  title: string;
  parentTopicId?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  masteryScore: number; // 0 - 100%
  lastReviewed?: string;
  nextReviewDate: string;
  // SM-2 / FSRS metrics
  repetitionNumber: number;
  intervalDays: number;
  easeFactor: number; // Default 2.5
  stability: number;
  difficultyRating: number;
}

export interface StudyExercise {
  id: string;
  topicId: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  rubric: string;
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface StudySessionRecord {
  id: string;
  topicId: string;
  courseId: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  rating: 1 | 2 | 3 | 4 | 5; // User recall rating (Again, Hard, Good, Easy)
  notes?: string;
}

// ==========================================
// 9. CAMADA DE NAVEGADOR (packages/browser/)
// ==========================================

export interface AccessibilityNode {
  id: string; // Stable ID e.g. "elem-01"
  role: string; // "button", "link", "input", "heading", "table"
  name: string; // Text or accessible label
  value?: string;
  description?: string;
  disabled?: boolean;
  children?: AccessibilityNode[];
}

export interface BrowserPageCompactView {
  url: string;
  title: string;
  tree: AccessibilityNode;
  mainTextSnippet: string;
  interactiveElementsCount: number;
}

export interface BrowserActionRequest {
  action: 'NAVIGATE' | 'CLICK' | 'TYPE' | 'READ' | 'EXTRACT' | 'SCREENSHOT';
  elementId?: string; // Stable reference to accessibility node
  url?: string;
  text?: string;
  schema?: Record<string, unknown>;
}

// ==========================================
// 11. PORTAL ESCOLAR
// ==========================================

export interface SchoolPortalSyncData {
  portalName: string;
  lastSyncedAt: string;
  grades: Array<{ course: string; evalName: string; grade: number; maxGrade: number }>;
  deadlines: Array<{ course: string; title: string; date: string }>;
  announcements: Array<{ date: string; title: string; author: string; content: string }>;
  attendanceRate: number; // e.g. 96.5%
}

// ==========================================
// 15. CONTRATO DE FERRAMENTA FORMAL
// ==========================================

export interface FormalToolContract {
  name: string;
  version: string;
  description: string;
  parametersSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  riskLevel: RiskLevel;
  requiredPermissions: string[];
  requiredCapabilities?: ('windows_agent' | 'browser' | 'android' | 'hermes')[];
  sideEffects: 'none' | 'read' | 'write' | 'destructive' | 'external';
  idempotencyKeyFn?: (args: Record<string, unknown>) => string;
  rateLimitPerMinute?: number;
  timeoutMs?: number;
  requiresBackup?: boolean;
  rollback?: (args: Record<string, unknown>, context: unknown) => Promise<boolean>;
  verify?: (result: unknown) => Promise<boolean>;
  dryRun?: (args: Record<string, unknown>) => Promise<unknown>;
  redactionPolicy?: string[];
  auditFields?: string[];
  costEstimateUsd?: number;
}

// ==========================================
// 17. PROTOCOLOS CANÔNICOS
// ==========================================

export type ProtocolType =
  | 'BACKUP'
  | 'RECUPERACAO'
  | 'SEGURANCA'
  | 'AUDITORIA'
  | 'LIMPEZA'
  | 'ORGANIZACAO'
  | 'ESTUDOS'
  | 'AGENDA'
  | 'EMERGENCIA'
  | 'MANUTENCAO';

export interface ProtocolStepExecution {
  stepName: 'ACAO' | 'BACKUP' | 'VERIFICACAO' | 'EXECUCAO' | 'VALIDACAO' | 'REGISTRO';
  status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';
  detail: string;
  timestamp: string;
}

export interface ProtocolReport {
  id: string;
  protocolType: ProtocolType;
  startedAt: string;
  completedAt?: string;
  success: boolean;
  dryRun: boolean;
  steps: ProtocolStepExecution[];
  summary: string;
  diffSummary?: { added: string[]; modified: string[]; deleted: string[] };
}

// ==========================================
// 18. MULTIAGENTE E ORQUESTRADOR
// ==========================================

export type SpecializedAgentRole =
  | 'CORE_AGENT'
  | 'STUDY_AGENT'
  | 'BROWSER_AGENT'
  | 'ANDROID_AGENT'
  | 'WINDOWS_AGENT'
  | 'SECURITY_AGENT'
  | 'MEMORY_AGENT'
  | 'CALENDAR_AGENT'
  | 'RESEARCH_AGENT';

export interface AgentDelegationRecord {
  delegationId: string;
  fromAgent: string;
  toAgent: SpecializedAgentRole;
  taskDescription: string;
  allocatedTokenBudget: number;
  status: 'DISPATCHED' | 'COMPLETED' | 'REJECTED';
  resultSummary?: string;
}

// ==========================================
// 20. APRENDIZADO CONTÍNUO (cognitive/learning/)
// ==========================================

export interface InferredPreference {
  id: string;
  category: 'ROUTINE' | 'COMMUNICATION' | 'STUDY' | 'TOOL_PREFERENCE';
  statement: string;
  confidence: number;
  originEvidence: string;
  userConfirmed: boolean;
  detectedAt: string;
}

export interface SuggestedAutomation {
  id: string;
  title: string;
  triggerCondition: string;
  proposedAction: string;
  evidence: string;
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

