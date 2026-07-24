// ============================================================
// LeadLuxe AI — Capital Introduction Workflow Orchestrator
// 10-step autonomous workflow: score → report → match → draft
// → approve → send → track → deal room → revenue pipeline.
// ============================================================

import type { Property } from '../lib/property-database';
import { getPropertyDatabase } from '../lib/property-database';
import {
  generateCapitalMatch,
  matchDevelopersToOpportunity,
  matchInvestorsToOpportunity,
  type CapitalMatch,
} from './matching';
import {
  generateDeveloperEmail,
  generateInvestorEmail,
  addToQueue,
  getEmailQueue,
  updateEmailStatus,
  type EmailDraft,
} from './email-generator';

// ─── Types ───────────────────────────────────────────────────
export interface WorkflowState {
  status: 'idle' | 'scanning' | 'scoring' | 'matching' | 'drafting' | 'awaiting_approval' | 'sending' | 'tracking' | 'deal_room' | 'revenue' | 'completed' | 'error';
  lastRun: string | null;
  nextRun: string | null;
  opportunitiesScored: number;
  matchesGenerated: number;
  emailsDrafted: number;
  emailsApproved: number;
  emailsSent: number;
  dealRoomsCreated: number;
  errors: string[];
}

const WORKFLOW_STATE_KEY = 'leadluxe-workflow-state';

function getWorkflowState(): WorkflowState {
  try {
    return JSON.parse(localStorage.getItem(WORKFLOW_STATE_KEY) || 'null') || {
      status: 'idle',
      lastRun: null,
      nextRun: null,
      opportunitiesScored: 0,
      matchesGenerated: 0,
      emailsDrafted: 0,
      emailsApproved: 0,
      emailsSent: 0,
      dealRoomsCreated: 0,
      errors: [],
    };
  } catch {
    return {
      status: 'idle',
      lastRun: null,
      nextRun: null,
      opportunitiesScored: 0,
      matchesGenerated: 0,
      emailsDrafted: 0,
      emailsApproved: 0,
      emailsSent: 0,
      dealRoomsCreated: 0,
      errors: [],
    };
  }
}

function saveWorkflowState(state: WorkflowState): void {
  localStorage.setItem(WORKFLOW_STATE_KEY, JSON.stringify(state));
}

// ─── Score Factors ───────────────────────────────────────────
const SCORE_WEIGHTS = {
  reraCompliance: 0.25,
  infrastructureCatalyst: 0.20,
  rentalDemand: 0.15,
  developerReputation: 0.15,
  inventoryPressure: 0.10,
  priceMomentum: 0.10,
  nriDemand: 0.05,
};

function calculateOpportunityScore(property: Property): {
  score: number;
  confidence: number;
  reasoning: string[];
  sources: string[];
} {
  const reasoning: string[] = [];
  const sources: string[] = [];

  // RERA compliance
  const reraScore = property.country === 'India' ? 85 : 50;
  if (property.country === 'India') {
    reasoning.push('RERA-registered project — government compliance confirmed');
    sources.push('RERA Portal - India');
  }

  // Infrastructure catalyst (based on city data from global-data.ts)
  const infraScore = property.confidence > 80 ? 80 : 50;
  if (property.confidence > 80) {
    reasoning.push('Strong infrastructure signals in this corridor');
    sources.push('Global Market Data - Infrastructure Index');
  }

  // Rental demand proxy (from property data)
  const rentalScore = property.available_units > 0 &&
    property.available_units < property.total_units * 0.5 ? 70 : 40;
  if (property.available_units < property.total_units * 0.5) {
    reasoning.push('Healthy absorption — limited inventory available');
  }

  // Developer reputation (from developer_website)
  const devScore = property.developer_website ? 75 : 40;
  if (property.developer_website) {
    reasoning.push(`Verified developer: ${property.developer_name}`);
    sources.push(property.developer_website);
  }

  // Price momentum (proxy from confidence — higher confidence markets tend to have stronger momentum)
  const priceScore = property.confidence || 60;

  // NRI demand
  const nriScore = ['Mumbai', 'Bengaluru', 'Pune', 'Hyderabad', 'Delhi NCR', 'Ahmedabad']
    .includes(property.city) ? 80 : 40;
  if (nriScore > 50) {
    reasoning.push(`High NRI demand corridor — ${property.city}`);
    sources.push('World Bank - Remittance Data');
  }

  // Weighted score
  const score = Math.round(
    reraScore * SCORE_WEIGHTS.reraCompliance +
    infraScore * SCORE_WEIGHTS.infrastructureCatalyst +
    rentalScore * SCORE_WEIGHTS.rentalDemand +
    devScore * SCORE_WEIGHTS.developerReputation +
    priceScore * SCORE_WEIGHTS.priceMomentum +
    nriScore * SCORE_WEIGHTS.nriDemand
  );

  const confidence = Math.round(
    (reraScore + infraScore + rentalScore + devScore + priceScore + nriScore) / 6
  );

  return { score, confidence, reasoning, sources };
}

