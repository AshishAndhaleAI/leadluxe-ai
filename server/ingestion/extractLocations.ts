// ============================================================
// TerraNexus AI — Location Extractor
// Parses fetched reports to extract city, project, and
// market signal locations for geocoding.
// ============================================================

import type { FetchedReport } from './fetchReports';
import { KNOWN_CITIES } from '../../src/lib/global-data';

export interface ExtractedLocation {
  city: string;
  country: string;
  countryCode?: string;
  district?: string;
  sourceReport: string;
  confidence: number;
  metadata?: Record<string, any>;
}

// All known cities from our global data
const KNOWN_CITY_NAMES = new Set<string>();
const CITY_COUNTRY_MAP = new Map<string, string>();

// Initialize from our global data
function initCityLookup() {
  if (KNOWN_CITY_NAMES.size > 0) return;

  for (const [code, cities] of Object.entries(KNOWN_CITIES)) {
    for (const city of cities) {
      KNOWN_CITY_NAMES.add(city.name.toLowerCase());
      CITY_COUNTRY_MAP.set(city.name.toLowerCase(), code);
    }
  }
}

/**
 * Extract location names from report content
 * Uses known city names from our verified data
 */
export function extractLocations(reports: FetchedReport[]): ExtractedLocation[] {
  initCityLookup();

  const extracted = new Map<string, ExtractedLocation>();

  for (const report of reports) {
    if (report.city) {
      const key = `${report.city}|${report.country || ''}`;
      if (!extracted.has(key)) {
        extracted.set(key, {
          city: report.city,
          country: report.country || 'Global',
          countryCode: CITY_COUNTRY_MAP.get(report.city.toLowerCase()),
          sourceReport: report.title,
          confidence: report.confidence,
        });
      }
    }

    // Scan report content for known city names
    if (report.content) {
      const lower = report.content.toLowerCase();
      for (const cityName of KNOWN_CITY_NAMES) {
        if (lower.includes(cityName)) {
          const key = `${cityName}|${CITY_COUNTRY_MAP.get(cityName) || ''}`;
          if (!extracted.has(key)) {
            extracted.set(key, {
              city: cityName.charAt(0).toUpperCase() + cityName.slice(1),
              country: '',
              countryCode: CITY_COUNTRY_MAP.get(cityName),
              sourceReport: report.title,
              confidence: report.confidence - 10,
            });
          }
        }
      }
    }
  }

  return Array.from(extracted.values());
}
