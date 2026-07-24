// ============================================================
// TerraNexus AI — City Landing Page
// SEO-optimized page for each city showing local property
// opportunities, market analysis, and nearby options.
// ============================================================

import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, MapPin, TrendingUp, DollarSign, Shield,
  ArrowRight, Star, Activity, Home, Sparkles, Target,
  Clock, Bed, Bath, Zap, Percent,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { COUNTRIES, CITIES } from '../lib/global-data';
import { getPropertiesByCity, getPropertyDatabase } from '../lib/property-database';
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

const CITY_SLUG_MAP: Record<string, string> = {
  'mumbai': 'in-mum', 'pune': 'in-pun', 'bengaluru': 'in-blr', 'bangalore': 'in-blr',
  'hyderabad': 'in-hyd', 'delhi-ncr': 'in-del', 'delhi': 'in-del',
  'chennai': 'in-chn', 'ahmedabad': 'in-ahm', 'kolkata': 'in-kol',
  'gurgaon': 'in-ggn', 'noida': 'in-nd', 'jaipur': 'in-jai', 'thane': 'in-tha',
  'dubai': 'ae-dxb', 'abu-dhabi': 'ae-abu', 'sharjah': 'ae-shj',
  'new-york-city': 'us-nyc', 'new-york': 'us-nyc',
  'san-francisco': 'us-sfo', 'los-angeles': 'us-lax', 'miami': 'us-mia',
  'chicago': 'us-chi', 'austin': 'us-aus',
  'london': 'gb-lon', 'manchester': 'gb-man', 'birmingham': 'gb-bir',
  'singapore': 'sg-sin',
  'riyadh': 'sa-ruh', 'jeddah': 'sa-jed', 'dammam': 'sa-dmm',
  'toronto': 'ca-yt', 'vancouver': 'ca-van', 'montreal': 'ca-mtl',
  'sydney': 'au-syd', 'melbourne': 'au-mel', 'brisbane': 'au-bne',
  'kuala-lumpur': 'my-kl', 'penang': 'my-pg',
  'doha': 'qa-doh',
  'berlin': 'de-ber', 'munich': 'de-mun', 'frankfurt': 'de-fra', 'hamburg': 'de-ham',
  'paris': 'fr-par', 'lyon': 'fr-lyo', 'nice': 'fr-nic', 'marseille': 'fr-mar',
  'tokyo': 'jp-tky', 'osaka': 'jp-osk', 'yokohama': 'jp-yok', 'kyoto': 'jp-kyt',
  'seoul': 'kr-sel', 'busan': 'kr-bus', 'incheon': 'kr-inc',
  'bangkok': 'th-bkk', 'phuket': 'th-pkt', 'chiang-mai': 'th-cmi',
  'ho-chi-minh-city': 'vn-hcm', 'hanoi': 'vn-han', 'da-nang': 'vn-dng',
  'sao-paulo': 'br-spo', 'rio-de-janeiro': 'br-rio', 'brasilia': 'br-bsb',
  'mexico-city': 'mx-mex', 'cancun': 'mx-cun', 'guadalajara': 'mx-gdl',
  'istanbul': 'tr-ist', 'ankara': 'tr-ank', 'izmir': 'tr-izm', 'antalya': 'tr-ant',
  'madrid': 'es-mad', 'barcelona': 'es-bcn', 'valencia': 'es-vlc',
  'milan': 'it-mil', 'rome': 'it-rom',
  'cape-town': 'za-cpt', 'johannesburg': 'za-jhb',
  'lagos': 'ng-los', 'abuja': 'ng-abv',
  'cairo': 'eg-cai', 'alexandria': 'eg-alx',
};

