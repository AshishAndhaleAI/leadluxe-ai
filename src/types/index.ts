// ============================================================
// LeadLuxe AI — AI Opportunity Engine Types
// ============================================================

// =====================
// DEVELOPERS
// =====================
export interface Developer {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  website?: string;
  headquarters?: string;
  city: string;
  state?: string;
  founded_year?: number;
  builder_type?: 'public' | 'private' | 'partnership' | 'individual';
  pricing_segment?: 'budget' | 'mid_range' | 'premium' | 'luxury' | 'ultra_luxury';
  annual_revenue?: number;
  growth_rate?: number;
  market_share?: number;
  total_projects: number;
  active_projects: number;
  total_units_delivered: number;
  hiring_trend?: 'increasing' | 'stable' | 'decreasing';
  hiring_count: number;
  funding_info?: string;
  strengths: string[];
  weaknesses: string[];
  expansion_plans: string[];
  is_tracked: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// =====================
// PROJECTS
// =====================
export interface Project {
  id: string;
  developer_id: string;
  name: string;
  slug: string;
  description?: string;
  project_type?: ProjectType;
  status: ProjectStatus;
  location?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  total_units?: number;
  total_towers?: number;
  floor_count?: number;
  unit_types?: string[];
  area_range_min?: number;
  area_range_max?: number;
  price_range_min?: number;
  price_range_max?: number;
  amenities?: string[];
  rera_number?: string;
  rera_status?: 'applied' | 'approved' | 'not_applied';
  occupancy_date?: string;
  launch_date?: string;
  completion_date?: string;
  architect?: string;
  metadata: Record<string, any>;
  developer?: Developer;
  created_at: string;
  updated_at: string;
}

export type ProjectType =
  | 'luxury_residential' | 'premium_residential' | 'mid_range_residential'
  | 'affordable_housing' | 'commercial' | 'mixed_use' | 'township'
  | 'villa' | 'penthouse' | 'studio' | 'plot' | 'land';

export type ProjectStatus =
  | 'announced' | 'pre_launch' | 'launched' | 'ongoing_construction'
  | 'ready_to_move' | 'completed' | 'paused' | 'cancelled';

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  luxury_residential: 'Luxury Residential',
  premium_residential: 'Premium Residential',
  mid_range_residential: 'Mid-Range Residential',
  affordable_housing: 'Affordable Housing',
  commercial: 'Commercial',
  mixed_use: 'Mixed-Use',
  township: 'Township',
  villa: 'Villa',
  penthouse: 'Penthouse',
  studio: 'Studio',
  plot: 'Plot',
  land: 'Land',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  announced: 'Announced',
  pre_launch: 'Pre-Launch',
  launched: 'Launched',
  ongoing_construction: 'Under Construction',
  ready_to_move: 'Ready to Move',
  completed: 'Completed',
  paused: 'Paused',
  cancelled: 'Cancelled',
};

// =====================
// SIGNALS
// =====================
export interface Signal {
  id: string;
  developer_id?: string;
  project_id?: string;
  signal_type: SignalType;
  title: string;
  description?: string;
  source?: string;
  source_url?: string;
  source_type?: SourceType;
  raw_data?: Record<string, any>;
  normalized_data?: Record<string, any>;
  relevance_score: number;
  impact_level: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  is_processed: boolean;
  processed_at?: string;
  created_at: string;
}

export type SignalType =
  | 'rera_filing' | 'government_approval' | 'land_acquisition'
  | 'builder_hiring' | 'funding_raised' | 'project_launch'
  | 'partnership' | 'expansion' | 'market_trend' | 'news_coverage'
  | 'permit_issued' | 'construction_start' | 'price_change'
  | 'management_change' | 'legal_update' | 'award_recognition';

export type SourceType =
  | 'google_news' | 'builder_website' | 'company_website'
  | 'rera_portal' | 'government_portal' | 'newsletter'
  | 'social_media' | 'job_portal' | 'land_registry' | 'manual'
  | 'rss_feed' | 'api' | 'web_scraper';

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
  price_change: 'Price Change',
  management_change: 'Management Change',
  legal_update: 'Legal Update',
  award_recognition: 'Award Recognition',
};

