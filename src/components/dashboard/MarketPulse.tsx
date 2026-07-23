// ============================================================
// LeadLuxe AI — Market Pulse Live Ticker
// A scrolling ticker bar that shows global real estate signals
// in real-time, creating a "live intelligence" feel.
// ============================================================

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useOpportunityEngine } from '../../hooks/useOpportunityEngine';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function MarketPulse() {
  const { signals, dashboardMetrics } = useOpportunityEngine();
  const [isPaused, setIsPaused] = useState(false);


  // Generate ticker items from signals, enriched with market data
  const tickerItems = useMemo(() => {
    const items: { id: string; text: string; emoji: string; positive: boolean; critical: boolean }[] = [];

    // Add market metrics as the first items
    if (dashboardMetrics) {
      items.push({
        id: 'metrics-active',
        text: `${dashboardMetrics.todayOpportunities} active opportunities in pipeline`,
        emoji: '🎯',
        positive: true,
        critical: false,
      });
      items.push({
        id: 'metrics-pipeline',
        text: `Pipeline value: ₹${(dashboardMetrics.totalPipelineValue / 10000000).toFixed(1)} Cr across ${dashboardMetrics.activeDealsCount} deals`,
        emoji: '💰',
        positive: true,
        critical: false,
      });
      if (dashboardMetrics.criticalSignals > 0) {
        items.push({
          id: 'metrics-critical',
          text: `${dashboardMetrics.criticalSignals} high-priority signals requiring attention`,
          emoji: '🔴',
          positive: false,
          critical: true,
        });
      }
    }

    // Add recent signals as ticker items
    for (const signal of signals.slice(0, 30)) {
      const isPositive = signal.impact_level === 'high' || signal.impact_level === 'critical';
      items.push({
        id: signal.id,
        text: signal.title,
        emoji: isPositive ? '📈' : '📊',
        positive: isPositive,
        critical: signal.impact_level === 'critical',
      });
    }

    // If no signals, show a simple waiting message
    if (items.length < 5) {
      items.push({
        id: 'no-signal',
        text: 'Awaiting intelligence data — start RSS proxy with: npm run server',
        emoji: '⏳',
        positive: false,
        critical: false,
      });
      items.push({
        id: 'no-signal-2',
        text: 'No live market signals available yet — intelligence engine is idle',
        emoji: '💤',
        positive: false,
        critical: false,
      });
    }

    // Ensure we have enough items for smooth scrolling
    while (items.length < 12) {
      items.push({ id: `padding-${items.length}`, text: '●', emoji: '•', positive: true, critical: false });
    }
    // Duplicate for seamless looping effect
    return [...items, ...items, ...items];
  }, [signals, dashboardMetrics]);

  if (tickerItems.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-luxury-gold-500/10 bg-gradient-to-r from-luxury-surface via-luxury-gray to-luxury-dark"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left gradient fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-luxury-dark to-transparent pointer-events-none" />
      {/* Right gradient fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-luxury-dark to-transparent pointer-events-none" />

      {/* Live badge */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/15 border border-red-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-semibold text-red-400 uppercase tracking-wider">Live</span>
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex items-center h-10 overflow-hidden"
      >
        <motion.div
          className="flex items-center gap-8 whitespace-nowrap pl-28"
          animate={{ x: isPaused ? 0 : ['0%', '-50%'] }}
          transition={{
            x: {
              duration: 80,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 0,
            },
          }}
        >
          {tickerItems.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="flex items-center gap-2 text-xs"
            >
              <span className="text-sm">{item.emoji}</span>
              <span className={`text-gray-300 ${item.critical ? 'font-semibold' : ''}`}>
                {item.text}
              </span>
              {item.positive ? (
                <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400 shrink-0" />
              )}
              <span className="w-px h-3 bg-gray-800 last:hidden" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
