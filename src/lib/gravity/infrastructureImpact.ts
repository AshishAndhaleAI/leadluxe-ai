// ============================================================
// LeadLuxe AI — Infrastructure Impact Analysis
// Measures how nearby infrastructure projects affect
// real estate values and investment gravity.
//
// Analyzes:
//   - Metro/transit proximity
//   - Highway/corridor access
//   - Airport connectivity
//   - Active development density
//   - Government project impact
// ============================================================

export interface InfrastructureImpact {
  overallImpactScore: number;        // 0-100
  metroProximityScore: number;       // 0-100
  highwayAccessScore: number;        // 0-100
  airportConnectivityScore: number;  // 0-100
  developmentDensityScore: number;   // 0-100
  governmentProjectBoost: number;    // Percentage boost to nearby values
  keyInfrastructure: string[];
  estimatedValueAcceleration: number; // % additional appreciation from infra
}

interface CityInput {
  id: string;
  name: string;
  activeProjects: number;
  upcomingLaunches: number;
  priceTrend: number;
  averageRoi: number;
  absorptionRate: number;
  tags: string[];
  latitude: number;
  longitude: number;
}

// Known infrastructure projects mapped by city tags
const INFRASTRUCTURE_PROJECTS: Record<string, { name: string; type: string; impact: 'high' | 'medium' | 'low'; completionYear: number }[]> = {
  'in-pun': [
    { name: 'Pune Metro Phase 2', type: 'metro', impact: 'high', completionYear: 2027 },
    { name: 'Mumbai-Pune Expressway Widening', type: 'highway', impact: 'high', completionYear: 2026 },
    { name: 'New Pune International Airport', type: 'airport', impact: 'high', completionYear: 2028 },
    { name: 'Ring Road Project', type: 'highway', impact: 'medium', completionYear: 2027 },
  ],
  'in-mum': [
    { name: 'Mumbai Coastal Road Project', type: 'highway', impact: 'high', completionYear: 2026 },
    { name: 'Mumbai Metro Line 3', type: 'metro', impact: 'high', completionYear: 2026 },
    { name: 'Navi Mumbai International Airport', type: 'airport', impact: 'high', completionYear: 2025 },
    { name: 'Mumbai Trans Harbour Link', type: 'highway', impact: 'high', completionYear: 2025 },
  ],
  'in-blr': [
    { name: 'Namma Metro Phase 2 & 3', type: 'metro', impact: 'high', completionYear: 2027 },
    { name: 'Bengaluru Satellite Town Ring Road', type: 'highway', impact: 'medium', completionYear: 2027 },
    { name: 'Kempegowda Airport Expansion', type: 'airport', impact: 'high', completionYear: 2026 },
  ],
  'in-hyd': [
    { name: 'Hyderabad Metro Phase 2', type: 'metro', impact: 'high', completionYear: 2027 },
    { name: 'Regional Ring Road', type: 'highway', impact: 'medium', completionYear: 2028 },
    { name: 'Hyderabad Airport Expansion', type: 'airport', impact: 'medium', completionYear: 2026 },
  ],
  'ae-dxb': [
    { name: 'Dubai Metro Blue Line', type: 'metro', impact: 'high', completionYear: 2027 },
    { name: 'Al Maktoum International Airport Expansion', type: 'airport', impact: 'high', completionYear: 2028 },
    { name: 'Dubai Urban Master Plan 2040', type: 'government', impact: 'high', completionYear: 2040 },
  ],
  'gb-lon': [
    { name: 'Crossrail 2 (Elizabeth Line Phase 2)', type: 'metro', impact: 'high', completionYear: 2029 },
    { name: 'Thames Tideway Tunnel', type: 'government', impact: 'medium', completionYear: 2025 },
    { name: 'HS2 High Speed Rail', type: 'highway', impact: 'high', completionYear: 2028 },
  ],
  'us-nyc': [
    { name: 'Gateway Program (Hudson Tunnel)', type: 'metro', impact: 'high', completionYear: 2029 },
    { name: 'LaGuardia Airport Modernization', type: 'airport', impact: 'medium', completionYear: 2026 },
    { name: 'Second Avenue Subway Phase 2', type: 'metro', impact: 'high', completionYear: 2028 },
  ],
  'sg-sin': [
    { name: 'Cross Island Line (CRL)', type: 'metro', impact: 'high', completionYear: 2030 },
    { name: 'Changi Airport Terminal 5', type: 'airport', impact: 'high', completionYear: 2030 },
    { name: 'Greater Southern Waterfront', type: 'government', impact: 'high', completionYear: 2035 },
  ],
};

export function computeInfrastructureImpact(city: CityInput): InfrastructureImpact {
  // Find known infrastructure projects for this city
  const projects = INFRASTRUCTURE_PROJECTS[city.id] || [];

  // Score: metro/transit proximity
  const metroProjects = projects.filter(p => p.type === 'metro');
  const metroScore = Math.min(100, Math.round(
    (metroProjects.length * 25) + (metroProjects.some(p => p.impact === 'high') ? 20 : 0)
  ));

  // Score: highway access
  const highwayProjects = projects.filter(p => p.type === 'highway');
  const highwayScore = Math.min(100, Math.round(
    (highwayProjects.length * 20) + (highwayProjects.some(p => p.impact === 'high') ? 15 : 0)
  ));

  // Score: airport connectivity
  const airportProjects = projects.filter(p => p.type === 'airport');
  const airportScore = Math.min(100, Math.round(
    (airportProjects.length * 25) + (airportProjects.some(p => p.impact === 'high') ? 20 : 0)
  ));

  // Score: development density (from active projects + upcoming)
  const densityScore = Math.min(100, Math.round(
    ((city.activeProjects + city.upcomingLaunches) / 200) * 100
  ));

  // Government project boost
  const govProjects = projects.filter(p => p.type === 'government');
  const govBoost = govProjects.reduce((boost, p) => {
    return p.impact === 'high' ? boost + 8 : p.impact === 'medium' ? boost + 4 : boost + 2;
  }, 0);

  // Overall infrastructure impact
  const overallScore = Math.min(100, Math.round(
    (metroScore * 0.25) + (highwayScore * 0.20) + (airportScore * 0.20) + (densityScore * 0.25) + (govBoost * 0.10)
  ));

  // Estimated value acceleration from infrastructure
  const valueAcceleration = Math.round(
    (overallScore / 100) * 4 + // Up to 4% from infra alone
    (govBoost * 0.15) +        // Additional from government projects
    (city.absorptionRate > 70 ? 2 : 0) // Supply constraint boost
  );

  // Key infrastructure 
  const keyInfrastructure = projects
    .filter(p => p.impact === 'high' || p.impact === 'medium')
    .map(p => `${p.name} (${p.type}, est. ${p.completionYear}) — ${p.impact === 'high' ? 'Major impact' : 'Moderate impact'}`);

  return {
    overallImpactScore: overallScore,
    metroProximityScore: metroScore,
    highwayAccessScore: highwayScore,
    airportConnectivityScore: airportScore,
    developmentDensityScore: densityScore,
    governmentProjectBoost: govBoost,
    keyInfrastructure,
    estimatedValueAcceleration: valueAcceleration,
  };
}
