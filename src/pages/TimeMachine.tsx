import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, TrendingDown, Globe, MapPin, Zap, ArrowRight, Sparkles, Activity } from 'lucide-react';
import { generateTimeSnapshot, generateAllSnapshots, getCapitalShift, AVAILABLE_YEARS } from '../lib/neural';
import { cn } from '../lib/utils';

export function TimeMachine() {
  const [selectedYearIndex, setSelectedYearIndex] = useState(2); // Default to current (2025)

  const snapshots = useMemo(() => generateAllSnapshots(), []);
  const currentSnapshot = snapshots[selectedYearIndex];

  const shift = useMemo(() => {
    if (selectedYearIndex === 0) return null;
    return getCapitalShift(snapshots[selectedYearIndex - 1], snapshots[selectedYearIndex]);
  }, [selectedYearIndex, snapshots]);

  const isPast = selectedYearIndex < 2;
  const isFuture = selectedYearIndex > 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Time Machine</h2>
            <p className="text-sm text-gray-500">Slide through time to see capital shift across global markets</p>
          </div>
        </div>
      </div>

      {/* Year Slider */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {AVAILABLE_YEARS.map((y, i) => (
              <button
                key={y.year}
                onClick={() => setSelectedYearIndex(i)}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-medium transition-all border',
                  selectedYearIndex === i
                    ? 'bg-luxury-gold-500/15 text-luxury-gold-400 border-luxury-gold-500/30'
                    : 'bg-white/5 text-gray-400 border-luxury-border hover:text-white'
                )}
              >
                <span className="block text-sm font-bold">{y.year}</span>
                <span className="text-[8px] opacity-70">{y.label}</span>
              </button>
            ))}
          </div>
          <div className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium',
            isPast ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
            isFuture ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            'bg-luxury-gold-500/10 text-luxury-gold-400 border border-luxury-gold-500/20'
          )}>
            {currentSnapshot.label}
          </div>
        </div>

        {/* Timeline bar */}
        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-luxury-gold-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${((selectedYearIndex + 1) / AVAILABLE_YEARS.length) * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-luxury-gold-400 border-2 border-luxury-black shadow-lg shadow-luxury-gold-500/30 transition-all duration-300"
            style={{ left: `calc(${(selectedYearIndex / (AVAILABLE_YEARS.length - 1)) * 100}% - 10px)` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* City Rankings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="premium-card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-luxury-gold-400" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  City Rankings — {currentSnapshot.year}
                </h3>
              </div>
            </div>

            <div className="space-y-1.5">
              <AnimatePresence mode="wait">
                {currentSnapshot.cityRankings.slice(0, 15).map((city, i) => (
                  <motion.div
                    key={`${city.cityId}-${currentSnapshot.year}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className={cn(
                      'w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold',
                      i === 0 ? 'bg-luxury-gold-500/20 text-luxury-gold-400' :
                      i < 3 ? 'bg-amber-500/10 text-amber-400' :
                      i < 5 ? 'bg-blue-500/10 text-blue-400' :
                      'bg-gray-800 text-gray-500'
                    )}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{city.cityName}</p>
                      <p className="text-[9px] text-gray-500">{city.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-400">{city.score}</p>
                      <p className="text-[8px] text-gray-600">score</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Capital Shifts */}
          {shift && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="premium-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Gaining Capital</h3>
                </div>
                <div className="space-y-1.5">
                  {shift.citiesGaining.slice(0, 5).map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between p-1.5 rounded-lg bg-white/[0.02]">
                      <span className="text-xs text-gray-300">{c.name}</span>
                      <span className="text-[10px] font-medium text-emerald-400">+{c.delta}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="premium-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Losing Capital</h3>
                </div>
                <div className="space-y-1.5">
                  {shift.citiesLosing.slice(0, 5).map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between p-1.5 rounded-lg bg-white/[0.02]">
                      <span className="text-xs text-gray-300">{c.name}</span>
                      <span className="text-[10px] font-medium text-red-400">{c.delta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Emerging Hotspots */}
          <div className="premium-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Emerging Hotspots</h3>
            </div>
            <div className="space-y-1.5">
              {currentSnapshot.emergingHotspots.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No hotspots emerging in this period</p>
              ) : (
                currentSnapshot.emergingHotspots.map((city, i) => (
                  <div key={city} className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-500/5">
                    <Activity className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-xs text-gray-300">{city}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cooling Markets */}
          <div className="premium-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Cooling Markets</h3>
            </div>
            <div className="space-y-1.5">
              {currentSnapshot.coolingMarkets.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No cooling markets identified</p>
              ) : (
                currentSnapshot.coolingMarkets.map(city => (
                  <div key={city} className="flex items-center gap-2 p-1.5 rounded-lg bg-red-500/5">
                    <TrendingDown className="w-3 h-3 text-red-400 shrink-0" />
                    <span className="text-xs text-gray-300">{city}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Growth Corridors */}
          <div className="premium-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Growth Corridors</h3>
            </div>
            <div className="space-y-1.5">
              {currentSnapshot.growthCorridors.map((corridor, i) => (
                <div key={corridor} className="flex items-center gap-2 p-1.5 rounded-lg bg-luxury-gold-500/5">
                  <ArrowRight className="w-3 h-3 text-luxury-gold-400 shrink-0" />
                  <span className="text-[10px] text-gray-300">{corridor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Currency Zones */}
          <div className="premium-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Currency-Adjusted Zones</h3>
            </div>
            <div className="space-y-1.5">
              {currentSnapshot.currencyAdjustedZones.map(zone => (
                <div key={zone} className="flex items-center gap-2 p-1.5 rounded-lg bg-blue-500/5">
                  <span className="text-[10px] text-gray-300">{zone}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
