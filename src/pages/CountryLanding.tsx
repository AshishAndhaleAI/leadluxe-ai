// ============================================================
// TerraNexus AI — Country Landing Page
// SEO-optimized page for each country showing property
// opportunities, market metrics, and city breakdown.
// ============================================================

import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, MapPin, TrendingUp, DollarSign, Shield,
  ArrowRight, Globe, Star, Activity, BarChart3, Users,
  Home, Sparkles, Target,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { COUNTRIES, CITIES } from '../lib/global-data';
import { getPropertiesByCountry, getPropertyDatabase } from '../lib/property-database';
import { SEOHelmet, BreadcrumbLD } from '../components/seo/SEOHelmet';

function getFlag(code: string): string {
  const map: Record<string, string> = {
    IN: '🇮🇳', AE: '🇦🇪', US: '🇺🇸', GB: '🇬🇧', SG: '🇸🇬', SA: '🇸🇦',
    DE: '🇩🇪', FR: '🇫🇷', JP: '🇯🇵', KR: '🇰🇷', TH: '🇹🇭', VN: '🇻🇳',
    BR: '🇧🇷', MX: '🇲🇽', TR: '🇹🇷', ES: '🇪🇸', IT: '🇮🇹', NL: '🇳🇱',
    CA: '🇨🇦', AU: '🇦🇺', MY: '🇲🇾', QA: '🇶🇦', ZA: '🇿🇦', NG: '🇳🇬', EG: '🇪🇬',
  };
  return map[code] || '🌍';
}

function formatPrice(price: number, cc: string): string {
  if (cc === 'IN') {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  }
  const syms: Record<string, string> = {
    AE: 'AED ', GB: '£', SG: 'S$', SA: 'SAR ', JP: '¥', KR: '₩',
    TH: '฿', VN: '₫', TR: '₺', ES: '€', IT: '€', DE: '€', FR: '€',
    NL: '€', CA: 'C$', AU: 'A$', MY: 'RM', QA: 'QAR ', BR: 'R$',
    MX: 'Mex$', ZA: 'R', NG: '₦', EG: 'E£',
  };
  return `${syms[cc] || '$'}${price >= 1000000 ? (price / 1000000).toFixed(2) + 'M' : price.toLocaleString()}`;
}

