import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Mail, Lock, User, Eye, EyeOff,
  ArrowRight, CheckCircle, Sparkles, Globe,
  MapPin, IndianRupee, ChevronRight, ChevronLeft,
  Home, Star, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { COUNTRIES, CITIES, getCitiesByCountry } from '../lib/global-data';
import type { Country, City } from '../lib/global-data';

type OnboardingStep = 'auth' | 'location' | 'preferences' | 'complete';

const INVESTMENT_GOALS = [
  { key: 'rental', label: 'Rental Income', icon: '🏠' },
  { key: 'appreciation', label: 'Capital Appreciation', icon: '📈' },
  { key: 'commercial', label: 'Commercial', icon: '🏢' },
  { key: 'luxury', label: 'Luxury Living', icon: '💎' },
  { key: 'land_banking', label: 'Land Banking', icon: '🗺️' },
  { key: 'international', label: 'International', icon: '🌍' },
];

const PROPERTY_TYPES = [
  { key: 'apartment', label: 'Apartment', icon: '🏢' },
  { key: 'villa', label: 'Villa', icon: '🏡' },
  { key: 'penthouse', label: 'Penthouse', icon: '🏛️' },
  { key: 'commercial', label: 'Commercial', icon: '🏬' },
  { key: 'land', label: 'Land', icon: '🗺️' },
  { key: 'townhouse', label: 'Townhouse', icon: '🏘️' },
];

const RISK_LEVELS = [
  { key: 'low', label: 'Low Risk', emoji: '🛡️' },
  { key: 'medium', label: 'Medium Risk', emoji: '⚖️' },
  { key: 'high', label: 'High Risk', emoji: '🚀' },
];

