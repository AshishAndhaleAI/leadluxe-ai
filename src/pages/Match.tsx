import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, IndianRupee, Building2, TrendingUp,
  Shield, Sparkles, ArrowRight, Clock, Globe, Bot,
  Target, Star, Zap, ChevronRight, Sliders, RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { formatIndianCurrency } from '../lib/format';
import { CITIES, COUNTRIES, getHotCities, getCitiesByCountry, formatGlobalCurrency } from '../lib/global-data';
import { useAuth } from '../context/AuthContext';
import type { City, InvestmentGoal, PropertyType } from '../lib/global-data';

const INVESTMENT_GOALS: { key: InvestmentGoal; label: string; icon: string; description: string }[] = [
  { key: 'appreciation', label: 'Capital Appreciation', icon: '📈', description: 'Long-term value growth' },
  { key: 'rental', label: 'Rental Income', icon: '🏠', description: 'Monthly passive income' },
  { key: 'commercial', label: 'Commercial', icon: '🏢', description: 'Office/retail investment' },
  { key: 'luxury', label: 'Luxury Living', icon: '💎', description: 'Premium properties' },
  { key: 'land_banking', label: 'Land Banking', icon: '🗺️', description: 'Land value appreciation' },
  { key: 'international', label: 'International', icon: '🌍', description: 'Global diversification' },
];

