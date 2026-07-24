// ============================================================
// TerraNexus AI — Digital Twin Page (Route)
// Loads property by slug and renders the full 7-layer
// Digital Twin research workspace.
// ============================================================

import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { getEnrichedPropertyBySlug, getEnrichedPropertyById } from '../services/property-enrichment';
import { DigitalTwinWorkspace } from '../components/digital-twin/DigitalTwinWorkspace';

export function DigitalTwinPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const property = useMemo(() => {
    if (!slug) return undefined;
    return getEnrichedPropertyBySlug(slug) || getEnrichedPropertyById(slug);
  }, [slug]);

  if (!property) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <Building2 className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Property Not Found</h1>
          <p className="text-sm text-gray-500 mb-6">
            The property you're looking for doesn't exist or the Digital Twin has not been generated yet.
          </p>
          <button onClick={() => navigate('/deal-room')} className="btn-primary">
            Browse Properties
          </button>
        </div>
      </div>
    );
  }

  return <DigitalTwinWorkspace property={property} onBack={() => navigate(-1)} />;
}
