// ============================================================
// LeadLuxe AI — SEO Helmet
// Per-page SEO meta tags using react-helmet-async
// Generates title, description, Open Graph, Twitter cards,
// and JSON-LD structured data for Google rich results.
// ============================================================

import { Helmet } from 'react-helmet-async';
import type { Property } from '../../lib/property-database';

const SITE_NAME = 'LeadLuxe AI — Global Real Estate Intelligence';
const SITE_URL = 'https://leadluxe-ai.vercel.app';
const DEFAULT_DESC = 'AI-powered global real estate intelligence platform. Discover high-value property opportunities, track market trends, and close deals across 25+ countries. Commission-only pricing.';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=630&fit=crop';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  canonical?: string;
}

export function SEOHelmet({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = 'website',
  noindex = false,
  canonical,
}: SEOProps) {
  const fullTitle = title ? `${title} | LeadLuxe AI` : 'LeadLuxe AI — Global Real Estate Intelligence';
  const canonicalUrl = canonical || url;

  return (
    <Helmet>
      {/* Standard meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Geo tags for local search */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="Global" />
    </Helmet>
  );
}

// ============================================================
// JSON-LD Structured Data for Real Estate
// Google Rich Results for properties
// ============================================================

interface RealEstateListingLDProps {
  property: Property;
  url: string;
}

export function RealEstateListingLD({ property, url }: RealEstateListingLDProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.name,
    description: property.description.slice(0, 200),
    url,
    image: property.images.map(i => i.url),
    datePosted: property.created_at,
    offers: {
      '@type': 'Offer',
      price: property.price_min,
      priceCurrency: property.currency,
      availability: property.available_units > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city,
      addressCountry: property.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude,
    },
    seller: {
      '@type': 'RealEstateAgent',
      name: property.developer_name,
    },
    numberOfRooms: Math.max(...property.bedrooms),
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.max_size_sqft,
      unitCode: 'SQFT',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}

// ============================================================
// Breadcrumb Structured Data
// Google Rich Results for navigation paths
// ============================================================

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbLD({ items }: { items: BreadcrumbItem[] }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}

// ============================================================
// WebSite Structured Data
// Enables Google Sitelinks Search Box in SERP
// ============================================================

export function WebSiteLD() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LeadLuxe AI',
    url: SITE_URL,
    description: 'AI-powered global real estate intelligence platform for developers and investors.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/deal-room?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}

// ============================================================
// Organization Structured Data
// Makes the brand appear in Google Knowledge Panel
// ============================================================

export function OrganizationLD() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LeadLuxe AI',
    description: 'AI-powered global real estate intelligence platform for developers and investors.',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://github.com/AshishAndhaleAI/leadluxe-ai',
    ],
    offers: {
      '@type': 'Offer',
      description: 'Commission-only pricing — 3% on closed deals. No subscription fees.',
    },
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'Country', name: 'UAE' },
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'Country', name: 'Singapore' },
      { '@type': 'Country', name: 'Saudi Arabia' },
      { '@type': 'Country', name: 'Germany' },
      { '@type': 'Country', name: 'France' },
      { '@type': 'Country', name: 'Japan' },
      { '@type': 'Country', name: 'South Korea' },
      { '@type': 'Country', name: 'Thailand' },
      { '@type': 'Country', name: 'Vietnam' },
      { '@type': 'Country', name: 'Brazil' },
      { '@type': 'Country', name: 'Mexico' },
      { '@type': 'Country', name: 'Turkey' },
      { '@type': 'Country', name: 'Spain' },
      { '@type': 'Country', name: 'Italy' },
      { '@type': 'Country', name: 'Canada' },
      { '@type': 'Country', name: 'Australia' },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
}
