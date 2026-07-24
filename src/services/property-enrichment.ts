// ============================================================
// TerraNexus AI — Property Enrichment Service
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
    projectArea: string | null;
    floorCount: number | null;
    unitVariants: { label: string; size: string; price: string; available: boolean }[];
    possessionStatus: string;
    reraNumber: string | null;
    googleReviewScore: number | null;
    totalReviews: number | null;
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

  const totalFloors: number | null = null; // Cannot be verified without official building permit
  const reraNum: string | null = null; // RERA numbers must come from official RERA registries — never generated
  const gScore: number | null = null; // Google review scores require a real Google Maps listing

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
      projectArea: null, // Cannot be verified without official site plan
      floorCount: totalFloors,
      unitVariants: p.unit_types.map(u => ({
        label: u.type,
        size: `${u.size_sqft.toLocaleString()} sqft`,
        price: `${p.currencySymbol}${formatShort(p.price_min, p.countryCode)}`,
        available: u.available > 0,
      })),
      possessionStatus: p.status === 'ready_to_move' ? 'Immediate' : p.status === 'under_construction' ? `By ${new Date(p.completion_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : p.status === 'pre_launch' ? `Expected ${new Date(p.completion_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'Completed',
      reraNumber: reraNum,
      googleReviewScore: gScore,
      totalReviews: null,
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
    summary: `${p.name} in ${p.address.district}, ${p.city}. ${p.propertyDetails.possessionStatus}. Visit the official developer website for verified contact information.`,
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
      `💰 Est. Commission (3%): ${p.currencySymbol}${formatShort(p.estimated_commission, p.countryCode)}`,
      `🏢 Built by: ${p.developer_name}`,
      `🌐 Visit developer website: ${p.builder?.website || 'not yet verified'}`,
      `📈 AI Confidence: ${p.confidence}/100`,
    ],
    recommended_actions: p.status === 'pre_launch' ? [
      `Visit ${p.builder?.website || 'developer website'} for pre-launch pricing`,
      `Request project brochure from official developer portal`,
      `Visit ${p.address.district}, ${p.city} — view on Google Maps`,
    ] : [
      `Check ${p.builder?.website || 'developer website'} for current availability`,
      `Schedule site visit in ${p.city}`,
      `Review project details on official developer portal`,
    ],
    next_best_action: p.status === 'pre_launch'
      ? `Visit developer website for pre-launch pricing`
      : `Visit official developer website for availability`,
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
