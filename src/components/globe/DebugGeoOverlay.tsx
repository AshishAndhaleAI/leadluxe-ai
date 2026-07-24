// ============================================================
// TerraNexus AI — Debug Geo Overlay
// Toggle: Ctrl + Shift + G
// Shows city name, latitude, longitude, source, verification
// status, and linked projects for every city.
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, MapPin, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CITIES, COUNTRIES } from '../../lib/global-data';
import { VERIFIED_COORDINATES } from '../../lib/geo/GeocodingEngine';
import { formatCoordinate } from '../../lib/geo/CoordinateValidation';

interface CityDebugInfo {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  flag: string;
  latitude: number;
  longitude: number;
  source: string;
  verificationStatus: 'verified' | 'plausible' | 'unverified';
  linkedProjects: number;
}

export function DebugGeoOverlay() {
  const [visible, setVisible] = useState(false);

  // Toggle on Ctrl+Shift+G
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        setVisible(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cities = useMemo((): CityDebugInfo[] => {
    const list: CityDebugInfo[] = [];
    for (const country of COUNTRIES) {
      const countryCities = CITIES[country.code] || [];
      for (const city of countryCities) {
        const isVerified = !!VERIFIED_COORDINATES[city.name];
        list.push({
          id: city.id,
          name: city.name,
          countryCode: country.code,
          countryName: country.name,
          flag: country.flag,
          latitude: city.latitude,
          longitude: city.longitude,
          source: isVerified ? 'TerraNexus Verified' : 'global-data.ts',
          verificationStatus: isVerified ? 'verified' : 'plausible',
          linkedProjects: city.activeProjects,
        });
      }
    }
    // Sort by country then city
    return list.sort((a, b) => a.countryName.localeCompare(b.countryName) || a.name.localeCompare(b.name));
  }, []);

  const verifiedCount = cities.filter(c => c.verificationStatus === 'verified').length;
  const totalCount = cities.length;
  const pctValid = Math.round((verifiedCount / totalCount) * 100);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-96 z-[9999] bg-luxury-black/95 backdrop-blur-xl border-l border-gray-800 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-luxury-gold-400" />
            <span className="text-sm font-semibold text-white">Geo Debug</span>
            <span className={cn(
              'text-[9px] px-1.5 py-0.5 rounded-full',
              pctValid >= 90 ? 'bg-emerald-500/15 text-emerald-400' :
              pctValid >= 70 ? 'bg-amber-500/15 text-amber-400' :
              'bg-red-500/15 text-red-400'
            )}>
              {verifiedCount}/{totalCount} verified
            </span>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-3 gap-px bg-gray-800">
          {[
            { label: 'Total Cities', value: totalCount, color: 'text-white' },
            { label: 'Verified', value: verifiedCount, color: 'text-emerald-400' },
            { label: 'Accuracy', value: `${pctValid}%`, color: 'text-luxury-gold-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-luxury-black/90 px-3 py-2 text-center">
              <p className={cn('text-sm font-bold', stat.color)}>{stat.value}</p>
              <p className="text-[8px] text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-800 bg-gray-900/30">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] text-gray-500">Verified</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] text-gray-500">Plausible</span>
          </div>
          <div className="flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-red-400" />
            <span className="text-[9px] text-gray-500">Unverified</span>
          </div>
        </div>

        {/* City List */}
        <div className="flex-1 overflow-y-auto">
          {cities.map((city) => {
            const StatusIcon = city.verificationStatus === 'verified' ? CheckCircle : 
                         city.verificationStatus === 'plausible' ? AlertTriangle : HelpCircle;
            const iconColor = city.verificationStatus === 'verified' ? 'text-emerald-400' :
                             city.verificationStatus === 'plausible' ? 'text-amber-400' : 'text-red-400';
            
            return (
              <div
                key={city.id}
                className="flex items-start gap-3 px-4 py-2.5 border-b border-gray-900 hover:bg-white/[0.02] transition-colors"
              >
                <StatusIcon className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', iconColor)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{city.flag}</span>
                    <span className="text-xs font-medium text-white">{city.name}</span>
                    <span className="text-[9px] text-gray-600">{city.countryCode}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                    {formatCoordinate(city.latitude, city.longitude)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      'text-[8px] px-1 py-0.5 rounded',
                      city.verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-500' :
                      city.verificationStatus === 'plausible' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-red-500/10 text-red-500'
                    )}>
                      {city.source}
                    </span>
                    <span className="text-[8px] text-gray-600">{city.linkedProjects} projects</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
