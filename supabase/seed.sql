-- ============================================================
-- LeadLuxe AI — Seed Data
-- Run this AFTER schema.sql in your Supabase SQL Editor
-- Creates sample leads, events, conversations, and notifications
-- ============================================================

-- First, create a demo user (if running outside the auth trigger)
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  'demo@leadluxe.ai',
  'Demo User',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'demo@leadluxe.ai'
);

-- ============================================================
-- LEADS (30 realistic Indian real estate leads)
-- ============================================================
INSERT INTO public.leads (id, user_id, name, phone, email, budget, preferred_location, property_type, visit_timeline, source, status, score, notes)
VALUES
-- Hot leads (score >= 70)
('a1000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Rajesh Mehta', '+91-9876543210', 'rajesh.mehta@gmail.com', 25000000, 'Worli, Mumbai', 'apartment', 'this_week', 'website', 'new', 92, 'Looking for 3BHK sea-facing apartment. Budget flexible up to 3Cr. Ready to visit this weekend.'),
('a1000002-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Anita Kapoor', '+91-9988776655', 'anita.kapoor@yahoo.com', 45000000, 'Bandra West, Mumbai', 'penthouse', 'within_7_days', 'whatsapp', 'qualified', 88, 'Premium buyer. Already sold their previous property. Looking for luxury penthouse with sky lounge.'),
('a1000003-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Vikram Singh', '+91-9876123456', 'vikram.singh@outlook.com', 18000000, 'Whitefield, Bangalore', 'villa', 'within_15_days', 'website', 'contacted', 85, 'IT professional looking for 4BHK villa in gated community. Has pre-approved loan.'),
('a1000004-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Priya Sharma', '+91-9765432109', 'priya.sharma@rediffmail.com', 35000000, 'Dwarka, Delhi', 'apartment', 'this_week', 'referral', 'negotiation', 90, 'Referred by existing customer Mr. Gupta. Very serious buyer. Already shortlisted 2 properties.'),
('a1000005-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Amit Joshi', '+91-9654321098', 'amit.joshi@gmail.com', 12000000, 'Kothrud, Pune', 'apartment', 'within_7_days', 'website', 'site_visit', 78, 'First-time buyer. 2BHK budget. Scheduled site visit for this Saturday.'),
('a1000006-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Sunita Verma', '+91-9543210987', 'sunita.verma@hotmail.com', 65000000, 'Jubilee Hills, Hyderabad', 'villa', 'within_30_days', 'social_media', 'new', 82, 'High net worth individual. Looking for luxury villa with pool. Instagram lead.'),
('a1000007-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Deepak Patel', '+91-9432109876', 'deepak.patel@gmail.com', 8500000, 'SG Highway, Ahmedabad', 'apartment', 'this_week', 'whatsapp', 'contacted', 73, 'Budget-conscious but very responsive on WhatsApp. 2BHK requirement.'),
('a1000008-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Kavita Reddy', '+91-9321098765', 'kavita.reddy@gmail.com', 28000000, 'Gachibowli, Hyderabad', 'apartment', 'within_7_days', 'email', 'qualified', 80, 'IT couple. Both working at Microsoft. Looking for 3BHK near office.'),
('a1000009-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Suresh Nair', '+91-9210987654', 'suresh.nair@yahoo.com', 15000000, 'Thane West, Mumbai', 'apartment', 'within_15_days', 'website', 'new', 70, 'Looking for 2BHK in Thane. Budget max 1.7Cr. Wants possession within 1 year.'),
('a1000010-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Meera Desai', '+91-9109876543', 'meera.desai@gmail.com', 52000000, 'Powai, Mumbai', 'penthouse', 'within_30_days', 'referral', 'new', 86, 'Doctor couple. Looking for luxury 4BHK penthouse. Very premium requirement.'),

