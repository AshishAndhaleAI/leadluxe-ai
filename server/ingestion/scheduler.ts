// ============================================================
// TerraNexus AI — Ingestion Scheduler
// Orchestrates the full pipeline:
//   Schedule → Fetch Reports → Extract Cities/Projects →
//   Geocode → Verify → Deduplicate → Save to Supabase
// ============================================================

import { fetchReports, type FetchedReport } from './fetchReports';
import { extractLocations, type ExtractedLocation } from './extractLocations';
import { geocodeLocations, type GeocodedLocation } from './geocode';
import { deduplicateLocations } from './deduplicate';
import { saveToSupabase, type IngestionRun } from './saveToSupabase';

// ============================================================
// CONFIGURATION
// ============================================================
export interface IngestionConfig {
  sources: {
    name: string;
    url?: string;
    enabled: boolean;
    intervalMs: number;
  }[];
  maxLocationsPerRun: number;
  rateLimitPerSecond: number;
  retryOnFailure: boolean;
  maxRetries: number;
}

export const DEFAULT_CONFIG: IngestionConfig = {
  sources: [
    // Global macro sources — updated weekly
    { name: 'World Bank', enabled: true, intervalMs: 7 * 24 * 60 * 60 * 1000 },
    { name: 'OECD', enabled: true, intervalMs: 7 * 24 * 60 * 60 * 1000 },
    { name: 'IMF', enabled: true, intervalMs: 7 * 24 * 60 * 60 * 1000 },

    // India sources — updated daily
    { name: 'RERA Maharashtra', enabled: true, intervalMs: 24 * 60 * 60 * 1000 },
    { name: 'PMRDA', enabled: true, intervalMs: 24 * 60 * 60 * 1000 },

    // UAE sources — updated daily
    { name: 'Dubai Land Department', enabled: true, intervalMs: 24 * 60 * 60 * 1000 },

    // UK sources — updated daily
    { name: 'UK Land Registry', enabled: true, intervalMs: 24 * 60 * 60 * 1000 },

    // US sources — updated daily
    { name: 'Zillow Research', enabled: true, intervalMs: 24 * 60 * 60 * 1000 },
    { name: 'Redfin Data Center', enabled: true, intervalMs: 24 * 60 * 60 * 1000 },

    // Global real estate research — updated weekly
    { name: 'JLL Research', enabled: true, intervalMs: 7 * 24 * 60 * 60 * 1000 },
    { name: 'Knight Frank Global', enabled: true, intervalMs: 7 * 24 * 60 * 60 * 1000 },
    { name: 'Savills Research', enabled: true, intervalMs: 7 * 24 * 60 * 60 * 1000 },
  ],
  maxLocationsPerRun: 500,
  rateLimitPerSecond: 1,
  retryOnFailure: true,
  maxRetries: 3,
};

// ============================================================
// INGESTION RUNNER
// ============================================================
export interface IngestionStats {
  runId: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
  locationsGeocoded: number;
  locationsFailed: number;
  locationsDeduplicated: number;
  startedAt: string | null;
  completedAt: string | null;
  errorSummary: string | null;
}

class IngestionRunner {
  private config: IngestionConfig;
  private currentRun: IngestionStats | null = null;
  private intervalTimers: Map<string, ReturnType<typeof setInterval>> = new Map();
  private isRunning = false;

