-- ============================================================
-- LeadLuxe AI — MVP Quickstart (Run once in Supabase SQL Editor)
-- ============================================================
-- This single script:
--   1. Drops ALL RLS policies on all tables
--   2. DISABLES ROW LEVEL SECURITY on all tables
--   3. Creates a placeholder user if none exists
--   4. Seeds 5 premium Pune demo leads
-- ============================================================

DO $$
DECLARE
  mvp_uid UUID;
  lead_count INT;
BEGIN
  -- ========== 1. DISABLE RLS ON ALL TABLES ==========

  -- Drop policies
  DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
  DROP POLICY IF EXISTS users_select_policy ON public.users;
  DROP POLICY IF EXISTS users_update_policy ON public.users;
  DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
  DROP POLICY IF EXISTS "Users can insert projects" ON public.projects;
  DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
  DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
  DROP POLICY IF EXISTS leads_select_policy ON public.leads;
  DROP POLICY IF EXISTS leads_insert_policy ON public.leads;
  DROP POLICY IF EXISTS leads_update_policy ON public.leads;
  DROP POLICY IF EXISTS leads_delete_policy ON public.leads;
  DROP POLICY IF EXISTS "Users can view own lead events" ON public.lead_events;
  DROP POLICY IF EXISTS "Users can insert lead events" ON public.lead_events;
  DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
  DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;
  DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
  DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
  DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
  DROP POLICY IF EXISTS "Users can view own site visits" ON public.site_visits;
  DROP POLICY IF EXISTS "Users can insert site visits" ON public.site_visits;
  DROP POLICY IF EXISTS "Users can update own site visits" ON public.site_visits;
  DROP POLICY IF EXISTS "Users can view own lead scores" ON public.lead_scores;
  DROP POLICY IF EXISTS "Users can insert lead scores" ON public.lead_scores;
  DROP POLICY IF EXISTS "Users can update own lead scores" ON public.lead_scores;
  DROP POLICY IF EXISTS "Users can manage own campaigns" ON public.campaigns;
  DROP POLICY IF EXISTS "Users can view own whatsapp messages" ON public.whatsapp_messages;
  DROP POLICY IF EXISTS "Users can insert whatsapp messages" ON public.whatsapp_messages;
  DROP POLICY IF EXISTS "Users can update own whatsapp messages" ON public.whatsapp_messages;
  DROP POLICY IF EXISTS "Users can view own analytics events" ON public.analytics_events;
  DROP POLICY IF EXISTS "Users can insert analytics events" ON public.analytics_events;
  DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Users can insert bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;

  -- Disable RLS
  ALTER TABLE public.users      DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.projects   DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.leads      DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.lead_events      DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.conversations    DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.messages         DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.site_visits      DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.lead_scores      DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.campaigns        DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.whatsapp_messages DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.analytics_events DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.bookings         DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.notifications    DISABLE ROW LEVEL SECURITY;

  -- ========== 2. ENSURE A USER EXISTS ==========

  SELECT id INTO mvp_uid FROM public.users LIMIT 1;

  IF mvp_uid IS NULL THEN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (gen_random_uuid(), 'mvp@leadluxe.ai', 'MVP Demo User', 'admin')
    RETURNING id INTO mvp_uid;
  END IF;

  -- ========== 3. SEED DEMO LEADS ==========

  SELECT COUNT(*) INTO lead_count FROM public.leads;

  IF lead_count = 0 THEN
    INSERT INTO public.leads (user_id, name, phone, email, budget, preferred_location, property_type, visit_timeline, source, status, score, score_factors, created_at) VALUES
      (mvp_uid, 'Rahul Mehta',   '+91-9876543210', 'rahul.mehta@email.com',    12500000, 'Baner, Pune',    'Apartment', 'Immediate',   'website',  'new',          94, '{"budget":25,"urgency":22,"engagement":28,"source":10,"location":22,"property":12,"completeness":22}'::jsonb, NOW() - INTERVAL '2 days'),
      (mvp_uid, 'Priya Kapoor',  '+91-9876543211', 'priya.kapoor@email.com',    8200000, 'Kharadi, Pune',  'Apartment', 'This month',  'whatsapp', 'qualified',    81, '{"budget":20,"urgency":18,"engagement":24,"source":18,"location":20,"property":10,"completeness":18}'::jsonb, NOW() - INTERVAL '5 days'),
      (mvp_uid, 'Amit Shah',     '+91-9876543212', 'amit.shah@email.com',      21000000, 'Balewadi, Pune', 'Villa',     'ASAP',        'referral', 'negotiation',  96, '{"budget":28,"urgency":22,"engagement":28,"source":30,"location":24,"property":18,"completeness":24}'::jsonb, NOW() - INTERVAL '7 days'),
      (mvp_uid, 'Sneha Joshi',   '+91-9876543213', 'sneha.joshi@email.com',     9500000, 'Wakad, Pune',    'Apartment', 'This week',   'website',  'site_visit',   78, '{"budget":20,"urgency":20,"engagement":22,"source":10,"location":22,"property":10,"completeness":18}'::jsonb, NOW() - INTERVAL '3 days'),
      (mvp_uid, 'Vikram Patil',  '+91-9876543214', 'vikram.patil@email.com',   17500000, 'Hinjewadi, Pune','Apartment', 'Immediate',   'phone',    'booked',       99, '{"budget":25,"urgency":24,"engagement":28,"source":22,"location":22,"property":14,"completeness":22}'::jsonb, NOW() - INTERVAL '10 days');

    -- Create lead events for Vikram Patil's booking
    INSERT INTO public.lead_events (lead_id, event_type, event_label, event_description, created_at)
    SELECT id, 'booking_confirmed', 'Booking Confirmed', 'Vikram Patil booked — ₹1.75 Cr deal closed', NOW() - INTERVAL '1 day'
    FROM public.leads WHERE name = 'Vikram Patil';
  END IF;
END;
$$;

-- Confirm
SELECT '✅ MVP Quickstart complete!' AS status;
SELECT COUNT(*) AS total_leads, ROUND(SUM(budget)::numeric / 10000000, 2) AS pipeline_cr FROM public.leads;