const RISK_LEVELS = [
  { key: 'low', label: 'Low Risk', description: 'Stable markets, steady returns', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' },
  { key: 'medium', label: 'Medium Risk', description: 'Balanced growth and stability', color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' },
  { key: 'high', label: 'High Risk', description: 'High growth potential, volatility', color: 'text-red-400 border-red-500/20 bg-red-500/10' },
];

const PROPERTY_TYPES: { key: PropertyType; label: string; icon: string }[] = [
  { key: 'apartment', label: 'Apartment', icon: '🏢' },
  { key: 'villa', label: 'Villa', icon: '🏡' },
  { key: 'penthouse', label: 'Penthouse', icon: '🏛️' },
  { key: 'commercial', label: 'Commercial', icon: '🏬' },
  { key: 'land', label: 'Land', icon: '🗺️' },
  { key: 'townhouse', label: 'Townhouse', icon: '🏘️' },
];

interface MatchResult {
  city: City;
  score: number;
  expectedRoi: number;
  expectedAppreciation: number;
  rentalYield: number;
  confidence: number;
  reasons: string[];
  commission: number;
}

function calculateMatch(city: City, budgetMin: number, budgetMax: number, goal: string, risk: string, propertyType: string, luxury: boolean): MatchResult {
  let score = 0;
  const reasons: string[] = [];

  // Budget fit
  const avgPrice = city.pricePerSqft * 1000;
  const budgetFit = avgPrice >= budgetMin && avgPrice <= budgetMax ? 20 : avgPrice < budgetMin ? 15 : 5;
  score += budgetFit;
  if (budgetFit >= 15) reasons.push(`Properties in ${city.name} fit your budget range`);

  // Investment goal alignment
  if (goal === 'appreciation' || goal === 'land_banking') {
    score += city.priceTrend * 1.5;
    if (city.priceTrend > 10) reasons.push(`Strong ${city.priceTrend}% price appreciation trend`);
  }
  if (goal === 'rental') {
    score += city.absorptionRate * 0.3;
    if (city.absorptionRate > 70) reasons.push(`High ${city.absorptionRate}% absorption rate — strong rental demand`);
  }
  if (goal === 'international') {
    score += city.foreignDemand * 0.3;
    if (city.foreignDemand > 60) reasons.push(`Strong foreign investor demand (${city.foreignDemand}%)`);
  }

  // Risk alignment
  if (risk === 'low' && city.priceTrend < 10) score += 10;
  if (risk === 'high' && city.priceTrend > 12) score += 15;
  if (risk === 'medium') score += 10;

  // Luxury preference
  if (luxury && city.tags.includes('luxury')) {
    score += 15;
    reasons.push(`${city.name} has a thriving luxury real estate market`);
  }

  // Market confidence
  score += city.confidence * 0.3;
  if (city.confidence > 85) reasons.push(`High market confidence score (${city.confidence}%)`);

  // Active projects indicator
  score += Math.min(city.activeProjects * 0.5, 15);
  if (city.activeProjects > 50) reasons.push(`Active market with ${city.activeProjects}+ ongoing projects`);

  // Clamp score
  score = Math.min(Math.max(score, 0), 100);

  const expectedRoi = city.averageRoi * (score / 100);
  const expectedAppreciation = city.priceTrend * (score / 100) * 1.2;
  const rentalYield = city.absorptionRate * 0.12;
  const commission = ((budgetMin + budgetMax) / 2) * 0.03;

  return {
    city, score: Math.round(score),
    expectedRoi: Math.round(expectedRoi * 10) / 10,
    expectedAppreciation: Math.round(expectedAppreciation * 10) / 10,
    rentalYield: Math.round(rentalYield * 10) / 10,
    confidence: Math.round(city.confidence * (score / 100)),
    reasons: reasons.slice(0, 4),
    commission,
  };
}

export function Match() {
  const navigate = useNavigate();
  const { user, updatePreferences, completeOnboarding } = useAuth();
  const prefs = user?.preferences;

  const [countryCode, setCountryCode] = useState(prefs?.countryCode || 'IN');
  const [budgetMin, setBudgetMin] = useState(prefs?.budgetRangeMin || 5000000);
  const [budgetMax, setBudgetMax] = useState(prefs?.budgetRangeMax || 50000000);
  const [goal, setGoal] = useState<InvestmentGoal>((prefs?.investmentGoal as InvestmentGoal) || 'appreciation');
  const [risk, setRisk] = useState(prefs?.riskLevel || 'medium');
  const [propertyType, setPropertyType] = useState<PropertyType>((prefs?.propertyType as PropertyType) || 'apartment');
  const [luxury, setLuxury] = useState(prefs?.luxuryPreference || false);
  const [holdingPeriod, setHoldingPeriod] = useState(prefs?.holdingPeriod || 5);
  const [showResults, setShowResults] = useState(false);

  const results = useMemo((): MatchResult[] => {
    const cities = countryCode ? getCitiesByCountry(countryCode) : Object.values(CITIES).flat();
    return cities
      .map(c => calculateMatch(c, budgetMin, budgetMax, goal, risk, propertyType, luxury))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [countryCode, budgetMin, budgetMax, goal, risk, propertyType, luxury]);

  // Skip results that are too low
  const filteredResults = results.filter(r => r.score >= 40);

  const handleSaveAndMatch = async () => {
    await updatePreferences({
      countryCode,
      budgetRangeMin: budgetMin,
      budgetRangeMax: budgetMax,
      investmentGoal: goal,
      riskLevel: risk as any,
      propertyType,
      luxuryPreference: luxury,
      holdingPeriod,
    });
    if (!user?.onboardingComplete) {
      await completeOnboarding();
    }
    setShowResults(true);
  };

  const country = COUNTRIES.find(c => c.code === countryCode);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-luxury-gold-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">AI Property Matchmaker</h2>
          <p className="text-sm text-gray-500">Find the best global properties ranked by expected ROI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Preferences Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="premium-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-luxury-gold-400" />
              Your Investment Profile
            </h3>

            {/* Country */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1.5 block">Target Country</label>
              <div className="flex flex-wrap gap-1.5">
                {COUNTRIES.filter(c => c.active).map(country => (
                  <button
                    key={country.code}
                    onClick={() => setCountryCode(country.code)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      countryCode === country.code
                        ? 'bg-luxury-gold-500/15 border-luxury-gold-500/30 text-luxury-gold-400'
                        : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700'
                    )}
                  >
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1.5 block">
                Budget Range: {formatIndianCurrency(budgetMin)} – {formatIndianCurrency(budgetMax)}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1000000"
                  max="100000000"
                  step="1000000"
                  value={budgetMin}
                  onChange={e => setBudgetMin(Number(e.target.value))}
                  className="flex-1 accent-luxury-gold-500"
                />
                <input
                  type="range"
                  min="1000000"
                  max="100000000"
                  step="1000000"
                  value={budgetMax}
                  onChange={e => setBudgetMax(Number(e.target.value))}
                  className="flex-1 accent-luxury-gold-500"
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                <span>₹10L</span>
                <span>₹1Cr</span>
                <span>₹5Cr</span>
                <span>₹10Cr</span>
              </div>
            </div>

            {/* Investment Goal */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1.5 block">Investment Goal</label>
              <div className="grid grid-cols-2 gap-1.5">
                {INVESTMENT_GOALS.map(g => (
                  <button
                    key={g.key}
                    onClick={() => setGoal(g.key)}
                    className={cn(
                      'text-left p-2 rounded-lg border text-xs transition-all',
                      goal === g.key
                        ? 'bg-luxury-gold-500/15 border-luxury-gold-500/30'
                        : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                    )}
                  >
                    <span className="text-base">{g.icon}</span>
                    <p className={cn('font-medium mt-0.5', goal === g.key ? 'text-luxury-gold-400' : 'text-gray-400')}>{g.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Level */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1.5 block">Risk Level</label>
              <div className="flex gap-1.5">
                {RISK_LEVELS.map(r => (
                  <button
                    key={r.key}
                    onClick={() => setRisk(r.key as any)}
                    className={cn(
                      'flex-1 p-2 rounded-lg border text-center text-xs transition-all',
                      risk === r.key ? r.color : 'bg-gray-900/50 border-gray-800 text-gray-500'
                    )}
                  >
                    <p className="font-medium">{r.label}</p>
                    <p className="text-[9px] mt-0.5 opacity-70">{r.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1.5 block">Property Type</label>
              <div className="flex flex-wrap gap-1.5">
                {PROPERTY_TYPES.map(pt => (
                  <button
                    key={pt.key}
                    onClick={() => setPropertyType(pt.key)}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      propertyType === pt.key
                        ? 'bg-luxury-gold-500/15 border-luxury-gold-500/30 text-luxury-gold-400'
                        : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700'
                    )}
                  >
                    <span>{pt.icon}</span>
                    <span>{pt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Luxury Toggle */}
            <div className="mb-4">
              <label className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-luxury-gold-400" />
                  <div>
                    <p className="text-xs font-medium text-white">Luxury Preference</p>
                    <p className="text-[9px] text-gray-500">Only show premium & ultra-luxury properties</p>
                  </div>
                </div>
                <div
                  onClick={() => setLuxury(!luxury)}
                  className={cn(
                    'w-9 h-5 rounded-full transition-colors relative cursor-pointer',
                    luxury ? 'bg-luxury-gold-500' : 'bg-gray-700'
                  )}
                >
                  <div className={cn(
                    'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                    luxury && 'translate-x-4'
                  )} />
                </div>
              </label>
            </div>

            {/* Holding Period */}
            <div className="mb-6">
              <label className="text-xs text-gray-400 mb-1.5 block">Holding Period: {holdingPeriod} years</label>
              <input
                type="range"
                min="1"
                max="20"
                value={holdingPeriod}
                onChange={e => setHoldingPeriod(Number(e.target.value))}
                className="w-full accent-luxury-gold-500"
              />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                <span>1 year</span>
                <span>10 years</span>
                <span>20 years</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleSaveAndMatch}
              className="btn-primary w-full group"
            >
              <Sparkles className="w-4 h-4" />
              Find My Best Properties
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {user?.onboardingComplete && (
              <p className="text-[10px] text-gray-600 text-center mt-2">
                Profile saved. Results refresh automatically.
              </p>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-4">
          {!showResults ? (
            <div className="premium-card p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-luxury-gold-500/20 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-10 h-10 text-luxury-gold-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display">
                Discover Your Perfect Property
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Set your preferences on the left, and our AI will search across global markets to find the best properties ranked by expected ROI, appreciation potential, and market confidence.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                {[
                  { icon: '🎯', label: 'Personalized' },
                  { icon: '🌍', label: 'Global Search' },
                  { icon: '📊', label: 'AI Ranked' },
                ].map((item, i) => (
                  <div key={i} className="glass-card p-3 text-center">
                    <span className="text-2xl block mb-1">{item.icon}</span>
                    <p className="text-xs text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="premium-card p-12 text-center">
              <Search className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">No Matching Properties Found</h3>
              <p className="text-sm text-gray-500 mb-4">Try adjusting your budget, risk level, or target country.</p>
              <button onClick={() => setShowResults(false)} className="btn-outline">
                <RefreshCw className="w-4 h-4" />
                Adjust Preferences
              </button>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="premium-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {filteredResults.length} Matches Found
                  </p>
                  <p className="text-xs text-gray-500">
                    {country?.flag} {country?.name} · {goal.replace('_', ' ')} · {risk} risk
                  </p>
                </div>
                <button onClick={() => setShowResults(false)} className="btn-ghost text-xs">
                  <RefreshCw className="w-3 h-3" />
                  Refine
                </button>
              </div>

              {/* Results */}
              <AnimatePresence>
                {filteredResults.map((result, i) => (
                  <motion.div
                    key={result.city.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="premium-card p-5 relative overflow-hidden group cursor-pointer"
                    onClick={() => navigate(`/opportunities?city=${result.city.id}`)}
                  >
                    {/* Rank badge */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-luxury-gold-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-luxury-gold-400">#{i + 1}</span>
                    </div>

                    <div className="flex items-start gap-4">
                      {/* Score Circle */}
                      <div className="relative flex-shrink-0">
                        <svg width="64" height="64" className="transform -rotate-90">
                          <circle cx="32" cy="32" r="27" fill="none" stroke="#1a1a1a" strokeWidth="4" />
                          <circle
                            cx="32" cy="32" r="27" fill="none"
                            stroke={result.score >= 80 ? '#22c55e' : result.score >= 60 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="4"
                            strokeDasharray={2 * Math.PI * 27}
                            strokeDashoffset={2 * Math.PI * 27 * (1 - result.score / 100)}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{result.score}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">{result.city.name}</span>
                          <span className="text-[10px] text-gray-500">{result.city.stateCode}, {country?.flag}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                          {[
                            { label: 'Expected ROI', value: `${result.expectedRoi}%`, color: 'text-emerald-400' },
                            { label: 'Appreciation', value: `${result.expectedAppreciation}%`, color: 'text-amber-400' },
                            { label: 'Rental Yield', value: `${result.rentalYield}%`, color: 'text-blue-400' },
                            { label: 'Confidence', value: `${result.confidence}%`, color: 'text-luxury-gold-400' },
                          ].map((metric, j) => (
                            <div key={j} className="glass-card p-2 text-center">
                              <p className="text-xs font-bold text-white">{metric.value}</p>
                              <p className="text-[9px] text-gray-500">{metric.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Reasons */}
                        <div className="flex flex-wrap gap-1.5">
                          {result.reasons.map((reason, j) => (
                            <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-luxury-gold-500/10 text-luxury-gold-400 border border-luxury-gold-500/20">
                              {reason}
                            </span>
                          ))}
                        </div>

                        {/* Commission */}
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            ₹{result.city.pricePerSqft.toLocaleString()}/sqft · {result.city.priceTrend > 0 ? '+' : ''}{result.city.priceTrend}% trend
                          </span>
                          <span className="text-emerald-400 font-medium">
                            Est. Commission: {formatIndianCurrency(result.commission)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-luxury-gold-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View opportunities in {result.city.name}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* AI Summary */}
              <div className="glass-card p-4 border border-luxury-gold-500/10">
                <div className="flex items-start gap-3">
                  <Bot className="w-5 h-5 text-luxury-gold-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-white mb-1">AI Recommendation</p>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      Based on your profile — {country?.name}, {goal.replace('_', ' ')} goal, {risk} risk, {formatIndianCurrency(budgetMin)}–{formatIndianCurrency(budgetMax)} budget — 
                      <strong className="text-luxury-gold-400"> {filteredResults[0]?.city.name}</strong> is your top match with a {filteredResults[0]?.score}% compatibility score.
                      {filteredResults[0]?.city.tags.includes('luxury') ? ' The luxury segment in this market shows strong foreign demand.' : ''}
                      {filteredResults[0]?.expectedAppreciation > 12 ? ' Expected appreciation exceeds market average.' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