  constructor(config: Partial<IngestionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start scheduled ingestion for all enabled sources
   */
  start(): void {
    // Run once immediately
    this.runFullPipeline();

    // Schedule each source at its configured interval
    for (const source of this.config.sources) {
      if (!source.enabled) continue;

      const timer = setInterval(() => {
        this.runSingleSource(source.name);
      }, source.intervalMs);

      this.intervalTimers.set(source.name, timer);
      console.log(`[IngestionScheduler] Scheduled '${source.name}' every ${source.intervalMs / 1000}s`);
    }

    console.log(`[IngestionScheduler] Started with ${this.config.sources.filter(s => s.enabled).length} sources`);
  }

  /**
   * Stop all scheduled ingestion
   */
  stop(): void {
    for (const [name, timer] of this.intervalTimers) {
      clearInterval(timer);
      console.log(`[IngestionScheduler] Stopped '${name}'`);
    }
    this.intervalTimers.clear();
  }

  /**
   * Run the full ingestion pipeline once
   */
  async runFullPipeline(): Promise<IngestionStats> {
    if (this.isRunning) {
      return this.currentRun || this.getIdleStats();
    }

    this.isRunning = true;
    const runId = `run-${Date.now()}`;

    this.currentRun = {
      runId,
      status: 'running',
      sourcesAttempted: 0,
      sourcesSucceeded: 0,
      sourcesFailed: 0,
      locationsGeocoded: 0,
      locationsFailed: 0,
      locationsDeduplicated: 0,
      startedAt: new Date().toISOString(),
      completedAt: null,
      errorSummary: null,
    };

    try {
      // Phase 1: Fetch reports from all enabled sources
      console.log(`[IngestionScheduler] Phase 1: Fetching reports from ${this.config.sources.filter(s => s.enabled).length} sources`);

      const reports: FetchedReport[] = [];
      for (const source of this.config.sources) {
        if (!source.enabled) continue;
        this.currentRun.sourcesAttempted++;

        try {
          const sourceReports = await fetchReports(source.name);
          reports.push(...sourceReports);
          this.currentRun.sourcesSucceeded++;
        } catch (err: any) {
          this.currentRun.sourcesFailed++;
          console.warn(`[IngestionScheduler] Source '${source.name}' failed: ${err.message}`);
        }
      }

      // Phase 2: Extract cities and projects from reports
      console.log(`[IngestionScheduler] Phase 2: Extracting locations from ${reports.length} reports`);
      let extracted = extractLocations(reports);
      extracted = extracted.slice(0, this.config.maxLocationsPerRun);

      // Phase 3: Geocode all extracted locations
      console.log(`[IngestionScheduler] Phase 3: Geocoding ${extracted.length} locations`);
      const geocoded = await geocodeLocations(extracted);
      this.currentRun.locationsGeocoded = geocoded.filter(g => g.success).length;
      this.currentRun.locationsFailed = geocoded.filter(g => !g.success).length;

      // Phase 4: Deduplicate
      console.log(`[IngestionScheduler] Phase 4: Deduplicating ${geocoded.length} records`);
      const { unique, duplicates } = deduplicateLocations(
        geocoded.filter(g => g.success).map(g => ({
          city: g.city,
          country: g.country,
          district: g.district,
          latitude: g.latitude!,
          longitude: g.longitude!,
          source: g.source || 'ingestion',
          confidence: g.confidence || 50,
        }))
      );
      this.currentRun.locationsDeduplicated = duplicates;

      // Phase 5: Save to Supabase
      console.log(`[IngestionScheduler] Phase 5: Saving ${unique.length} records to Supabase`);
      await saveToSupabase({
        runId,
        locations: unique,
        sourcesAttempted: this.currentRun.sourcesAttempted,
        sourcesSucceeded: this.currentRun.sourcesSucceeded,
        sourcesFailed: this.currentRun.sourcesFailed,
      });

      this.currentRun.status = 'completed';
      this.currentRun.completedAt = new Date().toISOString();
      console.log(`[IngestionScheduler] Pipeline complete: ${unique.length} locations saved`);
    } catch (err: any) {
      this.currentRun.status = 'failed';
      this.currentRun.errorSummary = err.message;
      this.currentRun.completedAt = new Date().toISOString();
      console.error(`[IngestionScheduler] Pipeline failed: ${err.message}`);
    } finally {
      this.isRunning = false;
    }

    return this.currentRun;
  }

  /**
   * Run ingestion for a single source
   */
  async runSingleSource(sourceName: string): Promise<void> {
    try {
      const reports = await fetchReports(sourceName);
      const extracted = extractLocations(reports);
      const geocoded = await geocodeLocations(extracted.slice(0, this.config.maxLocationsPerRun));
      const { unique } = deduplicateLocations(
        geocoded.filter(g => g.success).map(g => ({
          city: g.city,
          country: g.country,
          district: g.district,
          latitude: g.latitude!,
          longitude: g.longitude!,
          source: g.source || 'ingestion',
          confidence: g.confidence || 50,
        }))
      );

      if (unique.length > 0) {
        await saveToSupabase({
          runId: `run-${Date.now()}`,
          locations: unique,
          sourcesAttempted: 1,
          sourcesSucceeded: 1,
          sourcesFailed: 0,
        });
      }
    } catch (err: any) {
      console.warn(`[IngestionScheduler] Single source '${sourceName}' failed: ${err.message}`);
    }
  }

  /**
   * Get current ingestion stats
   */
  getStats(): IngestionStats {
    return this.currentRun || this.getIdleStats();
  }

  private getIdleStats(): IngestionStats {
    return {
      runId: '',
      status: 'idle',
      sourcesAttempted: 0,
      sourcesSucceeded: 0,
      sourcesFailed: 0,
      locationsGeocoded: 0,
      locationsFailed: 0,
      locationsDeduplicated: 0,
      startedAt: null,
      completedAt: null,
      errorSummary: null,
    };
  }

  /**
   * Get configuration
   */
  getConfig(): IngestionConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(partial: Partial<IngestionConfig>): void {
    this.config = { ...this.config, ...partial };
  }
}

// Singleton
export const ingestionScheduler = new IngestionScheduler();
export type { IngestionRunner };
function IngestionScheduler() {
  return new IngestionRunner();
}

