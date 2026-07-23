// ============================================================
// LeadLuxe AI — Investor Twin Onboarding Wizard
// 
// Multi-step creation flow:
//   1. Select Country
//   2. Select City
//   3. Select Budget
//   4. Select Goal
//   5. Select Risk
//   6. Select Timeline
//   7. AI Twin Created (confirmation)
// ============================================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, MapPin, DollarSign, Target, Shield,
  Clock, Sparkles, ChevronLeft, ChevronRight,
  Brain, Check, Building2, TrendingUp, Activity
} from 'lucide-react';
import { COUNTRIES, CITIES, type Country, type City } from '../../lib/global-data';
import type { InvestorProfile } from '../../lib/twin/twinEngine';
import { formatIndianCurrency } from '../../lib/format';
import { cn } from '../../lib/utils';

// ============================================================
// PROPS
// ============================================================
interface OnboardingWizardProps {
  onComplete: (profile: InvestorProfile) => Promise<void>;
  onSkip: () => void;
}

// ============================================================
// BUDGET RANGES
// ============================================================
const BUDGET_RANGES = [
  { min: 1000000, max: 5000000, label: '₹10L – ₹50L' },
  { min: 5000000, max: 15000000, label: '₹50L – ₹1.5Cr' },
  { min: 15000000, max: 50000000, label: '₹1.5Cr – ₹5Cr' },
  { min: 50000000, max: 100000000, label: '₹5Cr – ₹10Cr' },
  { min: 100000000, max: 250000000, label: '₹10Cr – ₹25Cr' },
  { min: 250000000, max: 1000000000, label: '₹25Cr+', isPlus: true },
];

// ============================================================
// GOALS
// ============================================================
const GOALS = [
  { value: 'rental' as const, label: 'Rental Income', icon: '🏠', desc: 'Steady monthly cash flow from tenants' },
  { value: 'appreciation' as const, label: 'Capital Appreciation', icon: '📈', desc: 'Long-term value growth' },
  { value: 'commercial' as const, label: 'Commercial', icon: '🏢', desc: 'Office, retail, or industrial assets' },
  { value: 'luxury' as const, label: 'Luxury Living', icon: '✨', desc: 'Premium high-end properties' },
  { value: 'land_banking' as const, label: 'Land Banking', icon: '🌄', desc: 'Land acquisition for future development' },
  { value: 'international' as const, label: 'International', icon: '🌍', desc: 'Cross-border investment' },
];

// ============================================================
// RISK LEVELS
// ============================================================
const RISK_LEVELS = [
  { value: 'low' as const, label: 'Low Risk', icon: '🛡️', desc: 'Stable markets, established developers, proven assets' },
  { value: 'medium' as const, label: 'Medium Risk', icon: '⚖️', desc: 'Balanced portfolio with growth potential' },
  { value: 'high' as const, label: 'High Risk', icon: '🚀', desc: 'Emerging markets, new developments, maximum upside' },
];

// ============================================================
// HOLDING PERIODS
// ============================================================
const HOLDING_PERIODS = [
  { years: 1, label: '1 year', desc: 'Short-term flip' },
  { years: 3, label: '3 years', desc: 'Medium-term' },
  { years: 5, label: '5 years', desc: 'Standard hold' },
  { years: 7, label: '7 years', desc: 'Long-term growth' },
  { years: 10, label: '10+ years', desc: 'Generational wealth' },
];

// ============================================================
// STEP CONFIGURATION
// ============================================================
const STEPS = ['Country', 'City', 'Budget', 'Goal', 'Risk', 'Timeline', 'Ready'];

