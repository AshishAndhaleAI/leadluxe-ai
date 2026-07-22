// ============================================================
// LeadLuxe AI — Autonomous Intelligence Core
// Ties agents, connectors, knowledge graph, and memory together
// ============================================================

import { knowledgeGraph, type GraphNode } from './knowledge-graph';
import { memorySystem } from './memory';
import { orchestrator, ResearchAgent, VerificationAgent, EntityResolutionAgent, 
         ProjectDetectionAgent, MarketIntelligenceAgent, NewsMonitoringAgent,
         CommissionAgent, RecommendationAgent, LearningAgent, SchedulerAgent } from '../agents/AgentFramework';
import { googleNewsConnector } from '../connectors/GoogleNewsConnector';
import { reraConnector, type NormalizedRERASignal } from '../connectors/RERAConnector';

/**
 * AutonomousIntelligence — the central system that:
 * 1. Runs connectors to fetch real data from public sources
 * 2. Feeds data into the agent framework for analysis
 * 3. Stores everything in the knowledge graph
 * 4. Tracks predictions and learns from outcomes
 */
export class AutonomousIntelligence {
  private initialized = false;
  private runCount = 0;
  private lastRunAt: string | null = null;
  private isRunning = false;
  private cycleIntervalMs = 600000; // 10 minutes default
  private cycleTimer: ReturnType<typeof setInterval> | null = null;

  // Public state
  public status: 'idle' | 'running' | 'error' = 'idle';
  public lastError: string | null = null;
  public totalRuns = 0;
  public totalSignalsCollected = 0;
  public totalOpportunitiesGenerated = 0;

  /**
   * Initialize the autonomous platform with all agents
   */
  initialize(): void {
    if (this.initialized) return;

    // Register all agents with the orchestrator
    orchestrator.register(new ResearchAgent());
    orchestrator.register(new VerificationAgent());
    orchestrator.register(new EntityResolutionAgent());
    orchestrator.register(new ProjectDetectionAgent());
    orchestrator.register(new MarketIntelligenceAgent());
    orchestrator.register(new NewsMonitoringAgent());
    orchestrator.register(new CommissionAgent());
    orchestrator.register(new RecommendationAgent());
    orchestrator.register(new LearningAgent());

    // Schedule agents
    const scheduler = orchestrator.getScheduler();
    scheduler.schedule('agent-news-monitoring', 300000);       // Every 5 min
    scheduler.schedule('agent-research', 600000);              // Every 10 min
    scheduler.schedule('agent-verification', 900000);          // Every 15 min
    scheduler.schedule('agent-entity-resolution', 600000);     // Every 10 min
    scheduler.schedule('agent-project-detection', 900000);     // Every 15 min
    scheduler.schedule('agent-market-intelligence', 1800000);  // Every 30 min
    scheduler.schedule('agent-commission', 900000);            // Every 15 min
    scheduler.schedule('agent-recommendation', 600000);         // Every 10 min
    scheduler.schedule('agent-learning', 1800000);             // Every 30 min

    this.initialized = true;
    console.log('[AutonomousIntelligence] Initialized with 10 agents');
  }

