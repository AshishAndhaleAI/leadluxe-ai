// ============================================================
// LeadLuxe AI — Deal Room
// Global property marketplace for real estate opportunities.
// Browse properties, view AI-powered insights, express interest,
// and track commissions on every deal.
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, DollarSign, Search, Filter, SlidersHorizontal,
  Grid3X3, List, Heart, ArrowUpDown, TrendingUp, Clock,
  CheckCircle, X, Star, ChevronRight, Sparkles, Percent,
  Camera, Bath, Bed, Maximize, Shield, Zap, Eye,
  ExternalLink, MessageSquare, Share2, Globe, Layers,
  BarChart3, Target, AlertCircle, ChevronDown,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getPropertyDatabase, searchProperties, getPropertiesByCountry, getHotProperties, getPreLaunchProperties, getHighValueProperties } from '../lib/property-database';
import type { Property, PropertyStatus, PropertyType, PropertyImage, PropertyUnit } from '../lib/property-database';

// ============================================================
// TYPES
// ============================================================

interface DealRoomFilters {
  search: string;
  country: string;
  propertyType: string;
  status: string;
  priceRange: [number, number];
  salesStatus: string;
  sortBy: 'price' | 'confidence' | 'commission' | 'newest';
}

// ============================================================
// COUNTRY OPTIONS
// ============================================================

const COUNTRIES_LIST = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pre_launch', label: 'Pre-Launch' },
  { value: 'under_construction', label: 'Under Construction' },
  { value: 'ready_to_move', label: 'Ready to Move' },
  { value: 'resale', label: 'Resale' },
];

const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'studio', label: 'Studio' },
];

// ============================================================
// HELPERS
// ============================================================

function formatPrice(price: number, cc: string): string {
  if (cc === 'IN') {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  }
  const syms: Record<string, string> = { AE: 'AED ', GB: '£', SG: 'S$', SA: 'SAR ', JP: '¥', KR: '₩', TH: '฿', VN: '₫', TR: '₺', ES: '€', IT: '€', DE: '€', FR: '€', NL: '€', CA: 'C$', AU: 'A$', MY: 'RM', QA: 'QAR ', BR: 'R$', MX: 'Mex$', ZA: 'R', NG: '₦', EG: 'E£' };
  return `${syms[cc] || '$'}${price >= 1000000 ? (price / 1000000).toFixed(2) + 'M' : price.toLocaleString()}`;
}

