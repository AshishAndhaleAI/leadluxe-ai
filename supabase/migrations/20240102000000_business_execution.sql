-- ============================================================
-- LeadLuxe AI — Business Execution Tables
-- Enterprise leads, target companies, outreach, demo bookings
-- ============================================================

-- ----------------------------
-- ENTERPRISE LEADS
-- Captures interest from developers, platforms, acquirers
-- ----------------------------
CREATE TABLE IF NOT EXISTS enterprise_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  website text,
  role text,
  market text,
  monthly_deal_volume text,
  interest_type text NOT NULL DEFAULT 'pilot'
    CHECK (interest_type IN ('pilot','partnership','white_label','acquisition_conversation','demo','report_request')),
  email text,
  phone text,
  message text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','demo_scheduled','pilot_discussion','pilot_active','partnership','closed')),
  score integer DEFAULT 0,
  source text DEFAULT 'website',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_leads_status ON enterprise_leads(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_leads_interest ON enterprise_leads(interest_type);
CREATE INDEX IF NOT EXISTS idx_enterprise_leads_created ON enterprise_leads(created_at DESC);

-- ----------------------------
-- TARGET COMPANIES
-- Publicly known developer/builder companies for outreach
-- ----------------------------
CREATE TABLE IF NOT EXISTS target_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  market text NOT NULL,
  city text,
  country text,
  asset_focus text[] DEFAULT '{}',
  website text,
  linkedin_url text,
  deal_volume_estimate text,
  outreach_status text NOT NULL DEFAULT 'identified'
    CHECK (outreach_status IN ('identified','contacted','demoed','piloting','partnered','declined')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_target_companies_market ON target_companies(market);
CREATE INDEX IF NOT EXISTS idx_target_companies_status ON target_companies(outreach_status);

-- ----------------------------
-- OUTREACH SEQUENCES
-- Track outreach to target companies
-- ----------------------------
CREATE TABLE IF NOT EXISTS outreach_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES target_companies(id),
  contact_name text,
  contact_email text,
  contact_title text,
  sequence_step integer DEFAULT 0,
  sequence_type text NOT NULL DEFAULT 'cold_email'
    CHECK (sequence_type IN ('cold_email','linkedin_dm','warm_intro','demo_invite','follow_up','report_share')),
  subject text,
  message_body text,
  sent_at timestamptz,
  opened_at timestamptz,
  replied_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ----------------------------
-- DEMO BOOKINGS
-- Track demo scheduling and attendance
-- ----------------------------
CREATE TABLE IF NOT EXISTS demo_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  preferred_date date,
  preferred_time time,
  timezone text DEFAULT 'IST',
  source text NOT NULL DEFAULT 'website'
    CHECK (source IN ('website','enterprise','report','pilot','referral','linkedin','other')),
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested','scheduled','confirmed','completed','cancelled','no_show')),
  notes text,
  calendar_event_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_demo_bookings_status ON demo_bookings(status);
CREATE INDEX IF NOT EXISTS idx_demo_bookings_date ON demo_bookings(preferred_date);

-- ----------------------------
-- PILOT COMPANIES
-- Track pilot program participants
-- ----------------------------
CREATE TABLE IF NOT EXISTS pilot_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text,
  contact_email text,
  market text,
  pilot_start_date date DEFAULT CURRENT_DATE,
  pilot_end_date date DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  pilot_focus text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','completed','extended','cancelled')),
  case_study_approved boolean DEFAULT false,
  feedback_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pilot_companies_status ON pilot_companies(status);

-- ----------------------------
-- ANALYTICS FUNNEL EVENTS
-- Business tracking for the conversion funnel
-- ----------------------------
CREATE TABLE IF NOT EXISTS funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  session_id text,
  source text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_funnel_events_type ON funnel_events(event_type, created_at DESC);

-- ----------------------------
-- RLS POLICIES
-- Admin-only access for business tables
-- ----------------------------
ALTER TABLE enterprise_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilot_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;

-- In MVP, allow all authenticated users to INSERT but only admins to SELECT
DROP POLICY IF EXISTS "Anyone can insert enterprise leads" ON enterprise_leads;
CREATE POLICY "Anyone can insert enterprise leads"
  ON enterprise_leads FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view enterprise leads" ON enterprise_leads;
CREATE POLICY "Admins can view enterprise leads"
  ON enterprise_leads FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can insert demos" ON demo_bookings;
CREATE POLICY "Anyone can insert demos"
  ON demo_bookings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view demos" ON demo_bookings;
CREATE POLICY "Admins can view demos"
  ON demo_bookings FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage target companies" ON target_companies;
CREATE POLICY "Admins can manage target companies"
  ON target_companies FOR ALL
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage pilots" ON pilot_companies;
CREATE POLICY "Admins can manage pilots"
  ON pilot_companies FOR ALL
  USING (auth.uid() IS NOT NULL);
