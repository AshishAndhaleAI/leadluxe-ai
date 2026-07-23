// ============================================================
// LeadLuxe AI — Coordinate Validation & Debug Utilities
// Runtime guards for the globe rendering pipeline
// ============================================================

import { CITIES, COUNTRIES } from '../global-data';
import type { City } from '../global-data';
import { VERIFIED_COORDINATES } from './GeocodingEngine';

// ============================================================
// VALIDATION RESULT
// ============================================================
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================
// RANGE CONSTANTS
// ============================================================
const LAT_MIN = -90;
const LAT_MAX = 90;
const LNG_MIN = -180;
const LNG_MAX = 180;

// ============================================================
// VALIDATE A SINGLE COORDINATE PAIR
// ============================================================
export function validateCoordinate(lat: number, lng: number, label = 'Coordinate'): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // NaN check
  if (isNaN(lat) || isNaN(lng)) {
    errors.push(`${label}: NaN detected (lat=${lat}, lng=${lng})`);
    return { valid: false, errors, warnings };
  }

  // Range checks
  if (lat < LAT_MIN || lat > LAT_MAX) {
    errors.push(`${label}: Latitude ${lat} out of range [${LAT_MIN}, ${LAT_MAX}]`);
  }
  if (lng < LNG_MIN || lng > LNG_MAX) {
    errors.push(`${label}: Longitude ${lng} out of range [${LNG_MIN}, ${LNG_MAX}]`);
  }

  // Zero check (likely unset)
  if (lat === 0 && lng === 0) {
    warnings.push(`${label}: Both lat and lng are 0 — likely unset`);
  }

  // Possible swapped lat/lng detection
  // If lat is > 90 or < -90 but lng is within [-90, 90], they're likely swapped
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    warnings.push(`${label}: lat (${lat}) > 90° while lng (${lng}) ≤ 90° — likely swapped`);
  }
  // If lng is within [-90, 90] and city is not near the poles, likely swapped
  if (Math.abs(lng) <= 90 && Math.abs(lat) <= 90) {
    // This is ambiguous but worth flagging for cities known to be outside ±90° longitude
    warnings.push(`${label}: Both lat (${lat}) and lng (${lng}) within [-90, 90] — verify order is correct`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================
// VALIDATE ALL CITIES IN THE DATABASE
// ============================================================
export interface CityValidationReport {
  cityId: string;
  cityName: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  valid: boolean;
  errors: string[];
  warnings: string[];
  verified: boolean;
  verifiedLat?: number;
  verifiedLng?: number;
  coordinateDeltaKm?: number;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function validateAllCities(): { reports: CityValidationReport[]; totalErrors: number; totalWarnings: number } {
  const reports: CityValidationReport[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const country of COUNTRIES) {
    const cities = CITIES[country.code] || [];
    for (const city of cities) {
      const result = validateCoordinate(city.latitude, city.longitude, `${city.name} (${city.id})`);
      const verified = VERIFIED_COORDINATES[city.name];
      
      let delta: number | undefined;
      if (verified && result.valid) {
        delta = haversineDistance(city.latitude, city.longitude, verified.lat, verified.lng);
      }

      const report: CityValidationReport = {
        cityId: city.id,
        cityName: city.name,
        countryCode: country.code,
        latitude: city.latitude,
        longitude: city.longitude,
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings,
        verified: !!verified,
        verifiedLat: verified?.lat,
        verifiedLng: verified?.lng,
        coordinateDeltaKm: delta,
      };

      reports.push(report);
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
    }
  }

  return { reports, totalErrors, totalWarnings };
}

// ============================================================
// VERIFY COORDINATE AGAINST AUTHORITATIVE SOURCE
// ============================================================
export function verifyAgainstAuthority(cityName: string, lat: number, lng: number): {
  match: boolean;
  deltaKm: number;
  authority: { lat: number; lng: number } | null;
} {
  const authority = VERIFIED_COORDINATES[cityName];
  if (!authority) {
    return { match: false, deltaKm: -1, authority: null };
  }

  const delta = haversineDistance(lat, lng, authority.lat, authority.lng);
  return {
    match: delta < 50, // Within 50 km = likely correct
    deltaKm: Math.round(delta),
    authority,
  };
}

// ============================================================
// FORMAT COORDINATE FOR DISPLAY
// ============================================================
export function formatCoordinate(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}
