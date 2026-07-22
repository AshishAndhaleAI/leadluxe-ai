// ============================================================
// LeadLuxe AI — Demo Provisioning Script
// ============================================================
// Usage:
//   export SUPABASE_URL=https://your-project.supabase.co
//   export SUPABASE_SERVICE_KEY=sb_secret_your_key_here
//   node scripts/provision-demo.mjs
// ============================================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://alrmqtusoytldraxfnba.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  console.error('   export SUPABASE_SERVICE_KEY=sb_secret_your_key_here');
  process.exit(1);
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: 'Bearer ' + SERVICE_KEY,
  'Content-Type': 'application/json',
};

async function req(method, path, body) {
  const res = await fetch(SUPABASE_URL + path, {
    method,
    headers: body ? { ...headers, 'Content-Type': 'application/json' } : headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data, ok: res.ok };
}

async function disableRLS() {
  const sql = `
    DO $$ BEGIN
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

      ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.lead_events DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.site_visits DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.lead_scores DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.campaigns DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.whatsapp_messages DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.analytics_events DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
    END; $$;
  `;

  console.log('  Attempt 1: Supabase Management API...');
  const ref = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
  
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + SERVICE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (res.ok) {
    console.log('  ✅ RLS disabled via Management API!');
    return true;
  }
  console.log(`  ❌ Management API: ${res.status}`);
  const text = await res.text();
  console.log(`  Response: ${text.slice(0, 150)}`);

  console.log('  Attempt 2: Supabase project API...');
  const res2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({})
  });
  console.log(`  ❌ RPC endpoint: ${res2.status}`);

  console.log('\n  ⚠️  Could not disable RLS programmatically.');
  console.log('  To finish setup, paste supabase/migrations/disable_rls_mvp.sql');
  console.log('  into your Supabase SQL Editor and click Run.');
  return false;
}

async function main() {
  console.log('\n🔧 LeadLuxe AI — Demo Provisioning\n');

  // Step 1: Create demo auth user
  console.log('Step 1: Creating demo auth user...');
  const { data: authUser, status } = await req('POST', '/auth/v1/admin/users', {
    email: 'demo@leadluxe.ai',
    password: 'Demo@123',
    email_confirm: true,
    user_metadata: { full_name: 'Demo Builder' },
  });

  if (status === 201 || status === 200) {
    console.log('  ✅ Demo user: demo@leadluxe.ai / Demo@123');
  } else if (status === 409) {
    console.log('  ⚠️  Demo user already exists');
  } else {
    console.log('  ❌ User creation failed:', authUser?.msg || authUser);
  }

  // Wait for trigger
  await new Promise(r => setTimeout(r, 2000));

  // Step 2: Disable RLS
  console.log('\nStep 2: Disabling RLS...');
  const rlsDisabled = await disableRLS();

  // Step 3: Seed demo leads
  console.log('\nStep 3: Seeding demo leads...');

  const { data: users } = await req('GET', '/rest/v1/users?select=id&limit=1');
  const userId = users?.[0]?.id;

  if (!userId && !rlsDisabled) {
    console.log('  ❌ No user in public.users table. RLS blocks admin user creation.');
    console.log('  Run the SQL migration first, then this script again.');
    return;
  }

  const { data: existing } = await req('GET', '/rest/v1/leads?select=id&limit=1');
  if (existing?.length > 0) {
    console.log('  ⚠️  Leads already exist — skipping seed');
  } else {
    const leads = [
      { name: 'Rahul Mehta', phone: '+91-9876543210', email: 'rahul.mehta@email.com', budget: 12500000, preferred_location: 'Baner, Pune', property_type: 'Apartment', visit_timeline: 'Immediate', source: 'website', status: 'hot', score: 94 },
      { name: 'Priya Kapoor', phone: '+91-9876543211', email: 'priya.kapoor@email.com', budget: 8200000, preferred_location: 'Kharadi, Pune', property_type: 'Apartment', visit_timeline: 'This month', source: 'whatsapp', status: 'qualified', score: 81 },
      { name: 'Amit Shah', phone: '+91-9876543212', email: 'amit.shah@email.com', budget: 21000000, preferred_location: 'Balewadi, Pune', property_type: 'Villa', visit_timeline: 'ASAP', source: 'referral', status: 'negotiation', score: 96 },
      { name: 'Sneha Joshi', phone: '+91-9876543213', email: 'sneha.joshi@email.com', budget: 9500000, preferred_location: 'Wakad, Pune', property_type: 'Apartment', visit_timeline: 'This week', source: 'website', status: 'site_visit', score: 78 },
      { name: 'Vikram Patil', phone: '+91-9876543214', email: 'vikram.patil@email.com', budget: 17500000, preferred_location: 'Hinjewadi, Pune', property_type: 'Apartment', visit_timeline: 'Immediate', source: 'phone', status: 'booked', score: 99 },
    ];

    let success = 0;
    for (const lead of leads) {
      const { status: s } = await req('POST', '/rest/v1/leads', {
        ...lead, user_id: userId || '00000000-0000-0000-0000-000000000001',
      });
      if (s === 201) success++;
    }
    console.log(`  ✅ Inserted ${success}/${leads.length} demo leads`);
  }

  console.log('\n========================================');
  console.log('📊 DEMO PROVISIONING STATUS');
  console.log('========================================');
  console.log('👤 Login:  demo@leadluxe.ai / Demo@123');
  console.log('💰 Pipeline: ₹6.87 Cr');
  console.log('📈 Commission (3%): ₹20.61 L');
  console.log('🏆 Realized: ₹5.25 L');
  
  if (!rlsDisabled) {
    console.log('\n⚠️  RLS is still enabled! Run this SQL in your Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/alrmqtusoytldraxfnba/sql/new');
    console.log('\n   Open leadluxe-ai/supabase/migrations/disable_rls_mvp.sql');
    console.log('   Copy → Paste → Run');
    console.log('\n   Then re-run: node scripts/provision-demo.mjs');
  } else {
    console.log('\n✅ Everything is ready! Reload your Vercel app.');
  }
  console.log('========================================\n');
}

main().catch(console.error);
