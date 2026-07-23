// ============================================================
// LeadLuxe AI — Property Detail Page
// SEO-optimized, comprehensive property page with full project
// information, images, contact details, maps, and AI insights.
// Uses enriched data with real addresses, builder contacts,
// Google Maps links, and curated images.
// Publicly accessible (no auth required) for Google indexing.
// ============================================================

import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, DollarSign, Phone, Mail, Calendar,
  CheckCircle, X, Star, Share2, ChevronLeft, ChevronRight,
  Maximize2, Bed, Bath, Square, Shield, Zap,
  Globe, ExternalLink, Heart, MessageSquare, Layers,
  Map as MapIcon, Navigation, Clock, Sparkles, Percent,
  PhoneCall, FileText, Award,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getEnrichedPropertyById, getEnrichedPropertyBySlug, getEnrichedPropertiesByCity } from '../services/property-enrichment';
import type { EnrichedProperty } from '../services/property-enrichment';
import { SEOHelmet, RealEstateListingLD, BreadcrumbLD } from '../components/seo/SEOHelmet';

// ============================================================
// HELPERS
// ============================================================

function formatPrice(price: number, cc: string): string {
  if (cc === 'IN') {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString('en-IN')}`;
  }
  const syms: Record<string, string> = { AE: 'AED ', GB: '£', SG: 'S$', SA: 'SAR ', JP: '¥', KR: '₩', TH: '฿', VN: '₫', TR: '₺', ES: '€', IT: '€', DE: '€', FR: '€', NL: '€', CA: 'C$', AU: 'A$', MY: 'RM', QA: 'QAR ', BR: 'R$', MX: 'Mex$', ZA: 'R', NG: '₦', EG: 'E£' };
  return `${syms[cc] || '$'}${price >= 1000000 ? (price / 1000000).toFixed(2) + 'M' : price.toLocaleString()}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pre_launch: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    under_construction: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    ready_to_move: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    resale: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  };
  return colors[status] || 'text-gray-400 bg-gray-500/10 border-gray-500/30';
}

function getSalesStatusColor(status: string): string {
  const colors: Record<string, string> = {
    hot: 'text-red-400 bg-red-500/10 border-red-500/30',
    active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    limited: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    sold_out: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  };
  return colors[status] || 'text-gray-400 bg-gray-500/10 border-gray-500/30';
}

// ============================================================
// IMAGE GALLERY
// ============================================================

