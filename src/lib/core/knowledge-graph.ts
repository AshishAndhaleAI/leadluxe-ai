// ============================================================
// TerraNexus AI — Knowledge Graph Core
// Links developers, projects, locations, signals, entities
// ============================================================

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  properties: Record<string, any>;
  source: string;
  sourceUrl: string;
  confidence: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type NodeType =
  | 'developer' | 'project' | 'location' | 'company' | 'architect'
  | 'contractor' | 'approval' | 'news' | 'government_record'
  | 'land_parcel' | 'event' | 'person' | 'agency' | 'investment';

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: RelationshipType;
  properties: Record<string, any>;
  confidence: number;
  source: string;
  discoveredAt: string;
}

export type RelationshipType =
  | 'develops' | 'located_in' | 'approved_by' | 'invested_in'
  | 'partners_with' | 'acquired_land' | 'constructed_by'
  | 'designed_by' | 'reported_by' | 'owns' | 'subsidiary_of'
  | 'manages' | 'competes_with' | 'supplies' | 'regulates';

export class KnowledgeGraph {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge[]> = new Map();
  private adjacency: Map<string, Set<string>> = new Map();

  addNode(node: GraphNode): void {
    const existing = this.nodes.get(node.id);
    if (existing) {
      this.nodes.set(node.id, { ...existing, ...node, updatedAt: new Date().toISOString() });
      return;
    }
    this.nodes.set(node.id, node);
    this.adjacency.set(node.id, new Set());
    this.edges.set(node.id, []);
  }

  addEdge(edge: GraphEdge): void {
    const existing = this.edges.get(edge.sourceId) || [];
    const dup = existing.find(e => e.targetId === edge.targetId && e.relationship === edge.relationship);
    if (dup) {
      dup.confidence = Math.max(dup.confidence, edge.confidence);
      dup.properties = { ...dup.properties, ...edge.properties };
      return;
    }
    existing.push(edge);
    this.edges.set(edge.sourceId, existing);
    this.adjacency.get(edge.sourceId)?.add(edge.targetId);
    this.adjacency.get(edge.targetId)?.add(edge.sourceId);
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getEdges(id: string): GraphEdge[] {
    return this.edges.get(id) || [];
  }

  getNeighbors(id: string): GraphNode[] {
    const neighborIds = this.adjacency.get(id);
    if (!neighborIds) return [];
    return Array.from(neighborIds)
      .map(nid => this.nodes.get(nid))
      .filter((n): n is GraphNode => !!n);
  }

  /**
   * Traverse the graph to answer questions like:
   * "What projects does this developer have?"
   * "What signals have been detected for this location?"
   */
  query(startId: string, relationship?: RelationshipType, maxDepth = 3): GraphNode[] {
    const visited = new Set<string>();
    const results: GraphNode[] = [];
    const queue: { id: string; depth: number }[] = [{ id: startId, depth: 0 }];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (visited.has(id) || depth > maxDepth) continue;
      visited.add(id);

      const node = this.nodes.get(id);
      if (node && id !== startId) results.push(node);

      const edges = this.edges.get(id) || [];
      for (const edge of edges) {
        if (relationship && edge.relationship !== relationship) continue;
        const targetId = edge.targetId === id ? edge.sourceId : edge.targetId;
        queue.push({ id: targetId, depth: depth + 1 });
      }
    }

    return results;
  }

  /**
   * Find all nodes matching a type and property filter
   */
  findNodes(type: NodeType, filter?: (node: GraphNode) => boolean): GraphNode[] {
    const results: GraphNode[] = [];
    for (const node of this.nodes.values()) {
      if (node.type === type && (!filter || filter(node))) {
        results.push(node);
      }
    }
    return results;
  }

  /**
   * Count relationships for a node (e.g., how many signals for this developer?)
   */
  countRelationships(id: string, relationship?: RelationshipType): number {
    const edges = this.edges.get(id) || [];
    if (relationship) return edges.filter(e => e.relationship === relationship).length;
    return edges.length;
  }

  /**
   * Get a summary of the graph
   */
  summarize(): { nodeCount: number; edgeCount: number; byType: Record<string, number> } {
    const byType: Record<string, number> = {};
    for (const node of this.nodes.values()) {
      byType[node.type] = (byType[node.type] || 0) + 1;
    }
    let edgeCount = 0;
    for (const edges of this.edges.values()) edgeCount += edges.length;
    return { nodeCount: this.nodes.size, edgeCount, byType };
  }

  /**
   * Export graph as JSON for persistence
   */
  export(): { nodes: GraphNode[]; edges: { sourceId: string; edges: GraphEdge[] }[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.entries()).map(([sourceId, edges]) => ({ sourceId, edges })),
    };
  }

  /**
   * Import graph from JSON
   */
  import(data: { nodes: GraphNode[]; edges: { sourceId: string; edges: GraphEdge[] }[] }): void {
    for (const node of data.nodes) this.nodes.set(node.id, node);
    for (const { sourceId, edges } of data.edges) {
      this.edges.set(sourceId, edges);
      for (const edge of edges) {
        this.adjacency.get(sourceId)?.add(edge.targetId);
        this.adjacency.get(edge.targetId)?.add(sourceId);
      }
    }
  }
}

// Singleton instance
export const knowledgeGraph = new KnowledgeGraph();
