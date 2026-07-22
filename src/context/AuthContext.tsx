import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const DEMO_USER: User = {
  id: 'demo-001',
  email: 'builder@leadluxe.ai',
  full_name: 'Rajesh Mehta',
  role: 'developer',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('leadluxe_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  async function signIn(_email: string, _password: string): Promise<{ error?: string }> {
    // Auto-login with demo account
    const demoUser = { ...DEMO_USER, email: _email || DEMO_USER.email };
    setUser(demoUser);
    localStorage.setItem('leadluxe_user', JSON.stringify(demoUser));
    return {};
  }

  async function signUp(_email: string, _password: string, fullName: string): Promise<{ error?: string }> {
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: _email,
      full_name: fullName || 'New User',
      role: 'developer',
    };
    setUser(newUser);
    localStorage.setItem('leadluxe_user', JSON.stringify(newUser));
    return {};
  }

  async function signOut() {
    setUser(null);
    localStorage.removeItem('leadluxe_user');
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
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
