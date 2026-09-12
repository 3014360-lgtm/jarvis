/**
 * JARVIS Digital Environment Perception Connectors
 * Provides granular opt-in ingestion with sensitive content redaction.
 */

import { SecurityRedactor } from '../security/redactor.ts';
import { worldModel } from '../worldModel/worldModel.ts';

export interface IngestionSourceStatus {
  id: string;
  name: string;
  category: 'FILESYSTEM' | 'CALENDAR' | 'ANDROID' | 'WINDOWS' | 'PORTAL' | 'BROWSER' | 'WHATSAPP';
  authorized: boolean;
  sensitiveRedactionActive: boolean;
  lastIngestedAt: string;
  itemsProcessed: number;
}

export class PerceptionConnectorsManager {
  private sources: Map<string, IngestionSourceStatus> = new Map([
    [
      'filesystem_workspace',
      {
        id: 'filesystem_workspace',
        name: 'Workspace Filesystem & Code Projects',
        category: 'FILESYSTEM',
        authorized: true,
        sensitiveRedactionActive: true,
        lastIngestedAt: new Date().toISOString(),
        itemsProcessed: 42,
      },
    ],
    [
      'google_calendar_oauth',
      {
        id: 'google_calendar_oauth',
        name: 'Google Calendar / MS Graph OAuth Sync',
        category: 'CALENDAR',
        authorized: true,
        sensitiveRedactionActive: true,
        lastIngestedAt: new Date().toISOString(),
        itemsProcessed: 18,
      },
    ],
    [
      'android_notifications',
      {
        id: 'android_notifications',
        name: 'Android NotificationListenerService (Opt-In with App Filtering)',
        category: 'ANDROID',
        authorized: true,
        sensitiveRedactionActive: true,
        lastIngestedAt: new Date().toISOString(),
        itemsProcessed: 9,
      },
    ],
    [
      'school_portal',
      {
        id: 'school_portal',
        name: 'Portal Acadêmico / Plataforma Educacional',
        category: 'PORTAL',
        authorized: true,
        sensitiveRedactionActive: true,
        lastIngestedAt: new Date().toISOString(),
        itemsProcessed: 24,
      },
    ],
    [
      'browser_extension',
      {
        id: 'browser_extension',
        name: 'Navegador (Abas ativas & Histórico autorizado)',
        category: 'BROWSER',
        authorized: true,
        sensitiveRedactionActive: true,
        lastIngestedAt: new Date().toISOString(),
        itemsProcessed: 12,
      },
    ],
    [
      'whatsapp_cloud_api',
      {
        id: 'whatsapp_cloud_api',
        name: 'WhatsApp Meta Cloud API Gateway',
        category: 'WHATSAPP',
        authorized: true,
        sensitiveRedactionActive: true,
        lastIngestedAt: new Date().toISOString(),
        itemsProcessed: 15,
      },
    ],
  ]);

  public getSources(): IngestionSourceStatus[] {
    return Array.from(this.sources.values());
  }

  public toggleAuthorization(id: string, authorized: boolean): boolean {
    const s = this.sources.get(id);
    if (!s) return false;
    s.authorized = authorized;
    return true;
  }

  /**
   * Ingests external ambient content with mandatory redaction and tagging as non-instructional
   */
  public ingestExternalEvent(
    sourceId: string,
    rawContent: string,
    metadata: Record<string, unknown>
  ): { safeText: string; entityExtracted?: string } {
    const source = this.sources.get(sourceId);
    if (!source || !source.authorized) {
      throw new Error(`Ingestion source ${sourceId} is not authorized by user policy.`);
    }

    // Mandatory redaction
    const redacted = SecurityRedactor.redact(rawContent);

    // Frame structurally as untrusted non-instructional content
    const safeText = `<<UNTRUSTED_CONTENT source="${sourceId}" timestamp="${new Date().toISOString()}">>\n${redacted.redactedText}\n<</UNTRUSTED_CONTENT>>`;

    source.itemsProcessed += 1;
    source.lastIngestedAt = new Date().toISOString();

    return {
      safeText,
    };
  }
}

export const perceptionConnectors = new PerceptionConnectorsManager();
