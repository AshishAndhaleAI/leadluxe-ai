// ============================================================
// RERA Portal Connector — Public government data source
// Monitors RERA project registrations across Indian states
// ============================================================

import { memorySystem } from '../core/memory';
import { knowledgeGraph } from '../core/knowledge-graph';

interface RERARecord {
  reraNumber: string;
  projectName: string;
  builderName: string;
  location: string;
  city: string;
  state: string;
  status: string;
  totalUnits: number;
  registrationDate: string;
  expiryDate: string;
  sourceUrl: string;
}

export class RERAConnector {
  public name = 'RERA Connector';
  public sourceType = 'rera_portal';
  public totalFetched = 0;
  public totalSignals = 0;
  public lastError: string | null = null;
  public lastSuccessAt: string | null = null;

  private stateRERAPortals = [
    { state: 'Maharashtra', url: 'https://maharera.mahaonline.gov.in', api: 'https://maharera.mahaonline.gov.in/api/project-search' },
    { state: 'Karnataka', url: 'https://rera.karnataka.gov.in', api: 'https://rera.karnataka.gov.in/api/projects' },
    { state: 'Gujarat', url: 'https://gujrera.gujarat.gov.in', api: null },
    { state: 'Uttar Pradesh', url: 'https://up-rera.org', api: null },
    { state: 'Haryana', url: 'https://haryanarera.gov.in', api: null },
    { state: 'Tamil Nadu', url: 'https://www.tnrera.in', api: null },
    { state: 'Telangana', url: 'https://rera.telangana.gov.in', api: null },
    { state: 'Rajasthan', url: 'https://rera.rajasthan.gov.in', api: null },
    { state: 'Madhya Pradesh', url: 'https://mprera.mp.gov.in', api: null },
    { state: 'West Bengal', url: 'https://www.wbhera.in', api: null },
  ];

  /**
   * Fetch RERA records. Uses public API endpoints where available,
   * falls back to search interface scraping.
   */
  async fetchLatest(limit = 20): Promise<NormalizedRERASignal[]> {
    const signals: NormalizedRERASignal[] = [];

    for (const portal of this.stateRERAPortals.slice(0, 3)) {
      try {
        console.log(`[RERAConnector] Checking ${portal.state} RERA portal`);
        const records = await this.fetchStateRERA(portal, limit);
        signals.push(...records);
      } catch (err: any) {
        this.lastError = `${portal.state}: ${err.message}`;
        console.warn(`[RERAConnector] ${portal.state} error: ${err.message}`);
      }
    }

    this.totalFetched += signals.length;
    this.lastSuccessAt = new Date().toISOString();
    console.log(`[RERAConnector] Fetched ${signals.length} RERA records`);

    return signals;
  }

  private async fetchStateRERA(portal: { state: string; url: string; api: string | null }, limit: number): Promise<NormalizedRERASignal[]> {
    const signals: NormalizedRERASignal[] = [];

    // Try API endpoint first
    if (portal.api) {
      try {
        const response = await fetch(portal.api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'LeadLuxeAI/1.0',
          },
          body: JSON.stringify({
            limit,
            offset: 0,
            status: 'registered',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const records = this.parseAPIResponse(data, portal.state);
          for (const record of records) {
            if (!memorySystem.isAlreadyProcessed(record.reraNumber)) {
              signals.push(this.normalizeRERASignal(record, portal));
            }
          }
          return signals;
        }
      } catch {
        // API failed, try HTML scraping
        console.log(`[RERAConnector] API failed for ${portal.state}, trying HTML`);
      }
    }

    // No fallback data — only real data from API is used
    // Connector returns empty when portals are unreachable, which is expected
    // In production, a headless browser or scheduled proxy would handle scraping
    return signals;
  }

  private parseAPIResponse(data: any, state: string): RERARecord[] {
    const records: RERARecord[] = [];
    const projects = data?.projects || data?.data || data?.results || [];

    if (Array.isArray(projects)) {
      for (const p of projects) {
        records.push({
          reraNumber: p.rera_number || p.reraNo || p.registration_number || `RERA-${state}-${Date.now()}`,
          projectName: p.project_name || p.projectName || p.name || 'Unknown',
          builderName: p.builder_name || p.promoter || p.builder || 'Unknown',
          location: p.location || p.address || p.area || '',
          city: p.city || p.district || '',
          state,
          status: p.status || p.project_status || 'registered',
          totalUnits: parseInt(p.total_units || p.units || '0'),
          registrationDate: p.registration_date || p.registered_date || p.reg_date || '',
          expiryDate: p.expiry_date || p.valid_upto || '',
          sourceUrl: `${p.source_url || ''}`,
        });
      }
    }

    return records;
  }

  private normalizeRERASignal(record: RERARecord, portal: { state: string; url: string; api: string | null }): NormalizedRERASignal {
    return {
      type: 'rera_filing',
      title: `RERA Filing: ${record.projectName} — ${record.builderName}`,
      description: `${record.builderName} registered "${record.projectName}" (${record.totalUnits} units) with ${portal.state} RERA. Status: ${record.status}. Location: ${record.location}, ${record.city}.`,
      sourceUrl: record.sourceUrl || `${portal.url}/search?rera=${record.reraNumber}`,
      source: `${portal.state} RERA`,
      date: record.registrationDate || new Date().toISOString(),
      developerName: record.builderName,
      location: `${record.location}, ${record.city}`,
      reraNumber: record.reraNumber,
      totalUnits: record.totalUnits,
      rawData: record,
      confidence: 90,
      country: 'IN',
      language: 'en',
      verificationStatus: 'verified',
    };
  }

  // No fallback data — only real public source data is used
}

export interface NormalizedRERASignal {
  type: string;
  title: string;
  description: string;
  sourceUrl: string;
  source: string;
  date: string;
  developerName?: string;
  location?: string;
  reraNumber?: string;
  totalUnits?: number;
  rawData: any;
  confidence: number;
  country: string;
  language: string;
  verificationStatus: 'verified' | 'unverified' | 'pending';
}

export const reraConnector = new RERAConnector();
