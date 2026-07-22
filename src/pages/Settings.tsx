import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, User, Bell, Shield, Percent,
  Building2, Save, CheckCircle, CreditCard, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

type SettingsTab = 'profile' | 'notifications' | 'commission' | 'team';

export function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { key: SettingsTab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profile', icon: User },
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
