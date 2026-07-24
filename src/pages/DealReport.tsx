// ============================================================
// TerraNexus AI — AI Deal Report Generator (/report/:slug)
// Professional branded investment report with PDF download
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Download, ArrowLeft, Building2, TrendingUp, Globe,
  Zap, Shield, Target, BarChart3, MapPin, DollarSign, CheckCircle,
  AlertTriangle, Sparkles, ChevronRight, Star, Layers
} from 'lucide-react';
import { CITIES, COUNTRIES } from '../lib/global-data';
import { formatIndianCurrency } from '../lib/format';
import { cn } from '../lib/utils';
import { trackEvent } from '../lib/analytics';
import type { City } from '../lib/global-data';

// ============================================================
// REPORT SECTION COMPONENT
// ============================================================
function ReportSection({ title, icon: Icon, children, delay = 0 }: {
  title: string; icon: any; children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-5 border-luxury-gold-500/10 print:border print:border-gray-300"
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-luxury-gold-400" />
        <h2 className="text-sm font-bold text-white print:text-gray-900">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

// ============================================================
// SCORE BAR COMPONENT
// ============================================================
function ScoreBar({ label, score, maxScore = 100, color }: {
  label: string; score: number; maxScore?: number; color?: string;
}) {
  const pct = Math.min((score / maxScore) * 100, 100);
  const barColor = color || (score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444');

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[9px]">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{score}/{maxScore}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700 print:bg-gray-400"
          style={{ width: `${pct}%`, backgroundColor: barColor }} />
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export function DealReport() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [cityData, setCityData] = useState<City | null>(null);
  const [countryName, setCountryName] = useState('');
  const [countryFlag, setCountryFlag] = useState('');
  const [countryCode, setCountryCode] = useState('');

  // Parse slug to find city
  useEffect(() => {
    if (!slug) return;

    // Parse e.g. "pune-kharadi" -> city "Pune", district "Kharadi"
    const parts = slug.split('-');
    const cityNamePart = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    const districtPart = parts.slice(1).join(' ').replace(/\b\w/g, (c) => c.toUpperCase());

    // Find city in CITIES
    for (const [cc, cities] of Object.entries(CITIES)) {
      const found = cities.find(
        (c) => c.name.toLowerCase() === cityNamePart.toLowerCase()
      );
      if (found) {
        setCityData(found);
        setCountryCode(cc);
        const country = COUNTRIES.find((c) => c.code === cc);
        if (country) {
          setCountryName(country.name);
          setCountryFlag(country.flag);
        }
        break;
      }
    }

    trackEvent('report_request', {
      slug,
      city: cityNamePart,
      district: districtPart,
    });
  }, [slug]);

  // ============================================================
  // GENERATE REPORT DATA
  // ============================================================
  const report = useMemo(() => {
    if (!cityData) return null;

    const pricePerSqft = cityData.pricePerSqft;
    const avgUnitSize = 1000;
    const propertyValue = pricePerSqft * avgUnitSize;
    const commission = propertyValue * 0.03;
    const momentum = Math.min(cityData.priceTrend * 8, 100);
    const demand = Math.min(cityData.investorInterest * 1.1, 100);
    const absorption = Math.min(cityData.absorptionRate * 1.2, 100);
    const confidence = cityData.confidence;
    const foreignDemand = Math.min(cityData.foreignDemand * 1.2, 100);
    const roiScore = Math.min(cityData.averageRoi * 7, 100);
    const marketScore = Math.round((momentum + demand + absorption + confidence + foreignDemand) / 5);

    return {
      cityName: cityData.name,
      countryName,
      countryFlag,
      countryCode,
      district: slug?.split('-').slice(1).join(' ') || 'Central',
      pricePerSqft,
      avgUnitSize,
      propertyValue,
      commission,
      priceTrend: cityData.priceTrend,
      absorptionRate: cityData.absorptionRate,
      averageRoi: cityData.averageRoi,
      foreignDemand: cityData.foreignDemand,
      investorInterest: cityData.investorInterest,
      confidence: cityData.confidence,
      activeProjects: cityData.activeProjects,
      upcomingLaunches: cityData.upcomingLaunches,
      tags: cityData.tags,
      latitude: cityData.latitude,
      longitude: cityData.longitude,
      generatedAt: new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
      }),
      scores: {
        marketScore,
        priceMomentum: Math.round(momentum),
        demandScore: Math.round(demand),
        absorptionScore: Math.round(absorption),
        confidenceScore: confidence,
        foreignScore: Math.round(foreignDemand),
        roiScore: Math.round(roiScore),
      },
      infrastructure: [
        `Metro connectivity within 5-10 km radius`,
        `${cityData.activeProjects} active residential/commercial projects`,
        `${cityData.upcomingLaunches} upcoming project launches in pipeline`,
        `${cityData.absorptionRate}% absorption rate indicates strong demand`,
      ],
      comparableTransactions: [
        { type: '2BHK (850 sqft)', price: pricePerSqft * 850 },
        { type: '3BHK (1,200 sqft)', price: pricePerSqft * 1200 },
        { type: 'Penthouse (2,000 sqft)', price: pricePerSqft * 2000 },
        { type: 'Commercial (500 sqft)', price: pricePerSqft * 500 * 0.7 },
      ],
      risks: [
        { factor: 'Market Volatility', severity: cityData.priceTrend > 10 ? 'medium' : 'low', mitigation: 'Historical price trend is positive' },
        { factor: 'Inventory Oversupply', severity: cityData.absorptionRate < 65 ? 'medium' : 'low', mitigation: `${cityData.absorptionRate}% absorption rate` },
        { factor: 'Regulatory Changes', severity: 'low', mitigation: 'Standard RERA compliance expected' },
        { factor: 'Liquidity', severity: cityData.investorInterest < 60 ? 'medium' : 'low', mitigation: `${cityData.investorInterest} investor interest score` },
      ],
    };
  }, [cityData, slug, countryName, countryFlag, countryCode]);

  const handleDownloadPDF = () => {
    trackEvent('report_download', { slug, city: cityData?.name });
    window.print();
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Report not available for this location</p>
          <p className="text-[10px] text-gray-600 mt-1">Try /report/pune-kharadi or /report/dubai-marina</p>
          <button onClick={() => navigate('/')} className="btn-outline mt-4">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black print:bg-white">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-20 border-b border-gray-800 bg-luxury-black/90 backdrop-blur-xl print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-white">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-600">{report.cityName} · {report.countryName}</span>
            <button onClick={handleDownloadPDF}
              className="btn-primary text-[10px] px-3 py-1.5">
              <Download className="w-3 h-3" /> Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 print:py-4 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-luxury-gold-500/20 print:border print:border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{report.countryFlag}</span>
                <span className="text-[9px] text-luxury-gold-400 font-medium uppercase tracking-wider">AI-Generated Report</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white print:text-gray-900 font-display">
                {report.cityName}{report.district !== 'Central' ? ` — ${report.district}` : ''}
              </h1>
              <p className="text-sm text-gray-400 print:text-gray-600 mt-1">
                {report.countryName} · Generated {report.generatedAt}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[9px] text-gray-600">
              <Shield className="w-3 h-3 text-luxury-gold-400" />
              TerraNexus AI Intelligence
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="text-center p-2 rounded-lg bg-luxury-gold-500/5 border border-luxury-gold-500/10">
              <p className="text-sm font-bold text-luxury-gold-400">{formatIndianCurrency(report.propertyValue)}</p>
              <p className="text-[8px] text-gray-600">Avg Property Value</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-sm font-bold text-emerald-400">{report.scores.marketScore}/100</p>
              <p className="text-[8px] text-gray-600">Market Score</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-luxury-gold-500/5 border border-luxury-gold-500/10">
              <p className="text-sm font-bold text-luxury-gold-400">{formatIndianCurrency(report.commission)}</p>
              <p className="text-[8px] text-gray-600">Est. Commission (3%)</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-sm font-bold text-emerald-400">{report.confidence}%</p>
              <p className="text-[8px] text-gray-600">AI Confidence</p>
            </div>
          </div>
        </motion.div>

        {/* Executive Summary */}
        <ReportSection title="Executive Summary" icon={FileText} delay={0.05}>
          <p className="text-[10px] text-gray-300 print:text-gray-700 leading-relaxed">
            This AI-generated report analyzes the real estate market in <strong className="text-white print:text-gray-900">{report.cityName}</strong>, 
            {report.countryName}. With a market score of <strong>{report.scores.marketScore}/100</strong>, 
            this location demonstrates {report.scores.marketScore >= 80 ? 'strong' : report.scores.marketScore >= 60 ? 'moderate' : 'developing'} 
            investment fundamentals. Price momentum of <strong>+{report.priceTrend}%</strong> YoY, 
            {report.absorptionRate}% absorption rate, and {report.activeProjects} active projects indicate 
            {report.absorptionRate >= 70 ? ' healthy demand-supply dynamics.' : ' a market requiring careful selection.'}
            {' '}AI confidence: <strong>{report.confidence}%</strong>. Estimated commission potential: <strong>{formatIndianCurrency(report.commission)}</strong>.
          </p>
        </ReportSection>

        {/* Market Momentum + Score Bars */}
        <div className="grid sm:grid-cols-2 gap-4">
          <ReportSection title="Market Momentum" icon={TrendingUp} delay={0.1}>
            <div className="space-y-2.5">
              <ScoreBar label="Price Momentum" score={report.scores.priceMomentum} />
              <ScoreBar label="Demand Score" score={report.scores.demandScore} />
              <ScoreBar label="Absorption Rate" score={report.scores.absorptionScore} />
              <ScoreBar label="AI Confidence" score={report.scores.confidenceScore} />
              <ScoreBar label="Foreign Demand" score={report.scores.foreignScore} />
              <ScoreBar label="ROI Potential" score={report.scores.roiScore} />
            </div>
          </ReportSection>

          <ReportSection title="AI Opportunity Ranking" icon={Target} delay={0.15}>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-gray-400">Overall Market Score</span>
                <span className={cn(
                  'text-xs font-bold',
                  report.scores.marketScore >= 80 ? 'text-emerald-400' : 
                  report.scores.marketScore >= 60 ? 'text-amber-400' : 'text-red-400'
                )}>{report.scores.marketScore}/100</span>
              </div>
              <div className="text-[10px] text-gray-300 print:text-gray-700 space-y-1">
                <p><strong className="text-white print:text-gray-900">Rank:</strong> {
                  report.scores.marketScore >= 85 ? 'Top 5% Global' :
                  report.scores.marketScore >= 75 ? 'Top 15% Global' :
                  report.scores.marketScore >= 60 ? 'Above Average' : 'Emerging Market'
                }</p>
                <p><strong className="text-white print:text-gray-900">Peer Group:</strong> {
                  report.tags.includes('luxury') ? 'Luxury Residential' :
                  report.tags.includes('commercial') ? 'Commercial' : 'Residential'
                }</p>
                <p><strong className="text-white print:text-gray-900">Forecast:</strong> {
                  report.priceTrend > 10 ? 'Strong upward momentum' :
                  report.priceTrend > 5 ? 'Stable growth' : 'Moderate'
                }</p>
              </div>
            </div>
          </ReportSection>
        </div>

        {/* Infrastructure Catalysts + Capital Flow */}
        <div className="grid sm:grid-cols-2 gap-4">
          <ReportSection title="Infrastructure Catalysts" icon={Building2} delay={0.2}>
            <ul className="space-y-1.5">
              {report.infrastructure.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[10px] text-gray-300 print:text-gray-700">
                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </ReportSection>

          <ReportSection title="Capital Flow Analysis" icon={Globe} delay={0.25}>
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between"><span className="text-gray-400">Foreign Demand Index</span><span className="text-white font-medium">{report.foreignDemand}/100</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Investor Interest</span><span className="text-white font-medium">{report.investorInterest}/100</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Avg ROI</span><span className="text-emerald-400 font-medium">{report.averageRoi}%</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Cross-Border Appeal</span>
                <span className={report.foreignDemand >= 50 ? 'text-emerald-400' : 'text-amber-400'}>
                  {report.foreignDemand >= 50 ? 'High' : 'Moderate'}
                </span>
              </div>
            </div>
          </ReportSection>
        </div>

        {/* Developer Landscape + Comparable Transactions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <ReportSection title="Developer Landscape" icon={Building2} delay={0.3}>
            <div className="text-[10px] text-gray-300 print:text-gray-700 space-y-1.5">
              <div className="flex justify-between"><span className="text-gray-400">Active Projects</span><span className="text-white font-medium">{report.activeProjects}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Upcoming Launches</span><span className="text-white font-medium">{report.upcomingLaunches}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Absorption Rate</span><span className="text-emerald-400 font-medium">{report.absorptionRate}%</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Price/Sqft</span><span className="text-white font-medium">{formatIndianCurrency(report.pricePerSqft)}</span></div>
            </div>
          </ReportSection>

          <ReportSection title="Comparable Transactions" icon={BarChart3} delay={0.35}>
            <div className="space-y-2">
              {report.comparableTransactions.map((t, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="text-gray-400">{t.type}</span>
                  <span className="text-white font-medium">{formatIndianCurrency(t.price)}</span>
                </div>
              ))}
            </div>
          </ReportSection>
        </div>

        {/* Risk Matrix */}
        <ReportSection title="Risk Matrix" icon={AlertTriangle} delay={0.4}>
          <div className="grid sm:grid-cols-2 gap-2">
            {report.risks.map((risk, i) => (
              <div key={i} className="p-2 rounded-lg bg-luxury-black/40 border border-gray-800/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    risk.severity === 'low' ? 'bg-emerald-400' :
                    risk.severity === 'medium' ? 'bg-amber-400' : 'bg-red-400'
                  )} />
                  <span className="text-[10px] font-medium text-white">{risk.factor}</span>
                  <span className={cn(
                    'text-[8px] px-1 rounded',
                    risk.severity === 'low' ? 'text-emerald-400' :
                    risk.severity === 'medium' ? 'text-amber-400' : 'text-red-400'
                  )}>{risk.severity}</span>
                </div>
                <p className="text-[9px] text-gray-500">{risk.mitigation}</p>
              </div>
            ))}
          </div>
        </ReportSection>

        {/* Commission Potential */}
        <ReportSection title="Commission Potential" icon={DollarSign} delay={0.45}>
          <div className="grid sm:grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-luxury-gold-500/5 border border-luxury-gold-500/10">
              <p className="text-xs text-gray-500">Est. Deal Value</p>
              <p className="text-lg font-bold text-white">{formatIndianCurrency(report.propertyValue)}</p>
            </div>
            <div className="p-3 rounded-lg bg-luxury-gold-500/5 border border-luxury-gold-500/10">
              <p className="text-xs text-gray-500">Commission Rate</p>
              <p className="text-lg font-bold text-luxury-gold-400">3%</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-xs text-gray-500">Est. Commission</p>
              <p className="text-lg font-bold text-emerald-400">{formatIndianCurrency(report.commission)}</p>
            </div>
          </div>
          <p className="text-[8px] text-gray-600 mt-2 text-center">No upfront cost. Only paid when a deal closes.</p>
        </ReportSection>

        {/* CTA Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="glass-card p-6 text-center border-luxury-gold-500/20 print:hidden">
          <h2 className="text-base font-bold text-white mb-2 font-display">Want a personalized report for your portfolio?</h2>
          <p className="text-[10px] text-gray-400 mb-4">Our AI can analyze any location across 120+ cities and 25 countries.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/enterprise')} className="btn-primary">
              <FileText className="w-4 h-4" /> Request Custom Report
            </button>
            <button onClick={() => navigate('/book-demo')} className="btn-outline">
              <Sparkles className="w-4 h-4" /> Book a Demo
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-[8px] text-gray-700 print:text-gray-500 pb-8">
          <p>TerraNexus AI — Generated {report.generatedAt} · This report is AI-generated for informational purposes.</p>
          <p>Verify critical data points with local professionals before making investment decisions.</p>
        </div>
      </div>
    </div>
  );
}
