import { useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Globe, MapPin, TrendingUp, TrendingDown, Activity,
  Building2, Zap, Sparkles, ArrowRight, Search,
  Star, Layers, Crosshair
} from 'lucide-react';
import { cn } from '../lib/utils';
import { COUNTRIES, CITIES, getCitiesByCountry, getCountry } from '../lib/global-data';
import type { Country, City } from '../lib/global-data';
import { useInvestmentArcs } from '../components/globe/InvestmentArcs';
import { useGlobeCities, formatCityLabel } from '../components/globe/CityClusters';
import { usePropertyHotspots, formatHotspotLabel } from '../components/globe/PropertyHotspots';
import { GlobeControls } from '../components/globe/GlobeControls';
import { InteractiveGlobe } from '../components/globe/Globe3D';

type ViewLevel = 'world' | 'country' | 'city';

export function GlobalMap() {
  const navigate = useNavigate();
  const [viewLevel, setViewLevel] = useState<ViewLevel>('world');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Real geospatial data
  const cities = useGlobeCities();
  const hotspots = usePropertyHotspots(70);
  const arcs = useInvestmentArcs();
  const activeCountries = COUNTRIES.filter(c => c.active);

  // Filtered data
  const filteredCities = useMemo(() => {
    if (!selectedCountry) return [];
    const cs = getCitiesByCountry(selectedCountry.code);
    if (!searchQuery) return cs;
    const q = searchQuery.toLowerCase();
    return cs.filter(c => c.name.toLowerCase().includes(q));
  }, [selectedCountry, searchQuery]);

  const hotCities = useMemo(() => {
    return Object.values(CITIES).flat()
      .filter(c => c.investorInterest >= 75 || c.confidence >= 85)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }, []);

  // Globe event handlers
  const handleGlobeCitySelect = useCallback((cityId: string) => {
    for (const country of COUNTRIES) {
      const cs = CITIES[country.code] || [];
      const found = cs.find(c => c.id === cityId);
      if (found) {
        setSelectedCountry(country);
        setSelectedCity(found);
        setViewLevel('city');
        return;
      }
    }
  }, []);

  const handleGlobeCountrySelect = useCallback((countryCode: string) => {
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      setViewLevel('country');
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    // Find city by name across all countries
    for (const country of COUNTRIES) {
      const cs = CITIES[country.code] || [];
      const found = cs.find(c => c.name.toLowerCase().includes(query.toLowerCase()));
      if (found) {
        setSelectedCountry(country);
        setSelectedCity(found);
        setViewLevel('city');
        return;
      }
    }
  }, []);

  // Stats
  const allCitiesCount = useMemo(() => Object.values(CITIES).flat().length, []);
  const totalProjects = useMemo(() => 
    Object.values(CITIES).flat().reduce((s, c) => s + c.activeProjects, 0), 
  []);
  const avgConfidence = useMemo(() => {
    const all = Object.values(CITIES).flat();
    return all.length > 0 ? Math.round(all.reduce((s, c) => s + c.confidence, 0) / all.length) : 0;
  }, []);

  return (
    <div className={cn('space-y-6', isFullscreen && 'fixed inset-0 z-50 bg-luxury-black')}>
      {/* Header (hidden in fullscreen) */}
      {!isFullscreen && (
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
      )}

      {/* Globe Container */}
      <div ref={containerRef} className={cn('relative overflow-hidden rounded-xl premium-card', isFullscreen ? 'rounded-none h-screen' : 'min-h-[600px]')}>
        {/* Globe Loading Indicator */}
        <div className="absolute top-4 left-4 z-10">
          <GlobeControls
            onReset={() => {
              setViewLevel('world');
              setSelectedCountry(null);
              setSelectedCity(null);
            }}
            onSearch={handleSearch}
            onFullscreen={() => setIsFullscreen(!isFullscreen)}
            isFullscreen={isFullscreen}
            loading={false}
          />
        </div>

        {/* Globe Stats Overlay */}
        {!isFullscreen && (
          <div className="absolute bottom-4 left-4 z-10">
            <div className="flex items-center gap-3 px-3 py-2 bg-luxury-black/80 backdrop-blur-md border border-gray-800 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-luxury-gold-400" />
                <span className="text-[9px] text-gray-400">{activeCountries.length} countries</span>
              </div>
              <div className="w-px h-3 bg-gray-800" />
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] text-gray-400">{allCitiesCount} cities</span>
              </div>
              <div className="w-px h-3 bg-gray-800" />
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-blue-400" />
                <span className="text-[9px] text-gray-400">{totalProjects} projects</span>
              </div>
              <div className="w-px h-3 bg-gray-800" />
              <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-amber-400" />
                <span className="text-[9px] text-gray-400">{avgConfidence}% avg confidence</span>
              </div>
            </div>
          </div>
        )}

        {/* Globe Legend */}
        <div className="absolute bottom-4 right-4 z-10">
          <div className="flex flex-col gap-1.5 px-3 py-2 bg-luxury-black/80 backdrop-blur-md border border-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[9px] text-gray-400">Hot market</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-luxury-gold" />
              <span className="text-[9px] text-gray-400">Active market</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-px bg-amber-500" />
              <span className="text-[9px] text-gray-400">Investment flow</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-emerald-400/30 border border-emerald-400/50" />
              <span className="text-[9px] text-gray-400">Property hotspot</span>
            </div>
          </div>
        </div>

        {/* Globe Canvas — react-globe.gl renders here */}
        <div className={cn('w-full', isFullscreen ? 'h-screen' : 'h-[600px]')}>
          <InteractiveGlobe
            onCitySelect={handleGlobeCitySelect}
            onCountrySelect={handleGlobeCountrySelect}
            onBackToWorld={() => { setViewLevel('world'); setSelectedCountry(null); setSelectedCity(null); }}
          />
        </div>
      </div>

      {/* Data Panels (hidden in fullscreen) */}
      {!isFullscreen && (
        <>
          {/* Hot Cities Panel */}
          {(viewLevel === 'world') && (
            <div className="premium-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-luxury-gold-400" />
                <h3 className="text-sm font-semibold text-white">🔥 Hot Markets Right Now</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {hotCities.slice(0, 10).map((city, i) => {
                  const country = getCountry(city.countryCode);
                  return (
                    <motion.div
                      key={city.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-3 text-center group cursor-pointer hover:border-luxury-gold-500/30 transition-all"
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
          )}

          {/* Country View Data */}
          {(viewLevel === 'country' && selectedCountry) && (
            <CountryPanel 
              country={selectedCountry} 
              onCityClick={(city) => { setSelectedCity(city); setViewLevel('city'); }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {/* City View Data */}
          {(viewLevel === 'city' && selectedCity) && (
            <CityPanel 
              city={selectedCity} 
              onBack={() => setViewLevel('country')} 
              onNavigate={(path) => navigate(path)}
              arcsCount={arcs.filter(a => 
                cities.some(c => c.cityId === selectedCity.id && 
                  (Math.abs(a.startLat - c.lat) < 1 && Math.abs(a.startLng - c.lng) < 1))
              ).length}
              hotspotsCount={hotspots.filter(h =>
                Math.abs(h.lat - selectedCity.latitude) < 1 && 
                Math.abs(h.lng - selectedCity.longitude) < 1
              ).length}
            />
          )}

          {/* Market Stats Summary */}
          {viewLevel === 'world' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { label: 'Active Countries', value: activeCountries.length, icon: Globe, color: 'text-blue-400' },
                { label: 'Tracked Cities', value: allCitiesCount, icon: MapPin, color: 'text-emerald-400' },
                { label: 'Hot Markets', value: hotCities.length, icon: Zap, color: 'text-luxury-gold-400' },
                { label: 'Avg Confidence', value: `${avgConfidence}%`, icon: Activity, color: 'text-amber-400' },
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
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function CountryPanel({ country, onCityClick, searchQuery, onSearchChange }: {
  country: Country;
  onCityClick: (city: City) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  const citiesList = useMemo(() => {
    const cs = getCitiesByCountry(country.code);
    if (!searchQuery) return cs;
    const q = searchQuery.toLowerCase();
    return cs.filter(c => c.name.toLowerCase().includes(q));
  }, [country, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Country Header */}
      <div className="premium-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{country.flag}</span>
          <div>
            <h3 className="text-2xl font-bold text-white font-display">{country.name}</h3>
            <p className="text-sm text-gray-500">{country.currency} · {country.currencySymbol} · {country.languages.join(', ')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Cities Tracked', value: citiesList.length, icon: MapPin },
            { label: 'Market Trend', value: country.marketTrend, icon: country.marketTrend === 'rising' ? TrendingUp : Activity },
            { label: 'Confidence', value: `${country.confidence}%`, icon: Star },
            { label: 'Active Projects', value: citiesList.reduce((s, c) => s + c.activeProjects, 0), icon: Building2 },
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
          onChange={e => onSearchChange(e.target.value)}
          placeholder={`Search cities in ${country.name}...`}
          className="input-glass pl-10"
        />
      </div>

      {/* Cities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {citiesList.map((city, i) => (
          <motion.div
            key={city.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="premium-card p-5 cursor-pointer group"
            onClick={() => onCityClick(city)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-base font-semibold text-white group-hover:text-luxury-gold-300 transition-colors">{city.name}</h4>
                <p className="text-xs text-gray-500">{city.stateCode}, {country.name}</p>
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
  );
}

function CityPanel({ city, onBack, onNavigate, arcsCount, hotspotsCount }: {
  city: City;
  onBack: () => void;
  onNavigate: (path: string) => void;
  arcsCount: number;
  hotspotsCount: number;
}) {
  const country = getCountry(city.countryCode);

  return (
    <div className="space-y-6">
      {/* City Header */}
      <div className="premium-card p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <button onClick={onBack} className="text-[10px] text-gray-500 hover:text-white mb-2 flex items-center gap-1">
                ← Back to {country?.name}
              </button>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-luxury-gold-400" />
                <h3 className="text-xl font-bold text-white font-display">{city.name}</h3>
              </div>
              <p className="text-sm text-gray-500">
                {city.stateCode}, {country?.name} · {city.latitude.toFixed(2)}, {city.longitude.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {city.tags.map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-luxury-gold-500/10 text-luxury-gold-400 border border-luxury-gold-500/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Price/sqft', value: `₹${city.pricePerSqft.toLocaleString()}`, icon: Building2, color: 'text-white' },
              { label: 'Price Trend', value: `${city.priceTrend > 0 ? '+' : ''}${city.priceTrend}%`, icon: city.priceTrend > 0 ? TrendingUp : TrendingDown, color: city.priceTrend > 0 ? 'text-emerald-400' : 'text-red-400' },
              { label: 'Active Projects', value: city.activeProjects, icon: Activity, color: 'text-blue-400' },
              { label: 'Upcoming', value: city.upcomingLaunches, icon: Zap, color: 'text-amber-400' },
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
              { label: 'Absorption Rate', value: `${city.absorptionRate}%`, color: 'text-emerald-400' },
              { label: 'Avg ROI', value: `${city.averageRoi}%`, color: 'text-luxury-gold-400' },
              { label: 'Foreign Demand', value: `${city.foreignDemand}%`, color: 'text-blue-400' },
              { label: 'Investor Interest', value: `${city.investorInterest}%`, color: 'text-amber-400' },
            ].map((metric, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 border border-gray-800">
                <span className="text-[10px] text-gray-500">{metric.label}</span>
                <span className={cn('text-xs font-bold', metric.color)}>{metric.value}</span>
              </div>
            ))}
          </div>

          <div className="divider-gold my-4" />

          {/* Globe-specific metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card p-3 text-center border border-luxury-gold-500/10">
              <Layers className="w-4 h-4 text-luxury-gold-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{city.activeProjects}</p>
              <p className="text-[9px] text-gray-500">Property hotspots on globe</p>
            </div>
            <div className="glass-card p-3 text-center border border-luxury-gold-500/10">
              <Crosshair className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">{arcsCount}</p>
              <p className="text-[9px] text-gray-500">Investment arcs connected</p>
            </div>
            <div className="glass-card p-3 text-center border border-luxury-gold-500/10">
              <MapPin className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-white">
                {city.latitude.toFixed(1)}°{city.latitude >= 0 ? 'N' : 'S'}, {city.longitude.toFixed(1)}°{city.longitude >= 0 ? 'E' : 'W'}
              </p>
              <p className="text-[9px] text-gray-500">Globe coordinates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate('/match')} className="btn-primary">
          <Sparkles className="w-4 h-4" />
          AI Match — Find Properties in {city.name}
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={() => onNavigate(`/opportunities?city=${city.id}`)} className="btn-outline">
          <Zap className="w-4 h-4" />
          View Opportunities
        </button>
      </div>
    </div>
  );
}
