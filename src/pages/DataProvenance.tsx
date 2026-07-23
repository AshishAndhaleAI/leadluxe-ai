// ============================================================
// LeadLuxe AI — Data Provenance & Verification Policy
// Explains exactly where LeadLuxe obtains its real-estate data
// and the verification status of every data point.
// ============================================================

import { Shield, ExternalLink, Globe, Building2, Database, FileText, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

const SOURCE_TABLE = [
  { source: 'MahaRERA (Maharashtra)', type: 'Government Portal', url: 'https://maharera.maharashtra.gov.in', coverage: 'Maharashtra, India', status: 'Available' },
  { source: 'Dubai Land Department (DLD)', type: 'Government Portal', url: 'https://www.dubailand.gov.ae', coverage: 'Dubai, UAE', status: 'Available' },
  { source: 'HM Land Registry', type: 'Government Portal', url: 'https://www.gov.uk/government/organisations/land-registry', coverage: 'England & Wales, UK', status: 'Available' },
  { source: 'URA Singapore', type: 'Government Portal', url: 'https://www.ura.gov.sg', coverage: 'Singapore', status: 'Available' },
  { source: 'UK Planning Portal', type: 'Government Portal', url: 'https://www.planningportal.co.uk', coverage: 'United Kingdom', status: 'Available' },
  { source: 'JLL Research', type: 'Institutional Research', url: 'https://www.jll.co.in/en/trends-and-insights/research', coverage: 'Global', status: 'Available' },
  { source: 'CBRE Research', type: 'Institutional Research', url: 'https://www.cbre.com/insights', coverage: 'Global', status: 'Available' },
  { source: 'Knight Frank Research', type: 'Institutional Research', url: 'https://www.knightfrank.com/research', coverage: 'Global', status: 'Available' },
  { source: 'World Bank Open Data', type: 'Macro Data', url: 'https://data.worldbank.org', coverage: 'Global', status: 'Available' },
  { source: 'OpenStreetMap Nominatim', type: 'Geocoding', url: 'https://nominatim.openstreetmap.org', coverage: 'Global', status: 'Available' },
  { source: 'Unsplash Architecture', type: 'Image Library', url: 'https://unsplash.com/search/architecture', coverage: 'Global', status: 'Available' },
];

export function DataProvenance() {
  return (
    <div className="min-h-screen bg-[#03030a] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Data Provenance</h1>
            <p className="text-sm text-gray-500">How LeadLuxe AI obtains, verifies, and presents real-estate intelligence</p>
          </div>
        </div>

        {/* Policy Statement */}
        <div className="premium-card p-6 border-luxury-gold-500/10">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-luxury-gold-400 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-white mb-2">Verification Policy</h2>
              <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
                <p>
                  LeadLuxe AI aggregates publicly available real-estate information from government registries,
                  institutional research, official developer websites, and open data portals. Every data point
                  is attributed to its original source, and we clearly mark whether each record has been
                  independently verified.
                </p>
                <p>
                  <strong className="text-white">We NEVER generate synthetic contact information.</strong> If a developer's
                  phone number, email, or address has not been obtained from a verified source, we display
                  "Not verified" rather than fabricating it.
                </p>
                <p>
                  <strong className="text-white">Coordinates are city or district level</strong> unless a precise
                  parcel-level source is available. Buildings that share a city centroid are displayed there
                  until more precise data is obtained.
                </p>
                <p>
                  Evidence links point to the actual source documents — RERA filings, planning approvals,
                  official project pages, and market reports — allowing users to verify claims independently.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status Guide */}
        <div className="premium-card p-6">
          <h2 className="text-sm font-bold text-white mb-4">Understanding Verification Statuses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { status: 'VERIFIED', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', desc: 'Independently confirmed against a trusted source (government portal, land registry, official company filing).' },
              { status: 'PARTIAL', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', desc: 'Some data points are verified, but not all fields have been confirmed. Buyer diligence recommended.' },
              { status: 'UNVERIFIED', icon: HelpCircle, color: 'text-gray-400', bg: 'bg-gray-800', desc: 'The record exists in our database but has not yet been cross-referenced against a trusted source. Treat these as leads requiring verification.' },
              { status: 'STALE', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', desc: 'Previously verified, but the source has become unavailable or outdated. Historical data is preserved but not featured.' },
            ].map(item => (
              <div key={item.status} className={`flex items-start gap-3 p-3 rounded-xl ${item.bg}`}>
                <item.icon className={`w-4 h-4 ${item.color} mt-0.5 shrink-0`} />
                <div>
                  <p className={`text-xs font-bold ${item.color}`}>{item.status}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div className="premium-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-luxury-gold-400" />
            <h2 className="text-sm font-bold text-white">Trusted Data Sources</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">Source</th>
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">Type</th>
                  <th className="text-left py-2 pr-4 text-gray-500 font-medium">Coverage</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {SOURCE_TABLE.map(row => (
                  <tr key={row.source} className="border-b border-gray-800/50 hover:bg-white/[0.01]">
                    <td className="py-2.5 pr-4">
                      <a href={row.url} target="_blank" rel="noopener noreferrer"
                        className="text-white hover:text-luxury-gold-400 transition-colors flex items-center gap-1.5">
                        <ExternalLink className="w-3 h-3 text-luxury-gold-400 shrink-0" />
                        {row.source}
                      </a>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-400">{row.type}</td>
                    <td className="py-2.5 pr-4 text-gray-400">{row.coverage}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px]">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commission Policy */}
        <div className="premium-card p-6">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-luxury-gold-400 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-white mb-2">Commission Calculation</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                LeadLuxe AI operates on a success-fee model. We only earn commission when a deal closes.
                Estimated commissions are calculated as a percentage of the estimated deal value using
                country-specific rates (India: 3%, UAE: 2.5%, UK: 1.5%, Germany: 3.57%, USA: 2.5%,
                Japan: 3%, Singapore: 2%). These are estimates only — actual commissions are negotiated
                between the platform, the developer, and the client at deal close.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Commission estimates are NOT guarantees. Actual amounts depend on finalized deal value,
                negotiated terms, and applicable local regulations.
              </p>
            </div>
          </div>
        </div>

        {/* Global Coverage */}
        <div className="premium-card p-6">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-luxury-gold-400 mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-white mb-2">Current Global Coverage</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { code: 'IN', name: 'India', cities: 7 },
                  { code: 'AE', name: 'UAE', cities: 2 },
                  { code: 'US', name: 'United States', cities: 5 },
                  { code: 'GB', name: 'United Kingdom', cities: 2 },
                  { code: 'SG', name: 'Singapore', cities: 1 },
                  { code: 'SA', name: 'Saudi Arabia', cities: 2 },
                  { code: 'DE', name: 'Germany', cities: 3 },
                  { code: 'FR', name: 'France', cities: 2 },
                  { code: 'JP', name: 'Japan', cities: 2 },
                  { code: 'KR', name: 'South Korea', cities: 2 },
                  { code: 'TH', name: 'Thailand', cities: 2 },
                  { code: 'VN', name: 'Vietnam', cities: 2 },
                  { code: 'BR', name: 'Brazil', cities: 2 },
                  { code: 'ES', name: 'Spain', cities: 2 },
                  { code: 'IT', name: 'Italy', cities: 2 },
                  { code: 'CA', name: 'Canada', cities: 1 },
                  { code: 'AU', name: 'Australia', cities: 2 },
                  { code: 'MY', name: 'Malaysia', cities: 1 },
                ].map(c => (
                  <div key={c.code} className="flex items-center gap-2 p-2 rounded-lg bg-gray-900/50">
                    <span className="text-sm">{c.name}</span>
                    <span className="text-[10px] text-gray-500">{c.cities} cities</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-600 mt-3">
                Coverage is continuously expanding as we ingest new public data sources.
                If your market is not listed, submit an enterprise inquiry.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-gray-500 leading-relaxed">
              <strong className="text-amber-400">Important Disclaimer:</strong> LeadLuxe AI aggregates
              publicly available information. We do not generate synthetic data, fabricate contacts, or
              invent property details. All records are clearly marked with their verification status.
              Users should independently verify any critical information before making investment decisions.
              Property values, commission estimates, and market scores are AI-generated approximations
              and should not be considered financial advice.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
