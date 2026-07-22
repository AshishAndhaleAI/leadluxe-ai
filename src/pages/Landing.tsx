import { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Sparkles, Bot, BarChart3, Building2, Shield,
  TrendingUp, Users, CalendarIcon, MessageSquare, CheckCircle,
  Star, ChevronRight, Menu, X, Zap, Layers, Check, Maximize2,
  Calculator, IndianRupee, Percent, Trophy
} from 'lucide-react';
import { PropertyChatbot } from '../components/chatbot/PropertyChatbot';
import { cn } from '../lib/utils';
import { formatIndianCurrency } from '../lib/format';

const Hero3D = lazy(() =>
  import('../components/hero/Hero3D').then((m) => ({ default: m.Hero3D }))
);

const BuildingWalkthrough = lazy(() =>
  import('../components/hero/Hero3D').then((m) => ({ default: m.BuildingWalkthrough }))
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const features = [
  {
    icon: Bot, title: 'AI Lead Capture', description: 'Smart chatbot that captures and qualifies leads 24/7 from your website and WhatsApp.', color: 'text-luxury-gold-400',
  },
  {
    icon: BarChart3, title: 'Real-Time Analytics', description: 'Track conversions, revenue projections, and team performance with stunning dashboards.', color: 'text-emerald-400',
  },
  {
    icon: Users, title: 'AI Lead Scoring Engine', description: 'Sophisticated AI scores leads based on budget, urgency, location, and engagement patterns.', color: 'text-blue-400',
  },
  {
    icon: CalendarIcon, title: 'Smart Scheduling', description: 'Automated site visit scheduling with calendar sync, reminders, and confirmation workflows.', color: 'text-amber-400',
  },
  {
    icon: MessageSquare, title: 'WhatsApp Automation', description: 'Seamless WhatsApp follow-ups, brochures, and reminders through Meta Cloud API.', color: 'text-emerald-400',
  },
  {
    icon: Shield, title: 'Enterprise Security', description: 'Role-based access, audit logs, and enterprise-grade data protection with Supabase.', color: 'text-purple-400',
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
    name: 'Rajesh Mehta', role: 'Director, Mehta Builders',
    content: "We closed ₹50 Cr in deals and paid zero upfront — only 3% on closed bookings. LeadLuxe AI transformed our entire sales pipeline.",
    rating: 5,
  },
  {
    name: 'Anita Kapoor', role: 'Sales Head, Kapoor Estates',
    content: "The AI scoring is incredibly accurate. We now focus on the right leads and close deals faster than ever before. No subscription, no risk.",
    rating: 5,
  },
  {
    name: 'Vikram Singh', role: 'CEO, Singh Developments',
    content: "The WhatsApp integration alone has saved us hours of manual follow-up. And we only pay when we close. Absolutely essential for modern real estate sales.",
    rating: 5,
  },
];

const commissionExamples = [
  { deal: 5000000, label: '₹50 L', commission: 150000, icon: '🏡' },
  { deal: 8000000, label: '₹80 L', commission: 240000, icon: '🏠' },
  { deal: 12000000, label: '₹1.2 Cr', commission: 360000, icon: '🏢' },
  { deal: 25000000, label: '₹2.5 Cr', commission: 750000, icon: '🏛️' },
];

export function Landing() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [calcValue, setCalcValue] = useState<string>('10000000');
  const [email, setEmail] = useState('');

  const parsedDeal = parseInt(calcValue) || 0;
  const calcCommission = parsedDeal * 0.03;

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
              <a href="#calculator" className="text-sm text-gray-400 hover:text-white transition-colors">Commission Calculator</a>
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
                Book Builder Demo
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
              <a href="#calculator" className="block text-sm text-gray-400 hover:text-white py-2">Commission Calculator</a>
              <button onClick={() => navigate('/login')} className="w-full text-sm font-medium text-gray-300 py-2">Sign In</button>
              <button onClick={() => navigate('/login')} className="btn-primary w-full">Book Builder Demo <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </nav>

      {/* 3D Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <Hero3D />
          </Suspense>
        </div>

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
              <Percent className="w-4 h-4 text-luxury-gold-400" />
              <span className="text-sm font-medium text-luxury-gold-400">Zero Subscription · Zero Risk</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight font-display text-balance">
              We Don't Charge Monthly.<br />
              <span className="text-gradient-gold">We Get Paid When You Close a Property Deal.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg sm:text-xl text-gray-400 mb-10 max-w-3xl mx-auto">
              AI qualification, WhatsApp automation, site-visit booking, and sales intelligence for premium real-estate developers — with <span className="text-luxury-gold-400 font-semibold">zero subscription risk</span>. Only 3% success fee on closed deals.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="btn-primary text-lg px-8 py-4 shadow-gold-lg"
              >
                Book Builder Demo
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

            {/* No-risk badges */}
            <motion.div variants={itemVariants} className="flex items-center justify-center gap-6 mt-8 text-xs text-gray-600">
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> No upfront cost</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> No monthly subscription</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 3% on closed deals only</span>
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
              From first touch to final booking — LeadLuxe AI automates the entire lead conversion pipeline. No upfront cost, only 3% on closed deals.
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

      {/* Commission Model Section */}
      <section id="calculator" className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-luxury-gold-500/[0.03] to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-luxury-gold-500/30 bg-luxury-gold-500/10 mb-6">
              <Calculator className="w-4 h-4 text-luxury-gold-400" />
              <span className="text-sm font-medium text-luxury-gold-400">Transparent Pricing</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 font-display">
              We Win{' '}
              <span className="text-gradient-gold">When You Win.</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              No monthly subscription. No hidden fees. A simple 3% success fee on every property booking closed through our platform.
            </p>
          </motion.div>

          {/* Interactive Commission Calculator */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="premium-card p-8 lg:p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-luxury-gold-500/5 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
                    <IndianRupee className="w-6 h-6 text-luxury-gold-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Commission Calculator</h3>
                    <p className="text-sm text-gray-400">See exactly what you'd pay — only when a deal closes</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Input */}
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Enter your estimated property deal value</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-gold-400" />
                        <input
                          type="text"
                          value={calcValue}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setCalcValue(val);
                          }}
                          className="input-glass w-full pl-12 py-4 text-xl font-bold text-white"
                          placeholder="Enter amount"
                        />
                      </div>
                    </div>

                    <div className="glass-card p-4 border border-luxury-gold-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400">Property Deal Value</span>
                        <span className="text-lg font-bold text-white">{parsedDeal > 0 ? formatIndianCurrency(parsedDeal) : '—'}</span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400">Success Fee</span>
                        <span className="text-sm text-luxury-gold-400 font-semibold">3%</span>
                      </div>
                      <div className="border-t border-luxury-border my-2 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">Your Commission to LeadLuxe</span>
                          <span className="text-xl font-bold text-luxury-gold-400">
                            {parsedDeal > 0 ? formatIndianCurrency(calcCommission) : '—'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">You only pay this when the deal closes</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => navigate('/login')}
                        className="btn-primary flex-1"
                      >
                        Calculate My Commission ROI
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate('/login')}
                        className="btn-outline flex-1"
                      >
                        Request AI Lead Audit
                      </button>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 font-medium">Example commissions on typical deals</p>
                    {commissionExamples.map((ex, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-4 border border-luxury-gold-500/10 hover:border-luxury-gold-500/30 transition-all cursor-pointer group"
                        onClick={() => setCalcValue(String(ex.deal))}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{ex.icon}</span>
                            <div>
                              <p className="text-sm font-semibold text-white">{ex.label} deal</p>
                              <p className="text-xs text-luxury-gold-400">3% success fee</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-luxury-gold-400">{formatIndianCurrency(ex.commission)}</p>
                            <p className="text-[10px] text-gray-600">commission</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 mt-4">
                      <div className="flex items-start gap-3">
                        <Trophy className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-emerald-400">No upfront cost. We win when you win.</p>
                          <p className="text-xs text-gray-500 mt-1">Only pay the 3% success fee after the booking is confirmed. No minimum commitment, no monthly bills, no hidden charges. Cancel anytime.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
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
            <p className="text-lg text-gray-400">See how real estate developers are closing more deals with zero subscription risk.</p>
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
                <p className="text-sm text-gray-300 leading-relaxed mb-6">"{testimonial.content}"</p>
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
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-luxury-gold-500/30 bg-luxury-gold-500/10 mb-6">
                <Percent className="w-4 h-4 text-luxury-gold-400" />
                <span className="text-sm font-medium text-luxury-gold-400">Zero Risk · Zero Upfront</span>
              </div>

              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 font-display">
                Ready to Close More Deals{' '}
                <span className="text-gradient-gold">With Zero Subscription Risk?</span>
              </h2>
              <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
                Join 500+ real estate developers who are using LeadLuxe AI to close more deals. Only pay 3% when a booking is confirmed.
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
                  Book Builder Demo
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-600">
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> No upfront cost</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> No monthly subscription</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 3% on closed deals</span>
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

      <PropertyChatbot />

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
