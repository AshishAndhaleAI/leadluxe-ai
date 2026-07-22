import { useState } from 'react';
import { Building2, Settings, Copy, CheckCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

type SetupView = 'instructions' | 'env-setup' | 'schema-setup';

export function SupabaseSetup() {
  const [view, setView] = useState<SetupView>('instructions');
  const [copied, setCopied] = useState(false);

  const copyEnvTemplate = () => {
    const text = `VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-luxury-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <span className="text-xl font-bold text-white">
            LeadLuxe <span className="text-luxury-gold-400">AI</span>
          </span>
        </div>

        {/* View switcher */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['instructions', 'env-setup', 'schema-setup'] as SetupView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                view === v
                  ? 'bg-luxury-gold-500/20 text-luxury-gold-400 border border-luxury-gold-500/30'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              {v === 'instructions' ? '⚠️ Setup' : v === 'env-setup' ? '🔑 Env' : '🗄️ Schema'}
            </button>
          ))}
        </div>

        {view === 'instructions' && (
          <div className="premium-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Supabase Not Configured</h2>
                <p className="text-sm text-gray-400">
                  This app requires a Supabase project to run. Two quick steps:
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-card p-4 border border-luxury-gold-500/10">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-luxury-gold-400">1</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1">Create a free Supabase project</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Go to{' '}
                      <a
                        href="https://supabase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-luxury-gold-400 hover:text-luxury-gold-300 underline"
                      >
                        supabase.com
                      </a>{' '}
                      and create a new project. Once created, copy your Project URL and anon public key from
                      <strong className="text-gray-300"> Settings → API</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4 border border-luxury-gold-500/10">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-luxury-gold-400">2</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1">Configure environment variables</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Create a <code className="text-luxury-gold-400 bg-luxury-gold-500/10 px-1 rounded">.env</code> file in the project root with your Supabase credentials. Click the
                      <strong className="text-gray-300"> 🔑 Env</strong> tab for instructions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4 border border-luxury-gold-500/10">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-luxury-gold-400">3</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1">Run the database schema</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Copy the SQL from <code className="text-luxury-gold-400 bg-luxury-gold-500/10 px-1 rounded">supabase/schema.sql</code> and paste it into your Supabase
                      <strong className="text-gray-300"> SQL Editor</strong>. Click the{' '}
                      <strong className="text-gray-300"> 🗄️ Schema</strong> tab to view and copy it.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full mt-6"
            >
              <RefreshCw className="w-4 h-4" />
              Reload After Configuring
            </button>
          </div>
        )}

        {view === 'env-setup' && (
          <div className="premium-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-luxury-gold-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Environment Variables</h2>
                <p className="text-sm text-gray-400">
                  Create a <code className="text-luxury-gold-400">.env</code> file in the project root:
                </p>
              </div>
            </div>

            <div className="glass-card p-4 mb-4 font-mono text-xs text-gray-300 leading-relaxed relative group">
              <pre className="whitespace-pre-wrap">
                {`# .env  (project root)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here`}
              </pre>
              <button
                onClick={copyEnvTemplate}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                title="Copy template"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-xs text-gray-500 space-y-2">
              <p>
                <strong className="text-gray-400">Getting your credentials:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to your{' '}
                  <a
                    href="https://supabase.com/dashboard/projects"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-luxury-gold-400 hover:underline"
                  >
                    Supabase Dashboard
                  </a>
                </li>
                <li>Select your project</li>
                <li>Go to <strong className="text-gray-300">Project Settings → API</strong></li>
                <li>Copy the <strong className="text-gray-300">Project URL</strong> and the <strong className="text-gray-300">anon public</strong> key</li>
                <li>Replace the values in your <code className="text-luxury-gold-400">.env</code> file</li>
              </ol>
            </div>
          </div>
        )}

        {view === 'schema-setup' && (
          <SchemaView />
        )}
      </div>
    </div>
  );
}

/** Displays schema info with instructions to run it in Supabase SQL Editor. */
function SchemaView() {
  const [copied, setCopied] = useState(false);

  const schemaStatements = [
    'CREATE TABLE users (extends auth.users)',
    'CREATE TABLE projects',
    'CREATE TABLE leads',
    'CREATE TABLE lead_events (journey timeline)',
    'CREATE TABLE conversations',
    'CREATE TABLE messages',
    'CREATE TABLE site_visits',
    'CREATE TABLE lead_scores',
    'CREATE TABLE campaigns',
    'CREATE TABLE whatsapp_messages',
    'CREATE TABLE analytics_events',
    'CREATE TABLE bookings',
    'CREATE TABLE notifications',
    'Auto-triggers: updated_at, user profile on signup',
    'Row Level Security on all tables',
    'Realtime publications for live subscriptions',
  ];

  const copyTableNames = async () => {
    const text = schemaStatements.join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="premium-card p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <span className="text-lg">🗄️</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Database Schema</h2>
            <p className="text-sm text-gray-400">13 tables with RLS, triggers, and indexes</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tables</h3>
        <div className="grid grid-cols-2 gap-2">
          {schemaStatements.map((stmt, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <CheckCircle className="w-3 h-3 text-emerald-500/70 flex-shrink-0" />
              <span>{stmt}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-3">
        <p>
          <strong className="text-gray-400">To apply:</strong>
        </p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Open the file <code className="text-luxury-gold-400 bg-luxury-gold-500/10 px-1 rounded">leadluxe-ai/supabase/schema.sql</code> in your editor</li>
          <li>Copy its entire contents</li>
          <li>Go to your Supabase project's <strong className="text-gray-300">SQL Editor</strong></li>
          <li>Paste and click <strong className="text-gray-300">Run</strong></li>
        </ol>

        <button onClick={copyTableNames} className="btn-outline text-sm mt-2">
          {copied ? (
            <><CheckCircle className="w-4 h-4 text-emerald-400" /> Copied table list</>
          ) : (
            <><Copy className="w-4 h-4" /> Copy table list</>
          )}
        </button>

        <div className="pt-2">
          <a
            href="https://supabase.com/dashboard/projects"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-luxury-gold-400 hover:text-luxury-gold-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open Supabase Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
