// ============================================================
// LeadLuxe AI — Autonomous Agent Framework
// 10 specialized agents with shared message bus
// ============================================================

import { knowledgeGraph, type GraphNode, type RelationshipType } from '../core/knowledge-graph';
import { memorySystem } from '../core/memory';

// =====================
// MESSAGE BUS
// =====================
export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: MessageType;
  payload: any;
  timestamp: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  sourceEntityId?: string;
}

export type MessageType =
  | 'entity_discovered'
  | 'entity_verified'
  | 'signal_detected'
  | 'opportunity_evaluated'
  | 'recommendation_ready'
  | 'commission_calculated'
  | 'learning_update'
  | 'scheduler_tick'
  | 'error'
  | 'status';

// =====================
// BASE AGENT
// =====================
export abstract class Agent {
  public id: string;
  public name: string;
  protected inbox: AgentMessage[] = [];
  protected outbox: AgentMessage[] = [];
  protected status: 'idle' | 'working' | 'error' = 'idle';
  protected lastRunAt: string | null = null;
  protected runCount = 0;
  protected errorCount = 0;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  abstract execute(): Promise<void>;

  async receive(message: AgentMessage): Promise<void> {
    this.inbox.push(message);
    await this.processMessage(message);
  }

  protected async processMessage(_message: AgentMessage): Promise<void> {
    // Override in subclasses
  }

  protected send(to: string, type: MessageType, payload: any, priority: AgentMessage['priority'] = 'medium', sourceEntityId?: string): void {
    this.outbox.push({
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      from: this.id,
      to,
      type,
      payload,
      timestamp: new Date().toISOString(),
      priority,
      sourceEntityId,
    });
  }

  protected log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const prefix = `[${this.name}] ${level.toUpperCase()}:`;
    if (level === 'error') {
      console.error(prefix, message, data || '');
      this.errorCount++;
    } else if (level === 'warn') {
      console.warn(prefix, message, data || '');
    } else {
      console.log(prefix, message, data || '');
    }
  }

  getStatus(): { id: string; name: string; status: string; lastRun: string | null; runCount: number; errorCount: number; inboxSize: number } {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      lastRun: this.lastRunAt,
      runCount: this.runCount,
      errorCount: this.errorCount,
      inboxSize: this.inbox.length,
    };
  }

  drainOutbox(): AgentMessage[] {
    const messages = [...this.outbox];
    this.outbox = [];
    return messages;
  }
}

// =====================
// 1. RESEARCH AGENT
// =====================
export class ResearchAgent extends Agent {
  constructor() { super('agent-research', 'Research Agent'); }

  async execute(): Promise<void> {
    this.status = 'working';
    this.lastRunAt = new Date().toISOString();
    this.runCount++;

    try {
      // Check inbox for entities to research
      for (const msg of this.inbox) {
        if (msg.type === 'entity_discovered') {
          await this.researchEntity(msg.payload);
        }
      }

      // Periodic: scan for new developers/projects
      await this.scanForNewEntities();

      this.status = 'idle';
    } catch (err: any) {
      this.log('error', 'Research failed', err.message);
      this.status = 'error';
    }
  }

