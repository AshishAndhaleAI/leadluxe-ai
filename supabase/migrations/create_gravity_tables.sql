-- ============================================================
-- LeadLuxe AI — Gravity Engine Database Tables
-- Tracks infrastructure projects, market signals, developer
-- momentum, and commission events for the Gravity Engine
-- ============================================================

-- ============================================================
-- 1. gravity_signals — detected market signals per city
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gravity_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id TEXT NOT NULL,
  city_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  signal_category TEXT NOT NULL CHECK (signal_category IN (
    'search_demand', 'price_momentum', 'infrastructure_proximity',
    'developer_activity', 'inventory_absorption', 'rental_yield',
    'user_location_match', 'cross_border_interest',
    'infrastructure_velocity', 'employment_gravity',
    'market_inefficiency', 'capital_magnetism', 'demographic_pull'
  )),
  signal_label TEXT NOT NULL,
  signal_detail TEXT,
  signal_value REAL NOT NULL DEFAULT 0,
  normalized_score REAL NOT NULL DEFAULT 0 CHECK (normalized_score >= 0 AND normalized_score <= 100),
  direction TEXT NOT NULL DEFAULT 'neutral' CHECK (direction IN ('positive', 'negative', 'neutral')),
  weight REAL NOT NULL DEFAULT 0.5 CHECK (weight >= 0 AND weight <= 1),
  source_url TEXT,
  gravity_score REAL DEFAULT 0,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gravity_signals_city ON public.gravity_signals (city_id);
CREATE INDEX idx_gravity_signals_category ON public.gravity_signals (signal_category);
CREATE INDEX idx_gravity_signals_detected ON public.gravity_signals (detected_at DESC);

-- ============================================================
-- 2. infrastructure_projects — known infrastructure projects
-- ============================================================
CREATE TABLE IF NOT EXISTS public.infrastructure_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN (
    'metro', 'highway', 'airport', 'railway', 'bridge',
    'government', 'commercial', 'mixed_use', 'renewable', 'utility'
  )),
  city_id TEXT,
  city_name TEXT,
  country_code TEXT DEFAULT 'IN',
  latitude REAL,
  longitude REAL,
  impact_level TEXT NOT NULL DEFAULT 'medium' CHECK (impact_level IN ('critical', 'high', 'medium', 'low')),
  estimated_budget REAL, -- In INR crores
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'announced' CHECK (status IN (
    'proposed', 'announced', 'under_construction', 'completed', 'delayed', 'cancelled'
  )),
  announcement_date DATE,
  start_date DATE,
  completion_date DATE,
  contractor TEXT,
  developer TEXT,
  description TEXT,
  source_url TEXT,
  source_name TEXT,
  is_tracked BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_infra_city ON public.infrastructure_projects (city_id);
CREATE INDEX idx_infra_status ON public.infrastructure_projects (status);
CREATE INDEX idx_infra_type ON public.infrastructure_projects (project_type);
CREATE INDEX idx_infra_impact ON public.infrastructure_projects (impact_level);

-- ============================================================
-- 3. market_transactions — recorded property transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.market_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id TEXT NOT NULL,
  city_name TEXT NOT NULL,
  country_code TEXT DEFAULT 'IN',
  district TEXT,
  property_type TEXT CHECK (property_type IN (
    'apartment', 'villa', 'penthouse', 'commercial', 'land', 'plot', 'townhouse'
  )),
  transaction_type TEXT NOT NULL DEFAULT 'sale' CHECK (transaction_type IN ('sale', 'lease', 'rental', 'pre_booking')),
  deal_value REAL NOT NULL,
  currency TEXT DEFAULT 'INR',
  price_per_sqft REAL,
  area_sqft REAL,
  units_count INTEGER DEFAULT 1,
  buyer_type TEXT CHECK (buyer_type IN ('individual', 'hni', 'institutional', 'foreign', 'developer', 'reit')),
  seller_type TEXT CHECK (seller_type IN ('individual', 'developer', 'institutional', 'government')),
  transaction_date DATE,
  registration_date DATE,
  source_name TEXT,
  source_url TEXT,
  confidence REAL DEFAULT 0.7 CHECK (confidence >= 0 AND confidence <= 1),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tx_city ON public.market_transactions (city_id);
