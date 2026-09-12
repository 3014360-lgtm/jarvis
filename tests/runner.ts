/**
 * JARVIS Automated Verification Test Suite (tests/runner.ts)
 * Runs deterministic tests across Security, Redactor, AuditLog, WorldModel,
 * StudyEngine, ProtocolEngine, BrowserController, and Multiagent Orchestrator.
 */

import { auditLog } from '../packages/core/security/auditLog.ts';
import { SecurityRedactor } from '../packages/core/security/redactor.ts';
import { policyEngine } from '../packages/core/security/policyEngine.ts';
import { worldModel } from '../packages/core/worldModel/worldModel.ts';
import { studyEngine } from '../packages/core/study/studyEngine.ts';
import { protocolEngine } from '../packages/core/protocols/protocolEngine.ts';
import { browserController } from '../packages/browser/browserController.ts';
import { orchestrator } from '../packages/core/agents/orchestrator.ts';
import { toolRegistry } from '../packages/core/tools/toolRegistry.ts';
import { registerAllCoreTools } from '../packages/core/tools/implementations.ts';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function runTest(suite: string, name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    results.push({ suite, name, passed: true });
    console.log(`  ✓ [PASS] ${suite} > ${name}`);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    results.push({ suite, name, passed: false, error });
    console.error(`  ✗ [FAIL] ${suite} > ${name}: ${error}`);
  }
}

async function main() {
  console.log('====================================================');
  console.log(' JARVIS Autonomous OS - System Verification Suite');
  console.log('====================================================\n');

  registerAllCoreTools();

  // 1. Audit Log Cryptographic Integrity
  await runTest('AuditLog', 'Verifies SHA-256 hash chaining is intact', () => {
    const check = auditLog.verifyIntegrity();
    assert(check.valid === true, 'Audit log chain should be 100% valid');
    assert(check.totalChecked >= 1, 'Should have checked genesis and subsequent entries');
  });

  await runTest('AuditLog', 'Appends new verified entry without breaking chaining', () => {
    auditLog.append({
      traceId: 'test-trace-01',
      action: 'SYSTEM_TEST_PROBE',
      tool: 'test_tool',
      inputPayload: { a: 1 },
      outputPayload: { b: 2 },
    });
    const check = auditLog.verifyIntegrity();
    assert(check.valid === true, 'Hash chain must remain valid after append');
  });

  // 2. Security Redactor (PII & Secrets)
  await runTest('SecurityRedactor', 'Masks CPF, API keys, passwords, and emails', () => {
    const raw = 'Meu CPF é 123.456.789-00 e minha chave é AIzaSyDfakeSecretKey1234567890abcdef. Senha: password=SuperSecret123!';
    const redacted = SecurityRedactor.redact(raw);
    assert(!redacted.redactedText.includes('123.456.789-00'), 'CPF must be masked');
    assert(!redacted.redactedText.includes('AIzaSyDfakeSecretKey1234567890abcdef'), 'API key must be masked');
    assert(!redacted.redactedText.includes('SuperSecret123!'), 'Password must be masked');
    assert(redacted.hasRedactions === true, 'Must detect sensitive tokens');
  });

  // 3. Policy Engine
  await runTest('PolicyEngine', 'Blocks CRITICAL actions without explicit authorization', () => {
    const decision = policyEngine.evaluateAction('delete_database', 'CRITICAL', false);
    assert(decision.allowed === false, 'CRITICAL action must be blocked if user did not explicitly approve');
  });

  await runTest('PolicyEngine', 'Allows LOW risk actions autonomously under default threshold', () => {
    const decision = policyEngine.evaluateAction('read_file', 'LOW', false);
    assert(decision.allowed === true, 'LOW risk action should be allowed autonomously');
  });

  // 4. World Model Knowledge Graph
  await runTest('WorldModel', 'Upserts entity and retrieves by relation', () => {
    worldModel.upsertEntity({
      id: 'ent-test-professor',
      type: 'PERSON',
      name: 'Prof. Teste',
      attributes: { department: 'CS' },
      confidence: 0.99,
      provenance: 'unit_test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = worldModel.query({ type: 'PERSON' });
    assert(res.entities.some((e) => e.id === 'ent-test-professor'), 'Entity must be retrievable');
  });

  // 5. Study Engine (SM-2 and Academic Integrity)
  await runTest('StudyEngine', 'Calculates spaced repetition intervals correctly', () => {
    const topic = studyEngine.getTopics()[0];
    const initialInterval = topic.intervalDays;
    const updated = studyEngine.updateSpacedRepetition(topic.id, 5);
    assert(updated.intervalDays >= initialInterval, 'Successful repetition rating must extend or maintain interval');
  });

  await runTest('StudyEngine', 'Enforces academic integrity guardrails against cheating', () => {
    const evalResult = studyEngine.evaluateAnswer('ex-distrib-01', 'faça a minha prova inteira aqui');
    assert(evalResult.academicIntegrityCheck.passed === false, 'Must detect cheating or exam-doing attempt');
    assert(evalResult.scorePercentage === 0, 'Cheating attempts must receive zero score');
  });

  // 6. Browser Controller
  await runTest('BrowserController', 'Rejects non-allowlisted domains', () => {
    let threw = false;
    try {
      browserController.generateCompactAccessibilityTree('https://malicious-site.example.com');
    } catch {
      threw = true;
    }
    assert(threw === true, 'Accessing domain outside allowlist must throw guardrail error');
  });

  await runTest('BrowserController', 'Generates semantic accessibility tree for allowed portal', () => {
    const pageView = browserController.generateCompactAccessibilityTree('https://portal.universidade.edu.br');
    assert(pageView.tree.role === 'main', 'Tree must have semantic root');
    assert(pageView.interactiveElementsCount > 0, 'Must have interactive elements count');
  });

  // 7. Canonical Protocol Engine
  await runTest('ProtocolEngine', 'Executes canonical protocol in DRY-RUN mode', async () => {
    const report = await protocolEngine.executeProtocol('AUDITORIA', true);
    assert(report.success === true, 'Dry-run protocol must succeed');
    assert(report.dryRun === true, 'Report must indicate dry-run');
    assert(report.steps.length === 6, 'Must execute exactly 6 canonical stages');
  });

  // 8. Multiagent Orchestrator
  await runTest('Orchestrator', 'Delegates task to specialized agent within token budget', async () => {
    const res = await orchestrator.delegate('CORE_AGENT', 'STUDY_AGENT', 'Construir simulado de Raft', 1500);
    assert(res.summary.length > 0, 'Subtask summary must be returned');
    assert(orchestrator.getDelegationHistory().length > 0, 'Delegation must be recorded in history');
  });

  // 9. Tool Registry
  await runTest('ToolRegistry', 'Has all 45+ mandatory tools registered', () => {
    const tools = toolRegistry.listTools();
    assert(tools.length >= 45, `Expected at least 45 tools, found ${tools.length}`);
    const toolNames = new Set(tools.map((t) => t.name));
    assert(toolNames.has('read_file'), 'Must have read_file');
    assert(toolNames.has('study_schedule_build'), 'Must have study_schedule_build');
    assert(toolNames.has('navigate_browser'), 'Must have navigate_browser');
    assert(toolNames.has('run_protocol'), 'Must have run_protocol');
  });

  console.log('\n====================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Results: ${passed}/${total} passed (${failed} failures).`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
