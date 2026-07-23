import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, User, Bell, Shield, Percent,
  Building2, Save, CheckCircle, CreditCard, LogOut, Bot,
  MessageSquare, Phone, Zap, Clock, Sliders,
  Globe, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
  getCoachPreferences, saveCoachPreferences,
  tryLoadFromSupabase, syncToSupabase,
  DEFAULT_PREFERENCES, STYLE_OPTIONS, TONE_OPTIONS, CHANNEL_OPTIONS,
  type CoachPreferences,
} from '../lib/coach-preferences';

type SettingsTab = 'profile' | 'notifications' | 'commission' | 'team' | 'coach';

export function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const [coachPrefs, setCoachPrefs] = useState<CoachPreferences>(() => getCoachPreferences());
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // On mount: try to load preferences from Supabase (cross-device sync)
  // If a newer version exists in the cloud, overwrite local and update state.
  useEffect(() => {
    if (!user?.id) return;
    const loadCloudPrefs = async () => {
      const cloudPrefs = await tryLoadFromSupabase(user.id);
      if (cloudPrefs) {
        saveCoachPreferences(cloudPrefs); // overwrite local
        setCoachPrefs(cloudPrefs);
      }
    };
    loadCloudPrefs();
  }, [user?.id]);

  const tabs: { key: SettingsTab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'coach', label: 'AI Coach', icon: Bot },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'commission', label: 'Commission', icon: Percent },
    { key: 'team', label: 'Team', icon: Shield },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-luxury-gold-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <p className="text-sm text-gray-500">Manage your account and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-luxury-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap',
              activeTab === tab.key
                ? 'text-luxury-gold-400 border-luxury-gold-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="premium-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Full Name</label>
              <input type="text" defaultValue={user?.full_name} className="input-glass" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
              <input type="email" defaultValue={user?.email} className="input-glass" readOnly />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Company</label>
              <input type="text" defaultValue="Premium Realty Developers" className="input-glass" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Role</label>
              <input type="text" defaultValue="Developer" className="input-glass" readOnly />
            </div>
          </div>
          <button onClick={handleSave} className="btn-primary">
            {saved ? <><CheckCircle className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      )}

      {/* AI Coach Tab */}
      {activeTab === 'coach' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="premium-card p-4 bg-gradient-to-r from-gray-900 via-gray-900/80 to-luxury-gold-500/5 border-luxury-gold-500/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 text-luxury-gold-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">AI Deal Coach Preferences</h3>
                <p className="text-sm text-gray-400">
                  Customize how the AI Coach interacts with you — adjust its style, tone, preferred channels, and urgency thresholds to match your sales workflow.
                </p>
              </div>
            </div>
          </div>

          {/* Communication Style */}
          <div className="premium-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-bold text-white">Communication Style</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">Choose how the AI Coach addresses you and frames its advice.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STYLE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setCoachPrefs(p => ({ ...p, style: opt.value }))}
                  className={cn(
                    'p-3 rounded-xl text-left border transition-all',
                    coachPrefs.style === opt.value
                      ? 'bg-luxury-gold-500/15 border-luxury-gold-500/30 text-luxury-gold-400'
                      : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-600'
                  )}
                >
                  <p className="text-xs font-semibold mb-0.5">{opt.label}</p>
                  <p className="text-[9px] opacity-70">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Response Tone */}
          <div className="premium-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-bold text-white">Response Tone</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">Control the energy and phrasing of coaching cards.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TONE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setCoachPrefs(p => ({ ...p, tone: opt.value }))}
                  className={cn(
                    'p-3 rounded-xl text-left border transition-all',
                    coachPrefs.tone === opt.value
                      ? 'bg-luxury-gold-500/15 border-luxury-gold-500/30 text-luxury-gold-400'
                      : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-600'
                  )}
                >
                  <p className="text-xs font-semibold mb-0.5">{opt.label}</p>
                  <p className="text-[9px] opacity-70">{opt.desc}</p>
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="mt-4 p-3 rounded-xl bg-gray-900/70 border border-gray-800">
              <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5">Preview</p>
              <p className="text-xs text-gray-300 italic">
                {coachPrefs.style === 'direct' && coachPrefs.tone === 'formal' && '"Contact Rajesh Mehta about Godrej Sky Residences. His interest was expressed 3 days ago. Send a property brochure and schedule a virtual tour to advance this deal." '}
                {coachPrefs.style === 'friendly' && coachPrefs.tone === 'conversational' && '"Hey! Rajesh Mehta is interested in Godrej Sky Residences. Why not reach out with a quick hello and a brochure? A personal touch goes a long way!" '}
                {coachPrefs.style === 'professional' && coachPrefs.tone === 'formal' && '"Recommendation: Initiate contact with Rajesh Mehta regarding Godrej Sky Residences. Attached is a suggested outreach template. Please review and proceed at your earliest convenience." '}
                {coachPrefs.style === 'motivational' && coachPrefs.tone === 'urgent' && '"Rajesh Mehta is ready! He expressed interest 3 days ago and every day you wait, the competition catches up. Pick up the phone NOW and close this deal!" '}
                {!(coachPrefs.style === 'direct' && coachPrefs.tone === 'formal') && !(coachPrefs.style === 'friendly' && coachPrefs.tone === 'conversational') && !(coachPrefs.style === 'professional' && coachPrefs.tone === 'formal') && !(coachPrefs.style === 'motivational' && coachPrefs.tone === 'urgent') && `"${coachPrefs.style === 'motivational' ? 'Go get them!' : coachPrefs.tone === 'urgent' ? 'Act now.' : 'Take the next step.'} Reach out to Rajesh Mehta about Godrej Sky Residences." `}
              </p>
            </div>
          </div>

          {/* Preferred Channels */}
          <div className="premium-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-bold text-white">Preferred Channels</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">Drag to reorder your preferred contact channels. The AI Coach will prioritize the first channel when recommending how to reach out.</p>
            <div className="space-y-2">
              {coachPrefs.preferredChannels.map((channel, idx) => {
                const info = CHANNEL_OPTIONS.find(c => c.value === channel)!;
                return (
                  <div
                    key={channel}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/50 border border-gray-800"
                  >
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => {
                          if (idx === 0) return;
                          const arr = [...coachPrefs.preferredChannels];
                          [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                          setCoachPrefs(p => ({ ...p, preferredChannels: arr }));
                        }}
                        className="p-0.5 rounded hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-30"
                        disabled={idx === 0}
                      >
                        <ChevronDown className="w-3 h-3 rotate-180" />
                      </button>
                      <button
                        onClick={() => {
                          if (idx === coachPrefs.preferredChannels.length - 1) return;
                          const arr = [...coachPrefs.preferredChannels];
                          [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
                          setCoachPrefs(p => ({ ...p, preferredChannels: arr }));
                        }}
                        className="p-0.5 rounded hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-30"
                        disabled={idx === coachPrefs.preferredChannels.length - 1}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm">{info.icon}</span>
                    <span className="flex-1 text-xs text-white font-medium">{info.label}</span>
                    <span className="text-[9px] text-gray-500">#{idx + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Urgency & Thresholds */}
          <div className="premium-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-luxury-gold-400" />
              <h3 className="text-sm font-bold text-white">Urgency & Thresholds</h3>
            </div>

            <div className="space-y-5">
              {/* Stale deal threshold */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <label className="text-xs text-gray-300">Stale Deal Threshold</label>
                  </div>
                  <span className="text-xs font-bold text-luxury-gold-400">{coachPrefs.staleThresholdDays} days</span>
                </div>
                <p className="text-[10px] text-gray-500 mb-2">
                  Deals idle longer than this many days are flagged as 'Stale' and get Critical priority.
                </p>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={coachPrefs.staleThresholdDays}
                  onChange={e => setCoachPrefs(p => ({ ...p, staleThresholdDays: Number(e.target.value) }))}
                  className="w-full h-1.5 rounded-full appearance-none bg-gray-700 accent-luxury-gold-500 cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-gray-600 mt-1">
                  <span>1 day (very aggressive)</span>
                  <span>14 days (relaxed)</span>
                </div>
              </div>

              {/* Min commission threshold */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-gray-500" />
                    <label className="text-xs text-gray-300">Minimum Commission Threshold</label>
                  </div>
                  <span className="text-xs font-bold text-luxury-gold-400">₹{coachPrefs.minCommissionThreshold.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-gray-500 mb-2">
                  Deals with commissions below this amount won't generate coaching cards — helps you focus on high-value opportunities.
                </p>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="25000"
                  value={coachPrefs.minCommissionThreshold}
                  onChange={e => setCoachPrefs(p => ({ ...p, minCommissionThreshold: Number(e.target.value) }))}
                  className="w-full h-1.5 rounded-full appearance-none bg-gray-700 accent-luxury-gold-500 cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-gray-600 mt-1">
                  <span>₹0 (all deals)</span>
                  <span>₹5 L (high-value only)</span>
                </div>
              </div>

              {/* Completed deals toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-gray-500" />
                  <div>
                    <p className="text-xs font-medium text-white">Show Completed / Lost Deals</p>
                    <p className="text-[9px] text-gray-500">Include closed and lost deals in coaching recommendations</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coachPrefs.showCompletedDeals}
                    onChange={e => setCoachPrefs(p => ({ ...p, showCompletedDeals: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-luxury-gold-500" />
                </label>
              </div>

              {/* Urgency alerts toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-gray-500" />
                  <div>
                    <p className="text-xs font-medium text-white">Urgency Alerts</p>
                    <p className="text-[9px] text-gray-500">Show daily notifications for critical deals needing immediate action</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coachPrefs.urgencyAlertsEnabled}
                    onChange={e => setCoachPrefs(p => ({ ...p, urgencyAlertsEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-luxury-gold-500" />
                </label>
              </div>
            </div>
          </div>

          {/* Sync Status */}
          {cloudSyncStatus === 'syncing' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              <p className="text-[10px] text-blue-400">Syncing preferences to cloud...</p>
            </div>
          )}
          {cloudSyncStatus === 'synced' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-[10px] text-emerald-400">Preferences synced to cloud · accessible from any device</p>
            </div>
          )}
          {cloudSyncStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-[10px] text-amber-400">Cloud sync unavailable — preferences saved locally</p>
            </div>
          )}

          {/* Save / Reset */}
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                setCloudSyncStatus('syncing');
                saveCoachPreferences(coachPrefs);
                if (user?.id) {
                  try {
                    await syncToSupabase(user.id, coachPrefs);
                    setCloudSyncStatus('synced');
                  } catch {
                    setCloudSyncStatus('error');
                    setTimeout(() => setCloudSyncStatus('idle'), 4000);
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                    return;
                  }
                } else {
                  setCloudSyncStatus('error');
                  setTimeout(() => setCloudSyncStatus('idle'), 3000);
                }
                setSaved(true);
                setTimeout(() => { setSaved(false); setCloudSyncStatus('idle'); }, 3000);
              }}
              className="btn-primary"
            >
              {saved ? <><CheckCircle className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Coach Preferences</>}
            </button>
            <button
              onClick={async () => {
                setCoachPrefs({ ...DEFAULT_PREFERENCES });
                saveCoachPreferences(DEFAULT_PREFERENCES);
                if (user?.id) {
                  setCloudSyncStatus('syncing');
                  try {
                    await syncToSupabase(user.id, DEFAULT_PREFERENCES);
                    setCloudSyncStatus('synced');
                  } catch {
                    setCloudSyncStatus('error');
                  }
                  setTimeout(() => setCloudSyncStatus('idle'), 3000);
                }
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
              className="btn-outline !text-gray-400 !border-gray-700"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="premium-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { label: 'New deal opportunities', desc: 'When AI detects a new high-confidence opportunity' },
              { label: 'Buying signals detected', desc: 'When new RERA filings, approvals, or market signals are found' },
              { label: 'Competitor activity', desc: 'When tracked builders launch projects or raise funding' },
              { label: 'Weekly forecast summary', desc: 'Every Monday with updated commission projections' },
              { label: 'AI Coach recommendations', desc: 'When the AI Coach has new deal-specific suggestions' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-luxury-gold-500" />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commission Tab */}
      {activeTab === 'commission' && (
        <div className="space-y-4">
          <div className="premium-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
                <Percent className="w-5 h-5 text-luxury-gold-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Commission Model</h3>
                <p className="text-sm text-gray-500">Zero subscription. Only pay when you close deals.</p>
              </div>
            </div>

            <div className="glass-card p-5 border border-luxury-gold-500/10 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">Success Fee</span>
                <span className="text-2xl font-bold text-luxury-gold-400">3%</span>
              </div>
              <div className="divider-gold mb-3" />
              <div className="space-y-2 text-xs text-gray-500">
                <p className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> No monthly subscription fee</p>
                <p className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> No upfront payment required</p>
                <p className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Only charged when a deal closes</p>
                <p className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Cancel anytime with zero penalty</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '₹50 L', commission: '₹1.5 L' },
                { value: '₹1.2 Cr', commission: '₹3.6 L' },
                { value: '₹2.5 Cr', commission: '₹7.5 L' },
                { value: '₹5 Cr', commission: '₹15 L' },
              ].map((ex, i) => (
                <div key={i} className="glass-card p-3 text-center">
                  <p className="text-sm text-gray-400">Deal: {ex.value}</p>
                  <p className="text-base font-bold text-luxury-gold-400 mt-1">{ex.commission}</p>
                  <p className="text-[10px] text-gray-600">commission</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="premium-card p-6">
          <h3 className="text-base font-semibold text-white mb-4">Team Management</h3>
          <div className="glass-card p-4 mb-4">
            <p className="text-sm text-gray-400">
              Invite your team members to collaborate on deal intelligence, share opportunities, and track commission together.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Rajesh Mehta', email: user?.email || 'builder@leadluxe.ai', role: 'Admin' },
            ].map((member, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-luxury-gray/50 border border-luxury-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-luxury-gold-500/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-luxury-gold-400">{member.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                <span className="text-xs text-luxury-gold-400 font-medium bg-luxury-gold-500/10 px-2 py-0.5 rounded-full border border-luxury-gold-500/20">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sign Out */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-600">App version 2.0 · AI Deal Intelligence Platform</p>
        <button
          onClick={() => { signOut(); navigate('/login'); }}
          className="btn-outline !text-red-400 !border-red-500/20 hover:!bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </motion.div>
  );
}
