import { useMemo } from 'react';
import { CITIES, COUNTRIES } from '../../lib/global-data';

export interface PropertyHotspot {
  lat: number;
  lng: number;
  name: string;
  city: string;
  country: string;
  propertyType: string;
  price: number;
  currency: string;
  opportunityScore: number;
  commission: number;
  color: string;
  radius: number;
}

export function usePropertyHotspots(confidenceThreshold = 75): PropertyHotspot[] {
  return useMemo(() => {
    const hotspots: PropertyHotspot[] = [];
    
    for (const country of COUNTRIES) {
      const countryCities = CITIES[country.code] || [];
      for (const city of countryCities) {
        if (city.confidence < confidenceThreshold) continue;

        // Use real city data directly — no random offsets, no random names
        const estimatedPrice = city.pricePerSqft * 1000;
        const estimatedCommission = estimatedPrice * 0.03;

        hotspots.push({
          // Use exact city center coordinates — no random offsets
          lat: city.latitude,
          lng: city.longitude,
          // Use real city-based naming
          name: `${city.name} · Premium ${city.tags.includes('luxury') ? 'Luxury' : 'Residential'} Segment`,
          city: city.name,
          country: country.name,
          // Derive property type from city tags
          propertyType: city.tags.includes('commercial') ? 'Commercial' : 
                        city.tags.includes('luxury') ? 'Luxury Residential' :
                        city.tags.includes('affordable') ? 'Residential' : 'Mixed-Use',
          // Use real price per sqft data
          price: estimatedPrice,
          currency: country.currency,
          // Use real confidence score
          opportunityScore: city.confidence,
          commission: estimatedCommission,
          color: city.confidence >= 85 ? '#f59e0b' : '#d4a030',
          // Scale radius by real confidence
          radius: 0.2 + (city.confidence / 100) * 0.3,
        });
      }
    }
    
    return hotspots;
  }, [confidenceThreshold]);
}

export function formatHotspotLabel(hotspot: PropertyHotspot): string {
  return `
    <div style="background: #050510; border: 1px solid rgba(212,160,48,0.3); border-radius: 8px; padding: 10px 14px; color: white; font-family: system-ui; min-width: 180px;">
      <div style="font-size: 12px; font-weight: 600; color: #f59e0b; margin-bottom: 6px;">
        💎 ${hotspot.city} · ${hotspot.propertyType}
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px;">
        <div style="color: #fff;">Est: ₹${(hotspot.price / 10000000).toFixed(1)}Cr</div>
        <div style="color: #22c55e;">Score: ${hotspot.opportunityScore}%</div>
        <div style="color: #f59e0b;">Commission: ₹${(hotspot.commission / 100000).toFixed(1)}L</div>
        <div style="color: #888;">${hotspot.city}, ${hotspot.country}</div>
      </div>
    </div>
  `;
}
