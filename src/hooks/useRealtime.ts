import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type RealtimeCallback<T> = (payload: RealtimePostgresChangesPayload<T>) => void;

interface RealtimeSubscription {
  table: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  callback: RealtimeCallback<any>;
}

export function useRealtime(subscriptions: RealtimeSubscription[]) {
  const subscriptionsRef = useRef(subscriptions);
  subscriptionsRef.current = subscriptions;

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channels = subscriptionsRef.current.map((sub) => {
      const channel = supabase.channel(`${sub.table}-${Date.now()}`);

      channel.on(
        'postgres_changes' as any,
        {
          event: sub.event || '*',
          schema: sub.schema || 'public',
          table: sub.table,
          ...(sub.filter ? { filter: sub.filter } : {}),
        },
        (payload: any) => {
          sub.callback(payload);
        }
      );

      channel.subscribe();
      return channel;
    });

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, []);
}