export function CountryLanding() {
  const { countryCode } = useParams<{ countryCode: string }>();
  const navigate = useNavigate();
  const code = countryCode?.toUpperCase() || '';

  const country = useMemo(() => COUNTRIES.find(c => c.code === code), [code]);
  const cities = useMemo(() => CITIES[code] || [], [code]);
  const properties = useMemo(() => getPropertiesByCountry(code), [code]);

  const stats = useMemo(() => {
    const totalValue = properties.reduce((s, p) => s + (p.price_min + p.price_max) / 2, 0);
    const totalCommission = properties.reduce((s, p) => s + p.estimated_commission, 0);
    return {
      totalProperties: properties.length,
      totalValue,
      totalCommission,
      avgConfidence: properties.length > 0 ? Math.round(properties.reduce((s, p) => s + p.confidence, 0) / properties.length) : 0,
      hotDeals: properties.filter(p => p.sales_status === 'hot').length,
      preLaunch: properties.filter(p => p.status === 'pre_launch').length,
      readyToMove: properties.filter(p => p.status === 'ready_to_move').length,
    };
  }, [properties]);

  if (!country) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Globe className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">Country Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">The country you're looking for doesn't exist in our database.</p>
          <button onClick={() => navigate('/deal-room')} className="btn-primary text-xs">
            Browse All Properties
          </button>
        </div>
      </div>
    );
  }

  const seoTitle = `${country.flag} ${country.name} Real Estate & Property Investment Opportunities ${new Date().getFullYear()}`;
  const seoDesc = `Explore ${stats.totalProperties} premium property opportunities in ${country.name}. AI-powered market intelligence, ${cities.length} cities covered, ${stats.hotDeals} hot deals available. Commission-only pricing at 3%.`;

  return (
    <>
      <SEOHelmet
        title={`${country.name} Real Estate & Property Investment`}
        description={seoDesc}
        url={`https://terranexus-ai.vercel.app/country/${code.toLowerCase()}`}
      />
      <BreadcrumbLD items={[
        { name: 'Home', url: '/' },
        { name: 'Deal Room', url: '/deal-room' },
        { name: country.name, url: `/country/${code.toLowerCase()}` },
      ]} />

      <div className="space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-8"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-gold-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-luxury-gold-500 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{country.flag}</span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
                  {country.name} Real Estate
                </h1>
                <p className="text-sm text-gray-400">
                  {cities.length} cities · {stats.totalProperties} properties · {formatPrice(stats.totalValue, code)} total pipeline value
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
              {seoDesc}
            </p>

            <div className="flex items-center gap-2 mt-4">
              {country.marketTrend === 'rising' && (
                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Rising Market
                </span>
              )}
              <span className="px-2 py-1 rounded-lg bg-luxury-gold-500/10 border border-luxury-gold-500/20 text-[10px] font-medium text-luxury-gold-400 flex items-center gap-1">
                <Star className="w-3 h-3" /> {country.confidence}% AI Confidence
              </span>
              <span className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-medium text-blue-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> {country.currency} {country.currencySymbol}
              </span>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Properties', value: stats.totalProperties, icon: Building2, color: 'text-luxury-gold-400' },
            { label: 'Pipeline Value', value: formatPrice(stats.totalValue, code), icon: DollarSign, color: 'text-emerald-400' },
            { label: 'Total Commission', value: formatPrice(stats.totalCommission, code), icon: Target, color: 'text-luxury-gold-400' },
            { label: 'Avg Confidence', value: `${stats.avgConfidence}%`, icon: Activity, color: 'text-blue-400' },
            { label: 'Hot Deals', value: stats.hotDeals, icon: Sparkles, color: 'text-red-400' },
            { label: 'Covered Cities', value: cities.length, icon: MapPin, color: 'text-purple-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="premium-card p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={cn('w-3.5 h-3.5', stat.color)} />
                <span className="text-[10px] text-gray-500">{stat.label}</span>
              </div>
              <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Cities Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-luxury-gold-400" />
              <h2 className="text-sm font-bold text-white font-display">Cities in {country.name}</h2>
              <span className="px-1.5 py-0.5 rounded-full bg-luxury-gold-500/10 text-[9px] font-medium text-luxury-gold-400">
                {cities.length} cities
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {cities.map((city, i) => {
              const cityProps = properties.filter(p => p.cityId === city.id);
              const cityCommission = cityProps.reduce((s, p) => s + p.estimated_commission, 0);
              return (
                <motion.button
                  key={city.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/city/${city.name.toLowerCase().replace(/\s+/g, '-')}`)}
                  className="premium-card p-4 text-left hover:border-luxury-gold-500/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white group-hover:text-luxury-gold-400 transition-colors">{city.name}</h3>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-luxury-gold-400 transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-gray-500">Properties:</span>
                      <span className="text-white ml-1">{cityProps.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Price/Sqft:</span>
                      <span className="text-luxury-gold-400 ml-1">{formatPrice(city.pricePerSqft, code)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Growth:</span>
                      <span className={cn('ml-1', city.priceTrend > 8 ? 'text-emerald-400' : 'text-amber-400')}>{city.priceTrend}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Commission:</span>
                      <span className="text-emerald-400 ml-1">{formatPrice(cityCommission, code)}</span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* All Properties in Country */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-luxury-gold-400" />
              <h2 className="text-sm font-bold text-white font-display">All Properties in {country.name}</h2>
              <span className="px-1.5 py-0.5 rounded-full bg-luxury-gold-500/10 text-[9px] font-medium text-luxury-gold-400">
                {properties.length} properties
              </span>
            </div>
            <button
              onClick={() => navigate(`/deal-room?country=${code}`)}
              className="text-[10px] font-medium text-luxury-gold-400 hover:text-luxury-gold-300 transition-colors"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {properties.slice(0, 12).map((property, i) => (
              <motion.button
                key={property.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => navigate(`/property/${property.slug}`)}
                className="premium-card overflow-hidden text-left group"
              >
                <div className="relative h-32 bg-gray-900">
                  <img
                    src={property.hero_url}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs font-semibold text-white truncate">{property.name}</p>
                    <p className="text-[9px] text-gray-300 truncate">{property.developer_name}</p>
                  </div>
                </div>
                <div className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-luxury-gold-400 font-bold">{formatPrice(property.price_min, code)}</span>
                    <span className="text-gray-500">{property.property_type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span>{property.min_size_sqft}-{property.max_size_sqft} sqft</span>
                    <span>{property.bedrooms.join('/')} BHK</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', property.confidence >= 80 ? 'bg-emerald-500' : 'bg-amber-500')}
                        style={{ width: `${property.confidence}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-400">{property.confidence}%</span>
                  </div>
                  <p className="text-[9px] text-emerald-400 font-medium">Commission: {formatPrice(property.estimated_commission, code)}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* SEO Content */}
        <div className="premium-card p-6">
          <h2 className="text-sm font-bold text-white font-display mb-3">
            Why Invest in {country.name} Real Estate?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-gray-400 leading-relaxed">
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Market Overview</h3>
              <p>
                {country.name} offers {cities.length} major real estate markets with {stats.totalProperties} active 
                property opportunities. The market trend is currently <strong className="text-emerald-400">{country.marketTrend}</strong> 
                with an AI confidence score of <strong className="text-luxury-gold-400">{country.confidence}%</strong>.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Investment Potential</h3>
              <p>
                The total pipeline value across all tracked properties is <strong className="text-emerald-400">{formatPrice(stats.totalValue, code)}</strong>. 
                With our commission-only model at 3%, potential earnings total <strong className="text-luxury-gold-400">{formatPrice(stats.totalCommission, code)}</strong>.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-semibold">AI Intelligence</h3>
              <p>
                TerraNexus AI continuously monitors {country.name}'s real estate market, tracking price movements, 
                new launches, regulatory changes, and demand patterns. Get personalized opportunities delivered automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