CREATE INDEX idx_tx_date ON public.market_transactions (transaction_date DESC);
CREATE INDEX idx_tx_value ON public.market_transactions (deal_value DESC);
CREATE INDEX idx_tx_type ON public.market_transactions (transaction_type);

-- ============================================================
-- 4. developer_momentum — developer activity tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS public.developer_momentum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID,
  developer_name TEXT NOT NULL,
  slug TEXT,
  city_id TEXT,
  city_name TEXT,
  country_code TEXT DEFAULT 'IN',
  projects_active INTEGER DEFAULT 0,
  projects_upcoming INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  units_delivered INTEGER DEFAULT 0,
  units_upcoming INTEGER DEFAULT 0,
  hiring_count INTEGER DEFAULT 0,
  hiring_trend TEXT DEFAULT 'stable' CHECK (hiring_trend IN ('increasing', 'stable', 'decreasing')),
  funding_raised REAL,
  funding_currency TEXT DEFAULT 'INR',
  funding_round TEXT,
  momentum_score REAL DEFAULT 50 CHECK (momentum_score >= 0 AND momentum_score <= 100),
  momentum_direction TEXT DEFAULT 'stable' CHECK (momentum_direction IN ('accelerating', 'stable', 'decelerating')),
  last_active_date DATE,
  source_name TEXT,
  source_url TEXT,
  metadata JSONB DEFAULT '{}',
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dev_momentum_city ON public.developer_momentum (city_id);
CREATE INDEX idx_dev_momentum_score ON public.developer_momentum (momentum_score DESC);
CREATE INDEX idx_dev_momentum_date ON public.developer_momentum (snapshot_date DESC);
CREATE INDEX idx_dev_momentum_name ON public.developer_momentum (developer_name);

-- ============================================================
-- 5. commission_events — commission tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS public.commission_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id TEXT,
  city_name TEXT,
  country_code TEXT DEFAULT 'IN',
  opportunity_id UUID,
  developer_id UUID,
  developer_name TEXT,
  deal_value REAL NOT NULL,
  commission_rate REAL NOT NULL DEFAULT 0.03 CHECK (commission_rate >= 0 AND commission_rate <= 0.5),
  gross_commission REAL NOT NULL,
  expected_commission REAL,
  deal_probability REAL DEFAULT 0.5 CHECK (deal_probability >= 0 AND deal_probability <= 1),
  status TEXT NOT NULL DEFAULT 'estimated' CHECK (status IN (
    'estimated', 'projected', 'negotiated', 'confirmed',
    'invoiced', 'paid', 'partial', 'overdue', 'cancelled'
  )),
  closing_probability_30d REAL CHECK (closing_probability_30d >= 0 AND closing_probability_30d <= 100),
  estimated_close_date DATE,
  actual_close_date DATE,
  payment_date DATE,
  payment_reference TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comm_city ON public.commission_events (city_id);
CREATE INDEX idx_comm_status ON public.commission_events (status);
CREATE INDEX idx_comm_value ON public.commission_events (gross_commission DESC);
CREATE INDEX idx_comm_date ON public.commission_events (created_at DESC);

-- ============================================================
-- Enable Row Level Security
-- ============================================================
ALTER TABLE public.gravity_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_momentum ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_events ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Allow read access to all authenticated users"
ON public.gravity_signals FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to all authenticated users"
ON public.infrastructure_projects FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to all authenticated users"
ON public.market_transactions FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to all authenticated users"
ON public.developer_momentum FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to all authenticated users"
ON public.commission_events FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own events
CREATE POLICY "Allow insert for authenticated users"
ON public.commission_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated users"
ON public.commission_events FOR UPDATE USING (auth.role() = 'authenticated');
