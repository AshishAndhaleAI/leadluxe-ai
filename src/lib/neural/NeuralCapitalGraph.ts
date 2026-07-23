// ============================================================
// Phase 1: Neural Capital Graph
// A graph database layer that models relationships between
// real estate entities across the global market
// ============================================================

import { COUNTRIES, CITIES } from '../global-data';

export type GraphNodeType =
  | 'country' | 'city' | 'district' | 'developer' | 'project'
  | 'investor' | 'infrastructure_asset' | 'airport' | 'metro_station'
  | 'tech_park' | 'sez' | 'university' | 'luxury_retail_zone';

export type GraphEdgeType =
  | 'capital_flow' | 'commuter_flow' | 'supply_dependency'
  | 'developer_relationship' | 'investment_correlation'
  | 'infrastructure_influence' | 'price_spillover';

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  city?: string;
  size: number; // visual size
  color: string; // visual color
  confidence: number;
  opportunityCount: number;
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: GraphEdgeType;
  weight: number;
  confidence: number;
  direction: 'directed' | 'undirected';
  label: string;
  properties: Record<string, any>;
}

export interface GraphVisualizationData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  capitalFlows: { source: string; target: string; value: number; label: string }[];
  hotspots: { nodeId: string; intensity: number; label: string }[];
}

// =====================
// BUILD GRAPH FROM GLOBAL DATA
// =====================
export function buildCapitalGraph(): GraphVisualizationData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const capitalFlows: GraphVisualizationData['capitalFlows'] = [];
  const hotspots: GraphVisualizationData['hotspots'] = [];

  let nodeIdCounter = 0;
  const nodeIds = new Map<string, string>();

  // Add country nodes
  for (const country of COUNTRIES) {
    if (!country.active) continue;
    const id = `node-${nodeIdCounter++}`;
    nodeIds.set(`country-${country.code}`, id);
    const countryCities = CITIES[country.code] || [];
    const avgConfidence = countryCities.length > 0
      ? Math.round(countryCities.reduce((s, c) => s + c.confidence, 0) / countryCities.length)
      : country.confidence;

    nodes.push({
      id,
      type: 'country',
      name: country.name,
      latitude: countryCities[0]?.latitude || 20,
      longitude: countryCities[0]?.longitude || 78,
      country: country.name,
      size: Math.max(15, countryCities.length * 3),
      color: '#D4AF37',
      confidence: avgConfidence,
      opportunityCount: countryCities.reduce((s, c) => s + c.activeProjects, 0),
      properties: { code: country.code, currency: country.currency, flag: country.flag },
    });
  }

  // Add city nodes and edges to their countries
  for (const [countryCode, cities] of Object.entries(CITIES)) {
    const countryNodeId = nodeIds.get(`country-${countryCode}`);
    if (!countryNodeId) continue;

    for (const city of cities) {
      const id = `node-${nodeIdCounter++}`;
      nodeIds.set(`city-${city.id}`, id);

      const isHot = city.confidence >= 85;
      const cityNodes = nodes.filter(n => n.type === 'city');
      const rank = cityNodes.length;

      nodes.push({
        id,
        type: 'city',
        name: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
        country: COUNTRIES.find(c => c.code === countryCode)?.name || 'Unknown',
        size: Math.max(8, Math.min(30, city.activeProjects / 3)),
        color: isHot ? '#F59E0B' : '#6B7280',
        confidence: city.confidence,
        opportunityCount: city.activeProjects + city.upcomingLaunches,
        properties: {
          pricePerSqft: city.pricePerSqft,
          priceTrend: city.priceTrend,
          absorptionRate: city.absorptionRate,
          foreignDemand: city.foreignDemand,
          tags: city.tags,
        },
      });

      // Edge: country → city
      edges.push({
        id: `edge-${nodeIdCounter++}`,
        sourceId: countryNodeId,
        targetId: id,
        type: 'capital_flow',
        weight: city.investorInterest / 100,
        confidence: city.confidence,
        direction: 'directed',
        label: `${city.name} ← ${COUNTRIES.find(c => c.code === countryCode)?.name}`,
        properties: { flowValue: city.investorInterest },
      });

      // Capital flows from high-interest cities
      if (city.foreignDemand > 50) {
        capitalFlows.push({
          source: id,
          target: countryNodeId,
          value: city.foreignDemand,
          label: `${city.name} foreign demand: ${city.foreignDemand}%`,
        });
      }

      // Hotspots for high-confidence cities
      if (city.confidence >= 80) {
        hotspots.push({
          nodeId: id,
          intensity: city.confidence / 100,
          label: `${city.name} — ${city.confidence}% confidence`,
        });
      }

      // Infrastructure influence edges between cities in same country
      for (const otherCity of cities) {
        if (otherCity.id === city.id) continue;
        const otherId = nodeIds.get(`city-${otherCity.id}`);
        if (!otherId) continue;

        const priceCorrelation = Math.abs(city.priceTrend - otherCity.priceTrend) < 3;
        if (priceCorrelation) {
          edges.push({
            id: `edge-${nodeIdCounter++}`,
            sourceId: id,
            targetId: otherId,
            type: 'price_spillover',
            weight: (100 - Math.abs(city.priceTrend - otherCity.priceTrend)) / 100,
            confidence: Math.min(city.confidence, otherCity.confidence),
            direction: 'undirected',
            label: `Price correlation: ${city.name} ↔ ${otherCity.name}`,
            properties: { priceDiff: Math.abs(city.priceTrend - otherCity.priceTrend) },
          });
        }
      }
    }
  }

  // Add infrastructure asset nodes (metro stations, airports near major cities)
  const infraTypes: { type: GraphNodeType; label: string; cities: { name: string; lat: number; lng: number }[] }[] = [
    { type: 'metro_station', label: 'Metro Station', cities: [
      { name: 'Mumbai Metro', lat: 19.076, lng: 72.8777 },
      { name: 'Delhi Metro Hub', lat: 28.7041, lng: 77.1025 },
      { name: 'London Crossrail', lat: 51.5074, lng: -0.1278 },
      { name: 'Dubai Metro', lat: 25.2048, lng: 55.2708 },
      { name: 'Singapore MRT', lat: 1.3521, lng: 103.8198 },
    ]},
    { type: 'airport', label: 'International Airport', cities: [
      { name: 'Dubai International', lat: 25.2532, lng: 55.3657 },
      { name: 'Heathrow', lat: 51.4700, lng: -0.4543 },
      { name: 'Changi', lat: 1.3644, lng: 103.9915 },
      { name: 'Mumbai International', lat: 19.0896, lng: 72.8656 },
      { name: 'Dubai World Central', lat: 24.8968, lng: 55.1625 },
    ]},
  ];

  for (const infra of infraTypes) {
    for (const loc of infra.cities) {
      const id = `node-${nodeIdCounter++}`;
      nodes.push({
        id,
        type: infra.type,
        name: loc.name,
        latitude: loc.lat,
        longitude: loc.lng,
        country: 'Various',
        size: 10,
        color: '#10B981',
        confidence: 85,
        opportunityCount: 0,
        properties: { label: infra.label },
      });

      // Connect infrastructure to nearby cities
      for (const city of Object.values(CITIES).flat()) {
        const cityNodeId = nodeIds.get(`city-${city.id}`);
        if (!cityNodeId) continue;
        const dist = distance(loc.lat, loc.lng, city.latitude, city.longitude);
        if (dist < 100) { // Within 100km
          edges.push({
            id: `edge-${nodeIdCounter++}`,
            sourceId: cityNodeId,
            targetId: id,
            type: 'infrastructure_influence',
            weight: 1 - (dist / 100),
            confidence: 80,
            direction: 'undirected',
            label: `${city.name} ↔ ${loc.name} (${Math.round(dist)}km)`,
            properties: { distance: Math.round(dist) },
          });
        }
      }
    }
  }

  // Sort hotspots by intensity
  hotspots.sort((a, b) => b.intensity - a.intensity);

  return { nodes, edges, capitalFlows, hotspots };
}

