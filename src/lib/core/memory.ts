// ============================================================
// TerraNexus AI — Operational Memory System
// Tracks predictions, outcomes, feedback, and learns over time
// ============================================================

export interface PredictionRecord {
  id: string;
  type: 'confidence' | 'timeline' | 'value' | 'recommendation' | 'signal_impact';
  entityId: string;
  entityType: string;
  predictedAt: string;
  predictedValue: any;
  actualValue?: any;
  accuracy?: number; // 0-100
  feedback?: string;
  resolvedAt?: string;
  metadata: Record<string, any>;
}

export interface FeedbackRecord {
  id: string;
  entityId: string;
  entityType: string;
  feedback: 'accurate' | 'inaccurate' | 'helpful' | 'unhelpful' | 'spam';
  comment?: string;
  userId?: string;
  createdAt: string;
}

export interface DiscoveryMemory {
  id: string;
  sourceUrl: string;
  sourceType: string;
  discoveredAt: string;
  alreadyProcessed: boolean;
  entitiesFound: string[];
  hash: string; // deduplication hash
}

export class MemorySystem {
  private predictions: Map<string, PredictionRecord> = new Map();
  private feedback: FeedbackRecord[] = [];
  private discoveries: Map<string, DiscoveryMemory> = new Map();
  private accuracyHistory: { date: string; accuracy: number; count: number }[] = [];
  private confidenceAdjustments: Map<string, { original: number; adjustment: number; reason: string }> = new Map();

