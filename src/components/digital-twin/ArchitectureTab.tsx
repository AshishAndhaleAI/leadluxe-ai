// ============================================================
// LeadLuxe AI — Architecture & Building Design Tab
// Layer 3 of the Digital Twin workspace.
// Shows design philosophy, facade materials, gallery, specs.
// ============================================================

import { Building2, Ruler, Palette, Wind, Sun, Shield, Star, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ArchitectureProfile } from '../../types/digital-twin';

interface ArchitectureTabProps {
  architecture: ArchitectureProfile;
  propertyName: string;
  heroImages: string[];
}

function SpecRow({ label, value, icon: Icon }: { label: string; value: string | number; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-900/40 border border-gray-800/50">
      {Icon && <Icon className="w-3.5 h-3.5 text-luxury-gold-400 shrink-0" />}
      <span className="text-[10px] text-gray-500">{label}</span>
      <span className="text-[10px] font-medium text-white ml-auto">{value}</span>
    </div>
  );
}

function SourceBadge({ provenance }: { provenance: { sourceName: string; verificationStatus: string } }) {
  const statusColor = {
    VERIFIED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PARTIAL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    UNVERIFIED: 'bg-gray-800 text-gray-500 border-gray-700',
    STALE: 'bg-red-500/10 text-red-400 border-red-500/20',
  }[provenance.verificationStatus] || 'bg-gray-800 text-gray-500 border-gray-700';

  return (
    <div className="flex items-center gap-2 mt-4 p-2 rounded-lg bg-gray-900/30 border border-gray-800/50">
      <div className="flex items-center gap-1.5 text-[8px] text-gray-600">
        <span className={cn('px-1.5 py-0.5 rounded-full border text-[7px]', statusColor)}>
          {provenance.verificationStatus}
        </span>
        <span>via {provenance.sourceName}</span>
      </div>
    </div>
  );
}

export function ArchitectureTab({ architecture, propertyName, heroImages }: ArchitectureTabProps) {
  const materials = architecture.facadeMaterials || [];
  const galleryImages = heroImages.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Design Philosophy */}
      <div className="premium-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-sm font-semibold text-white">Design Philosophy</h3>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{architecture.designPhilosophy}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-luxury-gold-500/10 text-luxury-gold-400 border border-luxury-gold-500/20">
            {architecture.architecturalStyle}
          </span>
          {architecture.sustainabilityRating && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {architecture.sustainabilityRating.system} {architecture.sustainabilityRating.level}
            </span>
          )}
        </div>
        <SourceBadge provenance={architecture.provenance} />
      </div>

      {/* Architect & Team */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="premium-card p-4">
          <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-2">Architect</p>
          <p className="text-sm font-semibold text-white">{architecture.architect}</p>
          {architecture.architectWebsite && (
            <a href={architecture.architectWebsite} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-luxury-gold-400 hover:underline mt-1">
              <ExternalLink className="w-3 h-3" /> Website
            </a>
          )}
        </div>
        <div className="premium-card p-4">
          <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-2">Landscape Architect</p>
          <p className="text-sm font-semibold text-white">{architecture.landscapeArchitect || 'Not verified'}</p>
        </div>
        <div className="premium-card p-4">
          <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-2">Structural Engineer</p>
          <p className="text-sm font-semibold text-white">{architecture.structuralEngineer || 'Not verified'}</p>
        </div>
        <div className="premium-card p-4">
          <p className="text-[9px] text-gray-600 uppercase tracking-wider mb-2">Interior Designer</p>
          <p className="text-sm font-semibold text-white">{architecture.interiorDesigner || 'Not verified'}</p>
        </div>
      </div>

      {/* Building Specifications */}
      <div className="premium-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Ruler className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-sm font-semibold text-white">Building Specifications</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <SpecRow label="Building Height" value={`${architecture.buildingHeight}m`} icon={Ruler} />
          <SpecRow label="Total Floors" value={architecture.totalFloors} icon={Building2} />
          <SpecRow label="Floor Height" value={`${architecture.typicalFloorHeight}m`} icon={Ruler} />
          <SpecRow label="Seismic Design" value={architecture.seismicDesignCategory || 'N/A'} icon={Shield} />
          <SpecRow label="Wind Load" value={architecture.windLoadDesign || 'N/A'} icon={Wind} />
          {architecture.sustainabilityRating && (
            <SpecRow label="Sustainability" value={`${architecture.sustainabilityRating.system} ${architecture.sustainabilityRating.level}`} icon={Star} />
          )}
        </div>
        <SourceBadge provenance={architecture.provenance} />
      </div>

      {/* Facade & Materials */}
      <div className="premium-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-sm font-semibold text-white">Facade & Materials</h3>
        </div>
        {materials.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {materials.map((mat, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-gray-900/40 border border-gray-800 text-[10px] text-gray-300">
                {mat}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-gray-600 italic">Material information not yet verified from official sources.</p>
        )}
        {architecture.balconySystem && (
          <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-gray-900/30 border border-gray-800/50">
            <span className="text-[10px] text-gray-500">Balcony System:</span>
            <span className="text-[10px] font-medium text-white">{architecture.balconySystem}</span>
          </div>
        )}
        {architecture.shadingStrategy && (
          <div className="flex items-center gap-2 mt-1 p-2 rounded-lg bg-gray-900/30 border border-gray-800/50">
            <Sun className="w-3 h-3 text-luxury-gold-400" />
            <span className="text-[10px] text-gray-500">Shading Strategy:</span>
            <span className="text-[10px] font-medium text-white">{architecture.shadingStrategy}</span>
          </div>
        )}
      </div>

      {/* Image Gallery */}
      {galleryImages.length > 0 && (
        <div className="premium-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-4 h-4 text-luxury-gold-400" />
            <h3 className="text-sm font-semibold text-white">Design Gallery</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {galleryImages.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer"
              >
                <img
                  src={url}
                  alt={`${propertyName} — Design view ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Downloadable Documents */}
      <div className="premium-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-sm font-semibold text-white">Downloads</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['Brochure PDF', 'Floor Plan', 'Masterplan', 'Elevation Sheets'].map((doc, i) => (
            <button
              key={i}
              disabled
              className="p-3 rounded-lg bg-gray-900/30 border border-gray-800/50 text-[9px] text-gray-600 text-center cursor-not-allowed hover:bg-gray-900/50 transition-colors"
            >
              <div className="w-6 h-6 mx-auto mb-1 rounded bg-gray-800 flex items-center justify-center">
                <ImageIcon className="w-3 h-3 text-gray-700" />
              </div>
              {doc}
              <span className="block text-[7px] text-gray-700 mt-0.5">Pending verification</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
