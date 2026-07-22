-- ============================================================
-- LeadLuxe AI — AI Deal Intelligence Platform Schema
-- Version 3.0 — Clean slate for opportunity engine
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================
-- DEVELOPERS
-- =====================
CREATE TABLE IF NOT EXISTS public.developers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  headquarters VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  founded_year INTEGER,
  builder_type VARCHAR(50) CHECK (builder_type IN ('public', 'private', 'partnership', 'individual')),
  pricing_segment VARCHAR(50) CHECK (pricing_segment IN ('budget', 'mid_range', 'premium', 'luxury', 'ultra_luxury')),
  annual_revenue DECIMAL(20,2),
  growth_rate DECIMAL(5,2),
  market_share DECIMAL(5,2),
  total_projects INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  total_units_delivered INTEGER DEFAULT 0,
  hiring_trend VARCHAR(50) CHECK (hiring_trend IN ('increasing', 'stable', 'decreasing')),
  hiring_count INTEGER DEFAULT 0,
  funding_info TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  expansion_plans TEXT[],
  is_tracked BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_developers_city ON public.developers(city);
CREATE INDEX idx_developers_tracked ON public.developers(is_tracked);
CREATE INDEX idx_developers_name_trgm ON public.developers USING gin(name gin_trgm_ops);

-- =====================
-- PROJECTS
-- =====================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  project_type VARCHAR(50) CHECK (project_type IN (
    'luxury_residential', 'premium_residential', 'mid_range_residential',
    'affordable_housing', 'commercial', 'mixed_use', 'township',
    'villa', 'penthouse', 'studio', 'plot', 'land'
  )),
  status VARCHAR(50) DEFAULT 'announced' CHECK (status IN (
    'announced', 'pre_launch', 'launched', 'ongoing_construction',
    'ready_to_move', 'completed', 'paused', 'cancelled'
  )),
  location VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  pin_code VARCHAR(10),
  total_units INTEGER,
  total_towers INTEGER,
  floor_count INTEGER,
  unit_types TEXT[],
  area_range_min DECIMAL(12,2),
  area_range_max DECIMAL(12,2),
  price_range_min DECIMAL(15,2),
  price_range_max DECIMAL(15,2),
  amenities TEXT[],
  rera_number VARCHAR(100),
  rera_status VARCHAR(50) CHECK (rera_status IN ('applied', 'approved', 'not_applied')),
  occupancy_date DATE,
  launch_date DATE,
  completion_date DATE,
  architect VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_developer ON public.projects(developer_id);
CREATE INDEX idx_projects_city ON public.projects(city);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_type ON public.projects(project_type);
CREATE INDEX idx_projects_name_trgm ON public.projects USING gin(name gin_trgm_ops);

