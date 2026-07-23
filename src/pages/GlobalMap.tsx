import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Globe, MapPin, TrendingUp, TrendingDown, Activity,
  Building2, Zap, Sparkles, ArrowRight, Search,
  Bot, Star
} from 'lucide-react';
import { cn } from '../lib/utils';

import { COUNTRIES, CITIES, getCitiesByCountry, getCountry, formatGlobalCurrency } from '../lib/global-data';
import type { Country, City } from '../lib/global-data';

type ViewLevel = 'world' | 'country' | 'city';

export function GlobalMap() {
  const navigate = useNavigate();
  const [viewLevel, setViewLevel] = useState<ViewLevel>('world');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeCountries = COUNTRIES.filter(c => c.active);

  const filteredCities = useMemo(() => {
    if (!selectedCountry) return [];
    const cities = getCitiesByCountry(selectedCountry.code);
    if (!searchQuery) return cities;
    const q = searchQuery.toLowerCase();
    return cities.filter(c => c.name.toLowerCase().includes(q));
  }, [selectedCountry, searchQuery]);

  const hotCities = useMemo(() => {
    return Object.values(CITIES).flat()
      .filter(c => c.investorInterest >= 75 || c.confidence >= 85)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Global Market Map</h2>
            <p className="text-sm text-gray-500">
              {viewLevel === 'world' ? 'Explore real estate markets worldwide' :
               viewLevel === 'country' ? `${selectedCountry?.flag} ${selectedCountry?.name}` :
               `${selectedCity?.name} market details`}
            </p>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-1 border border-luxury-border rounded-lg overflow-hidden">
          {(['world', 'country', 'city'] as const).map(v => (
            <button
              key={v}
              onClick={() => { setViewLevel(v); if (v === 'world') { setSelectedCountry(null); setSelectedCity(null); } }}
              disabled={(v === 'country' || v === 'city') && !selectedCountry}
              className={cn(
                'px-3 py-1.5 text-[10px] font-medium transition-colors',
                viewLevel === v ? 'bg-luxury-gold-500/20 text-luxury-gold-400' : 'text-gray-500 hover:text-white',
                ((v === 'country' || v === 'city') && !selectedCountry) ? 'opacity-30 cursor-not-allowed' : ''
              )}
            >
              {v === 'world' ? '🌍 World' : v === 'country' ? '🏛️ Country' : '📍 City'}
            </button>
          ))}
        </div>
      </div>

      {/* World View */}
      {viewLevel === 'world' && (
        <div className="space-y-6">
          {/* Globe Visualization */}
          <div className="premium-card p-8 relative overflow-hidden min-h-[400px]">
            {/* Decorative globe grid */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  radial-gradient(circle at 50% 50%, rgba(212,160,48,0.1) 0%, transparent 60%),
                  repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(212,160,48,0.05) 40px, rgba(212,160,48,0.05) 41px),
                  repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(212,160,48,0.05) 40px, rgba(212,160,48,0.05) 41px)
                `,
              }} />
            </div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white font-display mb-2">Global Real Estate Intelligence</h3>
                <p className="text-sm text-gray-500">{activeCountries.length} countries · {Object.values(CITIES).flat().length} cities tracked</p>
              </div>

              {/* Country Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {activeCountries.map((country, i) => (
                  <motion.button
                    key={country.code}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => { setSelectedCountry(country); setViewLevel('country'); }}
                    className="premium-card p-4 text-center group hover:border-luxury-gold-500/30 transition-all duration-300"
                  >
                    <span className="text-3xl block mb-2">{country.flag}</span>
                    <p className="text-sm font-semibold text-white group-hover:text-luxury-gold-300 transition-colors">{country.name}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{country.currency} · {country.marketTrend === 'rising' ? '📈' : '📊'}</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        country.marketTrend === 'rising' ? 'bg-emerald-400' : 'bg-amber-400'
                      )} />
                      <span className="text-[9px] text-gray-500">{country.marketTrend === 'rising' ? 'Rising' : 'Stable'}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Hot Cities */}
          <div className="premium-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-semibold text-white">🔥 Hot Markets Right Now</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {hotCities.map((city, i) => {
                const country = getCountry(city.countryCode);
                return (
                  <motion.div
                    key={city.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-3 text-center group cursor-pointer hover:border-luxury-gold-500/30"
                    onClick={() => { setSelectedCountry(country || null); setSelectedCity(city); setViewLevel('city'); }}
                  >
                    <p className="text-lg">{country?.flag || '🌍'}</p>
                    <p className="text-sm font-semibold text-white mt-1">{city.name}</p>
                    <p className="text-[10px] text-gray-500">{city.stateCode}, {country?.name}</p>
                    <div className="mt-2 space-y-0.5">
                      <p className="text-xs font-bold text-luxury-gold-400">{city.confidence}% confidence</p>
                      <p className="text-[9px] text-emerald-400">+{city.priceTrend}% trend</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { label: 'Active Countries', value: activeCountries.length, icon: Globe, color: 'text-blue-400' },
              { label: 'Tracked Cities', value: Object.values(CITIES).flat().length, icon: MapPin, color: 'text-emerald-400' },
              { label: 'Hot Markets', value: hotCities.length, icon: Zap, color: 'text-luxury-gold-400' },
              { label: 'Avg Confidence', value: '84%', icon: Activity, color: 'text-amber-400' },
            ].map((stat, i) => (
              <div key={i} className="premium-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={cn('w-4 h-4', stat.color)} />
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Country View */}
      {viewLevel === 'country' && selectedCountry && (
        <div className="space-y-6">
          {/* Country Header */}
          <div className="premium-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{selectedCountry.flag}</span>
              <div>
                <h3 className="text-2xl font-bold text-white font-display">{selectedCountry.name}</h3>
                <p className="text-sm text-gray-500">{selectedCountry.currency} · {selectedCountry.currencySymbol} · {selectedCountry.languages.join(', ')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Cities Tracked', value: getCitiesByCountry(selectedCountry.code).length, icon: MapPin },
                { label: 'Market Trend', value: selectedCountry.marketTrend, icon: selectedCountry.marketTrend === 'rising' ? TrendingUp : Activity },
                { label: 'Confidence', value: `${selectedCountry.confidence}%`, icon: Star },
                { label: 'Active Projects', value: getCitiesByCountry(selectedCountry.code).reduce((s, c) => s + c.activeProjects, 0), icon: Building2 },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-3 text-center">
                  <stat.icon className="w-4 h-4 text-luxury-gold-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search cities in ${selectedCountry.name}...`}
              className="input-glass pl-10"
            />
          </div>

          {/* Cities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCities.map((city, i) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="premium-card p-5 cursor-pointer group"
                onClick={() => { setSelectedCity(city); setViewLevel('city'); }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-base font-semibold text-white group-hover:text-luxury-gold-300 transition-colors">{city.name}</h4>
                    <p className="text-xs text-gray-500">{city.stateCode}, {selectedCountry.name}</p>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-medium',
                    city.confidence >= 85 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                    'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  )}>
                    {city.confidence}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="glass-card p-2 text-center">
                    <p className="text-xs font-bold text-white">₹{city.pricePerSqft.toLocaleString()}</p>
                    <p className="text-[9px] text-gray-500">Price/sqft</p>
                  </div>
                  <div className="glass-card p-2 text-center">
                    <p className={cn('text-xs font-bold', city.priceTrend > 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {city.priceTrend > 0 ? '+' : ''}{city.priceTrend}%
                    </p>
                    <p className="text-[9px] text-gray-500">Trend</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">{city.activeProjects} active projects</span>
                  <span className="text-luxury-gold-400 font-medium">{city.investorInterest}% investor interest</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* City View */}
      {viewLevel === 'city' && selectedCity && (
        <div className="space-y-6">
          {/* City Header */}
          <div className="premium-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-luxury-gold-400" />
                    <h3 className="text-xl font-bold text-white font-display">{selectedCity.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedCity.stateCode}, {getCountry(selectedCity.countryCode)?.name} · {selectedCity.latitude.toFixed(2)}, {selectedCity.longitude.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCity.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-luxury-gold-500/10 text-luxury-gold-400 border border-luxury-gold-500/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Price/sqft', value: `₹${selectedCity.pricePerSqft.toLocaleString()}`, icon: Building2, color: 'text-white' },
                  { label: 'Price Trend', value: `${selectedCity.priceTrend > 0 ? '+' : ''}${selectedCity.priceTrend}%`, icon: selectedCity.priceTrend > 0 ? TrendingUp : TrendingDown, color: selectedCity.priceTrend > 0 ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'Active Projects', value: selectedCity.activeProjects, icon: Activity, color: 'text-blue-400' },
                  { label: 'Upcoming', value: selectedCity.upcomingLaunches, icon: Zap, color: 'text-amber-400' },
                ].map((metric, i) => (
                  <div key={i} className="glass-card p-3">
                    <metric.icon className={cn('w-4 h-4 mb-1', metric.color)} />
                    <p className="text-lg font-bold text-white">{metric.value}</p>
                    <p className="text-[10px] text-gray-500">{metric.label}</p>
                  </div>
                ))}
              </div>

              <div className="divider-gold my-4" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Absorption Rate', value: `${selectedCity.absorptionRate}%`, color: 'text-emerald-400' },
                  { label: 'Avg ROI', value: `${selectedCity.averageRoi}%`, color: 'text-luxury-gold-400' },
                  { label: 'Foreign Demand', value: `${selectedCity.foreignDemand}%`, color: 'text-blue-400' },
                  { label: 'Investor Interest', value: `${selectedCity.investorInterest}%`, color: 'text-amber-400' },
                ].map((metric, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 border border-gray-800">
                    <span className="text-[10px] text-gray-500">{metric.label}</span>
                    <span className={cn('text-xs font-bold', metric.color)}>{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/match')}
              className="btn-primary"
            >
              <Bot className="w-4 h-4" />
              AI Match — Find Properties in {selectedCity.name}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/opportunities?city=${selectedCity.id}`)}
              className="btn-outline"
            >
              <Zap className="w-4 h-4" />
              View Opportunities
            </button>
          </div>

          {/* Map placeholder */}
          <div className="premium-card p-6 text-center min-h-[200px] flex items-center justify-center">
            <div>
              <Globe className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Interactive map at {selectedCity.latitude.toFixed(4)}°N, {Math.abs(selectedCity.longitude).toFixed(4)}°{selectedCity.longitude < 0 ? 'W' : 'E'}
              </p>
              <p className="text-[10px] text-gray-600 mt-1">Full map integration coming soon — showing {selectedCity.activeProjects} tracked projects in this city</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
