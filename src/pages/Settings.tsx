import { useState } from 'react';
import {
  Settings as SettingsIcon, User, Bell, Shield,
  MessageSquare, Palette, Key, Save, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const sections: SettingsSection[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'whatsapp', label: 'WhatsApp Integration', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'team', label: 'Team Members', icon: <Shield className="w-4 h-4" /> },
  { id: 'branding', label: 'Branding', icon: <Palette className="w-4 h-4" /> },
  { id: 'api', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
];

export function Settings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-luxury-gold-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <p className="text-sm text-gray-500">Manage your account and integrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-all',
                activeSection === section.id
                  ? 'bg-luxury-gold-500/15 text-luxury-gold-400 border border-luxury-gold-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
              )}
            >
              <div className="flex items-center gap-2.5">
                {section.icon}
                <span>{section.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 rounded-xl border border-gray-800 bg-gray-900/80 p-6">
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-white">Profile Settings</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-luxury-gold-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-luxury-gold-400">
                    {user?.full_name?.[0] || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <button className="text-xs text-luxury-gold-400 hover:text-luxury-gold-300 mt-1 transition-colors">
                    Change avatar
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.full_name || ''}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue={user?.phone || ''}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Role</label>
                  <input
                    type="text"
                    value={user?.role || 'Admin'}
                    disabled
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-white">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: 'New Lead Capture', desc: 'When a new lead is captured via website or WhatsApp' },
                  { label: 'High Score Lead', desc: 'When a lead scores 80+ on AI scoring' },
                  { label: 'Site Visit Scheduled', desc: 'When a site visit is booked' },
                  { label: 'Site Visit Reminder', desc: '24 hours before a scheduled visit' },
                  { label: 'Daily Digest', desc: 'End-of-day lead summary report' },
                  { label: 'Weekly Report', desc: 'Weekly performance analytics report' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm text-white">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-luxury-gold-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'whatsapp' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-white">WhatsApp Integration</h3>
              <div className="p-4 rounded-lg bg-luxury-gold-500/5 border border-luxury-gold-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-luxury-gold-400" />
                  <p className="text-sm font-medium text-luxury-gold-400">WhatsApp Business API</p>
                </div>
                <p className="text-xs text-gray-400">
                  Connect your WhatsApp Business account to enable automated follow-ups, 
                  property brochures, and visit reminders. API integration coming soon.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-800">
                  <div>
                    <p className="text-sm text-white">WhatsApp Business Number</p>
                    <p className="text-xs text-gray-500 mt-0.5">Not configured</p>
                  </div>
                  <button className="px-3 py-1.5 text-xs bg-luxury-gold-500/20 text-luxury-gold-400 border border-luxury-gold-500/30 rounded-lg hover:bg-luxury-gold-500/30 transition-all">
                    Configure
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-800">
                  <div>
                    <p className="text-sm text-white">Automated Follow-up Messages</p>
                    <p className="text-xs text-gray-500 mt-0.5">Configure auto-reply templates</p>
                  </div>
                  <button className="px-3 py-1.5 text-xs bg-gray-800 text-gray-400 border border-gray-700 rounded-lg hover:text-white transition-colors">
                    Edit Templates
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'team' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-white">Team Members</h3>
              <p className="text-xs text-gray-500">
                Manage team members and their access levels. (Coming soon)
              </p>
              <div className="p-8 text-center">
                <Shield className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Team management will be available in the next update</p>
              </div>
            </div>
          )}

          {activeSection === 'branding' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-white">Brand Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Company Name</label>
                  <input
                    type="text"
                    defaultValue="My Real Estate Co."
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Website URL</label>
                  <input
                    type="url"
                    defaultValue="https://mycompany.com"
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-white">API Keys</h3>
              <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white">Supabase API Key</p>
                  <button className="text-xs text-luxury-gold-400 hover:text-luxury-gold-300 transition-colors">
                    Regenerate
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-900 rounded text-xs text-gray-400 font-mono">
                    sk_live_xxxxxxxxxxxxxxxxxxxx
                  </code>
                  <button className="px-3 py-2 text-xs bg-gray-800 text-gray-400 border border-gray-700 rounded-lg hover:text-white transition-colors">
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 pt-6 border-t border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {saved ? '✅ Settings saved successfully!' : 'Changes are saved locally'}
            </p>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-luxury-gold-500/20 text-luxury-gold-400 border border-luxury-gold-500/30 rounded-lg text-sm font-medium hover:bg-luxury-gold-500/30 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
