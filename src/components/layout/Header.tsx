import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { cn } from '../../lib/utils';
import { useState } from 'react';

interface HeaderProps {
  onMenuToggle: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Lead Management',
  '/lead': 'Lead Details',
  '/calendar': 'Site Visit Calendar',
  '/analytics': 'Analytics & Reports',
  '/settings': 'Settings',
};

export function Header({ onMenuToggle }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { unreadCount, notifications, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentTitle = Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'LeadLuxe AI';

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-800/50 bg-gray-950/90 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-white">{currentTitle}</h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              {user?.full_name ? `Welcome, ${user.full_name.split(' ')[0]}` : 'LeadLuxe AI Dashboard'}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors hidden sm:flex">
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-luxury-gold-500 rounded-full text-[9px] font-bold text-black flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-800 bg-gray-950 shadow-2xl shadow-black/50 z-50 animate-slide-in-right">
                  <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-luxury-gold-400 hover:text-luxury-gold-300 transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'p-3 border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors',
                          !notif.is_read && 'bg-luxury-gold-500/5'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <div className={cn(
                            'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                            notif.type === 'lead' ? 'bg-luxury-gold-400' :
                            notif.type === 'success' ? 'bg-emerald-400' :
                            notif.type === 'warning' ? 'bg-amber-400' :
                            notif.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                          )} />
                          <div>
                            <p className="text-sm font-medium text-white">{notif.title}</p>
                            {notif.message && (
                              <p className="text-xs text-gray-400 mt-0.5">{notif.message}</p>
                            )}
                            <p className="text-[10px] text-gray-600 mt-1">
                              {new Date(notif.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="p-6 text-center">
                        <Bell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-luxury-gold-500/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-luxury-gold-400">
                  {user ? (user.full_name?.[0] || user.email[0]).toUpperCase() : 'U'}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gray-800 bg-gray-950 shadow-2xl shadow-black/50 z-50 animate-slide-in-right">
                  <div className="p-3 border-b border-gray-800">
                    <p className="text-sm font-medium text-white truncate">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setShowUserMenu(false);
                      navigate('/login');
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-gray-800/50 transition-colors rounded-b-xl"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