export const IMPACT_LEVELS = ['critical', 'high', 'medium', 'low', 'informational'] as const;

// =====================
// OPPORTUNITIES
// =====================
export interface Opportunity {
  id: string;
  developer_id: string;
  project_id?: string;
  title: string;
  summary?: string;
  opportunity_type?: OpportunityType;
  estimated_value: number;
  confidence_score: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  deal_stage: DealStage;
  commission_percentage: number;
  estimated_commission: number;
  commission_currency: string;
  reasoning: string[];
  recommended_actions: string[];
  next_best_action?: string;
  best_contact_day?: string;
  best_contact_channel?: string;
  best_followup_timing?: string;
  closing_probability?: number;
  potential_objections: string[];
  suggested_pitch?: string;
  ai_analysis: Record<string, any>;
  is_active: boolean;
  closed_at?: string;
  developer?: Developer;
  project?: Project;
  signals?: Signal[];
  created_at: string;
  updated_at: string;
}

export type OpportunityType =
  | 'new_project' | 'pre_launch' | 'phase_launch' | 'bulk_booking'
  | 'joint_venture' | 'investment' | 'fractional_ownership'
  | 'commercial_lease' | 'land_deal' | 'renovation';

export type DealStage =
  | 'discovered' | 'qualifying' | 'analyzing' | 'proposal'
  | 'negotiation' | 'closing' | 'closed_won' | 'closed_lost';

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  discovered: 'Discovered',
  qualifying: 'Qualifying',
  analyzing: 'Analyzing',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closing: 'Closing',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

export const DEAL_STAGE_COLORS: Record<DealStage, string> = {
  discovered: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  qualifying: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  analyzing: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
  proposal: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  negotiation: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  closing: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  closed_won: 'bg-luxury-gold-500/15 text-luxury-gold-400 border-luxury-gold-500/25',
  closed_lost: 'bg-red-500/15 text-red-400 border-red-500/25',
};

export const PRIORITY_COLORS = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  high: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  medium: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  low: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
};

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  new_project: 'New Project',
  pre_launch: 'Pre-Launch',
  phase_launch: 'Phase Launch',
  bulk_booking: 'Bulk Booking',
  joint_venture: 'Joint Venture',
  investment: 'Investment',
  fractional_ownership: 'Fractional Ownership',
  commercial_lease: 'Commercial Lease',
  land_deal: 'Land Deal',
  renovation: 'Renovation',
};

// =====================
// COMMISSION RECORDS
// =====================
export interface CommissionRecord {
  id: string;
  opportunity_id: string;
  developer_id: string;
  deal_value: number;
  commission_percentage: number;
  commission_amount: number;
  currency: string;
  status: CommissionStatus;
  invoice_number?: string;
  invoice_date?: string;
  invoice_url?: string;
  payment_date?: string;
  payment_reference?: string;
  payment_method?: string;
  paid_amount?: number;
  due_date?: string;
  notes?: string;
  metadata: Record<string, any>;
  developer?: Developer;
  created_at: string;
  updated_at: string;
}

export type CommissionStatus =
  | 'estimated' | 'negotiated' | 'confirmed' | 'invoiced'
  | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded';

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  estimated: 'Estimated',
  negotiated: 'Negotiated',
  confirmed: 'Confirmed',
  invoiced: 'Invoiced',
  paid: 'Paid',
  partial: 'Partial',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const COMMISSION_STATUS_COLORS: Record<CommissionStatus, string> = {
  estimated: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  negotiated: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  confirmed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  invoiced: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  paid: 'bg-luxury-gold-500/15 text-luxury-gold-400 border-luxury-gold-500/25',
  partial: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  overdue: 'bg-red-500/15 text-red-400 border-red-500/25',
  cancelled: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
  refunded: 'bg-pink-500/15 text-pink-400 border-pink-500/25',
};

// =====================
// ACTIVITY LOGS
// =====================
export interface ActivityLog {
  id: string;
  entity_type: 'developer' | 'project' | 'signal' | 'opportunity' | 'commission' | 'source' | 'connector' | 'system';
  entity_id?: string;
  action: string;
  description?: string;
  changes?: Record<string, any>;
  actor: string;
  metadata: Record<string, any>;
  created_at: string;
}