  /**
   * Record a new prediction
   */
  recordPrediction(prediction: Omit<PredictionRecord, 'id'>): string {
    const id = `pred-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.predictions.set(id, { ...prediction, id });
    return id;
  }

  /**
   * Resolve a prediction with actual outcome and calculate accuracy
   */
  resolvePrediction(id: string, actualValue: any, feedback?: string): number | null {
    const pred = this.predictions.get(id);
    if (!pred) return null;

    let accuracy = 0;
    if (typeof pred.predictedValue === 'number' && typeof actualValue === 'number') {
      const diff = Math.abs(pred.predictedValue - actualValue);
      const max = Math.max(pred.predictedValue, actualValue);
      accuracy = max > 0 ? Math.max(0, 100 - (diff / max) * 100) : 100;
    } else {
      accuracy = pred.predictedValue === actualValue ? 100 : 0;
    }

    this.predictions.set(id, {
      ...pred,
      actualValue,
      accuracy: Math.round(accuracy),
      feedback,
      resolvedAt: new Date().toISOString(),
    });

    // Update accuracy history
    const today = new Date().toISOString().slice(0, 10);
    const existing = this.accuracyHistory.find(a => a.date === today);
    if (existing) {
      existing.accuracy = (existing.accuracy * existing.count + accuracy) / (existing.count + 1);
      existing.count++;
    } else {
      this.accuracyHistory.push({ date: today, accuracy, count: 1 });
    }

    return Math.round(accuracy);
  }

  /**
   * Add user feedback on a prediction or recommendation
   */
  addFeedback(feedback: Omit<FeedbackRecord, 'id'>): string {
    const id = `fb-${Date.now()}`;
    this.feedback.push({ ...feedback, id });

    // Adjust confidence based on feedback
    if (feedback.feedback === 'accurate' || feedback.feedback === 'helpful') {
      this.adjustConfidence(feedback.entityId, 2, 'Positive user feedback');
    } else if (feedback.feedback === 'inaccurate' || feedback.feedback === 'unhelpful') {
      this.adjustConfidence(feedback.entityId, -5, 'Negative user feedback');
    }

    return id;
  }

  /**
   * Track a discovery for deduplication
   */
  trackDiscovery(discovery: Omit<DiscoveryMemory, 'id'>): boolean {
    if (this.discoveries.has(discovery.hash)) return false; // already processed
    const id = `disc-${Date.now()}`;
    this.discoveries.set(discovery.hash, { ...discovery, id });
    return true; // new discovery
  }

  /**
   * Check if a URL has already been processed
   */
  isAlreadyProcessed(url: string): boolean {
    for (const discovery of this.discoveries.values()) {
      if (discovery.sourceUrl === url) return true;
    }
    return false;
  }

  /**
   * Adjust confidence scores based on historical accuracy
   */
  adjustConfidence(entityId: string, delta: number, reason: string): void {
    const existing = this.confidenceAdjustments.get(entityId);
    if (existing) {
      existing.adjustment += delta;
      existing.reason = reason;
    } else {
      this.confidenceAdjustments.set(entityId, {
        original: 50,
        adjustment: delta,
        reason,
      });
    }
  }

  /**
   * Get adjusted confidence for an entity
   */
  getAdjustedConfidence(entityId: string, baseScore: number): number {
    const adj = this.confidenceAdjustments.get(entityId);
    if (!adj) return baseScore;
    return Math.max(0, Math.min(100, baseScore + adj.adjustment));
  }

  /**
   * Get accuracy statistics
   */
  getAccuracyStats(): {
    overallAccuracy: number;
    predictionsCount: number;
    resolvedCount: number;
    recentTrend: number;
    feedbackCount: number;
  } {
    const all = Array.from(this.predictions.values());
    const resolved = all.filter(p => p.accuracy !== undefined);
    const overallAccuracy = resolved.length > 0
      ? Math.round(resolved.reduce((s, p) => s + (p.accuracy || 0), 0) / resolved.length)
      : 0;

    const recent = this.accuracyHistory.slice(-7);
    const recentTrend = recent.length > 0
      ? Math.round(recent.reduce((s, a) => s + a.accuracy, 0) / recent.length)
      : 0;

    return {
      overallAccuracy,
      predictionsCount: all.length,
      resolvedCount: resolved.length,
      recentTrend,
      feedbackCount: this.feedback.length,
    };
  }

  /**
   * Get recommendations based on what worked historically
   */
  getLearnedRecommendations(): { pattern: string; successRate: number; examples: string[] }[] {
    const successful = this.feedback.filter(f => f.feedback === 'accurate' || f.feedback === 'helpful');
    const patterns: Map<string, { successes: number; total: number; examples: string[] }> = new Map();

    for (const fb of successful) {
      const key = fb.entityType;
      const existing = patterns.get(key) || { successes: 0, total: 0, examples: [] };
      existing.successes++;
      existing.total++;
      if (existing.examples.length < 3) existing.examples.push(fb.entityId);
      patterns.set(key, existing);
    }

    return Array.from(patterns.entries()).map(([pattern, data]) => ({
      pattern,
      successRate: Math.round((data.successes / data.total) * 100),
      examples: data.examples,
    }));
  }

  /**
   * Export memory for persistence
   */
  export(): {
    predictions: PredictionRecord[];
    feedback: FeedbackRecord[];
    discoveries: DiscoveryMemory[];
    adjustments: [string, { original: number; adjustment: number; reason: string }][];
  } {
    return {
      predictions: Array.from(this.predictions.values()),
      feedback: this.feedback,
      discoveries: Array.from(this.discoveries.values()),
      adjustments: Array.from(this.confidenceAdjustments.entries()),
    };
  }

  /**
   * Import memory from persistence
   */
  import(data: {
    predictions: PredictionRecord[];
    feedback: FeedbackRecord[];
    discoveries: DiscoveryMemory[];
    adjustments: [string, { original: number; adjustment: number; reason: string }][];
  }): void {
    for (const p of data.predictions) this.predictions.set(p.id, p);
    this.feedback = data.feedback;
    for (const d of data.discoveries) this.discoveries.set(d.hash, d);
    for (const [key, val] of data.adjustments) this.confidenceAdjustments.set(key, val);
  }
}

export const memorySystem = new MemorySystem();
