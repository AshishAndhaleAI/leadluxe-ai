// ============================================================
// TerraNexus AI — Ingestion Geocoder
// Wraps the Nominatim/Photon geocoder for the ingestion pipeline
// ============================================================

import type { ExtractedLocation } from './extractLocations';
import { geocodeLocation } from '../../src/lib/geo/NominatimGeocoder';

export interface GeocodedLocation {
  city: string;
  country: string;
  countryCode?: string;
  district?: string;
  latitude: number | null;
  longitude: number | null;
  source: string | null;
  confidence: number | null;
  success: boolean;
  error?: string;
}

/**
 * Geocode all extracted locations
 * Runs with automatic rate limiting (1 req/sec via NominatimGeocoder)
 */
export async function geocodeLocations(
  locations: ExtractedLocation[]
): Promise<GeocodedLocation[]> {
  const results: GeocodedLocation[] = [];

  for (const loc of locations) {
    try {
      const result = await geocodeLocation(loc.city, loc.country, loc.district);

      results.push({
        city: loc.city,
        country: loc.country,
        countryCode: loc.countryCode,
        district: loc.district,
        latitude: result?.latitude || null,
        longitude: result?.longitude || null,
        source: result?.source || null,
        confidence: result?.confidence || null,
        success: !!result,
        error: result ? undefined : 'Geocoding returned no result',
      });
    } catch (err: any) {
      results.push({
        city: loc.city,
        country: loc.country,
        countryCode: loc.countryCode,
        district: loc.district,
        latitude: null,
        longitude: null,
        source: null,
        confidence: null,
        success: false,
        error: err.message,
      });
    }
  }

  return results;
}
