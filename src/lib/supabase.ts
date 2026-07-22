import { createClient, type RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[Supabase] URL loaded:', !!supabaseUrl);
console.log('[Supabase] Anon Key loaded:', !!supabaseAnonKey);

/** Whether the required environment variables are present. */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/**
 * Create the Supabase client only when credentials are present.
 * Consumer components must check `isSupabaseConfigured` before making queries.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null!;

export type ConnectionStatus = 'connected' | 'failed';

/**
 * Ping the Supabase REST API to verify database connectivity.
 * Queries the `projects` table (known to exist after schema creation)
 * using a lightweight head request with limit 1.
 *
 * Returns:
 *   - 'connected':  The Supabase API responded and the table is queryable.
 *   - 'failed':     Credentials are missing or the request could not complete.
 */
export async function checkDatabaseConnection(): Promise<ConnectionStatus> {
  if (!isSupabaseConfigured || !supabase) {
    console.log('[Supabase] Health check: skipped — credentials not configured');
    return 'failed';
  }

  console.log('[Supabase] Health check: started — querying projects table');

  try {
    const { error } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (error) {
      console.log('[Supabase] Health check: error —', error.message);
      return 'failed';
    }

    console.log('[Supabase] Health check: success');
    return 'connected';
  } catch (err: any) {
    console.log('[Supabase] Health check: exception —', err?.message || err);
    return 'failed';
  }
}

// ============================================================
// Typed Supabase query helpers
// ============================================================

/**
 * Safe query runner — checks configuration before hitting Supabase.
 * Returns a no-op dummy so code won't crash, but you should guard UI with
 * `isSupabaseConfigured` before calling.
 */
function safeTable(table: string) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      select: () => ({
        eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }), order: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }), limit: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }) }),
        order: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
        limit: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') }),
      }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }), }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }), in: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }), }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }), }),
    } as any;
  }
  return supabase.from(table);
}

export const db = {
  leads: () => safeTable('leads').select('*'),
  lead: (id: string) => safeTable('leads').select('*').eq('id', id).single(),
  conversations: (leadId: string) =>
    safeTable('conversations')
      .select('*, messages(*)')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false }),
  messages: (conversationId: string) =>
    safeTable('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true }),
  siteVisits: () => safeTable('site_visits').select('*, lead:leads(*)'),
  siteVisitsByDate: (date: string) =>
    safeTable('site_visits')
      .select('*, lead:leads(*)')
      .eq('scheduled_date', date),
  leadEvents: (leadId: string) =>
    safeTable('lead_events')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false }),
  notifications: (userId: string) =>
    safeTable('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
  campaigns: () => safeTable('campaigns').select('*'),
  analytics: () => safeTable('analytics_events').select('*'),
  bookings: () => safeTable('bookings').select('*'),
};

// ============================================================
// Real-time subscription helpers
// ============================================================

export function subscribeToInserts<T>(
  table: string,
  callback: (payload: T) => void,
  filter?: string
): RealtimeChannel {
  if (!isSupabaseConfigured || !supabase) {
    return {
      unsubscribe: () => {},
      subscribe: () => {},
    } as unknown as RealtimeChannel;
  }

  const channelConfig: any = {
    event: 'INSERT',
    schema: 'public',
    table,
  };
  if (filter) channelConfig.filter = filter;

  return supabase
    .channel(`${table}-inserts-${Date.now()}`)
    .on('postgres_changes', channelConfig, (payload) => {
      callback(payload.new as T);
    })
    .subscribe();
}

export function subscribeToUpdates<T>(
  table: string,
  callback: (payload: T) => void,
  filter?: string
): RealtimeChannel {
  if (!isSupabaseConfigured || !supabase) {
    return {} as RealtimeChannel;
  }

  const channelConfig: any = {
    event: 'UPDATE',
    schema: 'public',
    table,
  };
  if (filter) channelConfig.filter = filter;

  return supabase
    .channel(`${table}-updates-${Date.now()}`)
    .on('postgres_changes', channelConfig, (payload) => {
      callback(payload.new as T);
    })
    .subscribe();
}

export function subscribeToTable<T>(
  table: string,
  callback: (payload: T) => void,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  filter?: string
): RealtimeChannel {
  if (!isSupabaseConfigured || !supabase) {
    return {} as RealtimeChannel;
  }

  const channelConfig: any = {
    event,
    schema: 'public',
    table,
  };
  if (filter) channelConfig.filter = filter;

  return supabase
    .channel(`${table}-${event}-${Date.now()}`)
    .on('postgres_changes' as any, channelConfig, (payload: any) => {
      callback(payload.new as T);
    })
    .subscribe();
}