  private async researchEntity(entity: any): Promise<void> {
    this.log('info', `Researching entity: ${entity.name || entity.url}`);

    // Store research in knowledge graph
    knowledgeGraph.addNode({
      id: `research-${Date.now()}`,
      type: 'event',
      label: `Research: ${entity.name || 'New Entity'}`,
      properties: { entity, researchDepth: 'initial' },
      source: entity.sourceUrl || 'internal',
      sourceUrl: entity.sourceUrl || '',
      confidence: entity.confidence || 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.send('agent-entity-resolution', 'entity_discovered', entity, 'high');
  }

  private async scanForNewEntities(): Promise<void> {
    // Scans knowledge graph for entities needing deeper research
    const entities = knowledgeGraph.findNodes('developer');
    this.log('info', `Scan complete: ${entities.length} developers in graph`);
  }

  async processMessage(message: AgentMessage): Promise<void> {
    if (message.type === 'scheduler_tick') {
      await this.execute();
    }
  }
}

// =====================
// 2. VERIFICATION AGENT
// =====================
export class VerificationAgent extends Agent {
  constructor() { super('agent-verification', 'Verification Agent'); }

  async execute(): Promise<void> {
    this.status = 'working';
    this.lastRunAt = new Date().toISOString();
    this.runCount++;

    try {
      for (const msg of this.inbox) {
        if (msg.type === 'entity_discovered') {
          await this.verifyEntity(msg.payload);
        }
      }

      // Verify existing low-confidence entities
      await this.verifyLowConfidence();

      this.status = 'idle';
    } catch (err: any) {
      this.log('error', 'Verification failed', err.message);
      this.status = 'error';
    }
  }

  private async verifyEntity(entity: any): Promise<number> {
    const confidence = this.calculateVerificationConfidence(entity);
    this.log('info', `Verified ${entity.name || 'entity'} with confidence ${confidence}%`);

    // Update knowledge graph
    const node = knowledgeGraph.getNode(entity.id);
    if (node) {
      knowledgeGraph.addNode({ ...node, confidence: Math.max(node.confidence, confidence) });
    }

    return confidence;
  }

  private calculateVerificationConfidence(entity: any): number {
    let score = 50;
    if (entity.sourceUrl) score += 15;
    if (entity.sourceUrl?.startsWith('https://')) score += 10;
    if (entity.description) score += 10;
    if (entity.name && entity.name.length > 2) score += 5;
    if (entity.multipleSources) score += 10;
    return Math.min(score, 100);
  }

  private async verifyLowConfidence(): Promise<void> {
    const lowConf = knowledgeGraph.findNodes('developer', n => (n.confidence || 0) < 40);
    for (const node of lowConf.slice(0, 10)) {
      this.send('agent-research', 'entity_discovered', node, 'low', node.id);
    }
    this.log('info', `Flagged ${lowConf.length} low-confidence entities for re-verification`); 
  }

  async processMessage(message: AgentMessage): Promise<void> {
    if (message.type === 'scheduler_tick') await this.execute();
    else await super.processMessage(message);
  }
}

// =====================
// 3. ENTITY RESOLUTION AGENT
// =====================
export class EntityResolutionAgent extends Agent {
  constructor() { super('agent-entity-resolution', 'Entity Resolution Agent'); }

  async execute(): Promise<void> {
    this.status = 'working';
    this.lastRunAt = new Date().toISOString();
    this.runCount++;

    try {
      for (const msg of this.inbox) {
        if (msg.type === 'entity_discovered') {
          await this.resolveEntity(msg.payload);
        }
      }

      this.status = 'idle';
    } catch (err: any) {
      this.log('error', 'Entity resolution failed', err.message);
      this.status = 'error';
    }
  }

  private async resolveEntity(entity: any): Promise<void> {
    this.log('info', `Resolving entity: ${entity.name || 'Unknown'}`);

    // Check for duplicate entities
    const existing = knowledgeGraph.findNodes('developer', n =>
      n.label.toLowerCase().includes((entity.name || '').toLowerCase())
    );

    if (existing.length > 0) {
      // Merge if high confidence match
      const target = existing[0];
      knowledgeGraph.addEdge({
        id: `edge-${Date.now()}`,
        sourceId: entity.id,
        targetId: target.id,
        relationship: entity.relationship || 'partners_with',
        properties: { merged: true, mergedAt: new Date().toISOString() },
        confidence: entity.confidence || 50,
        source: entity.sourceUrl || 'unknown',
        discoveredAt: new Date().toISOString(),
      });
      this.log('info', `Linked entity to existing: ${target.label}`);
    } else {
      // Create new entity node
      knowledgeGraph.addNode({
        id: entity.id || `entity-${Date.now()}`,
        type: entity.entityType || 'developer',
        label: entity.name || 'Unknown Entity',
        properties: entity,
        source: entity.sourceUrl || 'unknown',
        sourceUrl: entity.sourceUrl || '',
        confidence: entity.confidence || 50,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    this.send('agent-project-detection', 'entity_discovered', entity, 'medium');
  }

  async processMessage(message: AgentMessage): Promise<void> {
    if (message.type === 'scheduler_tick') await this.execute();
    else await super.processMessage(message);
  }
}

// =====================
// 4. PROJECT DETECTION AGENT
// =====================
export class ProjectDetectionAgent extends Agent {
  constructor() { super('agent-project-detection', 'Project Detection Agent'); }

  async execute(): Promise<void> {
    this.status = 'working';
    this.lastRunAt = new Date().toISOString();
    this.runCount++;

    try {
      for (const msg of this.inbox) {
        if (msg.type === 'entity_discovered') {
          await this.detectProjects(msg.payload);
        }
      }

      this.status = 'idle';
    } catch (err: any) {
      this.log('error', 'Project detection failed', err.message);
      this.status = 'error';
    }
  }

  private async detectProjects(entity: any): Promise<void> {
    this.log('info', `Checking for projects related to: ${entity.name}`);

    // Search knowledge graph for project signals
    const signals = knowledgeGraph.findNodes('approval', n =>
      n.properties.developerName?.toLowerCase().includes((entity.name || '').toLowerCase())
    );

    if (signals.length > 0) {
      for (const signal of signals) {
        // Create project node
        knowledgeGraph.addNode({
          id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'project',
          label: `Project: ${signal.properties.projectName || 'Unknown'}`,
          properties: { ...signal.properties, detectedBy: this.name },
          source: signal.source,
          sourceUrl: signal.sourceUrl,
          confidence: signal.confidence,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Link developer to project
        knowledgeGraph.addEdge({
          id: `edge-develops-${Date.now()}`,
          sourceId: entity.id,
          targetId: signal.id,
          relationship: 'develops',
          properties: { detectedAt: new Date().toISOString() },
          confidence: signal.confidence,
          source: signal.source,
          discoveredAt: new Date().toISOString(),
        });
      }
      this.log('info', `Detected ${signals.length} projects for ${entity.name}`);
    }

    this.send('agent-market-intelligence', 'entity_discovered', entity, 'low');
  }

  async processMessage(message: AgentMessage): Promise<void> {
    if (message.type === 'scheduler_tick') await this.execute();
    else await super.processMessage(message);
  }
}

// =====================
// 5. MARKET INTELLIGENCE AGENT
// =====================
export class MarketIntelligenceAgent extends Agent {
  constructor() { super('agent-market-intelligence', 'Market Intelligence Agent'); }

  async execute(): Promise<void> {
    this.status = 'working';
    this.lastRunAt = new Date().toISOString();
    this.runCount++;

    try {
      for (const msg of this.inbox) {
        if (msg.type === 'entity_discovered') {
          await this.analyzeMarket(msg.payload);
        }
      }

      this.status = 'idle';
    } catch (err: any) {
      this.log('error', 'Market analysis failed', err.message);
      this.status = 'error';
    }
  }

  private async analyzeMarket(entity: any): Promise<void> {
    this.log('info', `Analyzing market position for: ${entity.name}`);

    // Collect market signals
    const approvals = knowledgeGraph.findNodes('approval');
    const competitors = knowledgeGraph.findNodes('developer', n => n.id !== entity.id);

    knowledgeGraph.addNode({
      id: `market-analysis-${Date.now()}`,
      type: 'event',
      label: `Market Analysis: ${entity.name}`,
      properties: {
        entityName: entity.name,
        totalApprovals: approvals.length,
        competitors: competitors.length,
        marketPosition: this.estimateMarketPosition(entity, competitors),
        analyzedAt: new Date().toISOString(),
      },
      source: 'internal',
      sourceUrl: '',
      confidence: 70,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.log('info', `Market analysis complete for ${entity.name}`);
  }

  private estimateMarketPosition(entity: any, competitors: GraphNode[]): string {
    const competitorCount = competitors.length;
    if (competitorCount > 50) return 'fragmented market';
    if (competitorCount > 20) return 'consolidating market';
    if (competitorCount > 5) return 'concentrated market';
    return 'dominant position';
  }

  async processMessage(message: AgentMessage): Promise<void> {
    if (message.type === 'scheduler_tick') await this.execute();
    else await super.processMessage(message);
  }
}

// =====================
// 6. NEWS MONITORING AGENT
// =====================
export class NewsMonitoringAgent extends Agent {
  private proxyBase: string;
  private queries = [
    'real+estate+development+India',
    'real+estate+builder+project+launch',
    'RERA+filing+approval',
    'real+estate+project+launch+India',
  ];

  constructor() {
    super('agent-news-monitoring', 'News Monitoring Agent');
    this.proxyBase = (typeof window !== 'undefined' && (window as any).__LEADLUXE_PROXY_URL)
      || 'http://localhost:3001';
  }

  async execute(): Promise<void> {
    this.status = 'working';
    this.lastRunAt = new Date().toISOString();
    this.runCount++;

    try {
      this.log('info', `Monitoring ${this.queries.length} news queries via proxy`);
      for (const query of this.queries) {
        await this.fetchAndAnalyze(query);
      }
      this.status = 'idle';
    } catch (err: any) {
      this.log('error', 'News monitoring failed', err.message);
      this.status = 'error';
    }
  }

  private async fetchAndAnalyze(query: string): Promise<void> {
    try {
      const proxyUrl = `${this.proxyBase}/api/proxy/google-news?q=${query}`;
      this.log('info', `Fetching: ${proxyUrl}`);

      const response = await fetch(proxyUrl);
      if (!response.ok) {
        this.log('warn', `Proxy returned ${response.status} for query: ${query}`);
        return;
      }

      const result = await response.json();

      if (!result.success || !result.items) {
        this.log('warn', `Proxy error for query: ${query}`);
        return;
      }

      const items = result.items;
      this.log('info', `Fetched ${items.length} articles for query: ${query.slice(0, 40)}`);

      for (const item of items) {
        if (!memorySystem.isAlreadyProcessed(item.link)) {
          this.send('agent-research', 'signal_detected', {
            type: 'news_coverage',
            title: item.title || '',
            description: item.description || '',
            sourceUrl: item.link || '',
            source: item.source || 'Google News',
            date: item.pubDate || new Date().toISOString(),
          }, 'high');
        }
      }
    } catch (err: any) {
      this.log('warn', `Failed to fetch query ${query}: ${err.message}`);
    }
  }

  async processMessage(message: AgentMessage): Promise<void> {
    if (message.type === 'scheduler_tick') await this.execute();
    else await super.processMessage(message);
  }
}

// =====================
// 7. COMMISSION AGENT
// =====================
export class CommissionAgent extends Agent {
  private commissionRate = 0.03;

  constructor() { super('agent-commission', 'Commission Agent'); }

  async execute(): Promise<void> {
    this.status = 'working';
    this.lastRunAt = new Date().toISOString();
    this.runCount++;

    try {
      for (const msg of this.inbox) {
        if (msg.type === 'opportunity_evaluated') {
          await this.calculateCommission(msg.payload);
        }
      }
      this.status = 'idle';
    } catch (err: any) {
      this.log('error', 'Commission calculation failed', err.message);
      this.status = 'error';
    }
  }

  private async calculateCommission(opportunity: any): Promise<number> {
    const estimatedValue = opportunity.estimated_value || opportunity.estimatedValue || 0;
    const commission = estimatedValue * this.commissionRate;

    this.log('info', `Commission calculated: ${commission} (${this.commissionRate * 100}% of ${estimatedValue})`);

    knowledgeGraph.addNode({
      id: `commission-${Date.now()}`,
      type: 'event',
      label: `Commission: ${opportunity.developerName || 'Unknown'}`,
      properties: {
        dealValue: estimatedValue,
        rate: this.commissionRate,
        commission,
        opportunityId: opportunity.id,
        currency: 'INR',
      },
      source: 'internal',
      sourceUrl: '',
      confidence: 95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.send('agent-recommendation', 'commission_calculated', {
      opportunityId: opportunity.id,
      commission,
      dealValue: estimatedValue,
      rate: this.commissionRate,
    }, 'high');

    return commission;
  }

  async processMessage(message: AgentMessage): Promise<void> {
    if (message.type === 'scheduler_tick') await this.execute();
    else await super.processMessage(message);
  }
}

// =====================
// 8. RECOMMENDATION AGENT
// =====================
export class RecommendationAgent extends Agent {
  constructor() { super('agent-recommendation', 'Recommendation Agent'); }

  async execute(): Promise<void> {
    this.status = 'working';
    this.lastRunAt = new Date().toISOString();
    this.runCount++;

    try {
      for (const msg of this.inbox) {
        if (msg.type === 'commission_calculated' || msg.type === 'opportunity_evaluated') {
          await this.generateRecommendation(msg.payload);
        }
      }
      this.status = 'idle';
    } catch (err: any) {
      this.log('error', 'Recommendation generation failed', err.message);
      this.status = 'error';
    }
  }

  private async generateRecommendation(data: any): Promise<void> {
    const confidence = data.confidenceScore || data.confidence_score || 50;
    const value = data.estimatedValue || data.estimated_value || 0;

    const recommendation: any = {
      id: `rec-${Date.now()}`,
      entityId: data.opportunityId || data.id,
      priority: confidence >= 85 ? 'critical' : confidence >= 70 ? 'high' : confidence >= 50 ? 'medium' : 'low',
      bestContactDay: confidence >= 80 ? 'Tuesday' : 'Wednesday',
      bestContactChannel: confidence >= 80 ? 'Phone' : 'Email',
      bestFollowupTiming: confidence >= 80 ? 'Within 24 hours' : 'Within 1 week',
      closingProbability: confidence / 100,
      nextBestAction: confidence >= 70
        ? `Contact developer regarding ${data.developerName || 'opportunity'}`
        : `Monitor for additional signals before engaging`,
      estimatedCommission: data.commission || value * 0.03,
      generatedAt: new Date().toISOString(),
    };

    knowledgeGraph.addNode({
      id: recommendation.id,
      type: 'event',
      label: `Recommendation: ${data.developerName || 'Opportunity'}`,
      properties: recommendation,
      source: 'internal',
      sourceUrl: '',
      confidence: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.send('agent-learning', 'recommendation_ready', recommendation, 'medium');
  }

  async processMessage(message: AgentMessage): Promise<void> {
    if (message.type === 'scheduler_tick') await this.execute();
    else await super.processMessage(message);
  }
}

// =====================
// 9. LEARNING AGENT
// =====================
export class LearningAgent extends Agent {
  constructor() { super('agent-learning', 'Learning Agent'); }

  async execute(): Promise<void> {
    this.status = 'working';
    this.lastRunAt = new Date().toISOString();
    this.runCount++;

    try {
      for (const msg of this.inbox) {
        if (msg.type === 'recommendation_ready') {
          await this.analyzeAndLearn(msg.payload);
        }
      }

      await this.evaluatePerformance();
      this.status = 'idle';
    } catch (err: any) {
      this.log('error', 'Learning cycle failed', err.message);
      this.status = 'error';
    }
  }

  private async analyzeAndLearn(data: any): Promise<void> {
    const stats = memorySystem.getAccuracyStats();

    knowledgeGraph.addNode({
      id: `learning-${Date.now()}`,
      type: 'event',
      label: `Learning: ${data.entityId || 'System'}`,
      properties: {
        accuracy: stats.overallAccuracy,
        predictionsMade: stats.predictionsCount,
        resolvedCount: stats.resolvedCount,
        recentTrend: stats.recentTrend,
        timestamp: new Date().toISOString(),
      },
      source: 'internal',
      sourceUrl: '',
      confidence: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.log('info', `Learning cycle complete: ${stats.overallAccuracy}% accuracy (${stats.predictionsCount} predictions)`);
  }

  private async evaluatePerformance(): Promise<void> {
    const stats = memorySystem.getAccuracyStats();
    const trends = memorySystem.getLearnedRecommendations();

    // Adjust strategies based on performance
    if (stats.overallAccuracy < 60 && stats.resolvedCount > 10) {
      this.log('warn', `Low accuracy (${stats.overallAccuracy}%) — adjusting confidence scoring`);
    }

    if (trends.length > 0) {
      this.log('info', `Learned patterns: ${trends.map(t => `${t.pattern} (${t.successRate}%)`).join(', ')}`);
    }
  }

  async processMessage(message: AgentMessage): Promise<void> {
    if (message.type === 'scheduler_tick') await this.execute();
    else await super.processMessage(message);
  }
}

// =====================
// 10. SCHEDULER AGENT
// =====================
export class SchedulerAgent extends Agent {
  private intervals: Map<string, { intervalMs: number; lastRun: number }> = new Map();
  private targetAgents: string[] = [];

  constructor() { super('agent-scheduler', 'Scheduler Agent'); }

  setTargets(agents: string[]): void {
    this.targetAgents = agents;
  }

  schedule(agentId: string, intervalMs: number): void {
    this.intervals.set(agentId, { intervalMs, lastRun: 0 });
    this.log('info', `Scheduled ${agentId} every ${intervalMs / 1000}s`);
  }

  async execute(): Promise<void> {
    this.status = 'working';
    this.lastRunAt = new Date().toISOString();
    this.runCount++;

    try {
      const now = Date.now();
      for (const [agentId, schedule] of this.intervals) {
        if (now - schedule.lastRun >= schedule.intervalMs) {
          this.log('info', `Triggering ${agentId}`);
          this.send(agentId, 'scheduler_tick', { timestamp: new Date().toISOString() }, 'low');
          schedule.lastRun = now;
        }
      }
      this.status = 'idle';
    } catch (err: any) {
      this.log('error', 'Scheduler tick failed', err.message);
      this.status = 'error';
    }
  }

  async processMessage(message: AgentMessage): Promise<void> {
    if (message.type === 'scheduler_tick') await this.execute();
    else await super.processMessage(message);
  }
}

// =====================
// AGENT ORCHESTRATOR
// =====================
export class AgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private scheduler: SchedulerAgent;

  constructor() {
    this.scheduler = new SchedulerAgent();
    this.register(this.scheduler);
  }

  register(agent: Agent): void {
    this.agents.set(agent.id, agent);
    this.log(`Registered agent: ${agent.name} (${agent.id})`);

    if (agent.id !== 'agent-scheduler') {
      this.scheduler.setTargets(Array.from(this.agents.keys()));
    }
  }

  async send(from: string, to: string, type: MessageType, payload: any, priority: AgentMessage['priority'] = 'medium'): Promise<void> {
    const agent = this.agents.get(to);
    if (!agent) {
      this.log(`Agent not found: ${to}`);
      return;
    }

    const message: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      from,
      to,
      type,
      payload,
      timestamp: new Date().toISOString(),
      priority,
    };

    await agent.receive(message);
  }

  async runAll(): Promise<void> {
    this.log('Running all agents...');
    for (const agent of this.agents.values()) {
      try {
        await agent.execute();
        this.log(`${agent.name}: completed`);
      } catch (err: any) {
        this.log(`${agent.name}: ERROR — ${err.message}`);
      }
    }
    this.log('All agents executed');
  }

  async processMessageQueue(): Promise<void> {
    for (const agent of this.agents.values()) {
      const outbox = agent.drainOutbox();
      for (const msg of outbox) {
        const target = this.agents.get(msg.to);
        if (target) {
          await target.receive(msg);
        }
      }
    }
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAllStatus(): { id: string; name: string; status: string; lastRun: string | null; runCount: number; errorCount: number }[] {
    return Array.from(this.agents.values()).map(a => a.getStatus());
  }

  getScheduler(): SchedulerAgent {
    return this.scheduler;
  }

  private log(message: string): void {
    console.log(`[Orchestrator] ${message}`);
  }
}

// Singleton
export const orchestrator = new AgentOrchestrator();
