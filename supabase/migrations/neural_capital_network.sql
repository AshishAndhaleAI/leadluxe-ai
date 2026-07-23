-- ============================================================
-- LeadLuxe AI — Neural Capital Network
-- All new tables for Phases 1-10
-- ============================================================

-- =====================
-- PHASE 1: NEURAL CAPITAL GRAPH
-- =====================
CREATE TABLE IF NOT EXISTS public.graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type TEXT NOT NULL CHECK (node_type IN (
    'country', 'city', 'district', 'developer', 'project',
    'investor', 'infrastructure_asset', 'airport', 'metro_station',
    'tech_park', 'sez', 'university', 'luxury_retail_zone'
  )),
  external_id TEXT,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  country TEXT,
  city TEXT,
  properties JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_graph_nodes_type ON public.graph_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_graph_nodes_country ON public.graph_nodes(country);
CREATE INDEX IF NOT EXISTS idx_graph_nodes_location ON public.graph_nodes(latitude, longitude);

CREATE TABLE IF NOT EXISTS public.graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID NOT NULL REFERENCES public.graph_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES public.graph_nodes(id) ON DELETE CASCADE,
  edge_type TEXT NOT NULL CHECK (edge_type IN (
    'capital_flow', 'commuter_flow', 'supply_dependency',
    'developer_relationship', 'investment_correlation',
    'infrastructure_influence', 'price_spillover'
  )),
  weight NUMERIC DEFAULT 1.0,
  confidence NUMERIC DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  direction TEXT CHECK (direction IN ('directed', 'undirected')) DEFAULT 'directed',
  properties JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_node_id, target_node_id, edge_type)
);

CREATE INDEX IF NOT EXISTS idx_graph_edges_source ON public.graph_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_target ON public.graph_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_graph_edges_type ON public.graph_edges(edge_type);
CREATE INDEX IF NOT EXISTS idx_graph_edges_weight ON public.graph_edges(weight DESC);

-- =====================
-- PHASE 2: CAPITAL FLOW PREDICTION
-- =====================
CREATE TABLE IF NOT EXISTS public.capital_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id TEXT NOT NULL,
  city_name TEXT,
  country TEXT,
  horizon TEXT CHECK (horizon IN ('30d', '90d', '1yr', '3yr')),
  inflow_probability NUMERIC DEFAULT 50 CHECK (inflow_probability >= 0 AND inflow_probability <= 100),
  momentum_score NUMERIC DEFAULT 50 CHECK (momentum_score >= 0 AND momentum_score <= 100),
  appreciation_forecast NUMERIC,
  institutional_demand_forecast NUMERIC DEFAULT 50,
  confidence NUMERIC DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  features_used JSONB DEFAULT '{}',
  reasoning TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, horizon)
);

CREATE INDEX IF NOT EXISTS idx_capital_predictions_city ON public.capital_predictions(city_id);
CREATE INDEX IF NOT EXISTS idx_capital_predictions_horizon ON public.capital_predictions(horizon);
CREATE INDEX IF NOT EXISTS idx_capital_predictions_probability ON public.capital_predictions(inflow_probability DESC);
CREATE INDEX IF NOT EXISTS idx_capital_predictions_generated ON public.capital_predictions(generated_at DESC);

-- =====================
-- PHASE 3: TIME MACHINE SNAPSHOTS
-- =====================
CREATE TABLE IF NOT EXISTS public.time_machine_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_year INTEGER NOT NULL,
  snapshot_label TEXT NOT NULL,
  is_current BOOLEAN DEFAULT FALSE,
  city_rankings JSONB DEFAULT '[]',
  capital_flows JSONB DEFAULT '[]',
  emerging_hotspots TEXT[] DEFAULT '{}',
  cooling_markets TEXT[] DEFAULT '{}',
  growth_corridors TEXT[] DEFAULT '{}',
  currency_adjusted_zones TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_machine_year ON public.time_machine_snapshots(snapshot_year);

