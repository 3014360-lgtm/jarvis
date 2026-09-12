import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { CognitiveLoop } from './packages/core/cognitive/cognitiveLoop.ts';
import { CanonicalOrganizeWeekFlow } from './packages/core/canonicalFlows/organizeWeekFlow.ts';
import { memoryManager } from './packages/core/memory/memoryManager.ts';
import { auditLog } from './packages/core/security/auditLog.ts';
import { toolRegistry } from './packages/core/tools/toolRegistry.ts';
import { policyEngine } from './packages/core/security/policyEngine.ts';
import { calendarStore, taskStore } from './packages/core/tools/implementations.ts';
import { worldModel } from './packages/core/worldModel/worldModel.ts';
import { studyEngine } from './packages/core/study/studyEngine.ts';
import { browserController } from './packages/browser/browserController.ts';
import { schoolPortalAdapter } from './integrations/school_portal/portalAdapter.ts';
import { protocolEngine } from './packages/core/protocols/protocolEngine.ts';
import { learningEngine } from './packages/core/learning/learningEngine.ts';
import { orchestrator } from './packages/core/agents/orchestrator.ts';
import { whatsAppGateway } from './integrations/whatsapp/whatsappGateway.ts';
import { perceptionConnectors } from './packages/core/perception/connectors.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // SSE Clients for live telemetry stream
  const sseClients: express.Response[] = [];

  function broadcastTraceEvent(event: string, data: unknown) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    sseClients.forEach((client) => {
      try {
        client.write(payload);
      } catch {
        // client disconnected
      }
    });
  }

  // --- API ROUTES FIRST ---

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      agent: 'JARVIS Autonomous OS',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // System status and telemetry
  app.get('/api/status', (_req, res) => {
    const memory = process.memoryUsage();
    res.json({
      status: 'ONLINE',
      mode: 'AUTONOMOUS_EXECUTIVE',
      kernel: 'JARVIS Core v1.0.0 (Debian 12 / Node 22)',
      activeTrace: 'trace-live-idle',
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
        rssMb: Math.round(memory.rss / 1024 / 1024),
      },
      policyThreshold: policyEngine.getUserThreshold(),
      toolsCount: toolRegistry.listTools().length,
      auditLogCount: auditLog.getEntries().length,
      storesCount: {
        working: memoryManager.getWorkingMemory().length,
        episodic: memoryManager.getEpisodicEvents().length,
        semantic: memoryManager.getSemanticEntities().length,
        procedural: memoryManager.getProceduralPlaybooks().length,
        documents: memoryManager.getDocuments().length,
      },
    });
  });

  // Run full 9-stage Cognitive Cycle
  app.post('/api/cognitive/cycle', async (req, res) => {
    try {
      const { goal, source = 'USER_INPUT', userExplicitApproved = true } = req.body;
      if (!goal || typeof goal !== 'string') {
        res.status(400).json({ error: 'Field "goal" is required and must be a string.' });
        return;
      }

      broadcastTraceEvent('cycle_start', { goal, source, startedAt: new Date().toISOString() });

      const cycleResult = await CognitiveLoop.runCycle(goal, source, Boolean(userExplicitApproved));

      broadcastTraceEvent('cycle_complete', {
        traceId: cycleResult.traceId,
        stagesCount: cycleResult.stages.length,
        success: cycleResult.success,
      });

      res.json(cycleResult);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: errorMsg });
    }
  });

  // Canonical Flow: Organize Minha Semana
  app.post('/api/canonical/organize-week', async (req, res) => {
    try {
      const { userExplicitApproved = true } = req.body;
      broadcastTraceEvent('canonical_start', { flow: 'OrganizeMinhaSemana' });
      const result = await CanonicalOrganizeWeekFlow.execute(Boolean(userExplicitApproved));
      broadcastTraceEvent('canonical_complete', {
        traceId: result.cycleResponse.traceId,
        blocks: result.allocatedBlocksCount,
      });
      res.json(result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: errorMsg });
    }
  });

  // Memory endpoints
  app.get('/api/memory/:store', (req, res) => {
    const store = req.params.store;
    if (store === 'working') {
      res.json(memoryManager.getWorkingMemory());
    } else if (store === 'episodic') {
      res.json(memoryManager.getEpisodicEvents(50));
    } else if (store === 'summary') {
      const period = (req.query.period as 'hourly' | 'daily' | 'weekly') || 'daily';
      res.json(memoryManager.getHierarchicalSummary(period));
    } else if (store === 'semantic') {
      res.json(memoryManager.getSemanticEntities());
    } else if (store === 'procedural') {
      res.json(memoryManager.getProceduralPlaybooks());
    } else if (store === 'preferences') {
      res.json(memoryManager.getPreferences());
    } else if (store === 'documents') {
      res.json(memoryManager.getDocuments());
    } else if (store === 'calendar') {
      res.json(calendarStore);
    } else if (store === 'tasks') {
      res.json(taskStore);
    } else {
      res.status(404).json({ error: `Memory store '${store}' not found.` });
    }
  });

  // Hybrid search across memory
  app.post('/api/memory/query', (req, res) => {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Query parameter required' });
      return;
    }
    const result = memoryManager.hybridQuery(String(query), 5);
    res.json(result);
  });

  // Cryptographic audit log
  app.get('/api/audit-log', (_req, res) => {
    const entries = auditLog.getEntries(100);
    const integrity = auditLog.verifyIntegrity();
    res.json({
      integrity,
      count: entries.length,
      entries,
    });
  });

  // Tools registry list
  app.get('/api/tools', (_req, res) => {
    res.json(toolRegistry.listTools());
  });

  // Direct tool execution via sandbox
  app.post('/api/tools/execute', async (req, res) => {
    const { toolName, args = {}, traceId = 'manual-api', userExplicitApproved = false } = req.body;
    if (!toolName) {
      res.status(400).json({ error: 'toolName is required' });
      return;
    }
    const outcome = await toolRegistry.executeTool(toolName, args, traceId, Boolean(userExplicitApproved));
    res.json(outcome);
  });

  // Multiplatform status bridge
  app.get('/api/platforms/status', (_req, res) => {
    res.json({
      webDashboard: { status: 'ONLINE', latencyMs: 2, clientCount: 1 },
      androidBridge: {
        status: 'CONNECTED',
        device: 'Pixel 9 Pro',
        os: 'Android 15',
        foregroundService: 'ACTIVE',
        wakeWord: 'Porcupine (Listening)',
        battery: '88%',
      },
      windowsAgent: {
        status: 'CONNECTED',
        os: 'Windows 11 Pro 64-bit',
        channel: 'NamedPipe / mTLS Loopback',
        activeWindow: 'Visual Studio Code',
      },
      whatsAppGateway: {
        status: 'STANDBY_WEBHOOK',
        officialApi: 'Meta Cloud API v21.0',
        webhookVerified: true,
      },
      voiceEngine: {
        stt: 'Web Speech API + Whisper.cpp on-device fallback',
        tts: 'Web SpeechSynthesis + Android Native TTS',
      },
    });
  });

  // Policy threshold update
  app.post('/api/security/policy', (req, res) => {
    const { threshold } = req.body;
    if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(threshold)) {
      policyEngine.setUserThreshold(threshold);
      res.json({ updatedThreshold: threshold });
    } else {
      res.status(400).json({ error: 'Invalid risk threshold' });
    }
  });

  // Emergency Panic Kill Switch
  app.post('/api/security/kill-switch', (_req, res) => {
    const report = protocolEngine.executeProtocol('EMERGENCIA', false);
    res.json({
      status: 'EMERGENCY_LOCKDOWN_ACTIVATED',
      message: 'Todas as execuções autônomas, conexões ativas e sessões externas foram suspensas.',
      report,
    });
  });

  // World Model Graph & Queries
  app.get('/api/world-model', (_req, res) => {
    res.json(worldModel.getGraph());
  });

  app.post('/api/world-model/query', (req, res) => {
    const { query, type, minConfidence } = req.body;
    res.json(worldModel.query({ query, type, minConfidence }));
  });

  // Ingestion Perception Connectors
  app.get('/api/perception/sources', (_req, res) => {
    res.json(perceptionConnectors.getSources());
  });

  // Academic Study Module
  app.get('/api/study/overview', (_req, res) => {
    res.json({
      courses: studyEngine.getCourses(),
      topics: studyEngine.getTopics(),
      evaluations: studyEngine.getEvaluations(),
      knowledgeGaps: studyEngine.detectKnowledgeGaps(),
    });
  });

  app.post('/api/study/spaced-repetition', (req, res) => {
    const { topicId, rating } = req.body;
    try {
      const updated = studyEngine.updateSpacedRepetition(topicId, rating);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  app.post('/api/study/exercises', (req, res) => {
    const { topicId, count } = req.body;
    res.json(studyEngine.generateExercises(topicId, count));
  });

  app.post('/api/study/evaluate', (req, res) => {
    const { exerciseId, answer } = req.body;
    res.json(studyEngine.evaluateAnswer(exerciseId, answer));
  });

  // Browser Layer
  app.get('/api/browser/view', (req, res) => {
    const url = (req.query.url as string) || 'https://portal.universidade.edu.br';
    try {
      res.json(browserController.generateCompactAccessibilityTree(url));
    } catch (err) {
      res.status(403).json({ error: (err as Error).message });
    }
  });

  app.post('/api/browser/action', async (req, res) => {
    try {
      const result = await browserController.executeAction(req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  app.get('/api/browser/recipes', (_req, res) => {
    res.json(browserController.getLearnedRecipes());
  });

  // School Portal
  app.get('/api/portal/status', (_req, res) => {
    res.json({
      map: schoolPortalAdapter.getPortalMap(),
      lastSync: schoolPortalAdapter.getLastSync(),
    });
  });

  app.post('/api/portal/sync', async (_req, res) => {
    const syncRes = await schoolPortalAdapter.sync();
    res.json(syncRes);
  });

  // Protocols Engine
  app.get('/api/protocols', (_req, res) => {
    res.json({
      available: protocolEngine.getAvailableProtocols(),
      history: protocolEngine.getHistory(),
    });
  });

  app.post('/api/protocols/execute', async (req, res) => {
    const { protocol, dryRun = false } = req.body;
    try {
      const report = await protocolEngine.executeProtocol(protocol, Boolean(dryRun));
      res.json(report);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Continuous Learning & Explainability
  app.get('/api/learning/overview', (_req, res) => {
    res.json({
      preferences: learningEngine.getPreferences(),
      automations: learningEngine.getSuggestedAutomations(),
      toolMetrics: learningEngine.getToolMetrics(),
    });
  });

  app.post('/api/learning/confirm-pref', (req, res) => {
    const { id } = req.body;
    res.json({ success: learningEngine.confirmPreference(id) });
  });

  app.post('/api/learning/automation-status', (req, res) => {
    const { id, status } = req.body;
    res.json({ success: learningEngine.updateAutomationStatus(id, status) });
  });

  app.post('/api/learning/explain', (req, res) => {
    const { action } = req.body;
    res.json(learningEngine.explainDecision(action));
  });

  // Multiagent Orchestrator
  app.get('/api/agents', (_req, res) => {
    res.json({
      agents: orchestrator.getRegisteredAgents(),
      delegations: orchestrator.getDelegationHistory(),
    });
  });

  app.post('/api/agents/delegate', async (req, res) => {
    const { fromAgent, toAgent, taskDescription, tokenBudget } = req.body;
    try {
      const outcome = await orchestrator.delegate(fromAgent, toAgent, taskDescription, tokenBudget);
      res.json(outcome);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  // WhatsApp Webhook
  app.post('/api/webhooks/whatsapp', async (req, res) => {
    const signature = req.headers['x-hub-signature-256'] as string;
    const bodyString = JSON.stringify(req.body);
    // In dev / sandbox, allow webhook testing
    const isValid = whatsAppGateway.verifyWebhookSignature(bodyString, signature) || process.env.NODE_ENV !== 'production';
    if (!isValid) {
      res.status(401).json({ error: 'Assinatura HMAC inválida' });
      return;
    }
    const outcome = await whatsAppGateway.handleInboundMessage({
      from: req.body.from || '+5511999998888',
      messageId: req.body.messageId || `msg-${Date.now()}`,
      type: req.body.type || 'text',
      text: req.body.text || '',
      timestamp: new Date().toISOString(),
    });
    res.json(outcome);
  });

  // SSE Trace Event Stream
  app.get('/api/traces/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.push(res);
    res.write(`event: connected\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);

    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // In Express v4, use app.get('*', ...
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JARVIS Kernel] Gateway active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[JARVIS Kernel] Startup failure:', err);
  process.exit(1);
});
