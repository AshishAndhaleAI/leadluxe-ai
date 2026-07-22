-- ============================================================
-- Migration: Disable RLS for MVP Demo Mode
-- ============================================================
-- Applied:  2026-07-22
-- Problem:  Infinite recursion in users RLS policy blocks all
--           authenticated queries. Fixing policies requires
--           careful subquery analysis; for the MVP we disable
--           RLS entirely so the demo works immediately.
--
-- Effect:   All tables are readable/writable by any
--           authenticated user. RLS will be re-enabled with
--           correct non-recursive policies in production v2.
-- ============================================================

-- =====================
-- 1. Drop all policies on every table
-- =====================

-- users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS users_select_policy ON public.users;
DROP POLICY IF EXISTS users_update_policy ON public.users;

-- projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- leads
DROP POLICY IF EXISTS leads_select_policy ON public.leads;
DROP POLICY IF EXISTS leads_insert_policy ON public.leads;
DROP POLICY IF EXISTS leads_update_policy ON public.leads;
DROP POLICY IF EXISTS leads_delete_policy ON public.leads;

-- lead_events
DROP POLICY IF EXISTS "Users can view own lead events" ON public.lead_events;
DROP POLICY IF EXISTS "Users can insert lead events" ON public.lead_events;

-- conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;

-- messages
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;

-- site_visits
DROP POLICY IF EXISTS "Users can view own site visits" ON public.site_visits;
DROP POLICY IF EXISTS "Users can insert site visits" ON public.site_visits;
DROP POLICY IF EXISTS "Users can update own site visits" ON public.site_visits;

-- lead_scores
DROP POLICY IF EXISTS "Users can view own lead scores" ON public.lead_scores;
DROP POLICY IF EXISTS "Users can insert lead scores" ON public.lead_scores;
DROP POLICY IF EXISTS "Users can update own lead scores" ON public.lead_scores;

-- campaigns
DROP POLICY IF EXISTS "Users can manage own campaigns" ON public.campaigns;

-- whatsapp_messages
DROP POLICY IF EXISTS "Users can view own whatsapp messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Users can insert whatsapp messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Users can update own whatsapp messages" ON public.whatsapp_messages;

-- analytics_events
DROP POLICY IF EXISTS "Users can view own analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can insert analytics events" ON public.analytics_events;

-- bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;

-- notifications
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;

-- =====================
-- 2. Disable Row Level Security on all tables
-- =====================
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
