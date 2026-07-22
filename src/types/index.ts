// ============================================================
// LeadLuxe AI — AI Deal Intelligence Platform Types
// ============================================================

export interface DealOpportunity {
  id: string;
  builderName: string;
  projectName: string;
  projectType: 'luxury_residential' | 'commercial' | 'mixed_use' | 'township' | 'villa' | 'penthouse';
  location: string;
  city: string;
  estimatedValue: number;
  confidenceScore: number;
  confidenceFactors: ConfidenceFactor[];
  dealStage: DealStage;
  expectedCommission: number;
  reasons: string[];
  recommendedActions: string[];
  signals: BuyingSignal[];
  createdAt: string;
  updatedAt: string;
}

export type DealStage =
  | 'discovered'
  | 'qualifying'
  | 'proposal'
  | 'negotiation'
  | 'closing'
  | 'closed_won'
  | 'closed_lost';

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  discovered: 'Discovered',
  qualifying: 'Qualifying',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closing: 'Closing',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

export const DEAL_STAGE_COLORS: Record<DealStage, string> = {
  discovered: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  qualifying: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  proposal: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  negotiation: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  closing: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  closed_won: 'bg-luxury-gold-500/15 text-luxury-gold-400 border-luxury-gold-500/25',
  closed_lost: 'bg-red-500/15 text-red-400 border-red-500/25',
};

export interface ConfidenceFactor {
  label: string;
  score: number; // 0-100
  weight: 'high' | 'medium' | 'low';
  description: string;
}

export interface BuyingSignal {
  id: string;
  type: SignalType;
  title: string;
  description: string;
  source: string;
  date: string;
  relevanceScore: number;
  impact: 'high' | 'medium' | 'low';
  url?: string;
}

export type SignalType =
  | 'rera_filing'
  | 'government_approval'
  | 'land_acquisition'
  | 'builder_hiring'
  | 'funding_raised'
  | 'project_launch'
  | 'partnership'
  | 'expansion'
  | 'market_trend'
  | 'news_coverage'
  | 'permit_issued'
  | 'construction_start';

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  rera_filing: 'RERA Filing',
  government_approval: 'Government Approval',
  land_acquisition: 'Land Acquisition',
  builder_hiring: 'Builder Hiring',
  funding_raised: 'Funding Raised',
  project_launch: 'Project Launch',
  partnership: 'Partnership',
  expansion: 'Expansion',
  market_trend: 'Market Trend',
  news_coverage: 'News Coverage',
  permit_issued: 'Permit Issued',
  construction_start: 'Construction Start',
};

export interface CompetitorProfile {
  id: string;
  name: string;
  logo: string;
  headquarters: string;
  foundedYear: number;
  projects: CompetitorProject[];
  annualRevenue: string;
  growthRate: number;
  marketShare: number;
  totalProjects: number;
  activeProjects: number;
  totalUnitsDelivered: number;
  pricing: 'budget' | 'mid_range' | 'premium' | 'luxury';
  strengths: string[];
  weaknesses: string[];
  recentActivity: string[];
  hiringTrend: 'increasing' | 'stable' | 'decreasing';
  hiringCount: number;
  fundingInfo?: string;
  expansionPlans?: string[];
  createdAt: string;
}

export interface CompetitorProject {
  name: string;
  location: string;
  type: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  totalValue: number;
  units: number;
  launchedDate: string;
}

export interface RevenueForecast {
  month: string;
  expectedCommission: number;
  probableCommission: number;
  optimisticCommission: number;
  deals: { name: string; value: number; probability: number }[];
}

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'signal' | 'competitor' | 'coach' | 'forecast';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
  action: string;
  createdAt: string;
}

export interface CoachMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  suggestions?: string[];
  confidence?: number;
  createdAt: string;
}

export interface CoachSession {
  id: string;
  title: string;
  dealId?: string;
  messages: CoachMessage[];
  summary?: string;
  actionItems?: string[];
  createdAt: string;
  updatedAt: string;
}

// Demo data types
export interface DemoUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

// Commission constants
export const COMMISSION_RATE = 0.03;
export const calculateCommission = (value: number) => value * COMMISSION_RATE;
