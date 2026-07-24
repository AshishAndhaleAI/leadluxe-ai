import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Country, City } from '../lib/global-data';
import { trackSignUp, trackLogin } from '../lib/analytics';

interface UserPreferences {
  country: Country | null;
  countryCode: string;
  city: City | null;
  budgetRangeMin: number;
  budgetRangeMax: number;
  propertyType: string;
  investmentGoal: string;
  riskLevel: 'low' | 'medium' | 'high';
  holdingPeriod: number;
  rentalGoal: boolean;
  luxuryPreference: boolean;
  preferredInvestmentRadius: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  preferences: UserPreferences;
  onboardingComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  isAuthenticated: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  country: null,
  countryCode: 'IN',
  city: null,
  budgetRangeMin: 5000000,
  budgetRangeMax: 50000000,
  propertyType: 'apartment',
  investmentGoal: 'appreciation',
  riskLevel: 'medium',
  holdingPeriod: 5,
  rentalGoal: false,
  luxuryPreference: false,
  preferredInvestmentRadius: 'city',
};

const DEMO_USER: User = {
  id: 'demo-001',
  email: 'builder@terranexus.ai',
  full_name: 'Rajesh Mehta',
  role: 'developer',
  preferences: {
    ...DEFAULT_PREFERENCES,
    country: { id: 'in', code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', currencySymbol: '₹', languages: ['Hindi', 'English'], timezones: ['Asia/Kolkata'], active: true, opportunityCount: 0, signalCount: 0, totalDealValue: 0, marketTrend: 'rising', confidence: 92 },
    city: { id: 'in-pun', stateCode: 'MH', countryCode: 'IN', name: 'Pune', latitude: 18.5204, longitude: 73.8567, pricePerSqft: 12000, priceTrend: 12.3, activeProjects: 98, upcomingLaunches: 31, absorptionRate: 78, averageRoi: 15.8, foreignDemand: 42, investorInterest: 82, confidence: 89, tags: ['it-hub', 'affordable', 'luxury'] },
    budgetRangeMin: 8000000,
    budgetRangeMax: 60000000,
    propertyType: 'apartment',
    investmentGoal: 'appreciation',
    riskLevel: 'medium',
    holdingPeriod: 5,
    rentalGoal: true,
    luxuryPreference: true,
    preferredInvestmentRadius: 'city',
  },
  onboardingComplete: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('terranexus_user');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch {}
    }
    setLoading(false);
  }, []);

  async function signIn(_email: string, _password: string): Promise<{ error?: string }> {
    const demoUser = { 
      ...DEMO_USER, 
      email: _email || DEMO_USER.email,
      full_name: _email?.split('@')[0].replace(/[._]/g, ' ') || DEMO_USER.full_name,
    };
    setUser(demoUser);
    localStorage.setItem('terranexus_user', JSON.stringify(demoUser));
    trackLogin('email');
    return {};
  }

  async function signUp(_email: string, _password: string, fullName: string): Promise<{ error?: string }> {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: _email,
      full_name: fullName || 'New User',
      role: 'developer',
      preferences: { ...DEFAULT_PREFERENCES },
      onboardingComplete: false,
    };
    setUser(newUser);
    localStorage.setItem('terranexus_user', JSON.stringify(newUser));
    trackSignUp('email');
    return {};
  }

  async function signOut() {
    setUser(null);
    localStorage.removeItem('terranexus_user');
  }

  async function updatePreferences(prefs: Partial<UserPreferences>) {
    if (!user) return;
    const updated = {
      ...user,
      preferences: { ...user.preferences, ...prefs },
    };
    setUser(updated);
    localStorage.setItem('terranexus_user', JSON.stringify(updated));
  }

  async function completeOnboarding() {
    if (!user) return;
    const updated = { ...user, onboardingComplete: true };
    setUser(updated);
    localStorage.setItem('terranexus_user', JSON.stringify(updated));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updatePreferences,
        completeOnboarding,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
