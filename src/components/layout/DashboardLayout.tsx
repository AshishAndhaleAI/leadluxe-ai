import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '../../lib/utils';
import { useNotifications, type AppNotification } from '../../context/NotificationContext';
import { getWatchlist, getGravityDelta } from '../../lib/gravity/alerts';
import { computeGravityRankings } from '../../lib/gravity/engine';
import { InvestorCommandBar } from '../command/InvestorCommandBar';

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const { addNotification } = useNotifications();
  const lastNotifiedRef = useRef<Set<string>>(new Set());

  // Poll for new gravity alerts every 60 seconds
  useEffect(() => {
    // Initial check
    const checkAlerts = () => {
      try {
        // Run gravity rankings once and reuse
        const rankings = computeGravityRankings();
        
        // Compute alert count from current rankings
        const watchlist = getWatchlist();
        const briefingSeenToday = localStorage.getItem('terranexus-briefing-last-seen');
        const isToday = briefingSeenToday
          ? new Date(briefingSeenToday).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
          : false;

        // If briefing was viewed today, show 0 badge unless there are watched alerts
        if (isToday && watchlist.length > 0) {
          // Count only watchlist items that changed
          let count = 0;
          for (const entry of watchlist) {
            const analysis = rankings.topMarkets.find(a => a.microMarket.id === entry.cityId);
            if (!analysis) continue;
            const delta = getGravityDelta(entry.cityId, analysis.overallScore);
            if (Math.abs(delta) >= entry.alertThreshold) count++;
          }
          setAlertCount(count);
        } else if (!isToday) {
          setAlertCount(1 + watchlist.length); // Unread briefing + watched markets
        } else {
          setAlertCount(0);
        }

        // Check for watchlist changes > 5 points and fire toast notifications
        if (watchlist.length === 0) return;

        for (const entry of watchlist) {
          const analysis = rankings.topMarkets.find(a => a.microMarket.id === entry.cityId);
          if (!analysis) continue;

          const delta = getGravityDelta(entry.cityId, analysis.overallScore);
          const absDelta = Math.floor(Math.abs(delta));
          const key = `${entry.cityId}-${absDelta}`;

          if (Math.abs(delta) >= entry.alertThreshold && !lastNotifiedRef.current.has(key)) {
            lastNotifiedRef.current.add(key);

            const alertType: AppNotification['type'] = delta > 0 ? 'success' : 'warning';
            addNotification({
              title: `${entry.countryFlag} ${entry.cityName} — Gravity ${delta > 0 ? '↑' : '↓'} ${absDelta} pts`,
              message: delta > 0
                ? `${entry.cityName}'s gravity score increased by ${delta} points. Review the Daily Briefing for details.`
                : `${entry.cityName}'s gravity score dropped by ${Math.abs(delta)} points. Review the Daily Briefing for market changes.`,
              type: alertType,
            });
          }
        }

        // Limit the notification set size to prevent memory leaks
        if (lastNotifiedRef.current.size > 500) {
          lastNotifiedRef.current = new Set();
        }
      } catch (err) {
        // Silently handle — alerts are best-effort
        console.warn('[Gravity Alerts] Check failed:', err);
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 60_000);
    return () => clearInterval(interval);
  }, [addNotification]);

  const handleToggle = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black">
      <Sidebar
        isCollapsed={window.innerWidth < 1024 ? !mobileSidebarOpen : sidebarCollapsed}
        onToggle={handleToggle}
        onMobileClose={() => setMobileSidebarOpen(false)}
        unreadAlertCount={alertCount}
      />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        )}
      >
        <Header onMenuToggle={handleToggle} />
        {/* AI Investor Command Bar — persistent across all pages */}
        <div className="px-4 lg:px-6 pt-3">
          <InvestorCommandBar />
        </div>
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
