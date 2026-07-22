import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isSignUp
        ? await signUp(email, password, fullName)
        : await signIn(email, password);

      if (result.error) {
        setError(result.error);
      } else if (!isSignUp) {
        navigate('/dashboard');
      } else if ('user' in result && result.user) {
        // User is immediately authenticated (email confirmation disabled)
        navigate('/dashboard');
      } else {
        setError('Account created! Check your email to confirm your account.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-luxury-black">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-luxury-gold-500/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-grid" />
        </div>

        <div className="relative flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-luxury-gold-400" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">LeadLuxe</span>
              <span className="text-2xl font-bold text-luxury-gold-400"> AI</span>
            </div>
          </div>

          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-white font-display leading-tight">
              Welcome Back to{' '}
              <span className="text-gradient-gold">
                LeadLuxe AI
              </span>
            </h1>

            <div className="space-y-4">
              {[
                { label: 'Track and manage all your leads', icon: '🎯' },
                { label: 'AI-powered lead scoring & automation', icon: '🤖' },
                { label: 'Real-time analytics and insights', icon: '📊' },
                { label: 'Smart site visit scheduling', icon: '📅' },
                { label: 'WhatsApp & email integration', icon: '💬' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-400">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-base">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Sparkles className="w-3.5 h-3.5 text-luxury-gold-400" />
              Enterprise-grade security · SOC 2 compliant
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-luxury-gold-400" />
              </div>
              <span className="text-xl font-bold text-white">LeadLuxe <span className="text-luxury-gold-400">AI</span></span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            {isSignUp
              ? 'Start your 14-day free trial. No credit card required.'
              : 'Access your lead management dashboard'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="input-glass"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="input-glass"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-glass pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className={cn(
                'p-3 rounded-lg text-sm',
                error.includes('created')
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              )}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-luxury-gold-400 hover:text-luxury-gold-300 font-medium transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Create one'}
            </button>
          </p>

          <button
            onClick={() => navigate('/')}
            className="mt-4 w-full text-center text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