-- =====================
-- PHASE 4: INVESTOR DNA
-- =====================
CREATE TABLE IF NOT EXISTS public.investor_dna_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'demo-001',
  profile_type TEXT NOT NULL CHECK (profile_type IN (
    'yield_hunter', 'capital_growth', 'ultra_luxury_collector',
    'institutional_fund', 'family_office', 'nri_investor',
    'developer_syndicate', 'reit_manager'
  )),
  profile_name TEXT NOT NULL,
  risk_tolerance NUMERIC DEFAULT 50 CHECK (risk_tolerance >= 0 AND risk_tolerance <= 100),
  preferred_asset_classes TEXT[] DEFAULT '{}',
  preferred_countries TEXT[] DEFAULT '{}',
  preferred_cities TEXT[] DEFAULT '{}',
  min_budget NUMERIC DEFAULT 0,
  max_budget NUMERIC DEFAULT 999999999,
  min_yield NUMERIC DEFAULT 0,
  min_appreciation NUMERIC DEFAULT 0,
  holding_period_years INTEGER DEFAULT 5,
  max_loan_to_value NUMERIC DEFAULT 70,
  currency_preferences TEXT[] DEFAULT '{}',
  behavioral_traits JSONB DEFAULT '{}',
  adaptive_ui_settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investor_dna_user ON public.investor_dna_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_dna_type ON public.investor_dna_profiles(profile_type);

-- =====================
-- PHASE 5: NEGOTIATION LAB
-- =====================
CREATE TABLE IF NOT EXISTS public.negotiation_lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  project_name TEXT,
  city TEXT,
  country TEXT,
  asking_price NUMERIC NOT NULL,
  recommended_offer NUMERIC,
  max_walk_away NUMERIC,
  expected_discount_min NUMERIC,
  expected_discount_max NUMERIC,
  discount_probability NUMERIC DEFAULT 50,
  inventory_pressure_score NUMERIC DEFAULT 50,
  quarter_end_discount_probability NUMERIC DEFAULT 50,
  bulk_purchase_leverage NUMERIC DEFAULT 50,
  broker_competition_intensity NUMERIC DEFAULT 50,
  payment_plan_options JSONB DEFAULT '[]',
  developer_counteroffer_simulation JSONB DEFAULT '{}',
  commission_impact NUMERIC DEFAULT 0,
  negotiation_strategy TEXT,
  confidence NUMERIC DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

-- =====================
-- PHASE 6: GLOBAL OPPORTUNITY RADAR
-- =====================
CREATE TABLE IF NOT EXISTS public.radar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'price_anomaly', 'sudden_inventory_drop', 'infrastructure_announcement',
    'developer_distress', 'unusual_luxury_transaction', 'cross_border_capital_spike'
  )),
  title TEXT NOT NULL,
  description TEXT,
  city TEXT,
  country TEXT,
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  confidence NUMERIC DEFAULT 50,
  source_url TEXT,
  source_name TEXT,
  affected_properties_count INTEGER DEFAULT 0,
  estimated_value_impact NUMERIC,
  metadata JSONB DEFAULT '{}',
  is_alerted BOOLEAN DEFAULT FALSE,
  alerted_channels TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_radar_events_type ON public.radar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_radar_events_severity ON public.radar_events(severity);
CREATE INDEX IF NOT EXISTS idx_radar_events_created ON public.radar_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_radar_events_alerted ON public.radar_events(is_alerted);

-- =====================
-- PHASE 8: MULTI-AGENT ORCHESTRATION
-- =====================
CREATE TABLE IF NOT EXISTS public.agent_orchestrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('running', 'completed', 'failed', 'scheduled', 'pending_approval')) DEFAULT 'scheduled',
  confidence NUMERIC DEFAULT 50,
  data_sources TEXT[] DEFAULT '{}',
  reasoning_summary TEXT,
  requires_human_approval BOOLEAN DEFAULT FALSE,
  approved_by_human BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  output JSONB DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(run_id, agent_name)
);

CREATE INDEX IF NOT EXISTS idx_agent_orch_run ON public.agent_orchestrations(run_id);
CREATE INDEX IF NOT EXISTS idx_agent_orch_status ON public.agent_orchestrations(status);
CREATE INDEX IF NOT EXISTS idx_agent_orch_started ON public.agent_orchestrations(started_at DESC);

CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  task_type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  data_source TEXT,
  confidence NUMERIC DEFAULT 50,
  result JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent ON public.agent_tasks(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON public.agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_priority ON public.agent_tasks(priority);

-- =====================
-- PHASE 9: ENTERPRISE DATA ROOM
-- =====================
CREATE TABLE IF NOT EXISTS public.data_room_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'demo-001',
  deal_name TEXT NOT NULL,
  deal_type TEXT CHECK (deal_type IN ('acquisition', 'joint_venture', 'development', 'funding', 'exit', 'partnership')),
  property_name TEXT,
  city TEXT,
  country TEXT,
  deal_value NUMERIC,
  currency TEXT DEFAULT 'INR',
  status TEXT CHECK (status IN ('draft', 'active', 'underwriting', 'negotiation', 'closed', 'archived')) DEFAULT 'draft',
  nda_signed BOOLEAN DEFAULT FALSE,
  nda_signed_at TIMESTAMPTZ,
  access_level TEXT CHECK (access_level IN ('owner', 'editor', 'viewer', 'restricted')) DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_room_deals_user ON public.data_room_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_data_room_deals_status ON public.data_room_deals(status);

CREATE TABLE IF NOT EXISTS public.data_room_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.data_room_deals(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT CHECK (document_type IN (
    'investment_memo', 'financial_model', 'market_report',
    'legal_document', 'nda', 'title_document', 'appraisal',
    'environmental_report', 'permits', 'correspondence'
  )),
  is_watermarked BOOLEAN DEFAULT FALSE,
  watermark_text TEXT,
  version INTEGER DEFAULT 1,
  file_url TEXT,
  file_size_bytes BIGINT DEFAULT 0,
  uploaded_by TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_room_docs_deal ON public.data_room_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_data_room_docs_type ON public.data_room_documents(document_type);

CREATE TABLE IF NOT EXISTS public.data_room_ndas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.data_room_deals(id) ON DELETE CASCADE,
  counterparty_name TEXT NOT NULL,
  counterparty_email TEXT,
  counterparty_entity TEXT,
  nda_version TEXT,
  signed_by_user BOOLEAN DEFAULT FALSE,
  signed_by_counterparty BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_room_ndas_deal ON public.data_room_ndas(deal_id);

-- =====================
-- RLS POLICIES
-- =====================
ALTER TABLE public.graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_machine_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_dna_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiation_lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_orchestrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_room_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_room_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_room_ndas ENABLE ROW LEVEL SECURITY;

-- Read-only policies for authenticated users
DROP POLICY IF EXISTS "Authenticated read graph_nodes" ON public.graph_nodes;
CREATE POLICY "Authenticated read graph_nodes" ON public.graph_nodes FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read graph_edges" ON public.graph_edges;
CREATE POLICY "Authenticated read graph_edges" ON public.graph_edges FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read capital_predictions" ON public.capital_predictions;
CREATE POLICY "Authenticated read capital_predictions" ON public.capital_predictions FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read time_machine_snapshots" ON public.time_machine_snapshots;
CREATE POLICY "Authenticated read time_machine_snapshots" ON public.time_machine_snapshots FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users manage own investor_dna" ON public.investor_dna_profiles;
CREATE POLICY "Users manage own investor_dna" ON public.investor_dna_profiles FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Authenticated read negotiation_lab" ON public.negotiation_lab_results;
CREATE POLICY "Authenticated read negotiation_lab" ON public.negotiation_lab_results FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read radar_events" ON public.radar_events;
CREATE POLICY "Authenticated read radar_events" ON public.radar_events FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read agent_orchestrations" ON public.agent_orchestrations;
CREATE POLICY "Authenticated read agent_orchestrations" ON public.agent_orchestrations FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read agent_tasks" ON public.agent_tasks;
CREATE POLICY "Authenticated read agent_tasks" ON public.agent_tasks FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users manage own data_room" ON public.data_room_deals;
CREATE POLICY "Users manage own data_room" ON public.data_room_deals FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users manage own data_room_docs" ON public.data_room_documents;
CREATE POLICY "Users manage own data_room_docs" ON public.data_room_documents FOR ALL USING (true);

DROP POLICY IF EXISTS "Users manage own data_room_ndas" ON public.data_room_ndas;
CREATE POLICY "Users manage own data_room_ndas" ON public.data_room_ndas FOR ALL USING (true);
