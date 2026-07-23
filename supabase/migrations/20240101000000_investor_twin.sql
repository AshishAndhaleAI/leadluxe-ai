-- ============================================================
-- LeadLuxe AI — Investor Twin System
-- Tables: investor_profiles, investor_behavior, investor_alerts
-- ============================================================

-- ----------------------------
-- INVESTOR PROFILES
-- Persists user investment preferences and twin configuration.
-- ----------------------------
CREATE TABLE IF NOT EXISTS investor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  -- Location
  country text NOT NULL,
  city text NOT NULL,
  -- Budget
  budget_min numeric NOT NULL DEFAULT 5000000,
  budget_max numeric NOT NULL DEFAULT 50000000,
  currency text NOT NULL DEFAULT 'INR',
  -- Preferences
  risk_tolerance text NOT NULL DEFAULT 'medium' CHECK (risk_tolerance IN ('low','medium','high')),
  investment_goal text NOT NULL DEFAULT 'appreciation' CHECK (investment_goal IN ('rental','appreciation','commercial','luxury','land_banking','international')),
  holding_period_years integer NOT NULL DEFAULT 5,
  preferred_asset_classes text[] DEFAULT '{}',
  liquidity_preference text NOT NULL DEFAULT 'moderate' CHECK (liquidity_preference IN ('low','moderate','high')),
  -- Twin metadata
  twin_name text,
  twin_created_at timestamptz DEFAULT now(),
  last_scan_at timestamptz DEFAULT now(),
  total_matches_generated integer DEFAULT 0,
  avg_match_score numeric DEFAULT 0,
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ----------------------------
-- INVESTOR BEHAVIOR
-- Tracks every user interaction for learning.
-- ----------------------------
CREATE TABLE IF NOT EXISTS investor_behavior (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  action_type text NOT NULL,
  entity_id text,
  entity_type text,
  dwell_time_ms integer,
  metadata jsonb DEFAULT '{}',
  session_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investor_behavior_user ON investor_behavior(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_behavior_action ON investor_behavior(action_type);
CREATE INDEX IF NOT EXISTS idx_investor_behavior_entity ON investor_behavior(entity_id);

-- ----------------------------
-- INVESTOR ALERTS
-- Priority-based notification system for matching opportunities.
-- ----------------------------
CREATE TABLE IF NOT EXISTS investor_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  opportunity_id text,
  alert_type text NOT NULL DEFAULT 'match' CHECK (alert_type IN ('match','watchlist','market_change','risk','commission','portfolio_drift')),
  priority integer NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 4),
  title text NOT NULL,
  description text,
  match_score numeric,
  estimated_commission numeric,
  reason text,
  source_url text,
  delivered boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investor_alerts_user ON investor_alerts(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_investor_alerts_delivered ON investor_alerts(user_id, delivered);
CREATE INDEX IF NOT EXISTS idx_investor_alerts_created ON investor_alerts(created_at DESC);

-- ----------------------------
-- PORTFOLIO ITEMS (Phase 7)
-- Tracks user-saved assets for the Portfolio Twin.
-- ----------------------------
CREATE TABLE IF NOT EXISTS investor_portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  opportunity_id text NOT NULL,
  property_name text,
  property_value numeric NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  acquisition_cost numeric,
  expected_commission numeric,
  expected_annual_yield numeric,
  expected_appreciation numeric,
  risk_score numeric,
  holding_period_years integer DEFAULT 5,
  status text NOT NULL DEFAULT 'watching' CHECK (status IN ('watching','negotiating','closed','sold')),
  notes text,
  added_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_user ON investor_portfolio_items(user_id);

-- ----------------------------
-- TWIN MATCH LOG (audit trail for every match generated)
-- ----------------------------
CREATE TABLE IF NOT EXISTS twin_match_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  opportunity_id text,
  match_score numeric NOT NULL,
  risk_adjusted_score numeric,
  commission_estimate numeric,
  matched_on text[] DEFAULT '{}',
  invalidated_by text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_twin_match_log_user ON twin_match_log(user_id, created_at DESC);

-- ----------------------------
-- RLS POLICIES (safe, non-recursive)
-- ----------------------------
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE twin_match_log ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
DROP POLICY IF EXISTS "Users own their profile" ON investor_profiles;
CREATE POLICY "Users own their profile"
  ON investor_profiles FOR ALL
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users own their behavior" ON investor_behavior;
CREATE POLICY "Users own their behavior"
  ON investor_behavior FOR ALL
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users own their alerts" ON investor_alerts;
CREATE POLICY "Users own their alerts"
  ON investor_alerts FOR ALL
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users own their portfolio" ON investor_portfolio_items;
CREATE POLICY "Users own their portfolio"
  ON investor_portfolio_items FOR ALL
  USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users own their match log" ON twin_match_log;
CREATE POLICY "Users own their match log"
  ON investor_portfolio_items FOR ALL
  USING (user_id = auth.uid()::text);