  /**
   * Run a complete intelligence cycle
   */
  async runCycle(): Promise<void> {
    if (this.isRunning) {
      console.log('[AutonomousIntelligence] Already running, skipping cycle');
      return;
    }

    this.isRunning = true;
    this.status = 'running';
    this.runCount++;
    this.totalRuns++;
    this.lastRunAt = new Date().toISOString();

    try {
      console.log(`[AutonomousIntelligence] Starting cycle #${this.runCount}`);

      // Phase 1: Collect signals from real data connectors
      await this.collectSignals();

      // Phase 2: Run agents on collected data
      await this.runAgents();

      // Phase 3: Process agent outputs
      await this.processResults();

      this.status = 'idle';
      console.log(`[AutonomousIntelligence] Cycle #${this.runCount} complete`);
    } catch (err: any) {
      this.lastError = err.message;
      this.status = 'error';
      console.error(`[AutonomousIntelligence] Cycle failed: ${err.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Start continuous operation
   */
  startContinuous(intervalMs = 600000): void {
    this.cycleIntervalMs = intervalMs;
    if (this.cycleTimer) clearInterval(this.cycleTimer);
    this.cycleTimer = setInterval(() => this.runCycle(), intervalMs);
    console.log(`[AutonomousIntelligence] Continuous operation started (every ${intervalMs / 1000}s)`);
    // Run first cycle immediately
    this.runCycle();
  }

  /**
   * Stop continuous operation
   */
  stopContinuous(): void {
    if (this.cycleTimer) {
      clearInterval(this.cycleTimer);
      this.cycleTimer = null;
    }
    console.log('[AutonomousIntelligence] Continuous operation stopped');
  }

  /**
   * Phase 1: Collect signals from all connectors
   */
  private async collectSignals(): Promise<void> {
    console.log('[AutonomousIntelligence] Phase 1: Collecting signals');

    // Google News
    const newsSignals = await googleNewsConnector.fetchAll();
    for (const signal of newsSignals) {
      await this.ingestSignal(signal);
    }
    this.totalSignalsCollected += newsSignals.length;

    // RERA portals
    const reraSignals = await reraConnector.fetchLatest(10);
    for (const signal of reraSignals) {
      await this.ingestRERASignal(signal);
    }
    this.totalSignalsCollected += reraSignals.length;

    console.log(`[AutonomousIntelligence] Collected ${this.totalSignalsCollected} total signals`);
  }

  /**
   * Ingest a normalized signal into the knowledge graph
   */
  private async ingestSignal(signal: any): Promise<void> {
    // Add to knowledge graph
    knowledgeGraph.addNode({
      id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'news',
      label: signal.title?.slice(0, 100) || 'News Signal',
      properties: signal,
      source: signal.source || 'Google News',
      sourceUrl: signal.sourceUrl || '',
      confidence: signal.confidence || 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Record in memory for deduplication
    if (signal.sourceUrl) {
      memorySystem.trackDiscovery({
        sourceUrl: signal.sourceUrl,
        sourceType: signal.source || 'google_news',
        discoveredAt: new Date().toISOString(),
        alreadyProcessed: false,
        entitiesFound: [signal.developerName || signal.title],
        hash: `sig-${signal.sourceUrl.length}-${signal.sourceUrl.slice(-20)}`,
      });
    }

    // Send to research agent for analysis
    await orchestrator.send(
      'system', 'agent-research', 'signal_detected', signal, 'high'
    );
  }

  /**
   * Ingest a RERA signal
   */
  private async ingestRERASignal(signal: NormalizedRERASignal): Promise<void> {
    knowledgeGraph.addNode({
      id: `rera-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'approval',
      label: `RERA: ${signal.developerName}`,
      properties: signal,
      source: signal.source || 'RERA',
      sourceUrl: signal.sourceUrl || '',
      confidence: signal.confidence || 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (signal.reraNumber) {
      memorySystem.trackDiscovery({
        sourceUrl: signal.reraNumber,
        sourceType: 'rera_portal',
        discoveredAt: new Date().toISOString(),
        alreadyProcessed: false,
        entitiesFound: [signal.developerName || ''],
        hash: `rera-${signal.reraNumber}`,
      });
    }

    await orchestrator.send(
      'system', 'agent-project-detection', 'signal_detected', signal, 'critical'
    );
  }

  /**
   * Phase 2: Run all agents
   */
  private async runAgents(): Promise<void> {
    console.log('[AutonomousIntelligence] Phase 2: Running agents');
    await orchestrator.runAll();
    await orchestrator.processMessageQueue();
    // Run message queue a second time to propagate cascading messages
    await orchestrator.processMessageQueue();
  }

  /**
   * Phase 3: Process results and generate insights
   */
  private async processResults(): Promise<void> {
    console.log('[AutonomousIntelligence] Phase 3: Processing results');
    
    const graphStats = knowledgeGraph.summarize();
    const memoryStats = memorySystem.getAccuracyStats();
    const agentStatuses = orchestrator.getAllStatus();

    this.totalOpportunitiesGenerated = knowledgeGraph.findNodes('event', 
      n => n.label.includes('Opportunity') || n.label.includes('Recommendation')
    ).length;

    console.log(`[AutonomousIntelligence] Knowledge graph: ${graphStats.nodeCount} nodes, ${graphStats.edgeCount} edges`);
    console.log(`[AutonomousIntelligence] Memory: ${memoryStats.predictionsCount} predictions, ${memoryStats.overallAccuracy}% accuracy`);
    console.log(`[AutonomousIntelligence] Agents: ${agentStatuses.filter(a => a.status === 'idle').length}/${agentStatuses.length} idle`);
  }

  /**
   * Get comprehensive system status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      status: this.status,
      totalRuns: this.totalRuns,
      lastRunAt: this.lastRunAt,
      lastError: this.lastError,
      totalSignalsCollected: this.totalSignalsCollected,
      totalOpportunitiesGenerated: this.totalOpportunitiesGenerated,
      agents: orchestrator.getAllStatus(),
      graphSummary: knowledgeGraph.summarize(),
      memoryStats: memorySystem.getAccuracyStats(),
      connectors: [
        { name: googleNewsConnector.name, totalFetched: googleNewsConnector.totalFetched, lastError: googleNewsConnector.lastError, lastSuccess: googleNewsConnector.lastSuccessAt },
        { name: reraConnector.name, totalFetched: reraConnector.totalFetched, lastError: reraConnector.lastError, lastSuccess: reraConnector.lastSuccessAt },
      ],
    };
  }

  /**
   * Get all opportunities discovered by the system
   */
  getOpportunities(): GraphNode[] {
    return knowledgeGraph.findNodes('event', n => 
      n.label.includes('Opportunity') || n.properties.opportunityId
    );
  }

  /**
   * Get recent signals
   */
  getRecentSignals(limit = 50): GraphNode[] {
    return knowledgeGraph.findNodes('news')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get developer nodes
   */
  getDevelopers(): GraphNode[] {
    return knowledgeGraph.findNodes('developer');
  }

  /**
   * Get project nodes
   */
  getProjects(): GraphNode[] {
    return knowledgeGraph.findNodes('project');
  }
}

// Singleton
export const autonomousIntelligence = new AutonomousIntelligence();
