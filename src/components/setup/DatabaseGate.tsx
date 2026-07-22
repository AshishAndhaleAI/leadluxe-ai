import { useState, useEffect, type ReactNode } from 'react';
import { isSupabaseConfigured, checkDatabaseConnection } from '../../lib/supabase';
import { Building2, AlertTriangle, Loader2, RefreshCw, Database } from 'lucide-react';
import { SupabaseSetup } from './SupabaseSetup';

type ConnectionStatus = 'loading' | 'connected' | 'schema_missing' | 'failed' | 'unconfigured';

interface DatabaseGateProps {
  children: ReactNode;
}

export function DatabaseGate({ children }: DatabaseGateProps) {
  const [status, setStatus] = useState<ConnectionStatus>(
    isSupabaseConfigured ? 'loading' : 'unconfigured'
  );
  const [errorDetail, setErrorDetail] = useState<string>('');

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;

    const check = async () => {
      try {
        const result = await checkDatabaseConnection();
        if (cancelled) return;
        setStatus(result as ConnectionStatus);
        if (result === 'failed') {
          setErrorDetail('The Supabase project is reachable but the database did not respond as expected.');
        }
      } catch (err: any) {
        if (cancelled) return;
        setStatus('failed');
        setErrorDetail(err?.message || 'Unknown connection error');
      }
    };

    // Give the UI a moment to render before the check
    const timer = setTimeout(check, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const handleRetry = () => {
    setStatus('loading');
    setErrorDetail('');
    checkDatabaseConnection()
      .then((result) => {
        setStatus(result as ConnectionStatus);
        if (result === 'failed') setErrorDetail('The Supabase project is reachable but the database did not respond as expected.');
      })
      .catch((err: any) => {
        setStatus('failed');
        setErrorDetail(err?.message || 'Unknown connection error');
      });
  };

  if (status === 'connected') {
    return <>{children}</>;
  }

  // Unconfigured → render the full SupabaseSetup (it's a full-page component)
  if (status === 'unconfigured') {
    return <SupabaseSetup />;
  }

  // While loading or failed, render a compact full-screen overlay (don't mount children)
  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-luxury-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-luxury-gold-400" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white">LeadLuxe</span>
            <span className="text-2xl font-bold text-luxury-gold-400"> AI</span>
          </div>
        </div>

        {status === 'loading' && (
          <div className="glass-card p-8 border border-luxury-gold-500/10">
            <div className="w-16 h-16 rounded-2xl bg-luxury-gold-500/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-luxury-gold-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connecting to Supabase</h2>
            <p className="text-sm text-gray-400">
              Verifying database connectivity...
            </p>
            <div className="mt-6 w-full bg-white/5 rounded-full h-1 overflow-hidden">
              <div className="h-full bg-luxury-gold-400 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {status === 'schema_missing' && (
          <div className="glass-card p-8 border border-amber-500/20">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Database Schema Required</h2>
            <p className="text-sm text-gray-400 mb-4">
              Your Supabase project is connected, but the database tables haven't been created yet.
              Run the schema file in your Supabase SQL Editor to create all 13 tables.
            </p>

            <div className="glass-card p-4 mb-4 text-left border border-luxury-gold-500/10">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Steps</p>
              <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                <li>Open{' '}
                  <a
                    href="https://supabase.com/dashboard/project/alrmqtusoytldraxfnba/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-luxury-gold-400 hover:text-luxury-gold-300 underline"
                  >
                    your Supabase SQL Editor
                  </a>
                </li>
                <li>Open the file <code className="text-luxury-gold-400 bg-luxury-gold-500/10 px-1 rounded">supabase/schema.sql</code> in your editor</li>
                <li>Copy the entire contents and paste into the SQL Editor</li>
                <li>Click <strong className="text-white">Run</strong> to create all tables</li>
                <li>Then click <strong className="text-white">Retry</strong> below</li>
              </ol>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleRetry}
                className="btn-primary"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="glass-card p-8 border border-red-500/20">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connection Failed</h2>
            <p className="text-sm text-gray-400 mb-2">
              Could not connect to the Supabase database.
            </p>
            {errorDetail && (
              <p className="text-xs text-red-400/70 mb-6 font-mono bg-red-500/5 rounded-lg p-3">
                {errorDetail}
              </p>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleRetry}
                className="btn-primary"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </button>
              <p className="text-xs text-gray-500 mt-3">
                Make sure your <code className="text-luxury-gold-400 bg-luxury-gold-500/10 px-1 rounded">.env</code> file has the correct Supabase URL and Anon Key.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
