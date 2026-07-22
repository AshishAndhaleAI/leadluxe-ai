-- ============================================================
-- Migration: Seed Premium Pune Demo Leads
-- ============================================================
-- Inserts 5 high-value Pune leads for MVP demonstration.
-- Only inserts if the leads table is empty.
-- Uses a COALESCE fallback for user_id so the seed works even
-- if no user profile exists in public.users yet (common when
-- running the seed directly in the Supabase SQL Editor before
-- creating an account).
-- ============================================================

DO $$
DECLARE
  mvp_user_id UUID;
BEGIN
  -- Get the first user_id from public.users, or create a placeholder
  SELECT id INTO mvp_user_id FROM public.users LIMIT 1;

  IF mvp_user_id IS NULL THEN
    -- Insert a placeholder MVP user so leads have a valid FK
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
      gen_random_uuid(),
      'mvp@leadluxe.ai',
      'MVP Demo User',
      'admin'
    )
    RETURNING id INTO mvp_user_id;
  END IF;

  -- Only seed if leads table is empty
  IF NOT EXISTS (SELECT 1 FROM public.leads LIMIT 1) THEN

    INSERT INTO public.leads (user_id, name, phone, email, budget, preferred_location, property_type, visit_timeline, source, status, score, score_factors, created_at)
    VALUES
      (mvp_user_id, 'Rahul Mehta', '+91-9876543210', 'rahul.mehta@email.com',
       12500000, 'Baner, Pune', 'Apartment', 'Immediate', 'website', 'hot', 94,
       '{"budget": 25, "urgency": 22, "engagement": 28, "source": 10, "location": 22, "property": 12, "completeness": 22}'::jsonb,
       NOW() - INTERVAL '2 days'),

      (mvp_user_id, 'Priya Kapoor', '+91-9876543211', 'priya.kapoor@email.com',
       8200000, 'Kharadi, Pune', 'Apartment', 'This month', 'whatsapp', 'qualified', 81,
       '{"budget": 20, "urgency": 18, "engagement": 24, "source": 18, "location": 20, "property": 10, "completeness": 18}'::jsonb,
       NOW() - INTERVAL '5 days'),

      (mvp_user_id, 'Amit Shah', '+91-9876543212', 'amit.shah@email.com',
       21000000, 'Balewadi, Pune', 'Villa', 'ASAP', 'referral', 'negotiation', 96,
       '{"budget": 28, "urgency": 22, "engagement": 28, "source": 30, "location": 24, "property": 18, "completeness": 24}'::jsonb,
       NOW() - INTERVAL '7 days'),

      (mvp_user_id, 'Sneha Joshi', '+91-9876543213', 'sneha.joshi@email.com',
       9500000, 'Wakad, Pune', 'Apartment', 'This week', 'website', 'site_visit', 78,
       '{"budget": 20, "urgency": 20, "engagement": 22, "source": 10, "location": 22, "property": 10, "completeness": 18}'::jsonb,
       NOW() - INTERVAL '3 days'),

      (mvp_user_id, 'Vikram Patil', '+91-9876543214', 'vikram.patil@email.com',
       17500000, 'Hinjewadi, Pune', 'Apartment', 'Immediate', 'phone', 'booked', 99,
       '{"budget": 25, "urgency": 24, "engagement": 28, "source": 22, "location": 22, "property": 14, "completeness": 22}'::jsonb,
       NOW() - INTERVAL '10 days');

  END IF;
END;
$$;