// ============================================================
// WIZARD COMPONENT
// ============================================================
export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<number | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [selectedHolding, setSelectedHolding] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingProgress, setCreatingProgress] = useState(0);

  // Available cities for selected country
  const availableCities = useMemo(() => {
    if (!selectedCountry) return [];
    return CITIES[selectedCountry] || [];
  }, [selectedCountry]);

  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return !!selectedCountry;
      case 1: return !!selectedCity;
      case 2: return selectedBudget !== null;
      case 3: return !!selectedGoal;
      case 4: return !!selectedRisk;
      case 5: return selectedHolding !== null;
      case 6: return true;
      default: return false;
    }
  }, [step, selectedCountry, selectedCity, selectedBudget, selectedGoal, selectedRisk, selectedHolding]);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => Math.max(s - 1, 0));
    }
  };

  const handleCreate = async () => {
    if (!selectedCountry || !selectedCity || selectedBudget === null || !selectedGoal || !selectedRisk || !selectedHolding) return;

    setIsCreating(true);
    setCreatingProgress(0);

    // Animate progress
    const interval = setInterval(() => {
      setCreatingProgress((p) => Math.min(p + 10, 90));
    }, 200);

    try {
      const budgetRange = BUDGET_RANGES[selectedBudget];
      const profile: InvestorProfile = {
        userId: '',
        country: selectedCountry,
        city: selectedCity,
        budgetMin: budgetRange.min,
        budgetMax: budgetRange.max,
        currency: 'INR',
        riskTolerance: selectedRisk as InvestorProfile['riskTolerance'],
        investmentGoal: selectedGoal as InvestorProfile['investmentGoal'],
        holdingPeriodYears: selectedHolding,
        preferredAssetClasses: ['apartment'],
        liquidityPreference: 'moderate',
      };

      setCreatingProgress(100);
      clearInterval(interval);
      await new Promise((r) => setTimeout(r, 500));
      await onComplete(profile);
    } catch {
      setIsCreating(false);
      clearInterval(interval);
    }
  };

  const country = COUNTRIES.find((c) => c.code === selectedCountry);
  const city = availableCities.find((c) => c.id === selectedCity);

  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 sm:p-8 backdrop-blur-xl bg-luxury-black/60 border border-luxury-gold-500/20"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-luxury-gold-500/20 to-luxury-gold-500/5 border border-luxury-gold-500/20 flex items-center justify-center mx-auto mb-3">
            {isCreating ? (
              <Activity className="w-7 h-7 text-luxury-gold-400 animate-pulse" />
            ) : (
              <Brain className="w-7 h-7 text-luxury-gold-400" />
            )}
          </div>
          <h2 className="text-lg font-bold text-white font-display">
            {isCreating ? 'Creating Your AI Investor Twin...' : 'Create Your AI Investor Twin'}
          </h2>
          <p className="text-[10px] text-gray-500 mt-1">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-1 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-0.5 flex-1 rounded-full transition-all duration-500',
                i <= step ? 'bg-luxury-gold-400' : 'bg-gray-800'
              )}
            />
          ))}
        </div>

        {/* Creating Progress */}
        {isCreating ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-20 h-20 rounded-full border-2 border-luxury-gold-500 border-t-transparent animate-spin mx-auto" />
            <div className="max-w-xs mx-auto">
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-luxury-gold-400 to-luxury-gold-300 rounded-full transition-all duration-300"
                  style={{ width: `${creatingProgress}%` }}
                />
              </div>
              <p className="text-[9px] text-gray-500 mt-3">
                {creatingProgress < 30 ? 'Analyzing your preferences...' :
                 creatingProgress < 60 ? 'Scanning global property markets...' :
                 creatingProgress < 90 ? 'Generating personalized matches...' :
                 'Your AI Twin is ready!'}
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-[320px]"
            >
              {/* Step 0: Country */}
              {step === 0 && (
                <div>
                  <p className="text-[10px] text-gray-500 mb-3">Where do you want to invest?</p>
                  <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                    {COUNTRIES.filter((c) => c.active).map((country) => (
                      <button
                        key={country.code}
                        onClick={() => setSelectedCountry(country.code)}
                        className={cn(
                          'p-3 rounded-lg border text-left transition-all',
                          selectedCountry === country.code
                            ? 'border-luxury-gold-400 bg-luxury-gold-500/10'
                            : 'border-gray-800 bg-luxury-black/60 hover:border-gray-700'
                        )}
                      >
                        <span className="text-lg">{country.flag}</span>
                        <p className="text-xs font-medium text-white mt-1">{country.name}</p>
                        <p className="text-[8px] text-gray-600">{country.currency}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: City */}
              {step === 1 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{country?.flag}</span>
                    <p className="text-xs text-gray-400">Cities in {country?.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                    {availableCities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => setSelectedCity(city.id)}
                        className={cn(
                          'p-3 rounded-lg border text-left transition-all',
                          selectedCity === city.id
                            ? 'border-luxury-gold-400 bg-luxury-gold-500/10'
                            : 'border-gray-800 bg-luxury-black/60 hover:border-gray-700'
                        )}
                      >
                        <MapPin className={cn('w-4 h-4 mb-1', selectedCity === city.id ? 'text-luxury-gold-400' : 'text-gray-600')} />
                        <p className="text-xs font-medium text-white">{city.name}</p>
                        <p className="text-[8px] text-gray-600">{city.activeProjects} active projects</p>
                        <p className="text-[8px] text-emerald-400">+{city.priceTrend}% trend</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Budget */}
              {step === 2 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-luxury-gold-400" />
                    <p className="text-xs text-gray-400">
                      Your budget for {city?.name || 'your city'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {BUDGET_RANGES.map((range, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedBudget(i)}
                        className={cn(
                          'w-full p-3 rounded-lg border text-left transition-all',
                          selectedBudget === i
                            ? 'border-luxury-gold-400 bg-luxury-gold-500/10'
                            : 'border-gray-800 bg-luxury-black/60 hover:border-gray-700'
                        )}
                      >
                        <p className="text-sm font-medium text-white">{range.label}</p>
                        <p className="text-[9px] text-gray-600 mt-0.5">
                          {range.isPlus ? 'Premium luxury segment' : 'Mid-range to premium'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Goal */}
              {step === 3 && (
                <div>
                  <p className="text-[10px] text-gray-500 mb-3">What's your primary investment goal?</p>
                  <div className="space-y-2">
                    {GOALS.map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => setSelectedGoal(goal.value)}
                        className={cn(
                          'w-full p-3 rounded-lg border text-left transition-all',
                          selectedGoal === goal.value
                            ? 'border-luxury-gold-400 bg-luxury-gold-500/10'
                            : 'border-gray-800 bg-luxury-black/60 hover:border-gray-700'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{goal.icon}</span>
                          <div>
                            <p className="text-xs font-medium text-white">{goal.label}</p>
                            <p className="text-[8px] text-gray-600">{goal.desc}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Risk */}
              {step === 4 && (
                <div>
                  <p className="text-[10px] text-gray-500 mb-3">What's your risk appetite?</p>
                  <div className="space-y-2">
                    {RISK_LEVELS.map((risk) => (
                      <button
                        key={risk.value}
                        onClick={() => setSelectedRisk(risk.value)}
                        className={cn(
                          'w-full p-3 rounded-lg border text-left transition-all',
                          selectedRisk === risk.value
                            ? 'border-luxury-gold-400 bg-luxury-gold-500/10'
                            : 'border-gray-800 bg-luxury-black/60 hover:border-gray-700'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{risk.icon}</span>
                          <div>
                            <p className="text-xs font-medium text-white">{risk.label}</p>
                            <p className="text-[8px] text-gray-600">{risk.desc}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Timeline */}
              {step === 5 && (
                <div>
                  <p className="text-[10px] text-gray-500 mb-3">How long do you plan to hold?</p>
                  <div className="space-y-2">
                    {HOLDING_PERIODS.map((period) => (
                      <button
                        key={period.years}
                        onClick={() => setSelectedHolding(period.years)}
                        className={cn(
                          'w-full p-3 rounded-lg border text-left transition-all',
                          selectedHolding === period.years
                            ? 'border-luxury-gold-400 bg-luxury-gold-500/10'
                            : 'border-gray-800 bg-luxury-black/60 hover:border-gray-700'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className={cn('w-4 h-4', selectedHolding === period.years ? 'text-luxury-gold-400' : 'text-gray-600')} />
                          <div>
                            <p className="text-xs font-medium text-white">{period.label}</p>
                            <p className="text-[8px] text-gray-600">{period.desc}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Ready */}
              {step === 6 && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-luxury-gold-500/20 to-emerald-500/10 border border-luxury-gold-500/30 flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-luxury-gold-400" />
                  </div>
                  <h3 className="text-base font-bold text-white font-display mb-2">Ready to Create Your Twin</h3>
                  
                  <div className="glass-card p-3 text-left space-y-1.5 mb-4 bg-luxury-black/40 border border-luxury-gold-500/10">
                    <div className="flex items-center gap-2 text-[9px]">
                      <Globe className="w-3 h-3 text-luxury-gold-400" />
                      <span className="text-gray-400">Country:</span>
                      <span className="text-white">{country?.flag} {country?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px]">
                      <MapPin className="w-3 h-3 text-luxury-gold-400" />
                      <span className="text-gray-400">City:</span>
                      <span className="text-white">{city?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px]">
                      <DollarSign className="w-3 h-3 text-luxury-gold-400" />
                      <span className="text-gray-400">Budget:</span>
                      <span className="text-white">{BUDGET_RANGES[selectedBudget!]?.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px]">
                      <Target className="w-3 h-3 text-luxury-gold-400" />
                      <span className="text-gray-400">Goal:</span>
                      <span className="text-white capitalize">{selectedGoal}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px]">
                      <Shield className="w-3 h-3 text-luxury-gold-400" />
                      <span className="text-gray-400">Risk:</span>
                      <span className="text-white capitalize">{selectedRisk}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px]">
                      <Clock className="w-3 h-3 text-luxury-gold-400" />
                      <span className="text-gray-400">Holding Period:</span>
                      <span className="text-white">{selectedHolding} years</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-500">
                    Your AI Twin will scan global markets 24/7 and deliver personalized opportunities matching these preferences.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Navigation */}
        {!isCreating && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
            <button
              onClick={step === 0 ? onSkip : handleBack}
              className="text-[10px] px-3 py-1.5 rounded-lg text-gray-500 hover:text-white transition-colors flex items-center gap-1"
            >
              {step === 0 ? 'Skip' : <><ChevronLeft className="w-3 h-3" /> Back</>}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={cn(
                  'text-[10px] px-4 py-1.5 rounded-lg flex items-center gap-1 transition-all',
                  canProceed
                    ? 'bg-luxury-gold-500/20 border border-luxury-gold-500/30 text-luxury-gold-400 hover:bg-luxury-gold-500/30'
                    : 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed'
                )}
              >
                Next <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                className="text-[10px] px-4 py-1.5 rounded-lg bg-luxury-gold-500/20 border border-luxury-gold-500/30 text-luxury-gold-400 hover:bg-luxury-gold-500/30 transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Create My Twin
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
