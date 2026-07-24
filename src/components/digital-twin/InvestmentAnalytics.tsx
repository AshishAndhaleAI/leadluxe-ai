// ============================================================
// TerraNexus AI — Investment Analytics Panel
// Layer 6 of the Digital Twin workspace.
// Institutional-grade investment research with charts,
// comparables, AI investment memo, and scenario analysis.
// ============================================================

import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, Shield, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { InvestmentResearch } from '../../types/digital-twin';

interface InvestmentAnalyticsProps {
  investment: InvestmentResearch;
  propertyName: string;
  city: string;
  priceMin: number;
  priceMax: number;
}

function formatPrice(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
}

function MiniChart({ data, color = '#34D399', height = 80 }: { data: { date: string; value: number }[]; color?: string; height?: number }) {
  if (data.length === 0) return <div className={cn('flex items-center justify-center', `h-[${height}px]`)}><p className="text-[8px] text-gray-600">No data</p></div>;
  const w = 240;
  const h = height;
  const values = data.map(d => d.value);
  const maxV = Math.max(...values);
  const minV = Math.min(...values);
  const range = maxV - minV || 1;
  const step = w / (data.length - 1);
  const points = values.map((v, i) => `${i * step},${h - ((v - minV) / range) * (h - 10) - 5}`).join(' ');
  const areaPoints = `0,${h} ${points} ${(data.length - 1) * step},${h}`;
  const isUp = values[values.length - 1] >= values[0];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={areaPoints} fill={`url(#grad-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InvestmentAnalytics({ investment, propertyName, city, priceMin, priceMax }: InvestmentAnalyticsProps) {
  const memo = investment.aiInvestmentMemo;

  return (
    <div className="space-y-6">
      {/* AI Investment Memo */}
      <div className={cn('premium-card p-5 border-2', 
        memo.recommendation === 'Buy' ? 'border-emerald-500/30' : 
        memo.recommendation === 'Hold' ? 'border-amber-500/30' : 'border-red-500/30'
      )}>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-sm font-semibold text-white">AI Investment Memo</h3>
          <span className={cn('ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold border',
            memo.recommendation === 'Buy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            memo.recommendation === 'Hold' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            'bg-red-500/10 text-red-400 border-red-500/20'
          )}>{memo.recommendation. toUpperCase()}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-gray-900/40 text-center">
            <p className="text-[9px] text-gray-500">12-Month Target</p>
            <p className="text-sm font-bold text-emerald-400">{formatPrice(memo.target12Month)}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-900/40 text-center">
            <p className="text-[9px] text-gray-500">36-Month Target</p>
            <p className="text-sm font-bold text-luxury-gold-400">{formatPrice(memo.target36Month)}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-900/40 text-center">
            <p className="text-[9px] text-gray-500">Cash-on-Cash</p>
            <p className="text-sm font-bold text-emerald-400">{investment.cashOnCashReturn}%</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-900/40 text-center">
            <p className="text-[9px] text-gray-500">Curr-Adj ROI</p>
            <p className="text-sm font-bold text-luxury-gold-400">{investment.currencyAdjustedReturn}%</p>
          </div>
        </div>

        {/* Key Catalysts & Risks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-[9px] text-emerald-400 font-medium mb-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Key Catalysts
            </p>
            <div className="space-y-1">
              {memo.keyCatalysts.map((c, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[9px] text-gray-400">
                  <span className="text-emerald-400 mt-0.5">+</span>
                  {c}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[9px] text-red-400 font-medium mb-2 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Key Risks
            </p>
            <div className="space-y-1">
              {memo.keyRisks.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[9px] text-gray-400">
                  <span className="text-red-400 mt-0.5">—</span>
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-gray-900/30 border border-gray-800">
          <p className="text-[8px] text-gray-600">Exit Strategy: {memo.exitStrategy}</p>
        </div>
      </div>

      {/* Price History & Rental Trend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <h4 className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Price Trend</h4>
          </div>
          <div className="h-20"><MiniChart data={investment.priceHistory} color="#34D399" /></div>
          <div className="flex items-center justify-between text-[7px] text-gray-600 mt-1">
            <span>{investment.priceHistory[0]?.date || 'N/A'}</span>
            <span>{investment.priceHistory[investment.priceHistory.length - 1]?.date || 'N/A'}</span>
          </div>
        </div>
        <div className="premium-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-luxury-gold-400" />
            <h4 className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Rental Trend</h4>
          </div>
          <div className="h-20"><MiniChart data={investment.rentalTrend} color="#F59E0B" /></div>
          <div className="flex items-center justify-between text-[7px] text-gray-600 mt-1">
            <span>{investment.rentalTrend[0]?.date || 'N/A'}</span>
            <span>{investment.rentalTrend[investment.rentalTrend.length - 1]?.date || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Market Health */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-3 text-center">
          <p className="text-[9px] text-gray-500">Absorption Rate</p>
          <p className="text-lg font-bold text-white">{investment.absorptionRate}%</p>
          <p className="text-[8px] text-emerald-400">{investment.absorptionRate >= 70 ? 'Healthy' : 'Moderate'}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[9px] text-gray-500">Inventory Months</p>
          <p className="text-lg font-bold text-white">{investment.inventoryMonths}m</p>
          <p className="text-[8px] text-amber-400">{investment.inventoryMonths <= 6 ? 'Low supply' : 'Adequate'}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[9px] text-gray-500">Mortgage Impact</p>
          <p className="text-lg font-bold text-white text-xs">{investment.mortgageRateImpact}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[9px] text-gray-500">Curr-Adj Return</p>
          <p className="text-lg font-bold text-luxury-gold-400">{investment.currencyAdjustedReturn}%</p>
        </div>
      </div>

      {/* IRR Scenarios */}
      <div className="premium-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-sm font-semibold text-white">IRR Scenario Analysis</h3>
        </div>
        <div className="space-y-2">
          {investment.irrScenarios.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
              <div className="flex items-center gap-2">
                <span className={cn('w-1.5 h-1.5 rounded-full',
                  s.scenario === 'Base' ? 'bg-blue-400' :
                  s.scenario === 'Bull' ? 'bg-emerald-400' : 'bg-red-400'
                )} />
                <span className="text-xs text-gray-300">{s.scenario} Case</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-luxury-gold-400">{s.irr}% IRR</span>
                <span className="text-[8px] text-gray-600">{s.probability}% probability</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Downside Stress Test */}
      <div className="premium-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Downside Stress Test</h3>
        </div>
        <div className="space-y-2">
          {investment.downsideStressTest.map((test, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-900/30 border border-gray-800/50">
              <span className="text-[10px] text-gray-400">{test.scenario}</span>
              <span className="text-[10px] text-red-400">{test.impact}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comparables Table */}
      {investment.comparables.length > 0 && (
        <div className="premium-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-luxury-gold-400" />
            <h3 className="text-sm font-semibold text-white">Comparable Projects</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[9px]">
              <thead>
                <tr className="text-gray-600 border-b border-gray-800">
                  <th className="text-left py-2 pr-3 font-medium">Project</th>
                  <th className="text-right px-3 font-medium">Price/sqft</th>
                  <th className="text-right px-3 font-medium">Occupancy</th>
                  <th className="text-right px-3 font-medium">Yield</th>
                  <th className="text-right pl-3 font-medium">Dev Score</th>
                </tr>
              </thead>
              <tbody>
                {investment.comparables.map((c, i) => (
                  <tr key={i} className="border-b border-gray-800/50 text-gray-400">
                    <td className="py-2 pr-3">
                      <p className="text-white text-[10px]">{c.projectName}</p>
                      <p className="text-[7px] text-gray-600">{c.developerName} · {c.distance}</p>
                    </td>
                    <td className="text-right px-3 text-white font-medium">{formatPrice(c.pricePerSqft)}/sqft</td>
                    <td className="text-right px-3 text-white">{c.occupancy}%</td>
                    <td className="text-right px-3 text-emerald-400">{c.rentalYield}%</td>
                    <td className="text-right pl-3 text-luxury-gold-400">{c.developerReputation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Source */}
      <div className="p-2 rounded-lg bg-gray-900/30 border border-gray-800/50">
        <span className="text-[8px] text-gray-600">
          Data sourced from {investment.provenance.sourceName} · {investment.provenance.verificationStatus} · {investment.provenance.fetchedAt}
        </span>
      </div>
    </div>
  );
}