// =====================
// SOURCES (Connectors)
// =====================
export interface Source {
  id: string;
  name: string;
  source_type: SourceType;
  config: Record<string, any>;
  is_active: boolean;
  last_run_at?: string;
  last_success_at?: string;
  last_error?: string;
  run_count: number;
  success_count: number;
  error_count: number;
  schedule_interval: string;
  created_at: string;
  updated_at: string;
}

// =====================
// DASHBOARD METRICS
// =====================
export interface DashboardMetrics {
  todayOpportunities: number;
  highConfidenceDeals: number;
  expectedCommission: number;
  newBuilderActivity: number;
  recentlyUpdatedProjects: number;
  upcomingLaunches: number;
  highestValueOpportunity: Opportunity | null;
  totalPipelineValue: number;
  closedCommission: number;
  activeDealsCount: number;
  avgConfidence: number;
  criticalSignals: number;
  hotProperties: number;
  preLaunchCount: number;
  totalAvailable: number;
  opportunitiesByPriority: { priority: string; count: number }[];
  opportunitiesByStage: { stage: string; count: number }[];
  commissionForecast: { month: string; expected: number; probable: number; optimistic: number }[];
  topOpportunities: Opportunity[];
  recentSignals: Signal[];
  recentActivity: ActivityLog[];
}

// =====================
// AI RECOMMENDATION
// =====================
export interface AIRecommendation {
  bestContactDay: string;
  bestContactChannel: string;
  bestFollowupTiming: string;
  closingProbability: number;
  potentialObjections: string[];
  suggestedPitch: string;
  nextBestAction: string;
}

// =====================
// AI TIMELINE EVENT
// =====================
export interface TimelineEvent {
  id: string;
  type: 'signal' | 'milestone' | 'action' | 'update' | 'system';
  title: string;
  description: string;
  date: string;
  icon?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  impact?: string;
}

// =====================
// COMMISSION
// =====================
export const COMMISSION_RATE = 0.03;
export const calculateCommission = (value: number) => value * COMMISSION_RATE;

// Legacy types kept for backward compatibility with existing components
export type DemoUser = { id: string; email: string; full_name: string; role: string; };
export interface RevenueForecast { month: string; expectedCommission: number; probableCommission: number; optimisticCommission: number; deals: { name: string; value: number; probability: number }[]; }
export interface CoachMessage { id: string; role: 'ai' | 'user'; content: string; suggestions?: string[]; confidence?: number; createdAt: string; }
export interface CoachSession { id: string; title: string; dealId?: string; messages: CoachMessage[]; summary?: string; actionItems?: string[]; createdAt: string; updatedAt: string; }
export interface AIInsight { id: string; type: 'opportunity' | 'signal' | 'competitor' | 'coach' | 'forecast'; title: string; description: string; priority: 'critical' | 'high' | 'medium' | 'low'; impact: string; action: string; createdAt: string; }

// Maintain legacy BuyingSignal and CompetitorProfile for existing components
export interface BuyingSignal { id: string; type: SignalType; title: string; description: string; source: string; date: string; relevanceScore: number; impact: 'high' | 'medium' | 'low'; url?: string; }
export interface CompetitorProfile { id: string; name: string; logo: string; headquarters: string; foundedYear: number; projects: { name: string; location: string; type: string; status: string; totalValue: number; units: number; launchedDate: string; }[]; annualRevenue: string; growthRate: number; marketShare: number; totalProjects: number; activeProjects: number; totalUnitsDelivered: number; pricing: string; strengths: string[]; weaknesses: string[]; recentActivity: string[]; hiringTrend: string; hiringCount: number; fundingInfo?: string; expansionPlans?: string[]; createdAt: string; }
export interface DealOpportunity { id: string; builderName: string; projectName: string; projectType: string; location: string; city: string; estimatedValue: number; confidenceScore: number; confidenceFactors: { label: string; score: number; weight: string; description: string; }[]; dealStage: string; expectedCommission: number; reasons: string[]; recommendedActions: string[]; signals: BuyingSignal[]; createdAt: string; updatedAt: string; }
export interface ConfidenceFactor { label: string; score: number; weight: 'high' | 'medium' | 'low'; description: string; }
