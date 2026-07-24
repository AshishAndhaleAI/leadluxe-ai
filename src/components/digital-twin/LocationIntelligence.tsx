// ============================================================
// TerraNexus AI — Location Intelligence
// Layer 2 of the Digital Twin workspace.
// Interactive map with distance matrix showing verified
// location details and proximity to key infrastructure.
// ============================================================

import { MapPin, Navigation, Plane, Train, Building2, GraduationCap, Hospital, TreePalm, Globe, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { LocationIntelligence as LocationIntelligenceType, SourceProvenance } from '../../types/digital-twin';

interface LocationIntelligenceProps {
  location: LocationIntelligenceType;
  developerName: string;
  googleMapsUrl: string;
}

function DistanceCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-900/40 border border-gray-800/50">
      <Icon className={cn('w-4 h-4 shrink-0', color)} />
      <span className="text-[10px] text-gray-400 flex-1">{label}</span>
      <span className="text-[10px] font-medium text-white">{value}</span>
    </div>
  );
}

export function LocationIntelligenceView({ location, developerName, googleMapsUrl }: LocationIntelligenceProps) {
  const dm = location.distanceMatrix;

  return (
    <div className="space-y-6">
      {/* Verified Address */}
      <div className="premium-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Verified Address</h3>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm text-white font-medium">{location.address}</p>
          <p className="text-[10px] text-gray-400">{location.district}, {location.city}, {location.country} — {location.postalCode}</p>
          <div className="flex items-center gap-3 text-[9px] text-gray-600">
            <span>Lat: {location.latitude.toFixed(4)}°</span>
            <span>Lng: {location.longitude.toFixed(4)}°</span>
            {location.parcelNumber && <span>Parcel: {location.parcelNumber}</span>}
          </div>
          {location.zoningClassification && (
            <div className="mt-1 flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-luxury-gold-400" />
              <span className="text-[9px] text-luxury-gold-400">Zoning: {location.zoningClassification}</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-luxury-gold-500/10 text-luxury-gold-400 border border-luxury-gold-500/20 text-[10px] font-medium hover:bg-luxury-gold-500/20 transition-all">
            <Navigation className="w-3 h-3" />
            Open in Google Maps
          </a>
          <span className="text-[7px] text-gray-700 self-center">Verified via {location.provenance.sourceName} on {location.provenance.fetchedAt}</span>
        </div>
      </div>

      {/* Distance Matrix */}
      <div className="premium-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-sm font-semibold text-white">Distance Matrix</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <DistanceCard icon={Plane} label="Airport" value={dm.airport} color="text-blue-400" />
          <DistanceCard icon={Building2} label="CBD" value={dm.cbd} color="text-luxury-gold-400" />
          <DistanceCard icon={Train} label="Metro Station" value={dm.metro} color="text-emerald-400" />
          <DistanceCard icon={GraduationCap} label="International School" value={dm.internationalSchool} color="text-purple-400" />
          <DistanceCard icon={Hospital} label="Hospital" value={dm.hospital} color="text-red-400" />
          {dm.beachWaterfront && <DistanceCard icon={TreePalm} label="Beach/Waterfront" value={dm.beachWaterfront} color="text-cyan-400" />}
          <DistanceCard icon={Building2} label="Business District" value={dm.businessDistrict} color="text-amber-400" />
        </div>
      </div>

      {/* Interactive Map */}
      <div className="premium-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-sm font-semibold text-white">Location Map</h3>
        </div>
        <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-950">
          {/* Static Map SVG */}
          <svg viewBox="0 0 600 256" className="w-full h-full">
            <rect x="0" y="0" width="600" height="256" fill="#0a0a0a" rx="12" />
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <line key={`h${i}`} x1="0" y1={i * 32} x2="600" y2={i * 32} stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
            ))}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <line key={`v${i}`} x1={i * 75} y1="0" x2={i * 75} y2="256" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
            ))}
            {/* Roads */}
            <line x1="0" y1="130" x2="600" y2="130" stroke="rgba(212, 175, 55, 0.15)" strokeWidth="2" />
            <line x1="300" y1="0" x2="300" y2="256" stroke="rgba(212, 175, 55, 0.1)" strokeWidth="1.5" />
            <line x1="100" y1="180" x2="500" y2="70" stroke="rgba(52, 211, 153, 0.15)" strokeWidth="1.5" />
            {/* Property pin */}
            <circle cx="300" cy="130" r="8" fill="rgba(212, 175, 55, 0.9)" />
            <circle cx="300" cy="130" r="14" fill="rgba(212, 175, 55, 0.2)" />
            <text x="315" y="134" fill="#d4a030" fontSize="8" fontWeight="bold">{developerName}</text>
            {/* Airport */}
            <circle cx="500" cy="40" r="5" fill="rgba(96, 165, 250, 0.5)" />
            <text x="470" y="32" fill="rgba(96, 165, 250, 0.6)" fontSize="7">Airport · {dm.airport}</text>
            {/* Metro */}
            <circle cx="80" cy="180" r="4" fill="rgba(52, 211, 153, 0.5)" />
            <text x="40" y="196" fill="rgba(52, 211, 153, 0.6)" fontSize="7">Metro · {dm.metro}</text>
            {/* CBD */}
            <circle cx="150" cy="60" r="4" fill="rgba(212, 175, 55, 0.5)" />
            <text x="100" y="52" fill="rgba(212, 175, 55, 0.6)" fontSize="7">CBD · {dm.cbd}</text>
            {/* Hospital */}
            <circle cx="420" cy="200" r="4" fill="rgba(239, 68, 68, 0.5)" />
            <text x="380" y="216" fill="rgba(239, 68, 68, 0.6)" fontSize="7">Hospital · {dm.hospital}</text>
            {/* School */}
            <circle cx="200" cy="220" r="4" fill="rgba(168, 85, 247, 0.5)" />
            <text x="150" y="240" fill="rgba(168, 85, 247, 0.6)" fontSize="7">School · {dm.internationalSchool}</text>
          </svg>
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2">
            <span className="text-[7px] text-gray-600 bg-black/60 px-2 py-0.5 rounded-full">{location.district}, {location.city}</span>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
              className="text-[7px] text-luxury-gold-400 bg-black/60 px-2 py-0.5 rounded-full hover:bg-black/80 transition-all inline-flex items-center gap-1">
              <ExternalLink className="w-2 h-2" /> Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* Source */}
      <div className="p-2 rounded-lg bg-gray-900/30 border border-gray-800/50">
        <span className="text-[8px] text-gray-600">
          Location data verified via {location.provenance.sourceName} on {location.provenance.fetchedAt} · Confidence: {location.provenance.confidenceScore}%
        </span>
      </div>
    </div>
  );
}
