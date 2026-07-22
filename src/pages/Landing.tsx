import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Sparkles, Bot, BarChart3, Building2, Shield,
  TrendingUp, Users, CalendarIcon, MessageSquare, CheckCircle,
  Star, ChevronRight, Menu, X, Zap, Layers, Check, Maximize2
} from 'lucide-react';
import { PropertyChatbot } from '../components/chatbot/PropertyChatbot';
import { cn } from '../lib/utils';

// Lazy-load the 3D Hero (heavy — Three.js, fiber, drei)
const Hero3D = lazy(() =>
  import('../components/hero/Hero3D').then((m) => ({ default: m.Hero3D }))
);

// Lazy-load the full-screen walkthrough
const BuildingWalkthrough = lazy(() =>
  import('../components/hero/Hero3D').then((m) => ({ default: m.BuildingWalkthrough }))
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const features = [
  {
    icon: Bot,
    title: 'AI Lead Capture',
    description: 'Smart chatbot that captures and qualifies leads 24/7 from your website and WhatsApp.',
    color: 'text-luxury-gold-400',
    gradient: 'from-luxury-gold-500/20 to-transparent',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Track conversions, revenue projections, and team performance with stunning dashboards.',
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-transparent',
  },
  {
    icon: Users,
    title: 'AI Lead Scoring Engine',
    description: 'Sophisticated AI scores leads based on budget, urgency, location, and engagement patterns.',
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-transparent',
  },
  {
    icon: CalendarIcon,
    title: 'Smart Scheduling',
    description: 'Automated site visit scheduling with calendar sync, reminders, and confirmation workflows.',
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-transparent',
  },
  {
    icon: MessageSquare,
    title: 'WhatsApp Automation',
    description: 'Seamless WhatsApp follow-ups, brochures, and reminders through Meta Cloud API.',
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-transparent',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Role-based access, audit logs, and enterprise-grade data protection with Supabase.',
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-transparent',
  },
];

const stats = [
  { value: '40%', label: 'Higher Conversion', icon: TrendingUp },
  { value: '3x', label: 'More Site Visits', icon: Zap },
  { value: '60%', label: 'Faster Response', icon: Layers },
  { value: '95%', label: 'Client Satisfaction', icon: Star },
];

const testimonials = [
  {
    name: 'Rajesh Mehta',
    role: 'Director, Mehta Builders',
    content: "LeadLuxe AI transformed how we handle leads. We've seen a 40% increase in site visit conversions within the first month.",
    rating: 5,
  },
  {
    name: 'Anita Kapoor',
    role: 'Sales Head, Kapoor Estates',
    content: "The AI scoring is incredibly accurate. We now focus on the right leads and close deals faster than ever before.",
    rating: 5,
  },
  {
    name: 'Vikram Singh',
    role: 'CEO, Singh Developments',
    content: "The WhatsApp integration alone has saved us hours of manual follow-up. Absolutely essential for modern real estate sales.",
    rating: 5,
  },
];

export function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);

  return (
    <div className="min-h-screen bg-luxury-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-glass-border bg-luxury-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-luxury-gold-400" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">LeadLuxe</span>
                <span className="text-lg font-bold text-luxury-gold-400"> AI</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
              <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-glass-border bg-luxury-black animate-fade-in">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm text-gray-400 hover:text-white py-2">Features</a>
              <a href="#testimonials" className="block text-sm text-gray-400 hover:text-white py-2">Testimonials</a>
              <a href="#pricing" className="block text-sm text-gray-400 hover:text-white py-2">Pricing</a>
              <button onClick={() => navigate('/login')} className="w-full text-sm font-medium text-gray-300 py-2">Sign In</button>
              <button onClick={() => navigate('/login')} className="btn-primary w-full">Get Started <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </nav>

      {/* 3D Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* 3D Canvas Background */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <Hero3D />
          </Suspense>
        </div>

        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/60 via-transparent to-luxury-black/80 z-[1]" />
        <div className="absolute inset-0 bg-grid opacity-30 z-[1]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-luxury-gold-500/30 bg-luxury-gold-500/10 mb-8">
              <Sparkles className="w-4 h-4 text-luxury-gold-400" />
              <span className="text-sm font-medium text-luxury-gold-400">AI-Powered Lead Conversion Platform</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight font-display text-balance">
              Convert Every Lead Into a{' '}
              <span className="text-gradient-gold">Property Booking</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              The AI-powered platform that helps real estate developers capture, nurture, and convert leads into qualified site visits and property bookings — automatically.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="btn-primary text-lg px-8 py-4 shadow-gold-lg"
              >
                Start Free Trial
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setWalkthroughOpen(true)}
                className="btn-outline text-lg px-8 py-4 group"
              >
                <Maximize2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Take Virtual Tour
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="glass-card p-4 text-center border-luxury-gold-500/10">
                  <stat.icon className="w-5 h-5 text-luxury-gold-400 mx-auto mb-2" />
                  <p className="text-2xl sm:text-3xl font-bold text-luxury-gold-400 font-display">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-gray-700 flex justify-center">
            <div className="w-1 h-2.5 rounded-full bg-luxury-gold-400 mt-2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 font-display">
              Everything You Need to{' '}
              <span className="text-gradient-gold">Close More Deals</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              From first touch to final booking — LeadLuxe AI automates the entire lead conversion pipeline.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1 }}
                className="premium-card p-6 group"
              >
                <div className="w-12 h-12 rounded-xl bg-luxury-gold-500/10 flex items-center justify-center mb-4 group-hover:bg-luxury-gold-500/20 transition-all duration-300">
                  <feature.icon className={cn('w-6 h-6', feature.color)} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-luxury-gold-500/[0.03] to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 font-display">
              Trusted by{' '}
              <span className="text-gradient-gold">Leading Builders</span>
            </h2>
            <p className="text-lg text-gray-400">See how real estate developers are transforming their sales process.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1 }}
                className="premium-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-luxury-gold-400 text-luxury-gold-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-luxury-gold-500/20 flex items-center justify-center">
                    <span className="text-sm font-semibold text-luxury-gold-400">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-luxury-gold-500/[0.02] to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 font-display">
              Simple, Transparent{' '}
              <span className="text-gradient-gold">Pricing</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your business. All plans include a 14-day free trial.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0 }}
              className="premium-card p-8 relative group hover:border-luxury-gold-500/30 transition-all duration-500"
            >
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white font-display">₹4,999</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">For small developers & agents</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Up to 200 leads/month',
                  'AI lead scoring',
                  'WhatsApp integration',
                  'Basic analytics dashboard',
                  'Email support',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/login')}
                className="btn-outline w-full"
              >
                Start Free Trial
              </button>
            </motion.div>

            {/* Pro Plan — Featured */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.1 }}
              className="premium-card p-8 relative group border-luxury-gold-500/40 scale-105 shadow-gold-lg"
            >
              {/* Popular badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-luxury-gold-500 text-black text-xs font-semibold">
                Most Popular
              </div>

              <div className="mb-6 mt-2">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Professional</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white font-display">₹12,999</span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">For growing real estate teams</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited leads',
                  'Advanced AI scoring & insights',
                  'WhatsApp automation workflows',
                  'Custom analytics & reports',
                  'Site visit scheduling',
                  'Team collaboration (up to 5 users)',
                  'Priority support',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-luxury-gold-400 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/login')}
                className="btn-primary w-full shadow-gold-lg"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: 0.2 }}
              className="premium-card p-8 relative group hover:border-luxury-gold-500/30 transition-all duration-500"
            >
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white font-display">Custom</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">For large builders & enterprises</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Professional',
                  'Custom AI model training',
                  'Dedicated account manager',
                  'Custom integrations & API',
                  'Unlimited team members',
                  'SLA guarantees',
                  'White-label options',
                  '24/7 phone & email support',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/login')}
                className="btn-outline w-full"
              >
                Contact Sales
              </button>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-gray-500 mt-10"
          >
            All plans include a 14-day free trial. No credit card required. Cancel anytime.
          </motion.p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="premium-card p-8 lg:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-luxury-gold-500/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 font-display">
                Ready to Transform Your{' '}
                <span className="text-gradient-gold">Lead Conversion?</span>
              </h2>
              <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
                Join 500+ real estate developers who are using LeadLuxe AI to close more deals.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-glass flex-1 w-full"
                />
                <button
                  onClick={() => navigate('/login')}
                  className="btn-primary w-full sm:w-auto whitespace-nowrap"
                >
                  Get Started Free
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  No credit card
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  14-day free trial
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  Cancel anytime
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-glass-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-luxury-gold-400" />
              </div>
              <span className="text-sm font-bold text-white">LeadLuxe AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Contact</a>
              <span>© 2024 LeadLuxe AI. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <PropertyChatbot />

      {/* Full-screen 3D Walkthrough */}
      <AnimatePresence>
        {walkthroughOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100]"
          >
            <button
              onClick={() => setWalkthroughOpen(false)}
              className="absolute top-6 right-6 z-[110] w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[110] text-center pointer-events-none">
              <div className="animate-bounce mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4a030" strokeWidth="2" className="mx-auto">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </div>
              <p className="text-xs text-gray-500">Drag to orbit · Scroll to zoom</p>
            </div>

            <Suspense fallback={
              <div className="w-full h-full bg-luxury-black flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm text-gray-500">Loading 3D Tour...</p>
                </div>
              </div>
            }>
              <BuildingWalkthrough />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
