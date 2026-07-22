-- ============================================================
-- Migration 001: Fix RLS infinite recursion on public.users
-- ============================================================
-- Applied:   2026-07-22
-- Problem:   users_select_policy contained
--            `auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')`
--            which queries public.users from within a policy ON public.users,
--            causing PostgreSQL infinite recursion.
--
-- Fix:      Replace with a simple `id = auth.uid()` check.
--           Admin/manager role checks on OTHER tables (leads, projects, etc.)
--           are unaffected — they subquery users from a different table's
--           policy, which does NOT cause recursion.
-- ============================================================

-- 1. Drop the recursive policies
DROP POLICY IF EXISTS users_select_policy ON public.users;
DROP POLICY IF EXISTS users_update_policy ON public.users;

-- 2. Recreate with non-recursive logic
--    Users can only see their own row — no self-referencing subquery.
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (id = auth.uid());

--    Users can only update their own row.
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