// =====================
// FIND PATHS THROUGH THE GRAPH
// =====================
export function findCapitalFlowPaths(
  graph: GraphVisualizationData,
  sourceCityId: string,
  targetCityId: string,
  maxDepth: number = 3
): { path: string[]; totalWeight: number; edges: GraphEdge[] }[] {
  const adjacency = new Map<string, { node: GraphNode; edge: GraphEdge }[]>();

  for (const edge of graph.edges) {
    if (!adjacency.has(edge.sourceId)) adjacency.set(edge.sourceId, []);
    if (!adjacency.has(edge.targetId)) adjacency.set(edge.targetId, []);
    const sourceNode = graph.nodes.find(n => n.id === edge.sourceId);
    const targetNode = graph.nodes.find(n => n.id === edge.targetId);
    if (sourceNode) adjacency.get(edge.sourceId)!.push({ node: targetNode!, edge });
    if (edge.direction === 'undirected' && targetNode) {
      adjacency.get(edge.targetId)!.push({ node: sourceNode!, edge });
    }
  }

  const results: { path: string[]; totalWeight: number; edges: GraphEdge[] }[] = [];
  const visited = new Set<string>();

  function dfs(currentId: string, targetId: string, depth: number, path: string[], edges: GraphEdge[], weight: number) {
    if (depth > maxDepth) return;
    if (currentId === targetId && depth > 0) {
      results.push({ path: [...path], totalWeight: weight / depth, edges: [...edges] });
      return;
    }

    const neighbors = adjacency.get(currentId) || [];
    for (const { node, edge } of neighbors) {
      if (!visited.has(node.id)) {
        visited.add(node.id);
        path.push(node.id);
        edges.push(edge);
        dfs(node.id, targetId, depth + 1, path, edges, weight + edge.weight);
        path.pop();
        edges.pop();
        visited.delete(node.id);
      }
    }
  }

  visited.add(sourceCityId);
  dfs(sourceCityId, targetCityId, 0, [sourceCityId], [], 0);

  return results.sort((a, b) => b.totalWeight - a.totalWeight);
}

// =====================
// HELPER
// =====================
function distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
