import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Sparkles, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('builder@leadluxe.ai');
  const [password, setPassword] = useState('demo123');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = isSignUp
      ? await signUp(email, password, fullName)
      : await signIn(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxury-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-luxury-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-luxury-gold-400" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">LeadLuxe</span>
              <span className="text-2xl font-bold text-luxury-gold-400"> AI</span>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-gray-500">
            {isSignUp
              ? 'Start converting more deals with AI intelligence'
              : 'Sign in to your AI Deal Intelligence dashboard'}
          </p>
        </div>

        {/* Form Card */}
        <div className="premium-card p-8 relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-luxury-gold-500/5 rounded-full blur-3xl" />

          <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
            {isSignUp && (
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-glass"
                  placeholder="Rajesh Mehta"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass"
                placeholder="builder@example.com"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-glass pr-10"
                  placeholder="Enter password"
                  required
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
              <p className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3 border border-red-500/20">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>

            {/* Demo credentials hint */}
            <div className="glass-card p-3 border border-luxury-gold-500/10">
              <p className="text-xs text-gray-500 text-center">
                <Sparkles className="w-3 h-3 text-luxury-gold-400 inline mr-1" />
                Demo: <span className="text-luxury-gold-400 font-mono">builder@leadluxe.ai</span> / <span className="text-luxury-gold-400 font-mono">demo123</span>
              </p>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-xs text-gray-500 hover:text-luxury-gold-400 transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>

            {/* Zero risk badges */}
            <div className="flex items-center justify-center gap-4 pt-2 text-[10px] text-gray-600">
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> No subscription</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 3% commission only</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Cancel anytime</span>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
