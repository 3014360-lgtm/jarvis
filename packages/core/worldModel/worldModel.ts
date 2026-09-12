/**
 * JARVIS World Model (User's Digital & Physical Environment Knowledge Graph)
 * Maintains persistent entities, relations, timestamps, confidence scores, and provenance.
 */

import { WorldEntity, WorldModelGraph, WorldRelation, WorldEntityType } from '../../shared/types.ts';

export class WorldModelManager {
  private entities: Map<string, WorldEntity> = new Map();
  private relations: Map<string, WorldRelation> = new Map();

  constructor() {
    this.seedDefaultWorld();
  }

  private seedDefaultWorld(): void {
    // Seed core academic and personal entities
    this.upsertEntity({
      id: 'ent-usr-01',
      type: 'PERSON',
      name: 'Usuário (Principal)',
      attributes: { role: 'Estudante de Engenharia de Computação & Desenvolvedor', timezone: 'America/Sao_Paulo' },
      confidence: 1.0,
      provenance: 'user_profile',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    });

    this.upsertEntity({
      id: 'ent-course-sd',
      type: 'COURSE',
      name: 'Sistemas Distribuídos',
      attributes: { code: 'EC-502', credits: 4, room: 'Lab 304', semester: '2026/2' },
      confidence: 0.98,
      provenance: 'school_portal_sync',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    });

    this.upsertEntity({
      id: 'ent-prof-silva',
      type: 'PROFESSOR',
      name: 'Prof. Dr. Marcos Silva',
      attributes: { email: 'marcos.silva@universidade.br', office: 'Bloco C, Sala 12' },
      confidence: 0.95,
      provenance: 'school_portal_sync',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    });

    this.upsertEntity({
      id: 'ent-course-ia',
      type: 'COURSE',
      name: 'Inteligência Artificial Avançada',
      attributes: { code: 'EC-508', credits: 4, room: 'Auditório 2', semester: '2026/2' },
      confidence: 0.98,
      provenance: 'school_portal_sync',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    });

    this.upsertEntity({
      id: 'ent-dev-pixel',
      type: 'DEVICE',
      name: 'Pixel 9 Pro (Android 15)',
      attributes: { os: 'Android 15', pushEnabled: true, wakeWordActive: true },
      confidence: 1.0,
      provenance: 'android_bridge',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    });

    this.upsertEntity({
      id: 'ent-dev-workstation',
      type: 'DEVICE',
      name: 'Windows Workstation (Dev Box)',
      attributes: { os: 'Windows 11 Pro 64-bit', agentService: 'ACTIVE', mTLS: true },
      confidence: 1.0,
      provenance: 'windows_agent',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    });

    this.upsertEntity({
      id: 'ent-proj-jarvis',
      type: 'PROJECT',
      name: 'JARVIS Autonomous AI OS',
      attributes: { repo: 'workspace/jarvis-core', tech: ['Node 22', 'TypeScript', 'Playwright', 'Vite'] },
      confidence: 1.0,
      provenance: 'file_watcher',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    });

    this.upsertEntity({
      id: 'ent-deadline-p1',
      type: 'DEADLINE',
      name: 'Prova P1 - Sistemas Distribuídos',
      attributes: { date: '2026-09-22T08:00:00Z', weight: 0.4, topics: ['Raft', 'Paxos', 'Chandy-Lamport'] },
      confidence: 0.99,
      provenance: 'school_portal_sync',
      createdAt: '2026-09-05T00:00:00Z',
      updatedAt: new Date().toISOString(),
    });

    // Relations
    this.upsertRelation({
      id: 'rel-01',
      sourceEntityId: 'ent-prof-silva',
      targetEntityId: 'ent-course-sd',
      relationType: 'TEACHES',
      confidence: 0.98,
      provenance: 'school_portal_sync',
      updatedAt: new Date().toISOString(),
    });

    this.upsertRelation({
      id: 'rel-02',
      sourceEntityId: 'ent-usr-01',
      targetEntityId: 'ent-course-sd',
      relationType: 'ENROLLED_IN',
      confidence: 1.0,
      provenance: 'school_portal_sync',
      updatedAt: new Date().toISOString(),
    });

    this.upsertRelation({
      id: 'rel-03',
      sourceEntityId: 'ent-deadline-p1',
      targetEntityId: 'ent-course-sd',
      relationType: 'DEADLINE_FOR',
      confidence: 0.99,
      provenance: 'school_portal_sync',
      updatedAt: new Date().toISOString(),
    });

    this.upsertRelation({
      id: 'rel-04',
      sourceEntityId: 'ent-usr-01',
      targetEntityId: 'ent-dev-pixel',
      relationType: 'OWNS',
      confidence: 1.0,
      provenance: 'android_bridge',
      updatedAt: new Date().toISOString(),
    });

    this.upsertRelation({
      id: 'rel-05',
      sourceEntityId: 'ent-usr-01',
      targetEntityId: 'ent-proj-jarvis',
      relationType: 'ASSOCIATED_WITH',
      confidence: 1.0,
      provenance: 'file_watcher',
      updatedAt: new Date().toISOString(),
    });
  }

  public upsertEntity(entity: WorldEntity): void {
    this.entities.set(entity.id, {
      ...entity,
      updatedAt: new Date().toISOString(),
    });
  }

  public getEntity(id: string): WorldEntity | undefined {
    return this.entities.get(id);
  }

  public upsertRelation(relation: WorldRelation): void {
    this.relations.set(relation.id, {
      ...relation,
      updatedAt: new Date().toISOString(),
    });
  }

  public getGraph(): WorldModelGraph {
    return {
      entities: Array.from(this.entities.values()),
      relations: Array.from(this.relations.values()),
    };
  }

  public query(params: {
    query?: string;
    type?: WorldEntityType;
    minConfidence?: number;
    relatedToEntityId?: string;
  }): { entities: WorldEntity[]; relations: WorldRelation[] } {
    let matchedEntities = Array.from(this.entities.values());

    if (params.type) {
      matchedEntities = matchedEntities.filter((e) => e.type === params.type);
    }

    if (params.minConfidence !== undefined) {
      matchedEntities = matchedEntities.filter((e) => e.confidence >= params.minConfidence!);
    }

    if (params.query) {
      const q = params.query.toLowerCase();
      matchedEntities = matchedEntities.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          JSON.stringify(e.attributes).toLowerCase().includes(q)
      );
    }

    const matchedIds = new Set(matchedEntities.map((e) => e.id));

    if (params.relatedToEntityId) {
      const relatedRels = Array.from(this.relations.values()).filter(
        (r) => r.sourceEntityId === params.relatedToEntityId || r.targetEntityId === params.relatedToEntityId
      );
      const neighborIds = new Set<string>();
      for (const r of relatedRels) {
        neighborIds.add(r.sourceEntityId);
        neighborIds.add(r.targetEntityId);
      }
      matchedEntities = matchedEntities.filter((e) => neighborIds.has(e.id));
    }

    const matchedRelations = Array.from(this.relations.values()).filter(
      (r) => matchedIds.has(r.sourceEntityId) || matchedIds.has(r.targetEntityId)
    );

    return {
      entities: matchedEntities,
      relations: matchedRelations,
    };
  }
}

export const worldModel = new WorldModelManager();
