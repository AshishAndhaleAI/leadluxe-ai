// ============================================================
// LeadLuxe AI — Deal Room Onboarding Flow (Phase 9-10)
// Multi-step onboarding that captures investor profile, budget,
// funding, citizenship, purpose, and the Digital Introduction
// Agreement. Creates a DealPassport on completion.
// ============================================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  User, IndianRupee, Clock, CreditCard, Globe,
  Target, FileText, CheckCircle, ChevronRight,
  ChevronLeft, ArrowRight, Shield, Award,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  createDealPassport,
  acceptIntroductionAgreement,
  updateBuyerQualification,
  calculateCloseScore,
  updateDealPassport,
  type InvestorType,
  type FundingSource,
  type InvestmentPurpose,
} from './DealPassport';

interface Props {
  /** The property object passed from DealRoom */
  property: {
    id: string;
    name: string;
    developer_name: string;
    developer_website?: string | null;
    city: string;
    country: string;
    countryCode: string;
    price_min: number;
    price_max: number;
    estimated_commission: number;
    currency: string;
    currencySymbol: string;
  };
  /** Existing DealPassport ID if resuming */
  existingPassportId?: string;
  onComplete: (passportId: string) => void;
  onClose: () => void;
}

type StepId = 'investor_type' | 'budget' | 'timeline' | 'funding' | 'citizenship' | 'purpose' | 'agreement' | 'qualifying';

const INVESTOR_TYPES: { value: InvestorType; label: string; icon: string; description: string }[] = [
  { value: 'individual', label: 'Individual Investor', icon: '👤', description: 'Personal investment portfolio' },
  { value: 'family_office', label: 'Family Office', icon: '🏛️', description: 'Managing multi-generational wealth' },
  { value: 'fund', label: 'Institutional Fund', icon: '🏦', description: 'Real estate fund or REIT' },
  { value: 'developer', label: 'Developer', icon: '🏗️', description: 'Property development firm' },
  { value: 'broker', label: 'Broker', icon: '🤝', description: 'Independent or franchise broker' },
];

const BUDGET_RANGES: { min: number; max: number; label: string }[] = [
  { min: 5000000, max: 20000000, label: '₹50L – ₹2Cr' },
  { min: 20000000, max: 50000000, label: '₹2Cr – ₹5Cr' },
  { min: 50000000, max: 100000000, label: '₹5Cr – ₹10Cr' },
  { min: 100000000, max: 250000000, label: '₹10Cr – ₹25Cr' },
  { min: 250000000, max: 10000000000, label: '₹25Cr+' },
];

const TIMELINE_OPTIONS: { value: number; label: string }[] = [
  { value: 30, label: 'Within 30 days' },
  { value: 90, label: 'Within 90 days' },
  { value: 180, label: 'Within 6 months' },
  { value: 365, label: 'Within 12 months' },
];

const FUNDING_OPTIONS: { value: FundingSource; label: string; icon: string }[] = [
  { value: 'cash', label: 'Cash (Liquid)', icon: '💵' },
  { value: 'mortgage', label: 'Mortgage / Loan', icon: '🏦' },
  { value: 'fund_capital', label: 'Fund Capital', icon: '💰' },
  { value: 'structured_financing', label: 'Structured Financing', icon: '📊' },
];

const PURPOSE_OPTIONS: { value: InvestmentPurpose; label: string; icon: string; description: string }[] = [
  { value: 'rental_yield', label: 'Rental Yield', icon: '🏠', description: 'Generate recurring rental income' },
  { value: 'capital_appreciation', label: 'Capital Appreciation', icon: '📈', description: 'Long-term value growth' },
  { value: 'portfolio_diversification', label: 'Diversification', icon: '🎯', description: 'Cross-border asset allocation' },
  { value: 'residency_visa', label: 'Residency / Visa', icon: '🛂', description: 'Golden visa or residency program' },
  { value: 'development_partnership', label: 'Development Partnership', icon: '🤝', description: 'Co-development or JV opportunity' },
];

const STEPS: { id: StepId; label: string; icon: any }[] = [
  { id: 'investor_type', label: 'Profile', icon: User },
  { id: 'budget', label: 'Budget', icon: IndianRupee },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'funding', label: 'Funding', icon: CreditCard },
  { id: 'citizenship', label: 'Citizenship', icon: Globe },
  { id: 'purpose', label: 'Goal', icon: Target },
  { id: 'agreement', label: 'Agreement', icon: FileText },
  { id: 'qualifying', label: 'AI Score', icon: Award },
];

