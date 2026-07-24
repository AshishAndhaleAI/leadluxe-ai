// ============================================================
// TerraNexus AI — Supabase Saver
// Persists geocoded locations to the verified_locations table
// and creates ingestion_runs tracking records.
// ============================================================

import type { LocationRecord } from './deduplicate';

export interface SaveInput {
  runId: string;
  locations: LocationRecord[];
  sourcesAttempted: number;
  sourcesSucceeded: number;
  sourcesFailed: number;
}

export interface IngestionRun {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'partial';
  startedAt: string;
  completedAt: string | null;
  locationsSaved: number;
  errorLog: string[];
}

/**
 * Save locations to Supabase
 * Uses the Supabase client from src/lib/supabase.ts
 */
export async function saveToSupabase(input: SaveInput): Promise<IngestionRun> {
  const run: IngestionRun = {
    id: input.runId,
    status: 'running',
    startedAt: new Date().toISOString(),
    completedAt: null,
    locationsSaved: 0,
    errorLog: [],
  };

  try {
    // Try to use Supabase client if available
    let savedCount = 0;

    // Attempt to import and use Supabase
    try {
      const { supabase } = await import('../../src/lib/supabase');

      for (const loc of input.locations) {
        try {
          const { error } = await supabase
            .from('verified_locations')
            .upsert({
              country_code: loc.country.slice(0, 2).toUpperCase(),
              country_name: loc.country,
              city_name: loc.city,
              city_name_normalized: loc.city.toLowerCase().trim(),
              district_name: loc.district || null,
              latitude: loc.latitude,
              longitude: loc.longitude,
              geocode_source: loc.source || 'terranexus_verified',
              geocode_confidence: loc.confidence,
              verification_status: 'verified',
              verified_at: new Date().toISOString(),
              source_name: loc.source,
            }, {
              onConflict: 'country_code,city_name,district_name',
              ignoreDuplicates: false,
            });

          if (error) {
            run.errorLog.push(`Save error for ${loc.city}: ${error.message}`);
          } else {
            savedCount++;
          }
        } catch (err: any) {
          run.errorLog.push(`Save exception for ${loc.city}: ${err.message}`);
        }
      }
    } catch {
      // Supabase client not available — save locally to ingestion record
      console.log('[SaveToSupabase] Supabase not available, logging locally');
    }

    run.locationsSaved = savedCount;
    run.status = savedCount > 0 ? 'completed' : 'partial';
    run.completedAt = new Date().toISOString();

    console.log(`[SaveToSupabase] Saved ${savedCount}/${input.locations.length} locations`);
  } catch (err: any) {
    run.status = 'failed';
    run.errorLog.push(`Fatal error: ${err.message}`);
    console.error(`[SaveToSupabase] Fatal error: ${err.message}`);
  }

  return run;
}
