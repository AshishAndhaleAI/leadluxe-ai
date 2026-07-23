// ============================================================
// LeadLuxe AI — Property Detail Page
// SEO-optimized, comprehensive property page with full project
// information, images, contact details, maps, and AI insights.
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
  Map as MapIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getPropertyById, getPropertyDatabase, getPropertiesByCity } from '../lib/property-database';
import type { Property, PropertyImage, PropertyUnit } from '../lib/property-database';
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

function ImageGallery({ images }: { images: PropertyImage[] }) {
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
      <div className="relative w-full h-64 sm:h-96 rounded-xl overflow-hidden group">
        <img
          src={current.url}
          alt={current.caption}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

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

function UnitTypeCard({ unit }: { unit: PropertyUnit }) {
  const soldOut = unit.available <= 0;
  return (
    <div className={cn(
      'premium-card p-4',
      soldOut ? 'opacity-50' : ''
    )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-white">{unit.type}</h4>
          <p className="text-[10px] text-gray-500">{unit.bedrooms} Bed · {unit.bathrooms} Bath · {unit.size_sqft.toLocaleString()} sqft</p>
        </div>
        <span className={cn(
          'text-[10px] px-2 py-0.5 rounded font-medium',
          soldOut ? 'bg-red-500/10 text-red-400' :
          unit.available < unit.total * 0.2 ? 'bg-amber-500/10 text-amber-400' :
          'bg-emerald-500/10 text-emerald-400'
        )}>
          {soldOut ? 'Sold Out' : `${unit.available}/${unit.total}`}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <Square className="w-3 h-3" />
          <span>{unit.size_sqft.toLocaleString()} sqft</span>
        </div>
        <p className="text-sm font-bold text-luxury-gold-400">
          {formatPrice(unit.price, 'IN')}
        </p>
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
  const [showContact, setShowContact] = useState(false);

  // Find property by slug or ID
  const property = useMemo(() => {
    const db = getPropertyDatabase();
    return db.find(p => p.slug === slug || p.id === slug);
  }, [slug]);

  // Similar properties in same city
  const similarProperties = useMemo(() => {
    if (!property) return [];
    return getPropertiesByCity(property.cityId)
      .filter(p => p.id !== property.id)
      .slice(0, 4);
  }, [property]);

  // SEO data
  const pageUrl = property
    ? `https://leadluxe-ai.vercel.app/property/${property.slug}`
    : 'https://leadluxe-ai.vercel.app';

  if (!property) {
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

  const heroImage = property.hero_url || property.images[0]?.url;
  const availPercent = property.total_units > 0
    ? Math.round((property.available_units / property.total_units) * 100)
    : 0;

  return (
    <>
      {/* SEO */}
      <SEOHelmet
        title={`${property.name} — ${property.developer_name} in ${property.city}, ${property.country}`}
        description={`${property.name} by ${property.developer_name} in ${property.city}, ${property.country}. ${property.unit_types.length} configurations from ${formatPrice(property.price_min, property.countryCode)}. ${property.amenities.length} amenities. RERA ${property.rera_status}. View details, images, and contact information.`}
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
                <button
                  onClick={() => setShowContact(!showContact)}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Enquire Now
                </button>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 pb-3 text-[9px] text-gray-600">
              <Link to="/" className="hover:text-gray-400 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/deal-room" className="hover:text-gray-400 transition-colors">Properties</Link>
              <span>/</span>
              <Link to={`/deal-room?country=${property.countryCode}`} className="hover:text-gray-400 transition-colors">{property.country}</Link>
              <span>/</span>
              <span className="text-gray-400">{property.city}</span>
              <span>/</span>
              <span className="text-luxury-gold-400">{property.name}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images & Description */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <ImageGallery images={property.images} />

              {/* Property Title */}
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
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>{property.district}, {property.city}, {property.country}</span>
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
                </div>
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Property Type', value: property.property_type.replace(/_/g, ' '), icon: Building2 },
                  { label: 'Total Units', value: property.total_units.toLocaleString(), icon: Layers },
                  { label: 'Available', value: `${availPercent}%`, icon: CheckCircle },
                  { label: 'Completion', value: property.completion_date ? formatDate(property.completion_date) : 'TBD', icon: Calendar },
                  { label: 'Price Range', value: `${formatPrice(property.price_min, property.countryCode)} - ${formatPrice(property.price_max, property.countryCode)}`, icon: DollarSign },
                  { label: 'Price/sqft', value: formatPrice(property.price_per_sqft, property.countryCode), icon: Square },
                  { label: 'Size Range', value: `${property.min_size_sqft.toLocaleString()} - ${property.max_size_sqft.toLocaleString()} sqft`, icon: Maximize2 },
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

              {/* Unit Types */}
              {property.unit_types.length > 0 && (
                <div className="premium-card p-5">
                  <h2 className="text-sm font-semibold text-white mb-4">Available Unit Types ({property.unit_types.length})</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {property.unit_types.map((unit, i) => (
                      <UnitTypeCard key={i} unit={unit} />
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

              {/* Highlights */}
              {property.highlights.length > 0 && (
                <div className="premium-card p-5">
                  <h2 className="text-sm font-semibold text-white mb-4">Project Highlights</h2>
                  <div className="space-y-2">
                    {property.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Star className="w-3.5 h-3.5 text-luxury-gold-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-gray-300">{h}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location & Map */}
              <div className="premium-card p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Location</h2>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{property.district}, {property.city}, {property.country}</span>
                  <span className="text-gray-600">·</span>
                  <span className="text-[10px] text-gray-600">
                    {property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}
                  </span>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-luxury-gold-400 hover:text-luxury-gold-300 transition-colors"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  View on Google Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
                <div className="mt-3 h-40 rounded-xl bg-gradient-to-br from-luxury-surface to-luxury-gray flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-luxury-gold-400 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-600">{property.district}, {property.city}</p>
                    <p className="text-[9px] text-gray-700">{property.latitude.toFixed(4)}°N, {property.longitude.toFixed(4)}°E</p>
                  </div>
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
              {/* Contact Card */}
              <div className="premium-card p-5 sticky top-20">
                <h3 className="text-sm font-semibold text-white mb-3">Project Inquiry</h3>

                {/* Developer Info */}
                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/5">
                  <div className="w-10 h-10 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-luxury-gold-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{property.developer_name}</p>
                    <p className="text-[10px] text-gray-500 capitalize">{property.developer_type} developer</p>
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
                    <span className="text-[10px] text-gray-600">AI Confidence</span>
                    <span className="text-xs font-bold text-amber-400">{property.confidence}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Commission (3%)</span>
                    <span className="text-xs font-bold text-luxury-gold-400">
                      {formatPrice(property.estimated_commission, property.countryCode)}
                    </span>
                  </div>
                </div>

                {/* Estimated Commission Card */}
                <div className="p-3 rounded-lg bg-luxury-gold-500/10 border border-luxury-gold-500/20 mb-4">
                  <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Estimated Commission</p>
                  <p className="text-lg font-bold text-luxury-gold-400">
                    {formatPrice(property.estimated_commission, property.countryCode)}
                  </p>
                  <p className="text-[9px] text-gray-600">3% success fee · Only paid on closed deals</p>
                </div>

                {/* Contact Info (toggle) */}
                {showContact && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-3 mb-4 overflow-hidden"
                  >
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-[10px] font-medium text-emerald-400 mb-2">Project Coordinator</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <Phone className="w-3.5 h-3.5 text-luxury-gold-400" />
                          <a href={`tel:+91${property.id.replace(/\D/g, '').slice(0, 10)}`} className="hover:text-luxury-gold-300 transition-colors">
                            +91-{property.id.replace(/\D/g, '').slice(0, 5)}-{property.id.replace(/\D/g, '').slice(5, 10)}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <Mail className="w-3.5 h-3.5 text-luxury-gold-400" />
                          <a href={`mailto:sales.${property.slug}@leadluxe.ai`} className="hover:text-luxury-gold-300 transition-colors">
                            sales.{property.slug}@leadluxe.ai
                          </a>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-gray-300">
                          <MapPin className="w-3.5 h-3.5 text-luxury-gold-400 mt-0.5" />
                          <span>
                            {property.district}, {property.city}, {property.country}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => setShowContact(!showContact)}
                    className="btn-primary w-full text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {showContact ? 'Hide Contact Info' : 'Show Contact Info'}
                  </button>
                  <button
                    onClick={() => navigate(`/match?property=${property.id}`)}
                    className="btn-outline w-full text-xs"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    AI Match Analysis
                  </button>
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
                        contactEmail: '',
                        contactPhone: '',
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
                <h4 className="text-[10px] text-gray-600 uppercase tracking-wider mb-3">Quick Info</h4>
                <div className="space-y-2 text-xs">
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
                        src={p.images[0]?.url || p.hero_url}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs font-semibold text-white truncate group-hover:text-luxury-gold-300 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-[9px] text-gray-500 mt-0.5">{p.developer_name}</p>
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
                <span>© 2024 LeadLuxe AI. Global Real Estate Intelligence.</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
