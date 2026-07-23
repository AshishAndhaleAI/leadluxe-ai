// ============================================================
// LeadLuxe AI — Supabase Client
// Lightweight client for Supabase-backed persistence.
// Falls back gracefully when env vars are not set.
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  : null;

/** Check whether Supabase credentials are available */
export function isSupabaseConfigured(): boolean {
  return isConfigured;
}

/** Human-readable status for the UI */
export function getSupabaseStatus(): { ok: boolean; message: string } {
  if (!SUPABASE_URL) return { ok: false, message: 'Missing VITE_SUPABASE_URL' };
  if (!SUPABASE_ANON_KEY) return { ok: false, message: 'Missing VITE_SUPABASE_ANON_KEY' };
  return { ok: true, message: 'Connected' };
}