-- =====================
-- SIGNALS (Buying Signals / Market Intelligence)
-- =====================
CREATE TABLE IF NOT EXISTS public.signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID REFERENCES public.developers(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  signal_type VARCHAR(50) NOT NULL CHECK (signal_type IN (
    'rera_filing', 'government_approval', 'land_acquisition',
    'builder_hiring', 'funding_raised', 'project_launch',
    'partnership', 'expansion', 'market_trend', 'news_coverage',
    'permit_issued', 'construction_start', 'price_change',
    'management_change', 'legal_update', 'award_recognition'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  source VARCHAR(255),
  source_url TEXT,
  source_type VARCHAR(50) CHECK (source_type IN (
    'google_news', 'builder_website', 'company_website',
    'rera_portal', 'government_portal', 'newsletter',
    'social_media', 'job_portal', 'land_registry', 'manual'
  )),
  raw_data JSONB,
  normalized_data JSONB,
  relevance_score INTEGER DEFAULT 0 CHECK (relevance_score >= 0 AND relevance_score <= 100),
  impact_level VARCHAR(20) CHECK (impact_level IN ('critical', 'high', 'medium', 'low', 'informational')),
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_signals_developer ON public.signals(developer_id);
CREATE INDEX idx_signals_type ON public.signals(signal_type);
CREATE INDEX idx_signals_impact ON public.signals(impact_level);
CREATE INDEX idx_signals_processed ON public.signals(is_processed);
CREATE INDEX idx_signals_created ON public.signals(created_at DESC);

-- =====================
-- SOURCES (Data Connector Tracking)
-- =====================
CREATE TABLE IF NOT EXISTS public.sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN (
    'google_news', 'builder_website', 'company_website',
    'rera_portal', 'government_portal', 'newsletter',
    'social_media', 'job_portal', 'land_registry', 'manual',
    'rss_feed', 'api', 'web_scraper'
  )),
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  schedule_interval VARCHAR(50) DEFAULT 'every_6h' CHECK (schedule_interval IN (
    'every_15m', 'every_1h', 'every_6h', 'every_12h', 'every_24h', 'weekly', 'manual'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- OPPORTUNITIES
-- =====================
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  opportunity_type VARCHAR(50) CHECK (opportunity_type IN (
    'new_project', 'pre_launch', 'phase_launch', 'bulk_booking',
    'joint_venture', 'investment', 'fractional_ownership',
    'commercial_lease', 'land_deal', 'renovation'
  )),
  estimated_value DECIMAL(20,2),
  confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  priority VARCHAR(20) CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  deal_stage VARCHAR(50) DEFAULT 'discovered' CHECK (deal_stage IN (
    'discovered', 'qualifying', 'analyzing', 'proposal',
    'negotiation', 'closing', 'closed_won', 'closed_lost'
  )),
  commission_percentage DECIMAL(5,2) DEFAULT 3.00,
  estimated_commission DECIMAL(20,2),
  commission_currency VARCHAR(10) DEFAULT 'INR',
  reasoning TEXT[],
  recommended_actions TEXT[],
  next_best_action VARCHAR(500),
  best_contact_day VARCHAR(20),
  best_contact_channel VARCHAR(50),
  best_followup_timing VARCHAR(100),
  closing_probability DECIMAL(5,2),
  potential_objections TEXT[],
  suggested_pitch TEXT,
  ai_analysis JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opportunities_developer ON public.opportunities(developer_id);
CREATE INDEX idx_opportunities_project ON public.opportunities(project_id);
CREATE INDEX idx_opportunities_confidence ON public.opportunities(confidence_score DESC);
CREATE INDEX idx_opportunities_stage ON public.opportunities(deal_stage);
CREATE INDEX idx_opportunities_active ON public.opportunities(is_active);
CREATE INDEX idx_opportunities_value ON public.opportunities(estimated_value DESC);
CREATE INDEX idx_opportunities_priority ON public.opportunities(priority);

-- =====================
-- COMMISSION RECORDS
-- =====================
CREATE TABLE IF NOT EXISTS public.commission_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE,
  deal_value DECIMAL(20,2) NOT NULL,
  commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 3.00,
  commission_amount DECIMAL(20,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'estimated', 'negotiated', 'confirmed', 'invoiced',
    'paid', 'partial', 'overdue', 'cancelled', 'refunded'
  )),
  invoice_number VARCHAR(100),
  invoice_date DATE,
  invoice_url TEXT,
  payment_date DATE,
  payment_reference VARCHAR(255),
  payment_method VARCHAR(50),
  paid_amount DECIMAL(20,2),
  due_date DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commission_opportunity ON public.commission_records(opportunity_id);
CREATE INDEX idx_commission_developer ON public.commission_records(developer_id);
CREATE INDEX idx_commission_status ON public.commission_records(status);
CREATE INDEX idx_commission_dates ON public.commission_records(invoice_date, payment_date);

-- =====================
-- ACTIVITY LOGS
-- =====================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN (
    'developer', 'project', 'signal', 'opportunity',
    'commission', 'source', 'connector', 'system'
  )),
  entity_id UUID,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  changes JSONB,
  actor VARCHAR(255) DEFAULT 'system',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_created ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_actor ON public.activity_logs(actor);

-- =====================
-- AUTO-UPDATE TRIGGERS
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_developers_updated_at
  BEFORE UPDATE ON public.developers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_records_updated_at
  BEFORE UPDATE ON public.commission_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sources_updated_at
  BEFORE UPDATE ON public.sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================
-- REALTIME PUBLICATION
-- =====================
ALTER PUBLICATION supabase_realtime ADD TABLE public.developers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commission_records;

-- Note: RLS is DISABLED for MVP/demo mode.
-- All tables are accessible without policy checks.
-- =====================