export function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, updatePreferences, completeOnboarding } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<OnboardingStep>('auth');

  // Onboarding fields
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [budgetMin, setBudgetMin] = useState(5000000);
  const [budgetMax, setBudgetMax] = useState(50000000);
  const [investmentGoal, setInvestmentGoal] = useState('appreciation');
  const [propertyType, setPropertyType] = useState('apartment');
  const [riskLevel, setRiskLevel] = useState('medium');

  const availableCities = selectedCountry ? getCitiesByCountry(selectedCountry.code) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        const result = await signUp(email, password, fullName);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        setStep('location');
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleOnboardingLocation = async () => {
    if (!selectedCountry || !selectedCity) {
      setError('Please select your country and city');
      return;
    }
    setError('');
    await updatePreferences({
      countryCode: selectedCountry.code,
      country: selectedCountry as any,
      city: selectedCity as any,
    });
    setStep('preferences');
  };

  const handleOnboardingPreferences = async () => {
    await updatePreferences({
      budgetRangeMin: budgetMin,
      budgetRangeMax: budgetMax,
      investmentGoal: investmentGoal as any,
      propertyType: propertyType as any,
      riskLevel: riskLevel as any,
    });
    await completeOnboarding();
    setStep('complete');
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-luxury-gold-400" />
            </div>
            <div className="text-left">
              <span className="text-xl font-bold text-white">LeadLuxe</span>
              <span className="text-xl font-bold text-luxury-gold-400"> AI</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Auth */}
          {step === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="premium-card p-8"
            >
              <h2 className="text-xl font-bold text-white mb-1 font-display">
                {isSignup ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {isSignup ? 'Set up your personalized intelligence profile' : 'Sign in to your intelligence dashboard'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="input-glass pl-10"
                        placeholder="Rajesh Mehta"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-glass pl-10"
                      placeholder="builder@company.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input-glass pl-10 pr-10"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{error}</motion.p>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Processing...</span>
                  ) : isSignup ? (
                    <span className="flex items-center gap-2">Create Account <Sparkles className="w-4 h-4" /></span>
                  ) : (
                    <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => { setIsSignup(!isSignup); setError(''); }}
                  className="text-sm text-gray-500 hover:text-luxury-gold-400 transition-colors"
                >
                  {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Create One"}
                </button>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={async () => {
                    setLoading(true);
                    await signIn('builder@leadluxe.ai', 'demo');
                    navigate('/dashboard');
                  }}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  Quick Demo Access
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Location */}
          {step === 'location' && (
            <motion.div
              key="location"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="premium-card p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-luxury-gold-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-display">Where Are You Investing?</h2>
                  <p className="text-xs text-gray-500">Set your target market for personalized intelligence</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Country */}
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-medium">Target Country</label>
                  <div className="grid grid-cols-2 gap-2">
                    {COUNTRIES.filter(c => c.active).map(country => (
                      <button
                        key={country.code}
                        onClick={() => { setSelectedCountry(country); setSelectedCity(null); }}
                        className={cn(
                          'flex items-center gap-2 p-3 rounded-lg border text-left transition-all',
                          selectedCountry?.code === country.code
                            ? 'bg-luxury-gold-500/15 border-luxury-gold-500/30'
                            : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                        )}
                      >
                        <span className="text-xl">{country.flag}</span>
                        <div>
                          <p className={cn('text-sm font-medium', selectedCountry?.code === country.code ? 'text-luxury-gold-400' : 'text-white')}>{country.name}</p>
                          <p className="text-[10px] text-gray-500">{country.currency}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* City */}
                {selectedCountry && (
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block font-medium">Select City</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {availableCities.map(city => (
                        <button
                          key={city.id}
                          onClick={() => setSelectedCity(city)}
                          className={cn(
                            'flex items-center gap-2 p-2.5 rounded-lg border transition-all',
                            selectedCity?.id === city.id
                              ? 'bg-luxury-gold-500/15 border-luxury-gold-500/30'
                              : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                          )}
                        >
                          <MapPin className={cn('w-4 h-4', selectedCity?.id === city.id ? 'text-luxury-gold-400' : 'text-gray-500')} />
                          <div>
                            <p className={cn('text-xs font-medium', selectedCity?.id === city.id ? 'text-luxury-gold-400' : 'text-white')}>{city.name}</p>
                            <p className="text-[9px] text-gray-500">{city.activeProjects} projects</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* City Details Preview */}
                {selectedCity && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-3 border border-luxury-gold-500/10"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Avg price/sqft</span>
                      <span className="text-white font-medium">₹{selectedCity.pricePerSqft.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-gray-400">Price trend</span>
                      <span className="text-emerald-400 font-medium">+{selectedCity.priceTrend}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-gray-400">Active projects</span>
                      <span className="text-white font-medium">{selectedCity.activeProjects}</span>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{error}</p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button onClick={() => setStep('auth')} className="btn-ghost flex-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleOnboardingLocation}
                    disabled={!selectedCountry || !selectedCity}
                    className="btn-primary flex-1"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Preferences */}
          {step === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="premium-card p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
                  <Star className="w-5 h-5 text-luxury-gold-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-display">Your Investment Profile</h2>
                  <p className="text-xs text-gray-500">Personalize your AI intelligence engine</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Budget Range */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">
                    Budget Range: ₹{Math.round(budgetMin / 100000)}L – ₹{Math.round(budgetMax / 100000)}L
                  </label>
                  <div className="flex items-center gap-3">
                    <IndianRupee className="w-4 h-4 text-gray-500 shrink-0" />
                    <input
                      type="range"
                      min="1000000"
                      max="100000000"
                      step="1000000"
                      value={budgetMin}
                      onChange={e => setBudgetMin(Number(e.target.value))}
                      className="flex-1 accent-luxury-gold-500"
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <IndianRupee className="w-4 h-4 text-gray-500 shrink-0" />
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
                  <div className="flex justify-between text-[9px] text-gray-600 mt-1 px-6">
                    <span>₹10L</span>
                    <span>₹50L</span>
                    <span>₹1Cr</span>
                    <span>₹5Cr</span>
                    <span>₹10Cr</span>
                  </div>
                </div>

                {/* Investment Goal */}
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-medium">Investment Goal</label>
                  <div className="grid grid-cols-3 gap-2">
                    {INVESTMENT_GOALS.map(g => (
                      <button
                        key={g.key}
                        onClick={() => setInvestmentGoal(g.key)}
                        className={cn(
                          'p-2.5 rounded-lg border text-center transition-all',
                          investmentGoal === g.key
                            ? 'bg-luxury-gold-500/15 border-luxury-gold-500/30'
                            : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                        )}
                      >
                        <span className="text-lg block mb-1">{g.icon}</span>
                        <p className={cn('text-[10px] font-medium', investmentGoal === g.key ? 'text-luxury-gold-400' : 'text-gray-400')}>{g.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-medium">Preferred Property Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PROPERTY_TYPES.map(pt => (
                      <button
                        key={pt.key}
                        onClick={() => setPropertyType(pt.key)}
                        className={cn(
                          'p-2.5 rounded-lg border text-center transition-all',
                          propertyType === pt.key
                            ? 'bg-luxury-gold-500/15 border-luxury-gold-500/30'
                            : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                        )}
                      >
                        <span className="text-lg block mb-1">{pt.icon}</span>
                        <p className={cn('text-[10px] font-medium', propertyType === pt.key ? 'text-luxury-gold-400' : 'text-gray-400')}>{pt.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-medium">Risk Tolerance</label>
                  <div className="flex gap-2">
                    {RISK_LEVELS.map(rl => (
                      <button
                        key={rl.key}
                        onClick={() => setRiskLevel(rl.key)}
                        className={cn(
                          'flex-1 p-3 rounded-lg border text-center transition-all',
                          riskLevel === rl.key
                            ? 'bg-luxury-gold-500/15 border-luxury-gold-500/30'
                            : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                        )}
                      >
                        <span className="text-lg block mb-1">{rl.emoji}</span>
                        <p className={cn('text-xs font-medium', riskLevel === rl.key ? 'text-luxury-gold-400' : 'text-gray-400')}>{rl.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{error}</p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button onClick={() => setStep('location')} className="btn-ghost flex-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={handleOnboardingPreferences} className="btn-primary flex-1">
                    Complete Setup <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="premium-card p-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 font-display">Profile Complete! 🎉</h2>
              <p className="text-sm text-gray-500 mb-2">
                Your AI intelligence engine is now personalized for{' '}
                <strong className="text-luxury-gold-400">{selectedCity?.name}, {selectedCountry?.flag}</strong>
              </p>
              <p className="text-xs text-gray-600 mb-6">
                The AI will automatically find opportunities matching your budget and goals.
              </p>
              <div className="w-10 h-10 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 mt-3">Redirecting to your dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