function getStatusBadge(status: PropertyStatus): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    pre_launch: { label: 'Pre-Launch', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    under_construction: { label: 'Under Construction', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    ready_to_move: { label: 'Ready to Move', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    resale: { label: 'Resale', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  };
  return map[status] || { label: status, color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' };
}

function getSalesBadge(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    hot: { label: '🔥 Hot Deal', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    active: { label: 'Active', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    limited: { label: '⚠️ Limited', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    sold_out: { label: 'Sold Out', color: 'bg-gray-500/15 text-gray-500 border-gray-500/30' },
  };
  return map[status] || { label: status, color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' };
}

// Modal state
interface ModalState {
  open: boolean;
  property: Property | null;
}

// ============================================================
// MAIN PAGE
// ============================================================

export function DealRoom() {
  const navigate = useNavigate();
  const allProperties = useMemo(() => getPropertyDatabase(), []);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [interestModal, setInterestModal] = useState<ModalState>({ open: false, property: null });
  const [detailModal, setDetailModal] = useState<ModalState>({ open: false, property: null });
  const [savedDeals, setSavedDeals] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('leadluxe-deals') || '[]'); }
    catch { return []; }
  });
  const [showMyInterests, setShowMyInterests] = useState(false);

  const totalDealCommission = useMemo(() =>
    savedDeals.reduce((s: number, d: any) => s + d.estimatedCommission, 0),
    [savedDeals]
  );
  const [filters, setFilters] = useState<DealRoomFilters>({
    search: '',
    country: 'all',
    propertyType: 'all',
    status: 'all',
    priceRange: [0, 1000000000],
    salesStatus: 'all',
    sortBy: 'confidence',
  });

  // Stats for summary cards
  const stats = useMemo(() => ({
    total: allProperties.length,
    hot: allProperties.filter(p => p.sales_status === 'hot').length,
    preLaunch: allProperties.filter(p => p.status === 'pre_launch').length,
    ready: allProperties.filter(p => p.status === 'ready_to_move').length,
    totalCommission: allProperties.reduce((s, p) => s + p.estimated_commission, 0),
  }), [allProperties]);

  // Filtered properties
  const filtered = useMemo(() => {
    let list = [...allProperties];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.developer_name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q)
      );
    }
    if (filters.country !== 'all') list = list.filter(p => p.countryCode === filters.country);
    if (filters.propertyType !== 'all') list = list.filter(p => p.property_type === filters.propertyType);
    if (filters.status !== 'all') list = list.filter(p => p.status === filters.status);
    if (filters.salesStatus !== 'all') list = list.filter(p => p.sales_status === filters.salesStatus);
    list = list.filter(p => p.price_max >= filters.priceRange[0] && p.price_min <= filters.priceRange[1]);

    list.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price': return b.price_max - a.price_max;
        case 'confidence': return b.confidence - a.confidence;
        case 'commission': return b.estimated_commission - a.estimated_commission;
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default: return 0;
      }
    });

    return list;
  }, [allProperties, filters]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-luxury-gold-400" />
            </div>
            <h1 className="text-xl font-bold text-white font-display">Deal Room</h1>
            <span className="px-2 py-0.5 rounded-full bg-luxury-gold-500/10 border border-luxury-gold-500/20 text-[9px] font-medium text-luxury-gold-400">
              {allProperties.length} Properties
            </span>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl">
            Browse {allProperties.length} properties across {COUNTRIES_LIST.length} countries. 
            Express interest directly, track commissions, and close deals worldwide.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Properties', value: stats.total, icon: Building2, color: 'text-luxury-gold-400', bg: 'bg-luxury-gold-500/10' },
          { label: '🔥 Hot Deals', value: stats.hot, icon: Zap, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: '🚀 Pre-Launch', value: stats.preLaunch, icon: RocketIcon, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: '✅ Ready to Move', value: stats.ready, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: '💰 Total Commission', value: formatPrice(stats.totalCommission, 'IN'), icon: Percent, color: 'text-luxury-gold-400', bg: 'bg-luxury-gold-500/10' },
          { label: '❤️ Favorites', value: favorites.size, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          ...(savedDeals.length > 0 ? [{ label: '🤝 My Deals', value: savedDeals.length, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }] : []),
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="premium-card p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-3 h-3', stat.color)} />
              </div>
              <p className="text-[10px] text-gray-400">{stat.label}</p>
            </div>
            <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="Search property, developer, city..."
            className="input-glass pl-9 text-xs"
          />
        </div>

        <select
          value={filters.country}
          onChange={e => setFilters(f => ({ ...f, country: e.target.value }))}
          className="input-glass text-xs py-1.5"
        >
          <option value="all">🌍 All Countries</option>
          {COUNTRIES_LIST.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="input-glass text-xs py-1.5"
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={filters.sortBy}
          onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value as any }))}
          className="input-glass text-xs py-1.5"
        >
          <option value="confidence">📊 Best Match</option>
          <option value="price">💰 Highest Value</option>
          <option value="commission">💎 Highest Commission</option>
          <option value="newest">🆕 Newest First</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'p-2 rounded-lg text-[10px] font-medium transition-colors',
            showFilters ? 'bg-luxury-gold-500/20 text-luxury-gold-400 border border-luxury-gold-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-0.5 border border-gray-800">
          <button onClick={() => setViewMode('grid')} className={cn('p-1.5 rounded', viewMode === 'grid' ? 'bg-luxury-gold-500/20 text-luxury-gold-400' : 'text-gray-500')}>
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setViewMode('list')} className={cn('p-1.5 rounded', viewMode === 'list' ? 'bg-luxury-gold-500/20 text-luxury-gold-400' : 'text-gray-500')}>
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-[10px] text-gray-500">
          {filtered.length} of {allProperties.length}
        </span>

        {savedDeals.length > 0 && (
          <button
            onClick={() => setShowMyInterests(!showMyInterests)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors',
              showMyInterests ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
            )}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            My Deals ({savedDeals.length})
            <span className="text-emerald-400">{formatPrice(totalDealCommission, 'IN')}</span>
          </button>
        )}
      </div>

      {/* Extended filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="premium-card p-4 overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Property Type</p>
                <select
                  value={filters.propertyType}
                  onChange={e => setFilters(f => ({ ...f, propertyType: e.target.value }))}
                  className="input-glass text-xs py-1.5 w-full"
                >
                  {PROPERTY_TYPES.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Sales Status</p>
                <select
                  value={filters.salesStatus}
                  onChange={e => setFilters(f => ({ ...f, salesStatus: e.target.value }))}
                  className="input-glass text-xs py-1.5 w-full"
                >
                  <option value="all">All</option>
                  <option value="hot">🔥 Hot Deal</option>
                  <option value="active">Active</option>
                  <option value="limited">⚠️ Limited</option>
                  <option value="sold_out">Sold Out</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Min Price</p>
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={e => setFilters(f => ({ ...f, priceRange: [Number(e.target.value), f.priceRange[1]] }))}
                  className="input-glass text-xs py-1.5 w-full"
                  placeholder="0"
                />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Max Price</p>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={e => setFilters(f => ({ ...f, priceRange: [f.priceRange[0], Number(e.target.value)] }))}
                  className="input-glass text-xs py-1.5 w-full"
                  placeholder="1000000000"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Interests Section */}
      {showMyInterests && savedDeals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">My Deal Interests</h2>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-medium text-emerald-400">
                {savedDeals.length} deals
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-gray-500">Total Commission:</span>
              <span className="text-sm font-bold text-emerald-400">{formatPrice(totalDealCommission, 'IN')}</span>
            </div>
          </div>
          <div className="space-y-2">
            {savedDeals.map((deal: any) => (
              <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-xs font-semibold text-white truncate">{deal.propertyName}</h3>
                    <span className="px-1 py-0.5 rounded bg-emerald-500/10 text-[8px] font-medium text-emerald-400 capitalize">{deal.status}</span>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {deal.developerName} · {deal.city}, {deal.country} · {deal.contactName}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-luxury-gold-400">
                      {formatPrice(deal.estimatedCommission, deal.currency || 'IN')}
                    </p>
                    <p className="text-[8px] text-gray-500">commission</p>
                  </div>
                  <button
                    onClick={() => {
                      const updated = savedDeals.filter((d: any) => d.id !== deal.id);
                      localStorage.setItem('leadluxe-deals', JSON.stringify(updated));
                      setSavedDeals(updated);
                    }}
                    className="p-1 rounded hover:bg-white/5 text-gray-600 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Property Grid / List */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Building2 className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No Properties Found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters to see more results.</p>
            <button onClick={() => setFilters({ search: '', country: 'all', propertyType: 'all', status: 'all', priceRange: [0, 1000000000], salesStatus: 'all', sortBy: 'confidence' })}
              className="btn-primary mt-4">Clear Filters</button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filtered.slice(0, 48).map((property, i) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={i}
                isFavorite={favorites.has(property.id)}
                onToggleFavorite={() => toggleFavorite(property.id)}
                onClick={() => setDetailModal({ open: true, property })}
                onExpressInterest={() => setInterestModal({ open: true, property })}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {filtered.slice(0, 50).map((property, i) => (
              <PropertyListItem
                key={property.id}
                property={property}
                index={i}
                isFavorite={favorites.has(property.id)}
                onToggleFavorite={() => toggleFavorite(property.id)}
                onClick={() => setDetailModal({ open: true, property })}
                onExpressInterest={() => setInterestModal({ open: true, property })}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interest Modal */}
      {interestModal.open && interestModal.property && (
        <InterestModal
          property={interestModal.property}
          onClose={() => setInterestModal({ open: false, property: null })}
          onSubmitted={() => {
            setInterestModal({ open: false, property: null });
            try { setSavedDeals(JSON.parse(localStorage.getItem('leadluxe-deals') || '[]')); }
            catch {}
          }}
        />
      )}

      {/* Detail Modal */}
      {detailModal.open && detailModal.property && (() => {
        const prop = detailModal.property;
        return (
          <PropertyDetailModalInner
            property={prop}
            isFavorite={favorites.has(prop.id)}
            onToggleFavorite={() => toggleFavorite(prop.id)}
            onExpressInterest={() => {
              setDetailModal({ open: false, property: null });
              setInterestModal({ open: true, property: prop });
            }}
            onClose={() => setDetailModal({ open: false, property: null })}
          />
        );
      })()}
    </div>
  );
}

// ============================================================
// DETAIL MODAL INNER (inline so TypeScript can narrow the type)
// ============================================================

function PropertyDetailModalInner({ property, isFavorite, onToggleFavorite, onExpressInterest, onClose }: {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onExpressInterest: () => void;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const statusBadge = getStatusBadge(property.status);
  const salesBadge = getSalesBadge(property.sales_status);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-950 border border-gray-800"
      >
        {/* Hero Image — full-width header */}
        <div className="relative h-72 sm:h-96 overflow-hidden">
          <img
            src={property.hero_url}
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
          <div className="absolute top-4 left-4 flex gap-1.5 z-10">
            <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border backdrop-blur-sm', statusBadge.color)}>{statusBadge.label}</span>
            <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium border backdrop-blur-sm', salesBadge.color)}>{salesBadge.label}</span>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button onClick={onToggleFavorite} className="p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors">
              <Heart className={cn('w-4 h-4', isFavorite ? 'text-rose-400 fill-rose-400' : 'text-white/70')} />
            </button>
            <button onClick={onClose} className="p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors">
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <h2 className="text-xl font-bold text-white">{property.name}</h2>
            <p className="text-sm text-gray-300">{property.developer_name} · {property.city}, {property.country}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
          {/* Left: Images & Amenities */}
          <div className="lg:col-span-3 p-4 space-y-4">
            {/* Image gallery */}
            <div className="relative h-56 rounded-xl overflow-hidden bg-gray-900">
              <img src={property.images[activeImage]?.url || ''} alt={property.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 flex gap-1">
                {property.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={cn('w-2 h-2 rounded-full transition-all', i === activeImage ? 'bg-luxury-gold-400 w-4' : 'bg-white/40')} />
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h3>
              <p className="text-xs text-gray-300 leading-relaxed">{property.description}</p>
            </div>

            {/* Highlights */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Highlights</h3>
              <div className="flex flex-wrap gap-1.5">
                {property.highlights.map((h, i) => (
                  <span key={i} className="px-2 py-1 rounded-lg bg-gray-800 text-[10px] text-gray-300">{h}</span>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Amenities ({property.amenities.length})</h3>
              <div className="flex flex-wrap gap-1.5">
                {property.amenities.map((a, i) => (
                  <span key={i} className="px-2 py-1 rounded-lg bg-gray-800/50 text-[10px] text-gray-300">{a}</span>
                ))}
              </div>
            </div>

            {/* Unit Types Table */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Unit Configurations</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-800">
                      <th className="text-left py-1.5 pr-3 font-medium">Type</th>
                      <th className="text-right py-1.5 pr-3 font-medium">Size (sqft)</th>
                      <th className="text-right py-1.5 pr-3 font-medium">Price</th>
                      <th className="text-right py-1.5 pr-3 font-medium">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {property.unit_types.map((u, i) => (
                      <tr key={i} className="border-b border-gray-800/30">
                        <td className="py-1.5 pr-3 text-white">{u.type}</td>
                        <td className="py-1.5 pr-3 text-right text-gray-400">{u.size_sqft.toLocaleString()}</td>
                        <td className="py-1.5 pr-3 text-right text-luxury-gold-400 font-medium">{formatPrice(u.price, property.countryCode)}</td>
                        <td className="py-1.5 pr-3 text-right">{u.available}/{u.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Key metrics + Actions */}
          <div className="lg:col-span-2 p-4 border-l border-gray-800 space-y-4">
            {/* Pricing */}
            <div className="premium-card p-4">
              <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Pricing</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="glass-card p-2 text-center">
                  <p className="text-sm font-bold text-luxury-gold-400">{formatPrice(property.price_min, property.countryCode)}</p>
                  <p className="text-[8px] text-gray-500">Starting From</p>
                </div>
                <div className="glass-card p-2 text-center">
                  <p className="text-sm font-bold text-white">{formatPrice(property.price_max, property.countryCode)}</p>
                  <p className="text-[8px] text-gray-500">Up To</p>
                </div>
                <div className="glass-card p-2 text-center">
                  <p className="text-xs font-bold text-gray-300">{property.price_per_sqft.toLocaleString()}</p>
                  <p className="text-[8px] text-gray-500">Per Sqft</p>
                </div>
                <div className="glass-card p-2 text-center">
                  <p className="text-xs font-bold text-gray-300">{property.total_units}</p>
                  <p className="text-[8px] text-gray-500">Total Units</p>
                </div>
              </div>
            </div>

            {/* Commission */}
            <div className="premium-card p-4 border-luxury-gold-500/20">
              <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Commission</h3>
              <div className="text-center py-3">
                <p className="text-2xl font-bold text-emerald-400">{formatPrice(property.estimated_commission, property.countryCode)}</p>
                <p className="text-[10px] text-gray-500">at {property.commission_percentage}% success fee</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 justify-center">
                <Percent className="w-3 h-3" />
                <span>No upfront cost. You only earn when the deal closes.</span>
              </div>
            </div>

            {/* Developer */}
            <div className="premium-card p-4">
              <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Developer</h3>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-luxury-gold-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{property.developer_name}</p>
                  <p className="text-[9px] text-gray-500 capitalize">{property.developer_type} company</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="premium-card p-4">
              <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Details</h3>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-white">{statusBadge.label}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="text-white capitalize">{property.property_type}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">RERA</span><span className={cn('capitalize', property.rera_status === 'approved' ? 'text-emerald-400' : 'text-amber-400')}>{property.rera_status}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Bedrooms</span><span className="text-white">{property.bedrooms.join(', ')} BHK</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Size Range</span><span className="text-white">{property.min_size_sqft.toLocaleString()} - {property.max_size_sqft.toLocaleString()} sqft</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Completion</span><span className="text-white">{property.completion_date}</span></div>
              </div>
            </div>

            {/* AI Confidence */}
            <div className="premium-card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">AI Confidence</h3>
                <span className={cn('text-xs font-bold', property.confidence >= 80 ? 'text-emerald-400' : 'text-amber-400')}>{property.confidence}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={cn('h-full rounded-full', property.confidence >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-amber-400')}
                  style={{ width: `${property.confidence}%` }}
                />
              </div>
              <p className="text-[9px] text-gray-600 mt-1">
                {property.confidence >= 80 ? 'High-confidence opportunity — strong deal potential' :
                 property.confidence >= 60 ? 'Moderate confidence — verify details before committing' :
                 'Low confidence — additional due diligence recommended'}
              </p>
            </div>

            {/* Express Interest CTA */}
            <button
              onClick={onExpressInterest}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-luxury-gold-500 to-amber-500 text-black font-bold text-xs hover:from-luxury-gold-400 hover:to-amber-400 transition-all shadow-lg shadow-luxury-gold-500/20"
            >
              Express Interest — Earn {formatPrice(property.estimated_commission, property.countryCode)}
            </button>
            <p className="text-[8px] text-gray-600 text-center">No obligation. We only earn when the deal closes at 3%.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// ROCKET ICON FALLBACK
// ============================================================

function RocketIcon({ className }: { className?: string }) {
  return <TrendingUp className={className} />;
}

// ============================================================
// PROPERTY CARD (Grid)
// ============================================================

function PropertyCard({ property, index, isFavorite, onToggleFavorite, onClick, onExpressInterest }: {
  property: Property;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
  onExpressInterest: () => void;
}) {
  const statusBadge = getStatusBadge(property.status);
  const salesBadge = getSalesBadge(property.sales_status);
  const imgUrl = property.images[0]?.url || 'https://picsum.photos/seed/default/800/600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.015 }}
      className="premium-card overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-900 overflow-hidden">
        <img src={imgUrl} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1">
          <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-medium border backdrop-blur-sm', statusBadge.color)}>{statusBadge.label}</span>
          <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-medium border backdrop-blur-sm', salesBadge.color)}>{salesBadge.label}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
        >
          <Heart className={cn('w-3.5 h-3.5', isFavorite ? 'text-rose-400 fill-rose-400' : 'text-white/70')} />
        </button>
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-xs font-semibold text-white truncate">{property.name}</p>
          <p className="text-[9px] text-gray-300 truncate">{property.developer_name}</p>
        </div>
      </div>

      {/* Details */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <MapPin className="w-3 h-3" />
          <span>{property.city}, {getFlag(property.countryCode)}</span>
          <span className="ml-auto">{property.property_type}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-luxury-gold-400">{formatPrice(property.price_min, property.countryCode)}</p>
            <p className="text-[9px] text-gray-500">to {formatPrice(property.price_max, property.countryCode)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-emerald-400">{formatPrice(property.estimated_commission, property.countryCode)}</p>
            <p className="text-[9px] text-gray-500">commission</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-0.5"><Maximize className="w-3 h-3" /> {property.min_size_sqft}-{property.max_size_sqft} sqft</span>
          <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" /> {property.bedrooms.join('/')} BHK</span>
          {property.status === 'ready_to_move' && <span className="flex items-center gap-0.5 text-emerald-400"><CheckCircle className="w-3 h-3" /> Ready</span>}
        </div>

        {/* Confidence bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-gray-800 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                property.confidence >= 80 ? 'bg-emerald-500' : property.confidence >= 60 ? 'bg-amber-500' : 'bg-gray-500'
              )}
              style={{ width: `${property.confidence}%` }}
            />
          </div>
          <span className={cn(
            'text-[9px] font-bold',
            property.confidence >= 80 ? 'text-emerald-400' : property.confidence >= 60 ? 'text-amber-400' : 'text-gray-400'
          )}>{property.confidence}%</span>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); onExpressInterest(); }}
          className="w-full py-1.5 rounded-lg bg-luxury-gold-500/20 border border-luxury-gold-500/30 text-[10px] font-medium text-luxury-gold-400 hover:bg-luxury-gold-500/30 transition-colors"
        >
          Express Interest — {formatPrice(property.estimated_commission, property.countryCode)} Commission
        </button>
      </div>
    </motion.div>
  );
}

function getFlag(code: string): string {
  const map: Record<string, string> = { IN: '🇮🇳', AE: '🇦🇪', US: '🇺🇸', GB: '🇬🇧', SG: '🇸🇬', SA: '🇸🇦', DE: '🇩🇪', FR: '🇫🇷', JP: '🇯🇵', KR: '🇰🇷', TH: '🇹🇭', VN: '🇻🇳', BR: '🇧🇷', MX: '🇲🇽', TR: '🇹🇷', ES: '🇪🇸', IT: '🇮🇹', CA: '🇨🇦', AU: '🇦🇺', MY: '🇲🇾', QA: '🇶🇦', NL: '🇳🇱', ZA: '🇿🇦', NG: '🇳🇬', EG: '🇪🇬' };
  return map[code] || '🌍';
}

// ============================================================
// PROPERTY LIST ITEM
// ============================================================

function PropertyListItem({ property, index, isFavorite, onToggleFavorite, onClick, onExpressInterest }: {
  property: Property;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
  onExpressInterest: () => void;
}) {
  const statusBadge = getStatusBadge(property.status);
  const salesBadge = getSalesBadge(property.sales_status);
  const imgUrl = property.images[0]?.url || 'https://picsum.photos/seed/default/800/600';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.01 }}
      onClick={onClick}
      className="premium-card p-3 cursor-pointer hover:border-gray-600/50 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="w-20 h-16 rounded-lg bg-gray-800 overflow-hidden shrink-0">
          <img src={imgUrl} alt={property.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-white truncate">{property.name}</h3>
            <span className={cn('px-1 py-0.5 rounded text-[8px] font-medium', statusBadge.color)}>{statusBadge.label}</span>
            <span className={cn('px-1 py-0.5 rounded text-[8px] font-medium', salesBadge.color)}>{salesBadge.label}</span>
          </div>
          <p className="text-[10px] text-gray-500 truncate">{property.developer_name} · {property.city}, {getFlag(property.countryCode)}</p>
          <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1">
            <span className="font-bold text-luxury-gold-400">{formatPrice(property.price_min, property.countryCode)}</span>
            <span>{property.min_size_sqft}-{property.max_size_sqft} sqft</span>
            <span>{property.bedrooms.join('/')} BHK</span>
            <span>Commission: <span className="text-emerald-400 font-medium">{formatPrice(property.estimated_commission, property.countryCode)}</span></span>
            <span>Confidence: <span className={cn('font-medium', property.confidence >= 80 ? 'text-emerald-400' : 'text-amber-400')}>{property.confidence}%</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} className="p-1.5 rounded-lg hover:bg-white/5">
            <Heart className={cn('w-3.5 h-3.5', isFavorite ? 'text-rose-400 fill-rose-400' : 'text-gray-500')} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onExpressInterest(); }}
            className="px-2.5 py-1.5 rounded-lg bg-luxury-gold-500/20 border border-luxury-gold-500/30 text-[10px] font-medium text-luxury-gold-400 hover:bg-luxury-gold-500/30 transition-colors"
          >
            Express Interest
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// INTEREST MODAL
// ============================================================

function InterestModal({ property, onClose, onSubmitted }: {
  property: Property;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to localStorage as a trackable deal lead
    const deal = {
      id: `deal-${property.id}-${Date.now()}`,
      propertyId: property.id,
      propertyName: property.name,
      developerName: property.developer_name,
      city: property.city,
      country: property.country,
      priceMin: property.price_min,
      priceMax: property.price_max,
      estimatedCommission: property.estimated_commission,
      currency: property.currency,
      currencySymbol: property.currencySymbol,
      contactName: form.name,
      contactEmail: form.email,
      contactPhone: form.phone,
      message: form.message,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('leadluxe-deals') || '[]');
    existing.unshift(deal);
    localStorage.setItem('leadluxe-deals', JSON.stringify(existing));
    setSubmitted(true);
    setTimeout(onSubmitted, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-gray-950 border border-gray-800 p-6"
      >
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Interest Registered!</h3>
            <p className="text-sm text-gray-400 mb-1">We've recorded your interest in</p>
            <p className="text-sm font-medium text-luxury-gold-400">{property.name}</p>
            <p className="text-xs text-gray-500 mt-4">
              Your AI Deal Coach will guide you through the next steps.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Express Interest</h3>
                <p className="text-xs text-gray-400 mt-1">{property.name} by {property.developer_name}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Commission preview */}
            <div className="glass-card p-3 mb-4 text-center border border-luxury-gold-500/20">
              <p className="text-[10px] text-gray-500">Potential Commission</p>
              <p className="text-xl font-bold text-emerald-400">{formatPrice(property.estimated_commission, property.countryCode)}</p>
              <p className="text-[9px] text-gray-600">at 3% success fee · No upfront cost</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">Your Name</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-glass text-xs w-full"
                  placeholder="Enter your name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="input-glass text-xs w-full"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Phone</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="input-glass text-xs w-full"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 block mb-1">Message (Optional)</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="input-glass text-xs w-full h-20 resize-none"
                  placeholder={`I'm interested in ${property.name}. Please share more details.`}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-luxury-gold-500 to-amber-500 text-black font-bold text-xs hover:from-luxury-gold-400 hover:to-amber-400 transition-all"
              >
                Submit Interest — Earn {formatPrice(property.estimated_commission, property.countryCode)}
              </button>
              <p className="text-[8px] text-gray-600 text-center">
                We'll connect you with the developer. No upfront payment needed.
              </p>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
