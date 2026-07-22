-- LeadLuxe AI - Enterprise Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- USERS TABLE (extends Supabase Auth)
-- =====================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'agent')),
  avatar_url TEXT,
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- PROJECTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location TEXT,
  property_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  budget_range_min DECIMAL(15,2),
  budget_range_max DECIMAL(15,2),
  total_units INTEGER,
  amenities TEXT[],
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- LEADS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  budget DECIMAL(15,2),
  preferred_location TEXT,
  property_type VARCHAR(100),
  visit_timeline VARCHAR(100),
  source VARCHAR(100) DEFAULT 'website' CHECK (source IN ('website', 'whatsapp', 'referral', 'social_media', 'email', 'phone', 'other')),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'site_visit', 'negotiation', 'booked', 'lost')),
  notes TEXT,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  score_factors JSONB,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  campaign_id UUID,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- LEAD EVENTS (Journey Timeline)
-- =====================
CREATE TABLE IF NOT EXISTS public.lead_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_label VARCHAR(255),
  event_description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- CONVERSATIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  source VARCHAR(50) DEFAULT 'website' CHECK (source IN ('website', 'whatsapp', 'email', 'phone')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  subject VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- MESSAGES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('lead', 'agent', 'admin', 'ai_bot', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- SITE VISITS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.site_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  notes TEXT,
  assigned_agent UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- LEAD SCORES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.lead_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  budget_score INTEGER DEFAULT 0,
  urgency_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  source_score INTEGER DEFAULT 0,
  factors JSONB,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id)
);

-- =====================
-- CAMPAIGNS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('social_media', 'google_ads', 'email', 'whatsapp', 'referral', 'direct')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'draft')),
  budget DECIMAL(15,2),
  spent DECIMAL(15,2),
  leads_generated INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- WHATSAPP MESSAGES QUEUE
-- =====================
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  template_name VARCHAR(255),
  parameters JSONB,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ANALYTICS EVENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  page VARCHAR(255),
  session_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- BOOKINGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  booking_date TIMESTAMPTZ NOT NULL,
  amount DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- NOTIFICATIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'lead')),
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id ON public.lead_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_events_created_at ON public.lead_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON public.conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_lead_id ON public.site_visits(lead_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_date ON public.site_visits(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_lead_id ON public.whatsapp_messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);

-- =====================
-- TRIGGER: Update updated_at
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_visits_updated_at BEFORE UPDATE ON public.site_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lead_scores_updated_at BEFORE UPDATE ON public.lead_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================
-- TRIGGER: Auto-create user profile on signup
-- =====================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'admin'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================
-- TRIGGER: Auto-create lead event on status change
-- =====================
CREATE OR REPLACE FUNCTION handle_lead_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.lead_events (lead_id, event_type, event_label, event_description)
    VALUES (
      NEW.id,
      'status_changed',
      'Status → ' || NEW.status,
      'Lead moved from ' || COALESCE(OLD.status, 'new') || ' to ' || NEW.status
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_lead_status_change
  AFTER UPDATE OF status ON public.leads
  FOR EACH ROW EXECUTE FUNCTION handle_lead_status_change();

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own row.
-- NOTE: Do NOT add role-based subqueries here (e.g. "auth.uid() IN (SELECT id
-- FROM public.users WHERE role = 'admin')") — that would query public.users
-- from within a policy ON public.users, causing infinite recursion.
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (id = auth.uid());
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =====================
-- PROJECTS RLS
-- =====================
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Users can insert projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- =====================
-- LEADS RLS
-- =====================
CREATE POLICY leads_select_policy ON public.leads
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY leads_insert_policy ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY leads_update_policy ON public.leads
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY leads_delete_policy ON public.leads
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- =====================
-- LEAD EVENTS RLS (inherited ownership through leads table)
-- =====================
CREATE POLICY "Users can view own lead events" ON public.lead_events
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );
CREATE POLICY "Users can insert lead events" ON public.lead_events
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );

-- =====================
-- CONVERSATIONS RLS (inherited ownership through leads table)
-- =====================
CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );
CREATE POLICY "Users can insert conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );
CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );

-- =====================
-- MESSAGES RLS (inherited ownership through conversations → leads)
-- =====================
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT l.user_id FROM public.conversations c
      JOIN public.leads l ON l.id = c.lead_id
      WHERE c.id = conversation_id
    )
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );
CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT l.user_id FROM public.conversations c
      JOIN public.leads l ON l.id = c.lead_id
      WHERE c.id = conversation_id
    )
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );

-- =====================
-- SITE VISITS RLS (inherited ownership through leads)
-- =====================
CREATE POLICY "Users can view own site visits" ON public.site_visits
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );
CREATE POLICY "Users can insert site visits" ON public.site_visits
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );
CREATE POLICY "Users can update own site visits" ON public.site_visits
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );

-- =====================
-- LEAD SCORES RLS (inherited ownership through leads)
-- =====================
CREATE POLICY "Users can view own lead scores" ON public.lead_scores
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );
CREATE POLICY "Users can insert lead scores" ON public.lead_scores
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );
CREATE POLICY "Users can update own lead scores" ON public.lead_scores
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );

-- =====================
-- CAMPAIGNS RLS
-- =====================
CREATE POLICY "Users can manage own campaigns" ON public.campaigns
  FOR ALL USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));

-- =====================
-- WHATSAPP MESSAGES RLS (inherited ownership through leads)
-- =====================
CREATE POLICY "Users can view own whatsapp messages" ON public.whatsapp_messages
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );
CREATE POLICY "Users can insert whatsapp messages" ON public.whatsapp_messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );
CREATE POLICY "Users can update own whatsapp messages" ON public.whatsapp_messages
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );

-- =====================
-- ANALYTICS EVENTS RLS
-- =====================
CREATE POLICY "Users can view own analytics events" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager')));
CREATE POLICY "Users can insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- =====================
-- BOOKINGS RLS (inherited ownership through leads)
-- =====================
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );
CREATE POLICY "Users can insert bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );
CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM public.leads WHERE id = lead_id)
    OR auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'manager'))
  );

-- =====================
-- NOTIFICATIONS RLS
-- =====================
CREATE POLICY "Users can manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_visits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
