export * from '../packages/shared/types.ts';

export type ActiveTab =
  | 'command'
  | 'cognitive_loop'
  | 'planner'
  | 'memory'
  | 'study'
  | 'protocols'
  | 'world_model'
  | 'learning'
  | 'audit'
  | 'platforms'
  | 'terminal'
  | 'docs';

export interface SystemStatusData {
  status: string;
  mode: string;
  kernel: string;
  activeTrace: string;
  uptimeSeconds: number;
  memory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
  };
  policyThreshold: string;
  toolsCount: number;
  auditLogCount: number;
  storesCount: {
    working: number;
    episodic: number;
    semantic: number;
    procedural: number;
    documents: number;
  };
}

export interface HybridSearchResult {
  episodic: Array<{ item: import('../packages/shared/types.ts').EpisodicEvent; score: number }>;
  semantic: Array<{ item: import('../packages/shared/types.ts').SemanticEntity; score: number }>;
  documents: Array<{ item: any; score: number }>;
}

export interface DocumentItem {
  id: string;
  docTitle: string;
  sourceUri: string;
  chunkIndex: number;
  content: string;
  tags: string[];
  timestamp: string;
  hash: string;
}

export interface PlatformStatusData {
  webDashboard: { status: string; latencyMs: number; clientCount: number };
  androidBridge: {
    status: string;
    device: string;
    os: string;
    foregroundService: string;
    wakeWord: string;
    battery: string;
  };
  windowsAgent: {
    status: string;
    os: string;
    channel: string;
    activeWindow: string;
  };
  whatsAppGateway: {
    status: string;
    officialApi: string;
    webhookVerified: boolean;
  };
  voiceEngine: {
    stt: string;
    tts: string;
  };
}
