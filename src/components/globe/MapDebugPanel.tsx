// ============================================================
// TerraNexus AI — Map Debug Panel
// Developer stats overlay for the Global Map page.
// Shows: total projects, verified/unverified locations,
// duplicate coordinates, failed geocodes, last ingestion.
// Toggle with Ctrl+Shift+M
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bug, X, Database, MapPin, CheckCircle, AlertTriangle,
  XCircle, RefreshCw, Globe, Activity, Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface DebugStats {
  totalCountries: number;
  totalCities: number;
  totalProjects: number;
  verifiedLocations: number;
  unverifiedLocations: number;
  duplicateCoordinates: number;
  failedGeocodes: number;
  lastIngestionRun: string | null;
  lastIngestionStatus: string | null;
  avgConfidence: number;
}

export function MapDebugPanel() {
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState<DebugStats>({
    totalCountries: 0,
    totalCities: 0,
    totalProjects: 0,
    verifiedLocations: 0,
    unverifiedLocations: 0,
    duplicateCoordinates: 0,
    failedGeocodes: 0,
    lastIngestionRun: null,
    lastIngestionStatus: null,
    avgConfidence: 0,
  });

  // Toggle on Ctrl+Shift+M
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        setVisible(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute stats on mount
  useEffect(() => {
    async function computeStats() {
      try {
        const { COUNTRIES, CITIES } = await import('../../lib/global-data');
        
        const allCities = Object.values(CITIES).flat();
        const totalProjects = allCities.reduce((s, c) => s + c.activeProjects, 0);
        const avgConf = allCities.length > 0
          ? Math.round(allCities.reduce((s, c) => s + c.confidence, 0) / allCities.length)
          : 0;

        // Check for potential duplicate coordinates
        const coordPairs = allCities.map(c => `${c.latitude.toFixed(2)},${c.longitude.toFixed(2)}`);
        const coordSet = new Set(coordPairs);
        const duplicates = coordPairs.length - coordSet.size;

        setStats({
          totalCountries: COUNTRIES.filter(c => c.active).length,
          totalCities: allCities.length,
          totalProjects,
          verifiedLocations: allCities.filter(c => c.confidence >= 85).length,
          unverifiedLocations: allCities.filter(c => c.confidence < 85).length,
          duplicateCoordinates: duplicates,
          failedGeocodes: 0,
          lastIngestionRun: null,
          lastIngestionStatus: null,
          avgConfidence: avgConf,
        });
      } catch {
        // Silently handle
      }
    }
    computeStats();
  }, []);

  if (!visible) return null;

  const statCards = [
    { label: 'Countries', value: stats.totalCountries, icon: Globe, color: 'text-blue-400' },
    { label: 'Cities', value: stats.totalCities, icon: MapPin, color: 'text-emerald-400' },
    { label: 'Projects', value: stats.totalProjects, icon: Database, color: 'text-luxury-gold-400' },
    { label: 'Verified', value: stats.verifiedLocations, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'Unverified', value: stats.unverifiedLocations, icon: AlertTriangle, color: 'text-amber-400' },
    { label: 'Duplicates', value: stats.duplicateCoordinates, icon: XCircle, color: stats.duplicateCoordinates > 0 ? 'text-red-400' : 'text-gray-600' },
    { label: 'Failed Geo', value: stats.failedGeocodes, icon: XCircle, color: stats.failedGeocodes > 0 ? 'text-red-400' : 'text-gray-600' },
    { label: 'Avg Confidence', value: `${stats.avgConfidence}%`, icon: Activity, color: stats.avgConfidence >= 80 ? 'text-emerald-400' : 'text-amber-400' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-4 z-[9998] max-w-md"
      >
        <div className="bg-luxury-black/95 backdrop-blur-xl border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-luxury-gold-400" />
              <span className="text-sm font-semibold text-white">Map Debug</span>
              <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full">
                Live
              </span>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-px bg-gray-800">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-luxury-black/90 px-2 py-2.5 text-center">
                <stat.icon className={cn('w-3.5 h-3.5 mx-auto mb-1', stat.color)} />
                <p className="text-xs font-bold text-white">{stat.value}</p>
                <p className="text-[7px] text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Ingestion Status */}
          <div className="px-4 py-2.5 border-t border-gray-800 bg-gray-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 text-gray-500" />
                <span className="text-[10px] text-gray-500">
                  {stats.lastIngestionRun
                    ? `Last run: ${stats.lastIngestionRun}`
                    : 'No ingestion runs yet'}
                </span>
              </div>
              {stats.lastIngestionStatus && (
                <span className={cn(
                  'text-[9px] px-1.5 py-0.5 rounded-full',
                  stats.lastIngestionStatus === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                  stats.lastIngestionStatus === 'running' ? 'bg-amber-500/15 text-amber-400' :
                  'bg-red-500/15 text-red-400'
                )}>
                  {stats.lastIngestionStatus}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-2.5 h-2.5 text-gray-600" />
              <span className="text-[8px] text-gray-600">
                Press Ctrl+Shift+M to toggle
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
