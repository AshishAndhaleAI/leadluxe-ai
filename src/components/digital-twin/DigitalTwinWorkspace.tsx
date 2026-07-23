// ============================================================
// LeadLuxe AI — Digital Twin Workspace
// 7-layer institutional-grade property research workspace.
// Orchestrates all Digital Twin section components.
// ============================================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, MapPin, Palette, Layers, Construction, BarChart3, FileText,
  ChevronLeft, ExternalLink, Shield, Clock, Image as ImageIcon,
  Phone, Mail, Navigation, Star, CheckCircle, Info,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { EnrichedProperty } from '../../services/property-enrichment';
import { PropertyDigitalTwin, VerificationBadge, SourceProvenance } from '../../types/digital-twin';
import { TrustBar } from './TrustBar';
import { ArchitectureTab } from './ArchitectureTab';
import { ConstructionTimeline } from './ConstructionTimeline';
import { InvestmentAnalytics } from './InvestmentAnalytics';
import { LegalEvidenceRoom } from './LegalEvidenceRoom';
import { LocationIntelligenceView } from './LocationIntelligence';
import { generateDigitalTwin } from './twin-generator';

interface DigitalTwinWorkspaceProps {
  property: EnrichedProperty;
  onBack: () => void;
}

// ============================================================
// TAB CONFIGURATION
// ============================================================
const TABS = [
  { id: 'overview', label: 'Overview', icon: Building2 },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'architecture', label: 'Architecture', icon: Palette },
  { id: 'units', label: 'Units', icon: Layers },
  { id: 'construction', label: 'Construction', icon: Construction },
  { id: 'investment', label: 'Investment', icon: BarChart3 },
  { id: 'legal', label: 'Evidence Room', icon: FileText },
] as const;

type TabId = typeof TABS[number]['id'];