-- Warm leads (score 40-69)
('a1000011-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Rahul Gupta', '+91-8998765432', 'rahul.gupta@outlook.com', 9500000, 'Noida Sector 62, Delhi NCR', 'apartment', 'within_30_days', 'website', 'new', 62, 'Working at HCL. Looking for 2BHK under 1Cr. Doing research.'),
('a1000012-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Pooja Iyer', '+91-8876543210', 'pooja.iyer@gmail.com', 22000000, 'Electronic City, Bangalore', 'apartment', 'within_15_days', 'social_media', 'contacted', 65, 'Software engineer at Amazon. 3BHK requirement near office. Instagram lead.'),
('a1000013-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Arun Kumar', '+91-8765432109', 'arun.kumar@rediffmail.com', 38000000, 'Sector 21, Gurgaon', 'villa', 'within_60_days', 'phone', 'qualified', 68, 'Senior manager at Google. Looking for 4BHK villa. Want to see options before visiting.'),
('a1000014-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Neha Jain', '+91-8654321098', 'neha.jain@gmail.com', 7500000, 'Indore', 'apartment', 'within_15_days', 'website', 'new', 55, 'First-time buyer. 2BHK under 80L. Early research phase.'),
('a1000015-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'Sanjay Mishra', '+91-8543210987', 'sanjay.mishra@yahoo.com', 42000000, 'Alipore, Kolkata', 'villa', 'this_week', 'whatsapp', 'site_visit', 72, 'Businessman. Ready to book if property matches expectations. WhatsApp active.'),
('a1000016-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', 'Divya Singh', '+91-8432109876', 'divya.singh@gmail.com', 16000000, 'Hinjewadi, Pune', 'apartment', 'within_30_days', 'website', 'new', 60, 'Working at Infosys. 3BHK requirement. Monthly budget EMI-based decision.'),
('a1000017-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', 'Ravi Agarwal', '+91-8321098765', 'ravi.agarwal@outlook.com', 55000000, 'Golf Links, Delhi', 'penthouse', 'within_15_days', 'referral', 'negotiation', 85, 'High-value referral from Mr. Mehta. Looking at 3 properties. Final decision pending.'),
('a1000018-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000001', 'Shweta Pandey', '+91-8210987654', 'shweta.pandey@gmail.com', 11000000, 'Chembur, Mumbai', 'apartment', 'within_45_days', 'email', 'new', 52, 'Exploring options near parents'' home. 2BHK. Not urgent.'),
('a1000019-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000001', 'Mohammed Khan', '+91-8109876543', 'mkhan@gmail.com', 30000000, 'Banjara Hills, Hyderabad', 'villa', 'within_30_days', 'website', 'contacted', 68, 'Business owner. Looking for premium villa. Visited website multiple times.'),
('a1000020-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Lakshmi Nair', '+91-8098765432', 'lakshmi.nair@yahoo.com', 19000000, 'Kochi', 'apartment', 'within_60_days', 'social_media', 'new', 50, 'NRI planning to return. Exploring investment options. Facebook lead.'),

-- Cold leads (score < 40)
('a1000021-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Vijay Joshi', '+91-7987654321', 'vijay.joshi@gmail.com', 4500000, 'Faridabad, Delhi NCR', 'apartment', 'within_90_days', 'website', 'new', 25, 'Very early stage. Checking prices online. Low budget.'),
('a1000022-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'Ananya BOSE', '+91-7876543210', 'ananya.bose@hotmail.com', 6000000, 'Salt Lake, Kolkata', 'apartment', 'within_6_months', 'email', 'new', 30, 'Student completing MBA. Future planning. Not immediate.'),
('a1000023-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'Gaurav Sharma', '+91-7765432109', 'gaurav.sharma@gmail.com', 35000000, 'Sector 29, Gurgaon', 'villa', 'this_week', 'whatsapp', 'booked', 91, '✅ BOOKED! Closed deal for 4BHK villa. Full payment made.'),
('a1000024-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000001', 'Rohit Malhotra', '+91-7654321098', 'rohit.malhotra@outlook.com', 20000000, 'Andheri West, Mumbai', 'apartment', 'within_45_days', 'phone', 'lost', 20, 'Lost to competitor. Was interested but chose another project closer to office.'),
('a1000025-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000001', 'Swati Chakraborty', '+91-7543210987', 'swati.c@gmail.com', 14000000, 'New Town, Kolkata', 'apartment', 'this_week', 'website', 'site_visit', 67, 'Site visit scheduled for Sunday. Very interested in the project.'),
('a1000026-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000001', 'Pranav Kulkarni', '+91-7432109876', 'pranav.k@yahoo.com', 48000000, 'Koregaon Park, Pune', 'villa', 'within_15_days', 'whatsapp', 'qualified', 75, 'Business owner in real estate. Knows the market. Very serious about premium property.'),
('a1000027-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000001', 'Tanya Kapoor', '+91-7321098765', 'tanya.kapoor@gmail.com', 8500000, 'Vaishali Nagar, Jaipur', 'apartment', 'within_30_days', 'social_media', 'new', 45, 'School teacher. Looking for affordable 2BHK. Instagram lead.'),
('a1000028-0000-0000-0000-000000000028', '00000000-0000-0000-0000-000000000001', 'Aditya Rao', '+91-7210987654', 'aditya.rao@gmail.com', 31000000, 'MG Road, Bangalore', 'apartment', 'within_7_days', 'website', 'negotiation', 82, 'Senior architect. Very specific about design quality. Final price negotiation ongoing.'),
('a1000029-0000-0000-0000-000000000029', '00000000-0000-0000-0000-000000000001', 'Fatima Sheikh', '+91-7109876543', 'fatima.sheikh@outlook.com', 9000000, 'Malad East, Mumbai', 'apartment', 'this_week', 'email', 'contacted', 58, '2BHK requirement near school for kids. Moderate urgency.'),
('a1000030-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', 'Ishaan Bhat', '+91-7098765432', 'ishaan.bhat@gmail.com', 75000000, 'Yerawada, Pune', 'penthouse', 'within_60_days', 'referral', 'new', 77, 'NRI from Dubai. HNI looking for ultra-luxury penthouse. Referred by family friend.');

-- ============================================================
-- LEAD EVENTS (journey timeline)
-- ============================================================
INSERT INTO public.lead_events (lead_id, event_type, event_label, event_description, created_at)
SELECT l.id, 'website_visit', 'Website Visit', 'Visited project page and submitted inquiry', l.created_at + interval '1 minute'
FROM public.leads l WHERE l.source = 'website';

INSERT INTO public.lead_events (lead_id, event_type, event_label, event_description, created_at)
SELECT l.id, 'chat_started', 'AI Chat Started', 'Started conversation with AI assistant', l.created_at + interval '5 minutes'
FROM public.leads l WHERE l.id IN ('a1000001-0000-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000003', 'a1000005-0000-0000-0000-000000000005', 'a1000009-0000-0000-0000-000000000009', 'a1000011-0000-0000-0000-000000000011', 'a1000016-0000-0000-0000-000000000016', 'a1000019-0000-0000-0000-000000000019', 'a1000025-0000-0000-0000-000000000025', 'a1000028-0000-0000-0000-000000000028');

INSERT INTO public.lead_events (lead_id, event_type, event_label, event_description, created_at)
SELECT l.id, 'budget_qualified', 'Budget Qualified', 'Budget confirmed within project range', l.created_at + interval '10 minutes'
FROM public.leads l WHERE l.score >= 60;

INSERT INTO public.lead_events (lead_id, event_type, event_label, event_description, created_at)
SELECT l.id, 'brochure_sent', 'Brochure Sent', 'Project brochure and price sheet sent via WhatsApp', l.created_at + interval '30 minutes'
FROM public.leads l WHERE l.status IN ('qualified', 'site_visit', 'negotiation', 'booked');

INSERT INTO public.lead_events (lead_id, event_type, event_label, event_description, created_at)
VALUES
('a1000005-0000-0000-0000-000000000005', 'site_visit_booked', 'Site Visit Booked', 'Site visit scheduled for Saturday 11:00 AM', NOW() - interval '2 days'),
('a1000015-0000-0000-0000-000000000015', 'site_visit_booked', 'Site Visit Booked', 'Site visit scheduled for Sunday 10:00 AM', NOW() - interval '1 day'),
('a1000025-0000-0000-0000-000000000025', 'site_visit_booked', 'Site Visit Booked', 'Site visit scheduled for Sunday 4:00 PM', NOW() - interval '3 days'),
('a1000004-0000-0000-0000-000000000004', 'agent_assigned', 'Sales Agent Assigned', 'Assigned to senior sales agent Priya M.', NOW() - interval '5 days'),
('a1000008-0000-0000-0000-000000000008', 'agent_assigned', 'Sales Agent Assigned', 'Assigned to agent Rahul K.', NOW() - interval '3 days'),
('a1000026-0000-0000-0000-000000000026', 'agent_assigned', 'Sales Agent Assigned', 'Assigned to agent Suresh P.', NOW() - interval '2 days'),
('a1000004-0000-0000-0000-000000000004', 'negotiation_started', 'Negotiation Started', 'Price negotiation in progress. Asking 5% discount.', NOW() - interval '2 days'),
('a1000017-0000-0000-0000-000000000017', 'negotiation_started', 'Negotiation Started', 'Negotiating on payment terms. Wants 60:40 split.', NOW() - interval '1 day'),
('a1000028-0000-0000-0000-000000000028', 'negotiation_started', 'Negotiation Started', 'Final negotiation round. Discount of 3% requested.', NOW() - interval '12 hours'),
('a1000023-0000-0000-0000-000000000023', 'booking_confirmed', 'Booking Confirmed', '✅ Property booked. Full payment of ₹3.5Cr received.', NOW() - interval '7 days'),
('a1000023-0000-0000-0000-000000000023', 'deal_closed', 'Deal Closed', 'Deal successfully closed. Welcome to the community!', NOW() - interval '5 days');

-- Status change events for leads that moved through pipeline
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT * FROM public.leads WHERE status != 'new' LOOP
    INSERT INTO public.lead_events (lead_id, event_type, event_label, event_description, created_at)
    VALUES (rec.id, 'status_changed', 'Status → ' || rec.status, 'Lead moved to ' || rec.status, rec.updated_at);
  END LOOP;
END $$;

-- ============================================================
-- CONVERSATIONS & MESSAGES
-- ============================================================
INSERT INTO public.conversations (id, lead_id, source, status)
VALUES
('c0000001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'website', 'active'),
('c0000002-0000-0000-0000-000000000002', 'a1000002-0000-0000-0000-000000000002', 'whatsapp', 'active'),
('c0000003-0000-0000-0000-000000000003', 'a1000003-0000-0000-0000-000000000003', 'website', 'resolved'),
('c0000004-0000-0000-0000-000000000004', 'a1000004-0000-0000-0000-000000000004', 'email', 'active');

INSERT INTO public.messages (conversation_id, sender_type, content, created_at)
VALUES
-- Conversation 1: Rajesh Mehta
('c0000001-0000-0000-0000-000000000001', 'lead', 'Hi, I''m looking for a 3BHK sea-facing apartment in Worli. Can you share details?', NOW() - interval '2 hours'),
('c0000001-0000-0000-0000-000000000001', 'ai_bot', 'Hello Rajesh! Thank you for reaching out. We have several sea-facing 3BHK options in Worli starting from ₹2.5Cr. Would you like to see the brochure?', NOW() - interval '1 hour 55 minutes'),
('c0000001-0000-0000-0000-000000000001', 'lead', 'Yes, please send it over. Also, what''s the possession timeline?', NOW() - interval '1 hour 50 minutes'),
('c0000001-0000-0000-0000-000000000001', 'ai_bot', 'The possession is December 2025. Our Worli towers are RERA registered. Sending the brochure and pricing sheet now. Would you like to schedule a site visit?', NOW() - interval '1 hour 45 minutes'),
('c0000001-0000-0000-0000-000000000001', 'lead', 'Yes, I''d like to visit this weekend. Saturday works for me.', NOW() - interval '1 hour 30 minutes'),

-- Conversation 2: Anita Kapoor (WhatsApp)
('c0000002-0000-0000-0000-000000000002', 'lead', 'Hello, I saw your property listing on WhatsApp. Interested in premium penthouses.', NOW() - interval '1 day'),
('c0000002-0000-0000-0000-000000000002', 'agent', 'Namaste Anita! We have stunning penthouses in Bandra West starting at ₹4Cr. Features include private terrace, sky lounge, and infinity pool. Shall I share more details?', NOW() - interval '23 hours'),
('c0000002-0000-0000-0000-000000000002', 'lead', 'Yes please. Also, do you have any ready-to-move options?', NOW() - interval '22 hours'),

-- Conversation 3: Vikram Singh
('c0000003-0000-0000-0000-000000000003', 'lead', 'Looking for 4BHK villa in Whitefield. Budget ~1.8Cr', NOW() - interval '3 days'),
('c0000003-0000-0000-0000-000000000003', 'ai_bot', 'Great choice, Vikram! Our Windsor Villas in Whitefield offer 4BHK options within your budget. Gated community with clubhouse, pool, and 24/7 security.', NOW() - interval '2 days 23 hours'),
('c0000003-0000-0000-0000-000000000003', 'lead', 'Sounds good. Can I see the floor plans?', NOW() - interval '2 days 22 hours'),
('c0000003-0000-0000-0000-000000000003', 'agent', 'Sure! Sending you the floor plans, elevation designs, and a video walkthrough. Would you like to visit the site this weekend?', NOW() - interval '2 days 21 hours'),
('c0000003-0000-0000-0000-000000000003', 'lead', 'I''ve received them. Let me discuss with my family and get back to you.', NOW() - interval '2 days'),

-- Conversation 4: Priya Sharma
('c0000004-0000-0000-0000-000000000004', 'lead', 'Hi, Mr. Gupta referred me. I''m looking for a 3BHK in Dwarka.', NOW() - interval '6 days'),
('c0000004-0000-0000-0000-000000000004', 'agent', 'Welcome Priya! Mr. Gupta is one of our valued customers. We have excellent 3BHK options in Dwarka Sector 19. Premium finishes, park-facing. Ready for site visit!', NOW() - interval '5 days 23 hours'),
('c0000004-0000-0000-0000-000000000004', 'lead', 'I visited the site yesterday and I''m impressed! But the price seems slightly high. Can we negotiate?', NOW() - interval '2 days'),
('c0000004-0000-0000-0000-000000000004', 'agent', 'I understand. Let me talk to my manager and see what we can do. Would ₹3.3Cr with a 70:30 payment plan work for you?', NOW() - interval '1 day 23 hours'),
('c0000004-0000-0000-0000-000000000004', 'lead', 'That''s still a bit above budget. Can we do ₹3.15Cr?', NOW() - interval '1 day'),
('c0000004-0000-0000-0000-000000000004', 'agent', 'Let me check with the management and get back to you within 24 hours.', NOW() - interval '12 hours');

-- ============================================================
-- SITE VISITS
-- ============================================================
INSERT INTO public.site_visits (lead_id, scheduled_date, scheduled_time, status, notes)
VALUES
('a1000005-0000-0000-0000-000000000005', CURRENT_DATE + interval '2 days', '11:00', 'scheduled', 'Meeting at site office. Agent: Rahul'),
('a1000015-0000-0000-0000-000000000015', CURRENT_DATE + interval '3 days', '10:00', 'scheduled', 'VIP client. Ensure model flat is ready. Agent: Priya'),
('a1000025-0000-0000-0000-000000000025', CURRENT_DATE + interval '1 day', '16:00', 'scheduled', 'Evening slot preferred. Agent: Suresh'),
('a1000023-0000-0000-0000-000000000023', CURRENT_DATE - interval '7 days', '14:00', 'completed', '✅ Booking done after visit. Very satisfied.'),
('a1000004-0000-0000-0000-000000000004', CURRENT_DATE - interval '4 days', '11:30', 'completed', 'Visited with family. Liked the property. Negotiation in progress.');

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO public.notifications (user_id, title, message, type, related_entity_type, related_entity_id, is_read)
VALUES
('00000000-0000-0000-0000-000000000001', 'New Lead: Rajesh Mehta 🎯', 'Score: 92/100 — Hot lead from website. Budget ₹2.5Cr, Worli, Mumbai.', 'lead', 'lead', 'a1000001-0000-0000-0000-000000000001', false),
('00000000-0000-0000-0000-000000000001', 'New Lead: Sunita Verma 🎯', 'Score: 82/100 — Premium lead from Instagram. Budget ₹6.5Cr, Jubilee Hills.', 'lead', 'lead', 'a1000006-0000-0000-0000-000000000006', false),
('00000000-0000-0000-0000-000000000001', 'Lead Converted: Gaurav Sharma ✅', 'Deal closed! Property booked for ₹3.5Cr. Full payment received.', 'success', 'lead', 'a1000023-0000-0000-0000-000000000023', false),
('00000000-0000-0000-0000-000000000001', 'Site Visit Scheduled', 'Swati Chakraborty will visit the site on Sunday at 4 PM.', 'info', 'site_visit', 'a1000025-0000-0000-0000-000000000025', false),
('00000000-0000-0000-0000-000000000001', 'Negotiation Alert', 'Priya Sharma requesting 10% discount. Approval needed.', 'warning', 'lead', 'a1000004-0000-0000-0000-000000000004', false),
('00000000-0000-0000-0000-000000000001', 'Lead Lost: Rohit Malhotra', 'Lead lost to competitor. Reason: proximity to office.', 'error', 'lead', 'a1000024-0000-0000-0000-000000000024', true),
('00000000-0000-0000-0000-000000000001', 'Weekly Summary', 'This week: 7 new leads, 2 site visits, 1 booking. Conversion rate 14.3%.', 'info', NULL, NULL, true),
('00000000-0000-0000-0000-000000000001', 'Payment Received', '₹3.5Cr received from Gaurav Sharma — Villa booking #BOOK-2024-001', 'success', 'booking', NULL, false);

-- ============================================================
-- ANALYTICS EVENTS
-- ============================================================
INSERT INTO public.analytics_events (user_id, event_type, event_data, created_at)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  CASE floor(random() * 5)
    WHEN 0 THEN 'page_view'
    WHEN 1 THEN 'lead_form_submit'
    WHEN 2 THEN 'chat_started'
    WHEN 3 THEN 'brochure_download'
    ELSE 'whatsapp_click'
  END,
  jsonb_build_object('page', CASE floor(random() * 4) WHEN 0 THEN '/' WHEN 1 THEN '/properties' WHEN 2 THEN '/pricing' ELSE '/contact' END),
  NOW() - (i || ' hours')::interval
FROM generate_series(1, 50) AS i;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these separately to check the data was loaded:
-- SELECT COUNT(*) as total_leads FROM public.leads;
-- SELECT status, COUNT(*) FROM public.leads GROUP BY status ORDER BY status;
-- SELECT source, COUNT(*) FROM public.leads GROUP BY source ORDER BY COUNT(*) DESC;
-- SELECT * FROM public.lead_events ORDER BY created_at DESC LIMIT 10;
-- SELECT * FROM public.notifications ORDER BY created_at DESC LIMIT 5;
