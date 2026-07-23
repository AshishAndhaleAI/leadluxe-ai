// ============================================================
// LeadLuxe AI — AI Deal Coach Preferences
// Customizable coaching templates for recommendation style,
// response tone, preferred channels, and urgency thresholds.
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

const STORAGE_KEY = 'leadluxe-coach-preferences';

export function getCoachPreferences(): CoachPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
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
