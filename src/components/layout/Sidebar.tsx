import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, BarChart3, Settings,
  ChevronLeft, Building2, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn, getInitials } from '../../lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/leads', label: 'Leads', icon: Users },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ isCollapsed, onToggle, onMobileClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300',
          isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        onClick={onMobileClose}
      />

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-gray-950 border-r border-gray-800/50 transition-all duration-300 flex flex-col',
          isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-[72px]' : 'w-[260px] translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800/50">
          <NavLink to="/dashboard" className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-luxury-gold-400" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">LeadLuxe</p>
                <p className="text-[10px] text-luxury-gold-400/70 font-medium">AI</p>
              </div>
            )}
          </NavLink>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors hidden lg:flex"
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform', isCollapsed && 'rotate-180')} />
          </button>
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors lg:hidden"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-luxury-gold-500/15 text-luxury-gold-400 border border-luxury-gold-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-luxury-gold-400')} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        {user && (
          <div className={cn(
            'px-3 py-3 border-t border-gray-800/50',
            isCollapsed && 'flex justify-center'
          )}>
            <div className={cn(
              'flex items-center gap-3',
              isCollapsed && 'flex-col'
            )}>
              <div className="w-8 h-8 rounded-full bg-luxury-gold-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-luxury-gold-400">
                  {getInitials(user.full_name || user.email)}
                </span>
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{user.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