// ============================================================
// HERO OVERVIEW
// ============================================================
function HeroOverview({ twin, property }: { twin: PropertyDigitalTwin; property: EnrichedProperty }) {
  const hero = twin.heroCinematic;
  const img = property.curatedImages?.hero_url || property.curatedImages?.images[0]?.url || '';

  return (
    <div className="space-y-6">
      {/* Hero Image */}
      <div className="relative w-full h-72 sm:h-96 rounded-xl overflow-hidden">
        <img src={img} alt={property.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">{property.name}</h1>
            <span className={cn('px-2 py-0.5 rounded-full text-[8px] font-bold border',
              hero.completionPercent >= 90 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
              hero.completionPercent >= 50 ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
              'bg-amber-500/15 text-amber-400 border-amber-500/30'
            )}>
              {hero.completionPercent}% Complete
            </span>
          </div>
          <p className="text-sm text-gray-300">{property.developer_name}</p>
          <p className="text-[10px] text-gray-500">{property.address.street}, {property.address.district}, {property.city}</p>
        </div>
      </div>

      {/* Building Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-3 text-center">
          <Building2 className="w-4 h-4 text-luxury-gold-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{hero.towerHeight}m</p>
          <p className="text-[8px] text-gray-600">Tower Height</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Layers className="w-4 h-4 text-luxury-gold-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{hero.floors}</p>
          <p className="text-[8px] text-gray-600">Floors</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Star className="w-4 h-4 text-luxury-gold-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{hero.architect}</p>
          <p className="text-[8px] text-gray-600">Architect</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Shield className="w-4 h-4 text-luxury-gold-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{hero.sustainabilityRating}</p>
          <p className="text-[8px] text-gray-600">Rating</p>
        </div>
      </div>

      {/* Quick Facts */}
      <div className="premium-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Digital Twin Overview</h3>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {[
            { label: 'Structural Engineer', value: hero.structuralEngineer },
            { label: 'Facade Type', value: hero.facadeType },
            { label: 'Completetion', value: `${hero.completionPercent}%` },
            { label: 'Property Type', value: property.property_type.replace(/_/g, ' ') },
            { label: 'Total Units', value: property.total_units.toString() },
            { label: 'Available', value: property.available_units.toString() },
            { label: 'Developer', value: property.developer_name },
            { label: 'Builder Since', value: property.builder?.yearEstablished?.toString() || 'N/A' },
          ].map((item, i) => (
            <div key={i} className="flex justify-between p-2 rounded-lg bg-gray-900/30">
              <span className="text-gray-500">{item.label}</span>
              <span className="text-white font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Summary */}
      <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-luxury-gold-400" />
          <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Data Trust Summary</h4>
        </div>
        <div className="grid grid-cols-5 gap-2 text-center text-[8px]">
          <div>
            <p className="text-xs font-bold text-emerald-400">{twin.trustSummary.verifiedDataPercent}%</p>
            <p className="text-gray-600">Verified</p>
          </div>
          <div>
            <p className="text-xs font-bold text-luxury-gold-400">{twin.trustSummary.evidenceCount}</p>
            <p className="text-gray-600">Evidence</p>
          </div>
          <div>
            <p className="text-xs font-bold text-purple-400">{twin.trustSummary.governmentSources}</p>
            <p className="text-gray-600">Gov Sources</p>
          </div>
          <div>
            <p className="text-xs font-bold text-blue-400">{twin.trustSummary.mapAccuracy}%</p>
            <p className="text-gray-600">Map Acc</p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400">23 Jul</p>
            <p className="text-gray-600">Verified</p>
          </div>
        </div>
        <p className="text-[7px] text-gray-700 text-center mt-2">
          Values marked UNVERIFIED have not been confirmed from an official source. 
          <a href="/data-provenance" className="text-luxury-gold-400 hover:underline ml-1">Data policy</a>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// UNIT ANALYSIS (Layer 4)
// ============================================================
function UnitAnalysis({ twin }: { twin: PropertyDigitalTwin }) {
  const stack = twin.unitAnalysis;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="premium-card p-4 text-center">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Total Units</p>
          <p className="text-2xl font-bold text-white">{stack.totalUnits}</p>
        </div>
        <div className="premium-card p-4 text-center">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Towers</p>
          <p className="text-2xl font-bold text-white">{stack.towerCount}</p>
        </div>
        <div className="premium-card p-4 text-center">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Unit Mix</p>
          <p className="text-2xl font-bold text-white">{stack.unitMix.length}</p>
          <p className="text-[8px] text-gray-600">configurations</p>
        </div>
      </div>

      {/* Unit Mix */}
      <div className="premium-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Unit Configuration Mix</h3>
        <div className="space-y-2">
          {stack.unitMix.map((mix, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-900/30">
              <span className="text-[10px] font-medium text-white w-20">{mix.type}</span>
              <div className="flex-1 h-3 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-luxury-gold-500/60" style={{ width: `${mix.percentage}%` }} />
              </div>
              <span className="text-[9px] text-gray-400 w-12 text-right">{mix.count} units</span>
              <span className="text-[9px] text-gray-600 w-10 text-right">{mix.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sun Path Summary */}
      <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/50">
        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Sunlight & Orientation</h4>
        <p className="text-[10px] text-gray-400 leading-relaxed">{stack.sunPathSummary}</p>
        {/* Orientation compass */}
        <div className="mt-3 flex justify-center">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <line x1="50" y1="5" x2="50" y2="20" stroke="#d4a030" strokeWidth="1.5" />
              <text x="48" y="8" fill="#d4a030" fontSize="6" textAnchor="middle">N</text>
              <line x1="50" y1="95" x2="50" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <text x="48" y="98" fill="rgba(255,255,255,0.3)" fontSize="6" textAnchor="middle">S</text>
              <line x1="5" y1="50" x2="20" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <text x="2" y="53" fill="rgba(255,255,255,0.3)" fontSize="5">W</text>
              <line x1="95" y1="50" x2="80" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <text x="85" y="53" fill="rgba(255,255,255,0.3)" fontSize="5">E</text>
              {/* Sun arc */}
              <path d="M 20,70 Q 50,20 80,70" fill="none" stroke="rgba(212, 175, 55, 0.15)" strokeWidth="1" strokeDasharray="3 2" />
              <circle cx="50" cy="35" r="4" fill="rgba(212, 175, 55, 0.3)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN WORKSPACE
// ============================================================
export function DigitalTwinWorkspace({ property, onBack }: DigitalTwinWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const twin = useMemo(() => generateDigitalTwin(property), [property]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <HeroOverview twin={twin} property={property} />;
      case 'location':
        return <LocationIntelligenceView location={twin.location} developerName={property.developer_name} googleMapsUrl={property.address.googleMapsUrl} />;
      case 'architecture':
        return <ArchitectureTab architecture={twin.architecture} propertyName={property.name} heroImages={property.curatedImages.images.map(i => i.url)} />;
      case 'units':
        return <UnitAnalysis twin={twin} />;
      case 'construction':
        return <ConstructionTimeline 
          milestones={twin.construction.milestones}
          overallProgress={twin.construction.overallProgress}
          scheduleConfidence={twin.construction.scheduleConfidence}
          contractorName={twin.construction.contractorName}
          contractorRiskScore={twin.construction.contractorRiskScore}
          provenance={twin.construction.provenance}
        />;
      case 'investment':
        return <InvestmentAnalytics investment={twin.investment} propertyName={property.name} city={property.city} priceMin={property.price_min} priceMax={property.price_max} />;
      case 'legal':
        return <LegalEvidenceRoom legal={twin.legal} propertyName={property.name} developerName={property.developer_name} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 border-b border-luxury-border bg-luxury-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-luxury-gold-500/20 flex items-center justify-center">
                  <Building2 className="w-3 h-3 text-luxury-gold-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{property.name}</p>
                  <p className="text-[8px] text-gray-500 truncate">Digital Twin · Institutional Research</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={property.address.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                className="btn-ghost text-[9px] px-2 py-1">
                <ExternalLink className="w-3 h-3" /> Maps
              </a>
              <span className="text-[8px] text-gray-700 border border-gray-800 px-2 py-0.5 rounded-full">
                ID: {property.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <TrustBar
        verifiedDataPercent={twin.trustSummary.verifiedDataPercent}
        lastVerified={twin.trustSummary.lastVerified}
        evidenceCount={twin.trustSummary.evidenceCount}
        governmentSources={twin.trustSummary.governmentSources}
        mapAccuracy={twin.trustSummary.mapAccuracy}
      />

      {/* Tab Navigation */}
      <div className="sticky top-[88px] z-20 bg-luxury-black/80 backdrop-blur-lg border-b border-luxury-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all',
                  activeTab === tab.id
                    ? 'bg-luxury-gold-500/15 text-luxury-gold-400 border border-luxury-gold-500/30 shadow-lg shadow-luxury-gold-500/5'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
                )}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="border-t border-luxury-border mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-luxury-gold-500/20 flex items-center justify-center">
                <Building2 className="w-2.5 h-2.5 text-luxury-gold-400" />
              </div>
              <span className="text-[10px] font-semibold text-white">LeadLuxe AI</span>
              <span className="text-[8px] text-gray-700">· Digital Twin Research · {property.name}</span>
            </div>
            <p className="text-[8px] text-gray-700">© 2026 LeadLuxe AI. Research-grade data — verify independently before investment.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