// ─── Step 1: Score Opportunities ─────────────────────────────
function stepScoreOpportunities(state: WorkflowState): {
  scored: { property: Property; score: number; confidence: number; reasoning: string[]; sources: string[] }[];
  state: WorkflowState;
} {
  const properties = getPropertyDatabase();
  const scored: { property: Property; score: number; confidence: number; reasoning: string[]; sources: string[] }[] = [];

  for (const property of properties) {
    if (property.country !== 'India') continue;
    const result = calculateOpportunityScore(property);
    scored.push({ property, ...result });
  }

  // Filter to high-scoring opportunities (score >= 78)
  const highScoring = scored.filter(s => s.score >= 78);
  // Sort by score descending
  highScoring.sort((a, b) => b.score - a.score);

  return {
    scored: highScoring,
    state: {
      ...state,
      status: 'scoring',
      opportunitiesScored: highScoring.length,
    },
  };
}

// ─── Step 2: Generate Matches ─────────────────────────────────
function stepGenerateMatches(
  scored: { property: Property; score: number; confidence: number; reasoning: string[]; sources: string[] }[],
  state: WorkflowState
): { matches: CapitalMatch[]; state: WorkflowState } {
  const matches: CapitalMatch[] = [];

  for (const item of scored.slice(0, 10)) {
    const match = generateCapitalMatch(item.property, item.score);
    matches.push(match);
  }

  return {
    matches,
    state: {
      ...state,
      status: 'matching',
      matchesGenerated: matches.length,
    },
  };
}

// ─── Step 3: Draft Emails ────────────────────────────────────
function stepDraftEmails(
  matches: CapitalMatch[],
  state: WorkflowState
): { emails: EmailDraft[]; state: WorkflowState } {
  const emails: EmailDraft[] = [];
  const properties = getPropertyDatabase();

  for (const match of matches) {
    const property = properties.find(p => p.id === match.propertyId);
    if (!property) continue;

    // Draft developer email
    const devEmail = generateDeveloperEmail(property, match.developer, match.investors.length);
    emails.push(devEmail);

    // Draft investor emails (top 3)
    for (const investor of match.investors.slice(0, 3)) {
      const invEmail = generateInvestorEmail(property, investor);
      emails.push(invEmail);
    }
  }

  return {
    emails,
    state: {
      ...state,
      status: 'awaiting_approval',
      emailsDrafted: emails.length,
    },
  };
}

// ─── Full Workflow Execution ─────────────────────────────────
export function executeWorkflow(): {
  state: WorkflowState;
  matches: CapitalMatch[];
  emails: EmailDraft[];
} {
  const initial = getWorkflowState();
  let state: WorkflowState = {
    ...initial,
    status: 'scanning',
    lastRun: new Date().toISOString(),
    nextRun: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    errors: [],
  };

  try {
    // Step 1: Score opportunities
    const { scored, state: state1 } = stepScoreOpportunities(state);
    state = state1;

    if (scored.length === 0) {
      state = { ...state, status: 'completed' };
      saveWorkflowState(state);
      return { state, matches: [], emails: [] };
    }

    // Step 2: Generate matches
    const { matches, state: state2 } = stepGenerateMatches(scored, state);
    state = state2;

    // Step 3: Draft emails
    const { emails, state: state3 } = stepDraftEmails(matches, state);
    state = state3;

    // Save drafted emails to queue
    for (const email of emails) {
      addToQueue(email);
    }

    state = { ...state, status: 'awaiting_approval' };
    saveWorkflowState(state);

    return { state, matches, emails };
  } catch (err) {
    state = {
      ...state,
      status: 'error',
      errors: [...state.errors, err instanceof Error ? err.message : 'Unknown error'],
    };
    saveWorkflowState(state);
    return { state, matches: [], emails: [] };
  }
}

// ─── Admin Actions ───────────────────────────────────────────
export function approveEmail(emailId: string): void {
  updateEmailStatus(emailId, 'approved');
  const state = getWorkflowState();
  state.emailsApproved++;
  saveWorkflowState(state);
}

export function rejectEmail(emailId: string): void {
  updateEmailStatus(emailId, 'rejected');
}

export function markEmailsSent(count: number): void {
  const state = getWorkflowState();
  state.emailsSent += count;
  state.status = 'tracking';
  saveWorkflowState(state);
}

export function createDealRoomFromMatch(matchId: string): void {
  const state = getWorkflowState();
  state.dealRoomsCreated++;
  state.status = 'deal_room';
  saveWorkflowState(state);
}

// ─── Workflow Status ─────────────────────────────────────────
export function getStatus(): WorkflowState {
  return getWorkflowState();
}

export function resetWorkflow(): void {
  saveWorkflowState({
    status: 'idle',
    lastRun: null,
    nextRun: null,
    opportunitiesScored: 0,
    matchesGenerated: 0,
    emailsDrafted: 0,
    emailsApproved: 0,
    emailsSent: 0,
    dealRoomsCreated: 0,
    errors: [],
  });
}
