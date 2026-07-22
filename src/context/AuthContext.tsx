import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string; user?: User }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Small delay to let the DB trigger finish creating the user row
        setTimeout(() => fetchUser(session.user.id), 500);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUser(userId: string): Promise<User | null> {
    try {
      // Try to fetch from public.users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        const u = data as User;
        setUser(u);
        setLoading(false);
        return u;
      }

      // If the table doesn't exist, try to create the row from auth user metadata
      if (error?.message?.includes('does not exist')) {
        // The users table might not exist yet — try to create
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser?.user) {
          const newUser: User = {
            id: authUser.user.id,
            email: authUser.user.email || '',
            full_name: authUser.user.user_metadata?.full_name || '',
            role: 'admin',
            created_at: authUser.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Attempt to insert — if the table doesn't exist this fails silently
          const { error: insertError } = await supabase
            .from('users')
            .insert(newUser);

          if (!insertError) {
            setUser(newUser);
            setLoading(false);
            return newUser;
          }
        }
      }

      // Fallback: set user from auth data directly (no public.users row needed)
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const fallbackUser: User = {
          id: authData.user.id,
          email: authData.user.email || '',
          full_name: authData.user.user_metadata?.full_name || '',
          role: 'admin',
          created_at: authData.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(fallbackUser);
        setLoading(false);
        return fallbackUser;
      }

      setLoading(false);
      return null;
    } catch {
      // Network error or similar — try auth fallback
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const fallbackUser: User = {
          id: authData.user.id,
          email: authData.user.email || '',
          full_name: authData.user.user_metadata?.full_name || '',
          role: 'admin',
          created_at: authData.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(fallbackUser);
      }
      setLoading(false);
      return null;
    }
  }

  async function signIn(email: string, password: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Network error. Please check your connection.' };
    }
  }

  async function signUp(email: string, password: string, fullName: string): Promise<{ error?: string; user?: User }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) return { error: error.message };

      // If the session is immediately available (no email confirmation), set user
      if (data.session?.user) {
        const newUser = await fetchUser(data.session.user.id);
        if (newUser) return { user: newUser };
      }

      // For email confirmation flow, the user will be set after they confirm
      return {};
    } catch (err: any) {
      return { error: err?.message || 'Network error. Please check your connection.' };
    }
  }

  async function signOut() {
    setUser(null);
    await supabase.auth.signOut();
  }

  async function refreshUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUser(session.user.id);
    }
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
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
