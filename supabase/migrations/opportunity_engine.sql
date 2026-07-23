-- ============================================================
-- LeadLuxe AI — AI Opportunity Discovery Engine
-- Tables for storing discovered opportunities, evidence,
-- market scores, and the ingestion pipeline.
-- ============================================================

-- OPPORTUNITIES: Core table
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Project identity
  project_id text,
  title text NOT NULL,
  description text,
  
  -- Location
  country_code text NOT NULL,
  country_name text NOT NULL,
  city_name text NOT NULL,
  district_name text,
  latitude double precision,
  longitude double precision,
  
  -- Developer
  developer_name text,
  developer_id text,
  
  -- Financials
  property_type text,
  property_value numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  commission_rate numeric NOT NULL DEFAULT 3.0,
  estimated_commission numeric NOT NULL DEFAULT 0,
  commission_usd numeric NOT NULL DEFAULT 0,
  
  -- AI Scores
  confidence_score numeric NOT NULL DEFAULT 0,
  market_score numeric NOT NULL DEFAULT 0,
  urgency numeric NOT NULL DEFAULT 0,
  roi_score numeric NOT NULL DEFAULT 0,
  liquidity_score numeric NOT NULL DEFAULT 0,
  ai_score_total numeric GENERATED ALWAYS AS (
    ROUND((confidence_score + market_score + urgency + roi_score + liquidity_score) / 5)
  ) STORED,
  
  -- Status
  status text NOT NULL DEFAULT 'active',
  priority text NOT NULL DEFAULT 'medium',
  
  -- Evidence tracking
  signal_count int NOT NULL DEFAULT 0,
  evidence_count int NOT NULL DEFAULT 0,
  
  -- Metadata
  source_name text,
  source_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Indexes
  CONSTRAINT valid_status CHECK (status IN ('active', 'qualified', 'negotiation', 'closed', 'lost'))
);

-- OPPORTUNITY EVIDENCE: Source attribution
CREATE TABLE IF NOT EXISTS opportunity_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  source_name text NOT NULL,
  source_url text,
  evidence_type text NOT NULL,
  extracted_statement text,
  confidence_weight numeric NOT NULL DEFAULT 1.0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- CITY MARKET SCORES: Per-city intelligence
CREATE TABLE IF NOT EXISTS city_market_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text NOT NULL,
  country_name text NOT NULL,
  city_name text NOT NULL,
  market_score numeric NOT NULL DEFAULT 0,
  price_momentum numeric NOT NULL DEFAULT 0,
  rental_yield numeric NOT NULL DEFAULT 0,
  infrastructure_score numeric NOT NULL DEFAULT 0,
  developer_activity numeric NOT NULL DEFAULT 0,
  foreign_investment numeric NOT NULL DEFAULT 0,
  inventory_demand_ratio numeric NOT NULL DEFAULT 0,
  signal_count int NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(country_code, city_name)
);

-- INGESTION LOG: Track pipeline runs
CREATE TABLE IF NOT EXISTS ingestion_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type text NOT NULL,
  status text NOT NULL DEFAULT 'running',
  records_fetched int DEFAULT 0,
  signals_extracted int DEFAULT 0,
  opportunities_generated int DEFAULT 0,
  failed_count int DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- SIGNALS: Live market signals
CREATE TABLE IF NOT EXISTS signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code text,
  city_name text,
  signal_type text NOT NULL,
  title text NOT NULL,
  description text,
  source_name text,
  source_url text,
  confidence numeric DEFAULT 50,
  severity text DEFAULT 'info',
  is_processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_opp_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opp_country ON opportunities(country_code);
CREATE INDEX IF NOT EXISTS idx_opp_city ON opportunities(city_name);
CREATE INDEX IF NOT EXISTS idx_opp_confidence ON opportunities(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_opp_created ON opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_opportunity ON opportunity_evidence(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_city_scores ON city_market_scores(market_score DESC);
CREATE INDEX IF NOT EXISTS idx_signals_created ON signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_status ON ingestion_log(status);

-- Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_market_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated users
CREATE POLICY "Anyone can read opportunities" ON opportunities FOR SELECT USING (true);
CREATE POLICY "Anyone can read evidence" ON opportunity_evidence FOR SELECT USING (true);
CREATE POLICY "Anyone can read city scores" ON city_market_scores FOR SELECT USING (true);
CREATE POLICY "Anyone can read ingestion log" ON ingestion_log FOR SELECT USING (true);
CREATE POLICY "Anyone can read signals" ON signals FOR SELECT USING (true);