function ImageGallery({ images }: { images: { url: string; caption: string; type: string }[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="w-full h-64 sm:h-96 rounded-xl bg-gradient-to-br from-luxury-surface to-luxury-gray flex items-center justify-center">
        <Building2 className="w-12 h-12 text-gray-700" />
      </div>
    );
  }

  const current = images[selectedIndex];

  return (
    <>
      {/* Main Image */}
      <div className="relative w-full h-64 sm:h-[28rem] rounded-xl overflow-hidden group">
        <img
          src={current.url}
          alt={current.caption}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Image counter */}
        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[10px] text-white">
          {selectedIndex + 1} / {images.length}
        </div>

        {/* Fullscreen button */}
        <button
          onClick={() => setFullscreen(true)}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Image caption */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-sm text-white/90 font-medium">{current.caption}</p>
          <p className="text-[10px] text-white/60 capitalize">{current.type} photo</p>
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex(i => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedIndex(i => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={cn(
                'w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all',
                i === selectedIndex ? 'border-luxury-gold-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <img src={img.url} alt={img.caption} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setFullscreen(false)}
          >
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={current.url.replace('w=800&h=600', 'w=1920&h=1200')}
              alt={current.caption}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// UNIT TYPE CARD
// ============================================================

function UnitTypeCard({ unit, currencySymbol, countryCode }: { 
  unit: { label: string; size: string; price: string; available: boolean };
  currencySymbol: string;
  countryCode: string;
}) {
  return (
    <div className={cn('premium-card p-4', !unit.available ? 'opacity-50' : '')}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-white">{unit.label}</h4>
          <p className="text-[10px] text-gray-500">{unit.size}</p>
        </div>
        <span className={cn(
          'text-[10px] px-2 py-0.5 rounded font-medium',
          !unit.available ? 'bg-red-500/10 text-red-400' :
          'bg-emerald-500/10 text-emerald-400'
        )}>
          {unit.available ? 'Available' : 'Sold Out'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <Square className="w-3 h-3" />
          <span>{unit.size}</span>
        </div>
        <p className="text-sm font-bold text-luxury-gold-400">{currencySymbol}{unit.price}</p>
      </div>
    </div>
  );
}

// ============================================================
// GOOGLE MAPS EMBED
// ============================================================

function GoogleMapsEmbed({ property }: { property: EnrichedProperty }) {
  const [loadMap, setLoadMap] = useState(false);

  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-luxury-surface to-luxury-gray">
      {!loadMap ? (
        <button
          onClick={() => setLoadMap(true)}
          className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors"
        >
          <MapPin className="w-8 h-8 text-luxury-gold-400" />
          <span className="text-xs text-gray-500">Click to load map</span>
          <span className="text-[9px] text-gray-700">{property.address.street}, {property.address.district}</span>
        </button>
      ) : (
        <iframe
          title={`${property.name} location`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={property.address.googleMapsEmbedUrl}
          className="w-full h-full"
        />
      )}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2">
        <span className="text-[9px] text-white/60 bg-black/50 px-2 py-0.5 rounded-full">
          {property.address.district}, {property.city}
        </span>
        <a
          href={property.address.googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[9px] text-luxury-gold-400 bg-black/50 px-2 py-0.5 rounded-full hover:bg-black/70 transition-colors"
        >
          <Navigation className="w-2.5 h-2.5" />
          Directions
        </a>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [showFullContact, setShowFullContact] = useState(false);

  // Find property by slug or ID using enriched data
  const property = useMemo(() => {
    if (!slug) return undefined;
    return getEnrichedPropertyBySlug(slug) || getEnrichedPropertyById(slug);
  }, [slug]);

  // Similar properties in same city
  const similarProperties = useMemo(() => {
    if (!property) return [];
    return getEnrichedPropertiesByCity(property.cityId)
      .filter(p => p.id !== property.id)
      .slice(0, 4);
  }, [property]);

  // SEO data
  const pageUrl = property
    ? `https://leadluxe-ai.vercel.app/property/${property.slug}`
    : 'https://leadluxe-ai.vercel.app';

  if (!property) {
    // Try loading page via property-database fallback
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <Building2 className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Property Not Found</h1>
          <p className="text-sm text-gray-500 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/deal-room')} className="btn-primary">
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  const heroImage = property.curatedImages.hero_url || property.curatedImages.images[0]?.url;
  const availPercent = property.total_units > 0
    ? Math.round((property.available_units / property.total_units) * 100)
    : 0;

  return (
    <>
      {/* SEO */}
      <SEOHelmet
        title={`${property.name} — ${property.developer_name} in ${property.address.district}, ${property.city}, ${property.country}`}
        description={`${property.name} by ${property.developer_name}. Located at ${property.address.street}, ${property.address.district}, ${property.city}, ${property.country}. ${property.unit_types.length} configurations from ${formatPrice(property.price_min, property.countryCode)}. ${property.amenities.length} amenities. RERA ${property.rera_status}. Contact: ${property.builder.salesPhone}. View details, real images, Google Maps, and contact information.`}
        image={heroImage}
        url={pageUrl}
        type="product"
        canonical={pageUrl}
      />
      <RealEstateListingLD property={property} url={pageUrl} />
      <BreadcrumbLD items={[
        { name: 'Home', url: '/' },
        { name: 'Properties', url: '/deal-room' },
        { name: `${property.country}`, url: `/deal-room?country=${property.countryCode}` },
        { name: `${property.city}`, url: `/deal-room?country=${property.countryCode}` },
        { name: property.address.district, url: `/city/${property.city.toLowerCase().replace(/\s+/g, '-')}` },
        { name: property.name, url: `/property/${property.slug}` },
      ]} />

      <div className="min-h-screen bg-luxury-black">
        {/* Top Navigation */}
        <div className="sticky top-0 z-30 border-b border-luxury-border bg-luxury-black/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-luxury-gold-500/20 flex items-center justify-center">
                    <Building2 className="w-3 h-3 text-luxury-gold-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">LeadLuxe</span>
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="btn-ghost text-xs px-2 py-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
                <a
                  href={`tel:${property.builder.salesPhone.replace(/\s/g, '')}`}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Now
                </a>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 pb-3 text-[9px] text-gray-600">
              <Link to="/" className="hover:text-gray-400 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/deal-room" className="hover:text-gray-400 transition-colors">Properties</Link>
              <span>/</span>
              <Link to={`/country/${property.countryCode.toLowerCase()}`} className="hover:text-gray-400 transition-colors">{property.country}</Link>
              <span>/</span>
              <Link to={`/city/${property.city.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-gray-400 transition-colors">{property.city}</Link>
              <span>/</span>
              <span className="text-luxury-gold-400">{property.address.district}</span>
              <span>/</span>
              <span className="text-gray-400">{property.name}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Enriched Data */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery — Real Curated Images */}
              <ImageGallery images={property.curatedImages.images} />

              {/* Property Title with Full Address */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">{property.name}</h1>
                      {property.sales_status === 'hot' && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[8px] font-bold border border-red-500/30 animate-pulse-gold">
                          HOT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Building2 className="w-4 h-4 text-luxury-gold-400" />
                      <span className="text-white font-medium">{property.developer_name}</span>
                      <span className="text-gray-600">·</span>
                      <span className="capitalize">{property.developer_type}</span>
                    </div>
                    {/* REAL ADDRESS — with Google Maps Link */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>{property.address.street}, {property.address.district}, {property.city}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-600">{property.address.postalCode}, {property.address.state}, {property.country}</span>
                      <a
                        href={property.address.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-luxury-gold-400 hover:text-luxury-gold-300 underline underline-offset-2 inline-flex items-center gap-1"
                      >
                        <MapIcon className="w-2.5 h-2.5" />
                        View on Google Maps
                      </a>
                    </div>
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className={cn('px-3 py-1 rounded-full text-[10px] font-medium border', getStatusColor(property.status))}>
                    {property.status.replace(/_/g, ' ')}
                  </span>
                  <span className={cn('px-3 py-1 rounded-full text-[10px] font-medium border', getSalesStatusColor(property.sales_status))}>
                    {property.sales_status === 'hot' ? '🔥 Hot Deal' :
                     property.sales_status === 'active' ? 'Active' :
                     property.sales_status === 'limited' ? '⚠️ Limited' : 'Sold Out'}
                  </span>
                  {property.rera_status !== 'not_applicable' && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-medium border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                      RERA {property.rera_status === 'approved' ? '✅ Approved' : 'Applied'}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-[10px] font-medium border border-luxury-gold-500/30 text-luxury-gold-400 bg-luxury-gold-500/10">
                    {property.propertyDetails.reraNumber}
                  </span>
                </div>
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Property Type', value: property.property_type.replace(/_/g, ' '), icon: Building2 },
                  { label: 'Project Area', value: property.propertyDetails.projectArea, icon: Layers },
                  { label: 'Available', value: `${availPercent}%`, icon: CheckCircle },
                  { label: 'Total Floors', value: `${property.propertyDetails.floorCount} Floors`, icon: Maximize2 },
                  { label: 'Price Range', value: `${formatPrice(property.price_min, property.countryCode)} - ${formatPrice(property.price_max, property.countryCode)}`, icon: DollarSign },
                  { label: 'Price/sqft', value: formatPrice(property.price_per_sqft, property.countryCode), icon: Square },
                  { label: 'Size Range', value: `${property.min_size_sqft.toLocaleString()} - ${property.max_size_sqft.toLocaleString()} sqft`, icon: Layers },
                  { label: 'Bedrooms', value: property.bedrooms.map(b => `${b}BHK`).join(', '), icon: Bed },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <stat.icon className="w-3 h-3 text-luxury-gold-400" />
                      <p className="text-[9px] text-gray-600 uppercase tracking-wider">{stat.label}</p>
                    </div>
                    <p className="text-xs font-semibold text-white leading-tight">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="premium-card p-5">
                <h2 className="text-sm font-semibold text-white mb-3">About This Property</h2>
                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>

              {/* Builder Information */}
              <div className="premium-card p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Builder / Developer Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-luxury-gold-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{property.developer_name}</p>
                        <p className="text-[9px] text-gray-500">Est. {property.builder.yearEstablished} · {property.developer_type}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <a href={`tel:${property.builder.salesPhone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">{property.builder.salesPhone}</a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail className="w-3.5 h-3.5 text-luxury-gold-400" />
                        <a href={`mailto:${property.builder.salesEmail}`} className="hover:text-white transition-colors">{property.builder.salesEmail}</a>
                      </div>
                      <div className="flex items-start gap-2 text-gray-400">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 mt-0.5" />
                        <span className="text-[11px]">{property.builder.headquarters}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        <a href={property.builder.website} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{property.builder.website}</a>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center p-4 rounded-xl bg-luxury-gold-500/5 border border-luxury-gold-500/20">
                    <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-3">Get in Touch</p>
                    <div className="space-y-2">
                      <a
                        href={`tel:${property.builder.salesPhone.replace(/\s/g, '')}`}
                        className="btn-primary w-full text-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Call {property.builder.salesPhone}
                      </a>
                      <a
                        href={`mailto:${property.builder.salesEmail}`}
                        className="btn-outline w-full text-xs"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Send Email
                      </a>
                      <a
                        href={property.address.googleMapsDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline w-full text-xs"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unit Types */}
              {property.propertyDetails.unitVariants.length > 0 && (
                <div className="premium-card p-5">
                  <h2 className="text-sm font-semibold text-white mb-4">Available Unit Types ({property.propertyDetails.unitVariants.length})</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {property.propertyDetails.unitVariants.map((unit, i) => (
                      <UnitTypeCard key={i} unit={unit} currencySymbol={property.currencySymbol} countryCode={property.countryCode} />
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div className="premium-card p-5">
                  <h2 className="text-sm font-semibold text-white mb-4">Amenities ({property.amenities.length})</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {property.amenities.map((amenity, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                        <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-xs text-gray-300">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Investment Highlights */}
              <div className="premium-card p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Investment Highlights</h2>
                <div className="space-y-2">
                  {property.investmentHighlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Star className="w-3.5 h-3.5 text-luxury-gold-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-300 leading-relaxed">{h}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location & Interactive Map */}
              <div className="premium-card p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Location & Map</h2>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-white">{property.address.street}</span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{property.address.district}, {property.city}, {property.address.state}, {property.country} - {property.address.postalCode}</p>
                <p className="text-[10px] text-gray-700 mb-4">Coordinates: {property.latitude.toFixed(4)}°N, {property.longitude.toFixed(4)}°E</p>
                
                {/* Google Maps Embed */}
                <GoogleMapsEmbed property={property} />

                {/* Nearby Places */}
                <div className="mt-4">
                  <h3 className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Nearby Places</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {property.nearbyPlaces.map((place, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[10px] text-gray-300 flex-1">{place.name}</span>
                        <span className="text-[8px] text-gray-600">{place.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={property.address.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium bg-white/5 text-gray-300 hover:bg-luxury-gold-500/10 hover:text-luxury-gold-400 transition-all"
                  >
                    <MapIcon className="w-3 h-3" />
                    Open in Google Maps
                  </a>
                  <a
                    href={property.address.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium bg-white/5 text-gray-300 hover:bg-luxury-gold-500/10 hover:text-luxury-gold-400 transition-all"
                  >
                    <Navigation className="w-3 h-3" />
                    Get Directions
                  </a>
                </div>
              </div>

              {/* Tags */}
              {property.tags.length > 0 && (
                <div className="premium-card p-5">
                  <h2 className="text-sm font-semibold text-white mb-4">Property Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-luxury-gold-500/10 text-luxury-gold-400 text-[10px] font-medium border border-luxury-gold-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Contact & Quick Info */}
            <div className="space-y-4">
              {/* Contact Card — Builder Info */}
              <div className="premium-card p-5 sticky top-20">
                <h3 className="text-sm font-semibold text-white mb-3">Contact Builder Directly</h3>

                {/* Builder Info */}
                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/5">
                  <div className="w-10 h-10 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-luxury-gold-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{property.developer_name}</p>
                    <p className="text-[10px] text-gray-500">Est. {property.builder.yearEstablished} · {property.developer_type}</p>
                  </div>
                </div>

                {/* Price Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Price Range</span>
                    <span className="text-xs font-bold text-white">
                      {formatPrice(property.price_min, property.countryCode)} - {formatPrice(property.price_max, property.countryCode)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Price / sqft</span>
                    <span className="text-xs font-medium text-luxury-gold-400">
                      {formatPrice(property.price_per_sqft, property.countryCode)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Available Units</span>
                    <span className="text-xs font-medium text-emerald-400">
                      {property.available_units} / {property.total_units}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Possession</span>
                    <span className="text-xs font-medium text-amber-400">{property.propertyDetails.possessionStatus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">AI Confidence</span>
                    <span className="text-xs font-bold text-amber-400">{property.confidence}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Commission (3%)</span>
                    <span className="text-xs font-bold text-luxury-gold-400">
                      {formatPrice(property.estimated_commission, property.countryCode)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Google Rating</span>
                    <span className="text-xs font-medium text-emerald-400">
                      ⭐ {property.propertyDetails.googleReviewScore}/5 ({property.propertyDetails.totalReviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Commission Card */}
                <div className="p-3 rounded-lg bg-luxury-gold-500/10 border border-luxury-gold-500/20 mb-4">
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Estimated Commission</p>
                  <p className="text-lg font-bold text-luxury-gold-400">
                    {formatPrice(property.estimated_commission, property.countryCode)}
                  </p>
                  <p className="text-[9px] text-gray-600">3% success fee · Only paid on closed deals</p>
                </div>

                {/* Builder Contact (Always Visible) — REAL DATA */}
                <div className="space-y-3 mb-4">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <p className="text-[10px] font-medium text-emerald-400">Project Coordinator — {property.developer_name}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <Phone className="w-3.5 h-3.5 text-luxury-gold-400 shrink-0" />
                        <a href={`tel:${property.builder.salesPhone.replace(/\s/g, '')}`} className="hover:text-luxury-gold-300 transition-colors">
                          {property.builder.salesPhone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <Mail className="w-3.5 h-3.5 text-luxury-gold-400 shrink-0" />
                        <a href={`mailto:${property.builder.salesEmail}`} className="hover:text-luxury-gold-300 transition-colors">
                          {property.builder.salesEmail}
                        </a>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-luxury-gold-400 shrink-0 mt-0.5" />
                        <span className="text-[11px]">{property.address.street}, {property.address.district}, {property.city}, {property.address.state}, {property.country} - {property.address.postalCode}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2">
                  <a
                    href={`tel:${property.builder.salesPhone.replace(/\s/g, '')}`}
                    className="btn-primary w-full text-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Call {property.developer_name} Sales
                  </a>
                  <a
                    href={`mailto:${property.builder.salesEmail}?subject=Inquiry%3A%20${property.name}&body=I%20am%20interested%20in%20${property.name}%20at%20${property.address.district}%2C%20${property.city}.%20Please%20share%20details%2C%20availability%2C%20and%20pricing.`}
                    className="btn-outline w-full text-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Send Inquiry Email
                  </a>
                  <button
                    onClick={() => {
                      const deals = JSON.parse(localStorage.getItem('leadluxe-deals') || '[]');
                      deals.push({
                        id: property.id,
                        propertyName: property.name,
                        developerName: property.developer_name,
                        city: property.city,
                        country: property.country,
                        countryCode: property.countryCode,
                        currency: property.currency,
                        currencySymbol: property.currencySymbol,
                        priceMin: property.price_min,
                        priceMax: property.price_max,
                        estimatedCommission: property.estimated_commission,
                        message: `Interested in ${property.name} — ${property.city}`,
                        contactName: '',
                        contactEmail: property.builder.salesEmail,
                        contactPhone: property.builder.salesPhone,
                        timestamp: new Date().toISOString(),
                        status: 'new',
                      });
                      localStorage.setItem('leadluxe-deals', JSON.stringify(deals));
                      navigate('/portfolio');
                    }}
                    className="btn-outline w-full text-xs"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    Express Interest
                  </button>
                  <button
                    onClick={() => navigate(`/match?property=${property.id}`)}
                    className="btn-ghost w-full text-xs text-gray-500"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    AI Match Analysis
                  </button>
                </div>
              </div>

              {/* Property Score */}
              <div className="glass-card p-4 border-luxury-gold-500/10">
                <h4 className="text-[10px] text-gray-600 uppercase tracking-wider mb-3">AI Property Score</h4>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="#1a1a1a" strokeWidth="4" />
                      <circle
                        cx="32" cy="32" r="28" fill="none"
                        stroke={property.confidence >= 80 ? '#22c55e' : property.confidence >= 60 ? '#d4a030' : '#f59e0b'}
                        strokeWidth="4"
                        strokeDasharray={`${(property.confidence / 100) * 176} 176`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                      {property.confidence}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white">
                      {property.confidence >= 80 ? 'High Confidence' :
                       property.confidence >= 60 ? 'Good Opportunity' : 'Moderate'}
                    </p>
                    <p className="text-[9px] text-gray-600">
                      {property.confidence >= 80 ? 'Strong buyer demand and market fit' :
                       property.confidence >= 60 ? 'Favorable market conditions' :
                       'Additional due diligence recommended'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="glass-card p-4 border-luxury-gold-500/10">
                <h4 className="text-[10px] text-gray-600 uppercase tracking-wider mb-3">Project Details</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Project Area</span>
                    <span className="text-gray-300">{property.propertyDetails.projectArea}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Total Floors</span>
                    <span className="text-gray-300">{property.propertyDetails.floorCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Possession</span>
                    <span className="text-luxury-gold-400">{property.propertyDetails.possessionStatus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Google Rating</span>
                    <span className="text-emerald-400">⭐ {property.propertyDetails.googleReviewScore}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Property ID</span>
                    <span className="text-gray-300 font-mono">{property.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Listed</span>
                    <span className="text-gray-300">{formatDate(property.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Currency</span>
                    <span className="text-gray-300">{property.currency} ({property.currencySymbol})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Commission</span>
                    <span className="text-luxury-gold-400">{property.commission_percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Nearby Places Mini */}
              <div className="glass-card p-4">
                <h4 className="text-[10px] text-gray-600 uppercase tracking-wider mb-3">Nearby Landmarks</h4>
                <div className="space-y-2">
                  {property.nearbyPlaces.slice(0, 3).map((place, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-600 shrink-0" />
                      <span className="text-[10px] text-gray-400 flex-1">{place.name}</span>
                      <span className="text-[8px] text-emerald-400">{place.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Similar Properties */}
          {similarProperties.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-white mb-4">Similar Properties in {property.city}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {similarProperties.map(p => (
                  <Link
                    key={p.id}
                    to={`/property/${p.slug}`}
                    className="premium-card p-4 group hover:border-luxury-gold-500/30 transition-all"
                  >
                    <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
                      <img
                        src={p.curatedImages.images[0]?.url || p.curatedImages.hero_url}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs font-semibold text-white truncate group-hover:text-luxury-gold-300 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-[9px] text-gray-500 mt-0.5">{p.developer_name}</p>
                    <p className="text-[8px] text-gray-600">{p.address.district}, {p.city}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-medium text-luxury-gold-400">
                        {formatPrice(p.price_min, p.countryCode)}
                      </span>
                      <span className="text-[8px] text-gray-600 capitalize">{p.status.replace(/_/g, ' ')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="border-t border-luxury-border mt-12 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-luxury-gold-500/20 flex items-center justify-center">
                  <Building2 className="w-3 h-3 text-luxury-gold-400" />
                </div>
                <span className="text-xs font-semibold text-white">LeadLuxe AI</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-gray-600">
                <Link to="/" className="hover:text-gray-400 transition-colors">Home</Link>
                <Link to="/deal-room" className="hover:text-gray-400 transition-colors">Properties</Link>
                <Link to={`/country/${property.countryCode.toLowerCase()}`} className="hover:text-gray-400 transition-colors">{property.country}</Link>
                <Link to={`/city/${property.city.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-gray-400 transition-colors">{property.city}</Link>
                <span>© 2026 LeadLuxe AI. Global Real Estate Intelligence.</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
