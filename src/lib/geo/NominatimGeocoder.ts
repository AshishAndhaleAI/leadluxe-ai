// ============================================================
// LeadLuxe AI — Nominatim Geocoding Adapter
// Primary: OpenStreetMap Nominatim API
// Fallback: Photon Geocoder
// Respects: robots.txt, rate limits (1 req/sec), usage policy
// ============================================================

import { getVerifiedCoordinates } from './GeocodingEngine';

// ============================================================
// TYPES
// ============================================================
export interface GeocoderResult {
  latitude: number;
  longitude: number;
  displayName: string;
  source: 'nominatim' | 'photon' | 'cache' | 'verified_map';
  confidence: number;
  boundingBox?: [number, number, number, number]; // minLat, maxLat, minLng, maxLng
  raw?: Record<string, any>;
}

export interface GeocoderOptions {
  addressdetails?: boolean;
  limit?: number;
  zoom?: number; // 1-18, higher = more precise
}

// ============================================================
// RATE LIMITER
// Nominatim requires max 1 request per second
// ============================================================
class RateLimiter {
  private lastRequestTime = 0;
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      if (elapsed < 1100) {
        await new Promise(r => setTimeout(r, 1100 - elapsed));
      }
      const task = this.queue.shift();
      if (task) {
        this.lastRequestTime = Date.now();
        await task();
      }
    }

    this.processing = false;
  }
}

const rateLimiter = new RateLimiter();

// ============================================================
// IN-MEMORY CACHE
// Avoids re-geocoding the same city multiple times per session
// ============================================================
const geocodeCache = new Map<string, GeocoderResult>();

function cacheKey(city: string, country?: string, district?: string): string {
  return `${city}|${country || ''}|${district || ''}`.toLowerCase().trim();
}

// ============================================================
// NOMINATIM API
// ============================================================
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

async function nominatimGeocode(
  query: string,
  options: GeocoderOptions = {}
): Promise<GeocoderResult | null> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: String(options.limit || 1),
    addressdetails: options.addressdetails ? '1' : '0',
    zoom: String(options.zoom || 10),
  });

  const url = `${NOMINATIM_BASE}/search?${params}`;

  try {
    const response = await rateLimiter.schedule(async () => {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'LeadLuxeAI/1.0 (real-estate-intelligence-platform)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });
      return res;
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const best = data[0];
    const lat = parseFloat(best.lat);
    const lng = parseFloat(best.lon);

    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

    return {
      latitude: lat,
      longitude: lng,
      displayName: best.display_name || query,
      source: 'nominatim',
      confidence: parseFloat(best.importance || '0.5') * 100,
      boundingBox: best.boundingbox ? [
        parseFloat(best.boundingbox[0]),
        parseFloat(best.boundingbox[1]),
        parseFloat(best.boundingbox[2]),
        parseFloat(best.boundingbox[3]),
      ] : undefined,
      raw: best,
    };
  } catch (err) {
    // Silently fall back
    return null;
  }
}

// ============================================================
// PHOTON GEOCODER (Fallback)
// Faster, no rate limit, but less precise
// ============================================================
const PHOTON_BASE = 'https://photon.komoot.io/api';

async function photonGeocode(query: string): Promise<GeocoderResult | null> {
  const params = new URLSearchParams({ q: query, limit: '1' });
  const url = `${PHOTON_BASE}?${params}`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.features || data.features.length === 0) return null;

    const feature = data.features[0];
    const [lng, lat] = feature.geometry.coordinates;

    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

    return {
      latitude: lat,
      longitude: lng,
      displayName: feature.properties?.name || query,
      source: 'photon',
      confidence: feature.properties?.confidence || 60,
    };
  } catch {
    return null;
  }
}

// ============================================================
// PUBLIC API: Geocode a city/project/address
// Priority: Cache → Verified Map → Nominatim → Photon
// ============================================================
export async function geocodeLocation(
  cityName: string,
  countryName?: string,
  districtName?: string,
): Promise<GeocoderResult | null> {
  const key = cacheKey(cityName, countryName, districtName);

  // 1. Check in-memory cache
  const cached = geocodeCache.get(key);
  if (cached) return cached;

  // 2. Check verified coordinates map
  const verified = getVerifiedCoordinates(cityName);
  if (verified) {
    const result: GeocoderResult = {
      latitude: verified.latitude,
      longitude: verified.longitude,
      displayName: `${cityName}${countryName ? `, ${countryName}` : ''}`,
      source: 'verified_map',
      confidence: 95,
    };
    geocodeCache.set(key, result);
    return result;
  }

  // 3. Build the query string for API geocoding
  const queryParts = [cityName];
  if (districtName) queryParts.push(districtName);
  if (countryName) queryParts.push(countryName);
  const query = queryParts.join(', ');

  // 4. Try Nominatim
  const nominatimResult = await nominatimGeocode(query);
  if (nominatimResult) {
    geocodeCache.set(key, nominatimResult);
    return nominatimResult;
  }

  // 5. Fallback to Photon
  const photonResult = await photonGeocode(query);
  if (photonResult) {
    geocodeCache.set(key, photonResult);
    return photonResult;
  }

  return null;
}

// ============================================================
// BATCH GEOCODING
// Geocode multiple locations with automatic rate limiting
// ============================================================
export async function batchGeocode(
  locations: Array<{ city: string; country?: string; district?: string }>
): Promise<Array<{ city: string; result: GeocoderResult | null }>> {
  const results: Array<{ city: string; result: GeocoderResult | null }> = [];

  for (const loc of locations) {
    const result = await geocodeLocation(loc.city, loc.country, loc.district);
    results.push({ city: loc.city, result });
  }

  return results;
}

// ============================================================
// GET CACHE STATS
// ============================================================
export function getGeocodeCacheStats(): { size: number; keys: string[] } {
  return {
    size: geocodeCache.size,
    keys: Array.from(geocodeCache.keys()),
  };
}

// ============================================================
// CLEAR CACHE
// ============================================================
export function clearGeocodeCache(): void {
  geocodeCache.clear();
}
