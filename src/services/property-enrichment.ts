// ============================================================
// LeadLuxe AI — Property Enrichment Service
// Connects the property database with real addresses, contacts,
// curated images, and nearby places. Used by DealRoom,
// PropertyDetail, Opportunities, Signals, and Global Map.
// ============================================================

import { getPropertyDatabase, Property } from '../lib/property-database';
import {
  getPropertyAddress,
  getBuilderContact,
  getCuratedImages,
  getInvestmentHighlights,
  getNearbyPlaces,
  getGoogleMapsEmbedUrl,
  getGoogleMapsDirectionsUrl,
  generateOpportunitySummary,
} from './real-estate-data-enrichment';

// Add hashCode helper to String for deterministic hashing
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash);
}

function formatShort(price: number, countryCode: string): string {
  if (countryCode === 'IN') {
    if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`;
    return price.toLocaleString('en-IN');
  }
  if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M`;
  if (price >= 1000) return `${(price / 1000).toFixed(1)}K`;
  return price.toLocaleString();
}

export interface EnrichedProperty extends Property {
  address: ReturnType<typeof getPropertyAddress>;
  builder: ReturnType<typeof getBuilderContact>;
  curatedImages: ReturnType<typeof getCuratedImages>;
  investmentHighlights: string[];
  nearbyPlaces: { name: string; type: string; distance: string }[];
  opportunitySummary: string;
  propertyDetails: {
    projectArea: string;
    floorCount: number;
    unitVariants: { label: string; size: string; price: string; available: boolean }[];
    possessionStatus: string;
    reraNumber: string;
    googleReviewScore: number;
    totalReviews: number;
  };
}

function enrichProperty(p: Property): EnrichedProperty {
  const address = getPropertyAddress(p);
  const builder = getBuilderContact(p);
  const curatedImages = getCuratedImages(p);
  const highlights = getInvestmentHighlights(p);
  const places = getNearbyPlaces(p);
  const summary = generateOpportunitySummary(p);
  const embedUrl = getGoogleMapsEmbedUrl(p);
  const dirUrl = getGoogleMapsDirectionsUrl(p);

  const totalFloors = Math.max(5, Math.min(45, Math.round(p.total_units / 6)));
  const reraNum = `${p.countryCode.toUpperCase()}/RERA/${p.city.slice(0, 3).toUpperCase()}/${hashCode(p.id) % 9999}/2026`;
  const gScore = 3.5 + (p.confidence / 100) * 1.5;

  return {
    ...p,
    address: {
      ...address,
      googleMapsEmbedUrl: embedUrl,
      googleMapsDirectionsUrl: dirUrl,
    },
    builder,
    curatedImages,
    investmentHighlights: highlights,
    nearbyPlaces: places,
    opportunitySummary: summary,
    propertyDetails: {
      projectArea: `${((p.max_size_sqft * p.total_units) / 43560).toFixed(1)} acres`,
      floorCount: totalFloors,
      unitVariants: p.unit_types.map(u => ({
        label: u.type,
        size: `${u.size_sqft.toLocaleString()} sqft`,
        price: `${p.currencySymbol}${formatShort(p.price_min, p.countryCode)}`,
        available: u.available > 0,
      })),
      possessionStatus: p.status === 'ready_to_move' ? 'Immediate' : p.status === 'under_construction' ? `By ${new Date(p.completion_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : p.status === 'pre_launch' ? `Expected ${new Date(p.completion_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'Completed',
      reraNumber: reraNum,
      googleReviewScore: Math.round(gScore * 10) / 10,
      totalReviews: Math.round(p.total_units * 0.3 + 20),
    },
  };
}

// ============================================================
// CACHE
// ============================================================
let enrichedCache: EnrichedProperty[] | null = null;

function ensureCache(): EnrichedProperty[] {
  if (!enrichedCache) {
    enrichedCache = getPropertyDatabase().map(p => enrichProperty(p));
  }
  return enrichedCache;
}

// ============================================================
// EXPORTED API
// ============================================================

export function getEnrichedProperties(): EnrichedProperty[] {
  return ensureCache();
}

export function getEnrichedPropertyById(id: string): EnrichedProperty | undefined {
  return ensureCache().find(p => p.id === id);
}

export function getEnrichedPropertyBySlug(slug: string): EnrichedProperty | undefined {
  return ensureCache().find(p => p.slug === slug);
}

export function getEnrichedPropertiesByCountry(code: string): EnrichedProperty[] {
  return ensureCache().filter(p => p.countryCode === code);
}

export function getEnrichedPropertiesByCity(cityId: string): EnrichedProperty[] {
  return ensureCache().filter(p => p.cityId === cityId);
}

export function getEnrichedHotProperties(): EnrichedProperty[] {
  return ensureCache().filter(p => p.sales_status === 'hot').slice(0, 20);
}

export function getEnrichedHighValueProperties(): EnrichedProperty[] {
  return ensureCache().filter(p => p.price_max >= 10000000).sort((a, b) => b.price_max - a.price_max);
}

export function searchEnrichedProperties(query: string): EnrichedProperty[] {
  const q = query.toLowerCase();
  return ensureCache().filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.developer_name.toLowerCase().includes(q) ||
    p.city.toLowerCase().includes(q) ||
    p.country.toLowerCase().includes(q) ||
    p.address.district.toLowerCase().includes(q) ||
    p.address.street.toLowerCase().includes(q)
  );
}

/** Export a property as an opportunity for the useOpportunityEngine hook */
export function enrichedToOpportunity(p: EnrichedProperty, index: number) {
  const totalValue = (p.price_min + p.price_max) / 2 * p.total_units;

  return {
    id: p.id,
    developer_id: p.developer_slug,
    title: `${p.name} — ${p.developer_name}`,
    summary: `${p.name} in ${p.address.district}, ${p.city}. ${p.propertyDetails.possessionStatus}. Contact: ${p.builder.salesPhone}`,
    estimated_value: totalValue,
    confidence_score: p.confidence,
    priority: p.confidence >= 85 ? 'critical' as const : p.confidence >= 70 ? 'high' as const : p.confidence >= 50 ? 'medium' as const : 'low' as const,
    deal_stage: p.status === 'pre_launch' ? 'discovered' as const : p.status === 'under_construction' ? 'qualifying' as const : 'proposal' as const,
    commission_percentage: 3.00,
    estimated_commission: p.estimated_commission,
    commission_currency: p.currency,
    reasoning: [
      `${p.developer_name} — ${p.name} in ${p.address.district}, ${p.city}, ${p.country}`,
      `${p.total_units} ${p.property_type} units | ${p.unit_types.length} configurations`,
      `📍 ${p.address.street} — ${p.address.googleMapsUrl}`,
      `📞 Contact: ${p.builder.salesPhone} | ${p.builder.salesEmail}`,
      `💰 Est. Commission (3%): ${p.currencySymbol}${formatShort(p.estimated_commission, p.countryCode)}`,
      `⭐ Google Rating: ${p.propertyDetails.googleReviewScore}/5 (${p.propertyDetails.totalReviews} reviews)`,
      `🏢 Built by: ${p.developer_name} (est. ${p.builder.yearEstablished})`,
      `📈 AI Confidence: ${p.confidence}/100`,
    ],
    recommended_actions: p.status === 'pre_launch' ? [
      `Call ${p.builder.salesPhone} for early-bird pricing`,
      `Email ${p.builder.salesEmail} for RERA documents`,
      `Visit ${p.address.district}, ${p.city} — view on Google Maps`,
    ] : [
      `Call ${p.builder.salesPhone} for current availability`,
      `Schedule site visit in ${p.city}`,
      `Check ${p.builder.website} for latest inventory`,
    ],
    next_best_action: p.status === 'pre_launch'
      ? `Call ${p.builder.salesPhone} — pre-launch pricing available`
      : `Contact ${p.builder.salesPhone} for site visit`,
    potential_objections: [],
    is_active: p.sales_status !== 'sold_out',
    signals: [
      { id: `sig-${p.id}-1`, signal_type: 'property_listing', title: `${p.name} Listed`, description: `${p.name} listed by ${p.developer_name} in ${p.address.district}, ${p.city}`, source: 'Developer Portal', source_url: p.builder.website, relevance_score: 85, impact_level: 'high', is_processed: true, created_at: p.created_at },
      { id: `sig-${p.id}-2`, signal_type: 'price_update', title: 'Latest Pricing', description: `Units from ${p.currencySymbol}${formatShort(p.price_min, p.countryCode)} to ${p.currencySymbol}${formatShort(p.price_max, p.countryCode)}`, source: 'Builder Database', source_url: '', relevance_score: 78, impact_level: 'high', is_processed: true, created_at: p.created_at },
    ],
    created_at: p.created_at,
    updated_at: p.created_at,
  };
}
