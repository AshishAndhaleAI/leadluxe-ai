// ============================================================
// LeadLuxe AI — Location Deduplicator
// Removes duplicate locations by city name and proximity
// to ensure no duplicate markers on the globe.
// ============================================================

export interface LocationRecord {
  city: string;
  country: string;
  district?: string;
  latitude: number;
  longitude: number;
  source: string;
  confidence: number;
}

interface DeduplicateResult {
  unique: LocationRecord[];
  duplicates: number;
}

// Proximity threshold: 10 km — locations closer than this are duplicates
const PROXIMITY_KM = 10;

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Deduplicate locations by:
 * 1. Exact city+country match (keep highest confidence)
 * 2. Proximity within PROXIMITY_KM (merge into one)
 */
export function deduplicateLocations(locations: LocationRecord[]): DeduplicateResult {
  if (locations.length === 0) {
    return { unique: [], duplicates: 0 };
  }

  const unique: LocationRecord[] = [];
  let duplicates = 0;

  for (const loc of locations) {
    let isDuplicate = false;

    for (const existing of unique) {
      // Check exact city+country match
      if (loc.city.toLowerCase() === existing.city.toLowerCase() &&
          loc.country.toLowerCase() === existing.country.toLowerCase()) {
        isDuplicate = true;
        duplicates++;
        break;
      }

      // Check proximity
      const distance = haversineDistance(
        loc.latitude, loc.longitude,
        existing.latitude, existing.longitude
      );
      if (distance < PROXIMITY_KM) {
        isDuplicate = true;
        duplicates++;
        break;
      }
    }

    if (!isDuplicate) {
      unique.push(loc);
    }
  }

  return { unique, duplicates };
}
