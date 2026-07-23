// ============================================================
// LeadLuxe AI — Globe 3D Entry Point (SSR-safe)
// Provides lazy-loaded globe component with Suspense fallback.
// ============================================================

import { lazy, Suspense } from 'react';
import type { GlobeSceneProps } from './GlobeScene';

const GlobeSceneInner = lazy(() =>
  import('./GlobeScene').then(m => ({ default: m.GlobeScene }))
);

function GlobeFallback() {
  return (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-luxury-black/50 rounded-xl">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading Globe Intelligence...</p>
      </div>
    </div>
  );
}

export function InteractiveGlobe(props: GlobeSceneProps) {
  return (
    <div className="w-full h-full relative" style={{ minHeight: '500px' }}>
      <Suspense fallback={<GlobeFallback />}>
        <GlobeSceneInner {...props} />
      </Suspense>
    </div>
  );
}

// Re-export types and hooks for convenience
export type { GlobeSceneProps } from './GlobeScene';
export { useGlobeCities, formatCityLabel } from './CityClusters';
export { usePropertyHotspots, formatHotspotLabel } from './PropertyHotspots';
export { useInvestmentArcs } from './InvestmentArcs';
export { useCountryData } from './CountryLayer';
export { GlobeScene } from './GlobeScene';