export function CityLanding() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const navigate = useNavigate();
  const slug = citySlug?.toLowerCase() || '';

  const cityId = CITY_SLUG_MAP[slug] || slug;
  const cityData = useMemo(() => {
    for (const cities of Object.values(CITIES)) {
      const found = cities.find(c => c.id === cityId || c.name.toLowerCase().replace(/\s+/g, '-') === slug);
      if (found) return found;
    }
    return null;
  }, [cityId, slug]);

  const properties = useMemo(() => getPropertiesByCity(cityId), [cityId]);
  const country = useMemo(() => cityData ? COUNTRIES.find(c => c.code === cityData.countryCode) : null, [cityData]);

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

  if (!cityData || !country) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">City Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">The city you're looking for isn't in our database yet.</p>
          <button onClick={() => navigate('/deal-room')} className="btn-primary text-xs">Browse All Properties</button>
        </div>
      </div>
    );
  }

  const seoTitle = `${cityData.name}, ${country.name} Real Estate — Property Investment Opportunities ${new Date().getFullYear()}`;
  const seoDesc = `Explore ${stats.totalProperties} premium property opportunities in ${cityData.name}, ${country.name}. AI-powered market analysis, ${stats.hotDeals} hot deals, ${stats.preLaunch} pre-launch projects. Commission-only at 3%.`;

  return (
    <>
      <SEOHelmet
        title={`${cityData.name}, ${country.name} Real Estate & Property`}
        description={seoDesc}
        url={`https://terranexus-ai.vercel.app/city/${slug}`}
      />
      <BreadcrumbLD items={[
        { name: 'Home', url: '/' },
        { name: country.name, url: `/country/${country.code.toLowerCase()}` },
        { name: cityData.name, url: `/city/${slug}` },
      ]} />

      <div className="space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-8"
        >
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-gold-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-luxury-gold-500 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
                  {cityData.name}, {country.name} Real Estate
                </h1>
                <p className="text-sm text-gray-400">
                  {getFlag(country.code)} {country.name} · {stats.totalProperties} properties · {formatPrice(cityData.pricePerSqft, country.code)}/sqft avg
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">{seoDesc}</p>
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className={cn('px-2 py-1 rounded-lg text-[10px] font-medium border flex items-center gap-1', cityData.priceTrend > 8 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400')}>
                <TrendingUp className="w-3 h-3" /> {cityData.priceTrend}% Price Growth
              </span>
              <span className="px-2 py-1 rounded-lg bg-luxury-gold-500/10 border-luxury-gold-500/20 text-[10px] font-medium text-luxury-gold-400 flex items-center gap-1">
                <Star className="w-3 h-3" /> {cityData.confidence}% Confidence
              </span>
              <span className="px-2 py-1 rounded-lg bg-blue-500/10 border-blue-500/20 text-[10px] font-medium text-blue-400 flex items-center gap-1">
                <Activity className="w-3 h-3" /> {cityData.absorptionRate}% Absorption
              </span>
              {cityData.tags.map(tag => (
                <span key={tag} className="px-2 py-1 rounded-lg bg-gray-800 border border-gray-700 text-[10px] text-gray-300 capitalize">{tag}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Properties', value: stats.totalProperties, icon: Building2, color: 'text-luxury-gold-400' },
            { label: 'Pipeline Value', value: formatPrice(stats.totalValue, country.code), icon: DollarSign, color: 'text-emerald-400' },
            { label: 'Commission', value: formatPrice(stats.totalCommission, country.code), icon: Target, color: 'text-luxury-gold-400' },
            { label: 'Confidence', value: `${stats.avgConfidence}%`, icon: Star, color: 'text-blue-400' },
            { label: 'Hot Deals', value: stats.hotDeals, icon: Sparkles, color: 'text-red-400' },
            { label: 'Price/Sqft', value: formatPrice(cityData.pricePerSqft, country.code), icon: DollarSign, color: 'text-amber-400' },
            { label: 'Growth', value: `${cityData.priceTrend}%`, icon: TrendingUp, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="premium-card p-3 text-center"
            >
              <stat.icon className={cn('w-3.5 h-3.5 mx-auto mb-1', stat.color)} />
              <p className={cn('text-sm font-bold', stat.color)}>{stat.value}</p>
              <p className="text-[9px] text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Properties */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-luxury-gold-400" />
              <h2 className="text-sm font-bold text-white font-display">Properties in {cityData.name}</h2>
              <span className="px-1.5 py-0.5 rounded-full bg-luxury-gold-500/10 text-[9px] font-medium text-luxury-gold-400">
                {properties.length} properties
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {properties.map((property, i) => (
              <motion.button
                key={property.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => navigate(`/property/${property.slug}`)}
                className="premium-card overflow-hidden text-left group"
              >
                <div className="relative h-32 bg-gray-900">
                  <img src={property.hero_url} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs font-semibold text-white truncate">{property.name}</p>
                    <p className="text-[9px] text-gray-300 truncate">{property.developer_name}</p>
                  </div>
                </div>
                <div className="p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-luxury-gold-400 font-bold">{formatPrice(property.price_min, country.code)}</span>
                    <span className="text-gray-500">{property.property_type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span>{property.min_size_sqft}-{property.max_size_sqft} sqft</span>
                    <span>{property.bedrooms.join('/')} BHK</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-gray-800 overflow-hidden">
                      <div className={cn('h-full rounded-full', property.confidence >= 80 ? 'bg-emerald-500' : 'bg-amber-500')} style={{ width: `${property.confidence}%` }} />
                    </div>
                    <span className="text-[9px] text-gray-400">{property.confidence}%</span>
                  </div>
                  <p className="text-[9px] text-emerald-400 font-medium">Commission: {formatPrice(property.estimated_commission, country.code)}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Market Analysis SEO Content */}
        <div className="premium-card p-6">
          <h2 className="text-sm font-bold text-white font-display mb-3">
            {cityData.name} Real Estate Market Analysis {new Date().getFullYear()}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-gray-400 leading-relaxed">
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Market Overview</h3>
              <p>
                {cityData.name} in {country.name} is a {'strong'}. The average price per sqft is <strong className="text-luxury-gold-400">{formatPrice(cityData.pricePerSqft, country.code)}</strong> 
                {' '}with a price trend of <strong className={cityData.priceTrend > 8 ? 'text-emerald-400' : 'text-amber-400'}>{cityData.priceTrend}%</strong>. 
                Market absorption rate is <strong className="text-blue-400">{cityData.absorptionRate}%</strong>.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Investment Opportunity</h3>
              <p>
                With {stats.totalProperties} active property opportunities and {stats.hotDeals} hot deals, {cityData.name} 
                offers significant potential. The AI confidence score of <strong className="text-luxury-gold-400">{cityData.confidence}%</strong> 
                indicates a {cityData.confidence >= 80 ? 'strong' : 'moderate'} market for investment.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-semibold">Commission Potential</h3>
              <p>
                Total commission opportunity across all tracked properties in {cityData.name} is 
                <strong className="text-emerald-400"> {formatPrice(stats.totalCommission, country.code)}</strong> 
                at a 3% success fee. TerraNexus AI earns only when deals close — no upfront cost.
              </p>
            </div>
          </div>
        </div>

        {/* Nearby Cities */}
        {country && (() => {
          const allCountryCities = CITIES[country.code] || [];
          const nearby = allCountryCities.filter(c => c.id !== cityData.id).slice(0, 6);
          if (nearby.length === 0) return null;
          return (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-luxury-gold-400" />
                <h2 className="text-sm font-bold text-white font-display">Other Cities in {country.name}</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {nearby.map(city => (
                  <motion.button
                    key={city.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate(`/city/${city.name.toLowerCase().replace(/\s+/g, '-')}`)}
                    className="premium-card p-3 text-center hover:border-luxury-gold-500/30 transition-all"
                  >
                    <p className="text-xs font-semibold text-white">{city.name}</p>
                    <p className="text-[9px] text-luxury-gold-400 mt-0.5">{formatPrice(city.pricePerSqft, country.code)}/sqft</p>
                    <p className="text-[9px] text-emerald-400">{city.priceTrend}% growth</p>
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
