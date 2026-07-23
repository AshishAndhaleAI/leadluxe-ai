-- ============================================================
-- LeadLuxe AI — Investor Operating System
-- Core tables for Phases 1-9
-- ============================================================

-- =====================
-- INVESTMENT SCORES (Phase 2)
-- =====================
CREATE TABLE IF NOT EXISTS public.investment_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id TEXT NOT NULL,
  project_name TEXT,
  city TEXT,
  country TEXT,
  -- 8-factor scoring
  price_momentum_score NUMERIC DEFAULT 0,
  rental_yield_score NUMERIC DEFAULT 0,
  inventory_absorption_score NUMERIC DEFAULT 0,
  infrastructure_pipeline_score NUMERIC DEFAULT 0,
  developer_reputation_score NUMERIC DEFAULT 0,
  foreign_investment_flow_score NUMERIC DEFAULT 0,
  currency_stability_score NUMERIC DEFAULT 0,
  liquidity_risk_score NUMERIC DEFAULT 0,
  -- Composite
  overall_score NUMERIC DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  confidence NUMERIC DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  score_factors JSONB DEFAULT '{}',
  upside_catalysts TEXT[] DEFAULT '{}',
  downside_risks TEXT[] DEFAULT '{}',
  suggested_holding_period TEXT,
  expected_commission NUMERIC DEFAULT 0,
  data_sources TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_investment_scores_overall ON public.investment_scores(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_investment_scores_country ON public.investment_scores(country);
CREATE INDEX IF NOT EXISTS idx_investment_scores_city ON public.investment_scores(city);
CREATE INDEX IF NOT EXISTS idx_investment_scores_updated ON public.investment_scores(updated_at DESC);

-- =====================
-- AI SIGNALS (Phase 4)
-- =====================
CREATE TABLE IF NOT EXISTS public.ai_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_category TEXT NOT NULL CHECK (signal_category IN (
    'interest_rate_change', 'mortgage_policy', 'infrastructure_approval',
    'metro_rail_expansion', 'foreign_capital_inflow', 'land_acquisition',
    'developer_debt_event', 'currency_shock', 'market_milestone',
    'government_policy', 'demand_spike', 'supply_constraint',
    'regulatory_change', 'economic_indicator'
  )),
  title TEXT NOT NULL,
  description TEXT,
  signal_strength NUMERIC DEFAULT 50 CHECK (signal_strength >= 0 AND signal_strength <= 100),
  affected_cities TEXT[] DEFAULT '{}',
  affected_countries TEXT[] DEFAULT '{}',
  impact_horizon TEXT CHECK (impact_horizon IN ('immediate', 'short_term', 'medium_term', 'long_term')),
  expected_impact_months INT DEFAULT 6,
  ai_confidence NUMERIC DEFAULT 50 CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  source_url TEXT,
  source_name TEXT,
  source_type TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  raw_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_signals_strength ON public.ai_signals(signal_strength DESC);
CREATE INDEX IF NOT EXISTS idx_ai_signals_category ON public.ai_signals(signal_category);
CREATE INDEX IF NOT EXISTS idx_ai_signals_created ON public.ai_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_signals_verified ON public.ai_signals(is_verified);

-- =====================
-- PORTFOLIOS (Phase 6)
-- =====================
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'demo-001',
  name TEXT NOT NULL,
  description TEXT,
  total_value NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  asset_count INT DEFAULT 0,
  geographic_focus TEXT[] DEFAULT '{}',
  asset_class_focus TEXT[] DEFAULT '{}',
  risk_profile TEXT CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive', 'speculative')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.portfolio_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  opportunity_id TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type TEXT CHECK (asset_type IN (
    'residential', 'commercial', 'land', 'mixed_use', 'fractional',
    'reit', 'development_project', 'rental_property'
  )),
  city TEXT,
  country TEXT,
  purchase_value NUMERIC NOT NULL,
  current_value NUMERIC,
  currency TEXT DEFAULT 'INR',
  investment_date TIMESTAMPTZ DEFAULT NOW(),
  expected_annual_yield NUMERIC,
  holding_period_years INT DEFAULT 5,
  debt_amount NUMERIC DEFAULT 0,
  equity_amount NUMERIC DEFAULT 0,
  risk_score NUMERIC DEFAULT 50,
  expected_commission NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_portfolio ON public.portfolio_assets(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_country ON public.portfolio_assets(country);

-- =====================
-- REPORTS (Phase 5)
-- =====================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'demo-001',
  opportunity_id TEXT,
  title TEXT NOT NULL,
  report_type TEXT CHECK (report_type IN (
    'investment_analysis', 'market_comparison', 'portfolio_review',
    'opportunity_brief', 'commission_forecast', 'risk_assessment'
  )),
  summary TEXT,
  sections JSONB DEFAULT '[]',
  pdf_url TEXT,
  is_generated BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_generated ON public.reports(is_generated);

-- =====================
-- GOVERNANCE LOGS (Phase 8)
-- =====================
CREATE TABLE IF NOT EXISTS public.governance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  action TEXT NOT NULL,
  action_type TEXT CHECK (action_type IN (
    'analysis', 'recommendation', 'alert', 'scan', 'score_update',
    'prediction', 'comparison', 'report', 'data_fetch', 'system'
  )),
  description TEXT,
  data_sources TEXT[] DEFAULT '{}',
  confidence NUMERIC DEFAULT 50,
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_by_human BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  external_action_taken BOOLEAN DEFAULT FALSE,
  summary JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_governance_agent ON public.governance_logs(agent_name);
CREATE INDEX IF NOT EXISTS idx_governance_created ON public.governance_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_governance_approval ON public.governance_logs(requires_approval, approved_by_human);

-- =====================
-- COMMAND HISTORY (Phase 1)
-- =====================
CREATE TABLE IF NOT EXISTS public.command_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'demo-001',
  command_text TEXT NOT NULL,
  parsed_intent TEXT,
  parsed_filters JSONB DEFAULT '{}',
  result_count INT DEFAULT 0,
  execution_time_ms INT DEFAULT 0,
  is_successful BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_command_history_user ON public.command_history(user_id);
CREATE INDEX IF NOT EXISTS idx_command_history_created ON public.command_history(created_at DESC);

-- =====================
-- AGENT RUNS (Phase 7)
-- =====================
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  agent_type TEXT CHECK (agent_type IN (
    'opportunity_hunter', 'market_scanner', 'signal_detector',
    'score_updater', 'report_generator', 'portfolio_analyzer',
    'capital_flow_tracker', 'developer_tracker'
  )),
  status TEXT CHECK (status IN ('running', 'completed', 'failed', 'scheduled')) DEFAULT 'scheduled',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  items_discovered INT DEFAULT 0,
  items_updated INT DEFAULT 0,
  errors TEXT[] DEFAULT '{}',
  summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_agent ON public.agent_runs(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON public.agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_started ON public.agent_runs(started_at DESC);

-- =====================
-- RLS POLICIES (read-only for authenticated users)
-- =====================
ALTER TABLE public.investment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.command_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all investment scores and signals
DROP POLICY IF EXISTS "Authenticated users can read investment_scores" ON public.investment_scores;
CREATE POLICY "Authenticated users can read investment_scores"
  ON public.investment_scores FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can read ai_signals" ON public.ai_signals;
CREATE POLICY "Authenticated users can read ai_signals"
  ON public.ai_signals FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow users to manage their own portfolios
DROP POLICY IF EXISTS "Users manage own portfolios" ON public.portfolios;
CREATE POLICY "Users manage own portfolios"
  ON public.portfolios FOR ALL
  USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users manage own portfolio assets" ON public.portfolio_assets;
CREATE POLICY "Users manage own portfolio assets"
  ON public.portfolio_assets FOR ALL
  USING (true);

-- Allow users to read their own reports
DROP POLICY IF EXISTS "Users read own reports" ON public.reports;
CREATE POLICY "Users read own reports"
  ON public.reports FOR ALL
  USING (auth.uid()::text = user_id);

-- Allow users to read governance logs
DROP POLICY IF EXISTS "Authenticated users can read governance_logs" ON public.governance_logs;
CREATE POLICY "Authenticated users can read governance_logs"
  ON public.governance_logs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow users to read their own command history
DROP POLICY IF EXISTS "Users read own command_history" ON public.command_history;
CREATE POLICY "Users read own command_history"
  ON public.command_history FOR ALL
  USING (auth.uid()::text = user_id);

-- Allow users to read agent runs
DROP POLICY IF EXISTS "Authenticated users can read agent_runs" ON public.agent_runs;
CREATE POLICY "Authenticated users can read agent_runs"
  ON public.agent_runs FOR SELECT
  USING (auth.role() = 'authenticated');
