// ============================================================
// LeadLuxe AI — AI Deal Coach Preferences
// Customizable coaching templates for recommendation style,
// response tone, preferred channels, and urgency thresholds.
//
// SYNC STRATEGY (localStorage-first, Supabase-backed):
//   - localStorage is the primary/instant store.
//   - Supabase is the cross-device sync layer.
//   - On mount / login: try loading from Supabase; if found and
//     newer than local, overwrite local.
//   - On save: write to localStorage instantly, then upsert to Supabase
//     in the background (fire-and-forget).
//   - When Supabase is unavailable, everything still works locally.
// ============================================================

export interface CoachPreferences {
  /** Communication style: how the coach addresses you */
  style: 'direct' | 'friendly' | 'professional' | 'motivational';
  /** Response tone: how recommendations are phrased */
  tone: 'formal' | 'conversational' | 'urgent' | 'encouraging';
  /** Preferred contact channels in order */
  preferredChannels: ('email' | 'phone' | 'whatsapp' | 'meeting')[];
  /** Days of inactivity before a deal is flagged as 'stale' (default: 5) */
  staleThresholdDays: number;
  /** Whether to show coaching cards for 'closed' / 'lost' deals */
  showCompletedDeals: boolean;
  /** Enable daily urgency notifications */
  urgencyAlertsEnabled: boolean;
  /** Minimum commission value (in INR) to show coaching — filters out small deals */
  minCommissionThreshold: number;
  /** User's timezone for timeline calculations */
  timezone: string;
}

export const DEFAULT_PREFERENCES: CoachPreferences = {
  style: 'direct',
  tone: 'conversational',
  preferredChannels: ['email', 'phone', 'whatsapp', 'meeting'],
  staleThresholdDays: 5,
  showCompletedDeals: false,
  urgencyAlertsEnabled: true,
  minCommissionThreshold: 0,
  timezone: 'Asia/Kolkata',
};

const LOCAL_KEY = 'leadluxe-coach-preferences';
const SYNC_KEY = 'leadluxe-coach-preferences-sync';

export function getCoachPreferences(): CoachPreferences {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(raw);
    // Merge with defaults to handle missing fields from older saves
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function saveCoachPreferences(prefs: CoachPreferences): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(prefs));
    localStorage.setItem(SYNC_KEY, Date.now().toString());
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

// ============================================================
// SUPABASE SYNC
// ============================================================

/**
 * Try to load coach preferences from Supabase.
 * Returns the preferences if found and newer than local, or null
 * if Supabase is unavailable or the local version is fresher.
 */
export async function tryLoadFromSupabase(userId: string): Promise<CoachPreferences | null> {
  try {
    const { supabase } = await import('./supabase');
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferences, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;

    const cloudPrefs = data.preferences as Record<string, unknown>;
    const cloudUpdated = new Date(data.updated_at).getTime();
    const localSyncTime = parseInt(localStorage.getItem(SYNC_KEY) || '0', 10);

    // Only use cloud version if it's newer than local
    if (cloudUpdated <= localSyncTime) return null;

    return { ...DEFAULT_PREFERENCES, ...cloudPrefs } as CoachPreferences;
  } catch {
    return null; // Supabase unavailable — fall back to local
  }
}

/**
 * Persist coach preferences to Supabase (fire-and-forget).
 * Errors are silently caught so they never block the UI.
 */
export async function syncToSupabase(userId: string, prefs: CoachPreferences): Promise<void> {
  try {
    const { supabase } = await import('./supabase');
    if (!supabase) return;

    await supabase
      .from('user_preferences')
      .upsert(
        { user_id: userId, preferences: prefs as unknown as Record<string, unknown> },
        { onConflict: 'user_id' }
      );
  } catch {
    // Silently fail — localStorage still works
  }
}

// ============================================================
// SUPABASE REALTIME SUBSCRIPTION
// ============================================================

/**
 * Subscribe to real-time preference changes for a specific user.
 * When preferences are updated on another device, the callback fires
 * with the updated preferences so the UI can reflect the change instantly.
 * Returns an unsubscribe function (call on cleanup).
 */
export function subscribeToPreferenceChanges(
  userId: string,
  onPreferencesChanged: (prefs: CoachPreferences) => void
): () => void {
  let unsubscribed = false;
  let subscription: { unsubscribe: () => void } | null = null;

  const setupSubscription = async () => {
    const { supabase } = await import('./supabase');
    if (!supabase || unsubscribed) return;

    // Listen for INSERT and UPDATE on user_preferences for this user
    const channel = supabase
      .channel('coach-preferences-realtime')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${userId}`,
        },
        async (payload: any) => {
          if (unsubscribed) return;
          // Avoid processing our own saves by checking the sync timestamp
          const newPrefs = payload.new?.preferences;
          if (!newPrefs) return;
          const merged = { ...DEFAULT_PREFERENCES, ...newPrefs } as CoachPreferences;
          // Only trigger callback if this wasn't our own change
          const localSyncTime = parseInt(localStorage.getItem(SYNC_KEY) || '0', 10);
          const cloudUpdated = payload.new?.updated_at
            ? new Date(payload.new.updated_at).getTime()
            : Date.now();
          if (cloudUpdated > localSyncTime) {
            saveCoachPreferences(merged); // overwrite local
            onPreferencesChanged(merged);
          }
        }
      )
      .subscribe();

    subscription = channel;
  };

  // Fire and forget — subscription setup is async
  setupSubscription();

  // Return cleanup function
  return () => {
    unsubscribed = true;
    if (subscription) {
      subscription.unsubscribe();
    }
  };
}

/** Human-readable labels for style options */
export const STYLE_OPTIONS: { value: CoachPreferences['style']; label: string; desc: string }[] = [
  { value: 'direct', label: 'Direct', desc: 'Clear, straight-to-the-point recommendations' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm, approachable tone with personal touches' },
  { value: 'professional', label: 'Professional', desc: 'Formal business language and structured advice' },
  { value: 'motivational', label: 'Motivational', desc: 'Energizing language to push you toward closing' },
];

export const TONE_OPTIONS: { value: CoachPreferences['tone']; label: string; desc: string }[] = [
  { value: 'formal', label: 'Formal', desc: 'Business-appropriate language with structured formatting' },
  { value: 'conversational', label: 'Conversational', desc: 'Natural, flowing text like a colleague advising you' },
  { value: 'urgent', label: 'Urgent', desc: 'Emphasizes time-sensitivity and action-driven language' },
  { value: 'encouraging', label: 'Encouraging', desc: 'Positive reinforcement with confidence-boosting phrasing' },
];

export const CHANNEL_OPTIONS: { value: CoachPreferences['preferredChannels'][number]; label: string; icon: string }[] = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Phone Call', icon: '📞' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'meeting', label: 'In-Person Meeting', icon: '🤝' },
];