export function DealRoomOnboarding({ property, existingPassportId, onComplete, onClose }: Props) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [investorType, setInvestorType] = useState<InvestorType | null>(null);
  const [budgetRange, setBudgetRange] = useState<{ min: number; max: number } | null>(null);
  const [timeline, setTimeline] = useState<number | null>(null);
  const [fundingSource, setFundingSource] = useState<FundingSource | null>(null);
  const [citizenship, setCitizenship] = useState('');
  const [purpose, setPurpose] = useState<InvestmentPurpose | null>(null);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [passportId, setPassportId] = useState<string | null>(existingPassportId || null);

  const steps = STEPS;
  const currentStepId = steps[currentStep].id;
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  // Calculate progress
  const progress = ((currentStep + 1) / steps.length) * 100;

  const canProceed = (() => {
    switch (currentStepId) {
      case 'investor_type': return !!investorType;
      case 'budget': return !!budgetRange;
      case 'timeline': return !!timeline;
      case 'funding': return !!fundingSource;
      case 'citizenship': return citizenship.trim().length > 0;
      case 'purpose': return !!purpose;
      case 'agreement': return agreementAccepted;
      case 'qualifying': return true;
      default: return false;
    }
  })();

  const handleNext = useCallback(() => {
    if (isLast) {
      handleComplete();
    } else if (canProceed) {
      setCurrentStep(s => s + 1);
    }
  }, [isLast, canProceed]);

  const handleBack = useCallback(() => {
    if (!isFirst) setCurrentStep(s => s - 1);
  }, [isFirst]);

  const handleComplete = useCallback(() => {
    if (!user) return;

    // Create or update the DealPassport
    let passportIdToUse = passportId;

    if (!passportIdToUse) {
      const passport = createDealPassport({
        propertyId: property.id,
        propertyName: property.name,
        developerName: property.developer_name,
        developerWebsite: property.developer_website || null,
        city: property.city,
        country: property.country,
        countryCode: property.countryCode,
        priceMin: property.price_min,
        priceMax: property.price_max,
        estimatedCommission: property.estimated_commission,
        currency: property.currency,
        currencySymbol: property.currencySymbol,
        userId: user.id,
      });
      passportIdToUse = passport.id;
      setPassportId(passportIdToUse);
    }

    if (passportIdToUse) {
      // Update investor profile fields
      updateDealPassport(
        passportIdToUse,
        {
          investorType,
          budgetRange,
          investmentTimeline: timeline,
          fundingSource,
          citizenship: citizenship || null,
          investmentPurpose: purpose,
          stage: 'onboarding_complete',
        },
        'onboarding_completed',
        `Onboarding completed for ${property.name}`,
        user.id,
      );

      // Accept the introduction agreement
      acceptIntroductionAgreement(passportIdToUse, user.id);

      // Calculate and save AI close score
      const score = calculateCloseScore({
        budgetRange,
        timeline,
        fundingSource,
        investorType,
        propertyPriceMin: property.price_min,
        propertyPriceMax: property.price_max,
      });

      updateBuyerQualification(passportIdToUse, {
        aiCloseScore: score.closeScore,
        financingReadiness: score.financingReadiness,
        ticketSize: score.ticketSize,
        crossBorderEligible: score.crossBorderEligible,
        negotiationReadiness: score.negotiationReadiness,
        institutionalMatchProbability: score.institutionalMatchProbability,
      }, user.id);

      setCompleted(true);
      setTimeout(() => onComplete(passportIdToUse), 2000);
    }
  }, [user, property, passportId, investorType, budgetRange, timeline, fundingSource, citizenship, purpose, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gray-950 border border-gray-800"
      >
        {completed ? (
          /* ─── Success State ──────────────────────────── */
          <div className="text-center py-12 px-8">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-display">
              Deal Room Access Granted
            </h2>
            <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
              Your AI Investor Passport has been created for <strong className="text-luxury-gold-400">{property.name}</strong>.
              Your AI Deal Coach will guide you through the next steps.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
              <div className="glass-card p-3 text-center">
                <p className="text-lg font-bold text-luxury-gold-400">
                  {budgetRange ? `${property.currencySymbol}${(budgetRange.min / 100000).toFixed(0)}L` : '—'}
                </p>
                <p className="text-[9px] text-gray-500">Budget Range</p>
              </div>
              <div className="glass-card p-3 text-center">
                <p className="text-lg font-bold text-emerald-400">{timeline ? `${timeline}d` : '—'}</p>
                <p className="text-[9px] text-gray-500">Timeline</p>
              </div>
            </div>
            <button
              onClick={() => passportId && onComplete(passportId)}
              className="btn-primary"
            >
              Open Deal Room
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* ─── Header with Progress ───────────────── */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white font-display">
                    {currentStepId === 'qualifying' ? 'AI Qualification' : 'Complete Your Profile'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Step {currentStep + 1} of {steps.length} · {steps[currentStep].label}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Step indicators */}
              <div className="flex gap-1.5">
                {steps.map((step, i) => (
                  <div
                    key={step.id}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-all duration-500',
                      i <= currentStep ? 'bg-luxury-gold-500' : 'bg-gray-800'
                    )}
                  />
                ))}
              </div>

              {/* Step labels */}
              <div className="flex justify-between mt-2">
                {steps.map((step, i) => (
                  <span key={step.id} className={cn(
                    'text-[8px] font-mono uppercase tracking-wider transition-colors',
                    i === currentStep ? 'text-luxury-gold-400' : i < currentStep ? 'text-gray-500' : 'text-gray-700'
                  )}>
                    {step.label}
                  </span>
                ))}
              </div>
            </div>

            {/* ─── Step Content ───────────────────────── */}
            <div className="p-6 min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Step 1: Investor Type */}
                  {currentStepId === 'investor_type' && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">I am investing as a...</h3>
                      <p className="text-[10px] text-gray-500 mb-4">Select your investor profile. This helps us match you to the right opportunities.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {INVESTOR_TYPES.map(t => (
                          <button
                            key={t.value}
                            onClick={() => setInvestorType(t.value)}
                            className={cn(
                              'p-3 rounded-xl border text-left transition-all',
                              investorType === t.value
                                ? 'border-luxury-gold-500/40 bg-luxury-gold-500/10'
                                : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                            )}
                          >
                            <span className="text-lg mb-1 block">{t.icon}</span>
                            <p className="text-xs font-medium text-white">{t.label}</p>
                            <p className="text-[9px] text-gray-500 mt-0.5">{t.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Budget */}
                  {currentStepId === 'budget' && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">What is your budget range?</h3>
                      <p className="text-[10px] text-gray-500 mb-4">Select the range that best matches your investment capacity.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {BUDGET_RANGES.map(b => (
                          <button
                            key={b.label}
                            onClick={() => setBudgetRange({ min: b.min, max: b.max })}
                            className={cn(
                              'p-4 rounded-xl border text-center transition-all',
                              budgetRange?.min === b.min && budgetRange?.max === b.max
                                ? 'border-luxury-gold-500/40 bg-luxury-gold-500/10'
                                : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                            )}
                          >
                            <p className="text-sm font-bold text-white">{b.label}</p>
                            <p className="text-[9px] text-gray-500 mt-1">
                              {b.min >= 250000000 ? 'Premium tier' : 'Mid-market'}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Timeline */}
                  {currentStepId === 'timeline' && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">When do you plan to invest?</h3>
                      <p className="text-[10px] text-gray-500 mb-4">This helps us prioritize urgency and match you with available inventory.</p>
                      <div className="grid grid-cols-2 gap-2">
                        {TIMELINE_OPTIONS.map(t => (
                          <button
                            key={t.value}
                            onClick={() => setTimeline(t.value)}
                            className={cn(
                              'p-4 rounded-xl border text-center transition-all',
                              timeline === t.value
                                ? 'border-luxury-gold-500/40 bg-luxury-gold-500/10'
                                : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                            )}
                          >
                            <Clock className={cn('w-5 h-5 mx-auto mb-2', timeline === t.value ? 'text-luxury-gold-400' : 'text-gray-500')} />
                            <p className="text-sm font-bold text-white">{t.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Funding Source */}
                  {currentStepId === 'funding' && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">How will this investment be funded?</h3>
                      <p className="text-[10px] text-gray-500 mb-4">Select your primary funding mechanism.</p>
                      <div className="grid grid-cols-2 gap-2">
                        {FUNDING_OPTIONS.map(f => (
                          <button
                            key={f.value}
                            onClick={() => setFundingSource(f.value)}
                            className={cn(
                              'p-4 rounded-xl border text-center transition-all',
                              fundingSource === f.value
                                ? 'border-luxury-gold-500/40 bg-luxury-gold-500/10'
                                : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                            )}
                          >
                            <span className="text-2xl mb-2 block">{f.icon}</span>
                            <p className="text-xs font-medium text-white">{f.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Citizenship */}
                  {currentStepId === 'citizenship' && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">Country of citizenship / residency</h3>
                      <p className="text-[10px] text-gray-500 mb-4">Required for cross-border compliance and tax reporting.</p>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          value={citizenship}
                          onChange={e => setCitizenship(e.target.value)}
                          placeholder="e.g. India, United Arab Emirates, United Kingdom"
                          className="input-glass pl-10 text-sm w-full"
                          autoFocus
                        />
                      </div>
                      <p className="text-[9px] text-gray-600 mt-2">Your data is encrypted and never shared without your consent.</p>
                    </div>
                  )}

                  {/* Step 6: Investment Purpose */}
                  {currentStepId === 'purpose' && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">What is your primary investment goal?</h3>
                      <p className="text-[10px] text-gray-500 mb-4">Select the objective that best describes your strategy.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {PURPOSE_OPTIONS.map(p => (
                          <button
                            key={p.value}
                            onClick={() => setPurpose(p.value)}
                            className={cn(
                              'p-3 rounded-xl border text-left transition-all',
                              purpose === p.value
                                ? 'border-luxury-gold-500/40 bg-luxury-gold-500/10'
                                : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                            )}
                          >
                            <span className="text-lg mb-1 block">{p.icon}</span>
                            <p className="text-xs font-medium text-white">{p.label}</p>
                            <p className="text-[9px] text-gray-500 mt-0.5">{p.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 7: Digital Introduction Agreement */}
                  {currentStepId === 'agreement' && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-luxury-gold-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">Digital Introduction Agreement</h3>
                          <p className="text-[9px] text-gray-500">One-time agreement for deal protection</p>
                        </div>
                      </div>

                      <div className="glass-card p-4 mb-4 border-luxury-gold-500/20 text-[11px] leading-relaxed text-gray-300 space-y-3">
                        <p>
                          <strong className="text-white">LeadLuxe AI Introduction Agreement v1.0</strong>
                        </p>
                        <p>
                          This opportunity — <strong className="text-luxury-gold-400">{property.name}</strong> by {property.developer_name} — 
                          was sourced and presented to you through the LeadLuxe AI intelligence platform.
                        </p>
                        <p>
                          By accepting this agreement, you acknowledge that:
                        </p>
                        <ul className="list-disc pl-4 space-y-1 text-[10px] text-gray-400">
                          <li>This property was introduced to you by LeadLuxe AI</li>
                          <li>Any transaction with the identified developer or affiliated entity within 12 months is considered a LeadLuxe-originated introduction</li>
                          <li>A success fee of {property.estimated_commission ? '3% (estimated ' + property.currencySymbol : ''}{(property.estimated_commission / 100000).toFixed(1)}L{property.estimated_commission ? ')' : '3%'} applies upon deal closure</li>
                          <li>You may decline this introduction at any time before signing a purchase agreement</li>
                        </ul>
                        <p className="text-[9px] text-gray-600 mt-2">
                          This agreement protects the value of the AI-driven introduction and ensures LeadLuxe can continue providing free access to its intelligence platform.
                        </p>
                      </div>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreementAccepted}
                          onChange={e => setAgreementAccepted(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-900 text-luxury-gold-500 focus:ring-luxury-gold-500/30"
                        />
                        <span className="text-xs text-gray-400 leading-relaxed">
                          I confirm that this property was introduced to me by LeadLuxe AI and agree to the terms of the Digital Introduction Agreement outlined above.
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Step 8: AI Qualification */}
                  {currentStepId === 'qualifying' && (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 rounded-full bg-luxury-gold-500/20 flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-luxury-gold-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-2">AI Qualification Complete</h3>
                      <p className="text-[10px] text-gray-500 mb-6">Your profile has been analyzed. Here's your buyer qualification summary:</p>

                      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
                        <div className="glass-card p-3 text-center">
                          <p className="text-lg font-bold text-luxury-gold-400">
                            {calculateCloseScore({
                              budgetRange,
                              timeline,
                              fundingSource,
                              investorType,
                              propertyPriceMin: property.price_min,
                              propertyPriceMax: property.price_max,
                            }).closeScore}
                          </p>
                          <p className="text-[9px] text-gray-500">AI Close Score</p>
                        </div>
                        <div className="glass-card p-3 text-center">
                          <p className="text-lg font-bold text-emerald-400">
                            {calculateCloseScore({
                              budgetRange,
                              timeline,
                              fundingSource,
                              investorType,
                              propertyPriceMin: property.price_min,
                              propertyPriceMax: property.price_max,
                            }).financingReadiness}
                          </p>
                          <p className="text-[9px] text-gray-500">Financing Readiness</p>
                        </div>
                      </div>

                      <p className="text-[10px] text-gray-500">
                        Estimated commission: <span className="text-emerald-400 font-bold">{property.currencySymbol}{(property.estimated_commission / 100000).toFixed(1)}L</span>
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ─── Footer Navigation ─────────────────── */}
            <div className="p-6 border-t border-gray-800 flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={isFirst}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all',
                  isFirst ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white hover:bg-white/5'
                )}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>

              <div className="text-[9px] text-gray-600">
                {property.name}
              </div>

              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={cn(
                  'inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold transition-all',
                  canProceed
                    ? 'bg-luxury-gold-500 text-black hover:bg-luxury-gold-400'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                )}
              >
                {isLast ? 'Complete' : 'Continue'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
