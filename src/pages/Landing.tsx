import { useState, lazy, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

// ─── Lazy-load the walkthrough (heavy — GSAP + ScrollTrigger) ─
const CinematicWalkthrough = lazy(() =>
  import('../components/landing/CinematicWalkthrough').then((m) => ({
    default: m.CinematicWalkthrough,
  }))
);

// ─── Zaha Hadid–Inspired Hero Image Pool ────────────────────
// Curated architectural photography from Unsplash:
// Licensed under the Unsplash License — free for commercial use.
// Replace with official developer/architectural firm imagery in production.
const HERO_IMAGES = [
  // Indian luxury architecture — Mumbai skyline
  'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1920&q=85&auto=format',
  // Indian contemporary architecture
  'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=1920&q=85&auto=format',
  // Luxury Indian residential tower
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85&auto=format',
];

// ─── Navigation ─────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Architecture', href: '#walkthrough' },
  { label: 'Enterprise', href: '/enterprise' },
  { label: 'Pilot', href: '/pilot' },
];

export function Landing() {
  const navigate = useNavigate();
  const [walkthroughStarted, setWalkthroughStarted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  // Cycle hero image every 6 seconds
  // In production, replace with a curated architectural slideshow
  const cycleHero = useCallback(() => {
    setHeroImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
  }, []);

  // ─── Walkthrough State ─────────────────────────────────
  const handleEnterExperience = useCallback(() => {
    setWalkthroughStarted(true);
    // Smooth scroll to the walkthrough after a brief delay for the render
    setTimeout(() => {
      document.getElementById('walkthrough')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // ─── Full-Screen Hero (pre-walkthrough) ────────────────
  if (!walkthroughStarted) {
    return (
      <div className="relative min-h-screen bg-[#050505] overflow-hidden">
        {/* ─── Navigation ───────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
          <div className="section-container">
            <div className="flex items-center justify-between h-20 lg:h-24">
              {/* Logo — minimal, architectural */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-3 group"
              >
                <div className="w-2 h-2 bg-white rounded-full group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-white tracking-[0.2em] uppercase font-mono">
                  LeadLuxe AI
                </span>
              </button>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-10">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-xs text-white/50 hover:text-white tracking-[0.12em] uppercase font-mono transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                ))}
                <button
                  onClick={() => navigate('/login')}
                  className="text-xs text-white/70 hover:text-white tracking-[0.12em] uppercase font-mono transition-colors duration-300"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/enterprise')}
                  className="btn-arch-filled text-[10px] tracking-[0.15em]"
                >
                  Request Report
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white/70"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="md:hidden border-t border-white/5 bg-[#050505]/95 backdrop-blur-xl"
              >
                <div className="section-container py-6 space-y-4">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-sm text-white/60 hover:text-white tracking-[0.12em] uppercase font-mono"
                    >
                      {link.label}
                    </a>
                  ))}
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                    className="block text-sm text-white/60 hover:text-white tracking-[0.12em] uppercase font-mono"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/enterprise'); }}
                    className="btn-arch-filled w-full text-center text-[10px]"
                  >
                    Request AI Deal Report
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* ─── Hero Section ─────────────────────────────── */}
        <section className="relative w-full h-screen flex items-center">
          {/* Edge-to-edge architectural image */}
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              <motion.img
                key={heroImageIndex}
                src={HERO_IMAGES[heroImageIndex]}
                alt="Contemporary architecture"
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                onLoad={() => {
                  // Cycle to next image after 6 seconds
                  setTimeout(cycleHero, 6000);
                }}
              />
            </AnimatePresence>
            {/* Multiple gradient layers for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-[#050505]/20 to-[#050505]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 via-transparent to-[#050505]/40" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent" />
          </div>

          {/* Hero content — minimal, editorial */}
          <div className="relative z-10 w-full">
            <div className="section-container">
              <div className="max-w-3xl">
                {/* Editorial label */}
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="editorial-label text-luxury-gold-400/70 mb-6 block"
                >
                  LeadLuxe AI
                </motion.span>

                {/* Main headline — large serif */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="heading-xl text-white mb-6"
                >
                  Intelligence for India's Most{' '}
                  <span className="text-gradient-gold">Valuable Buildings.</span>
                </motion.h1>

                {/* Supporting text */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="body-lg text-gray-400 max-w-xl mb-10 leading-relaxed"
                >
                  LeadLuxe analyzes verified RERA data, infrastructure activity, capital flows, 
                  developer momentum, and market signals across India to identify high-probability 
                  real-estate opportunities — surfaced before traditional portals recognize them.
                </motion.p>

                {/* Single CTA + secondary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <button
                    onClick={handleEnterExperience}
                    className="btn-arch-filled group text-sm tracking-[0.12em]"
                  >
                    Enter the Experience
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                  <button
                    onClick={() => navigate('/enterprise')}
                    className="btn-arch text-xs tracking-[0.12em]"
                  >
                    Request AI Deal Report
                  </button>
                </motion.div>

                {/* Data sources — editorial note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="mt-12 flex items-center gap-4 text-[9px] text-white/15 font-mono tracking-[0.05em]"
                >
                  <span>Sources: MahaRERA · State RERA Portals · HM Land Registry</span>
                  <span className="w-px h-3 bg-white/10" />
                  <span>World Bank · JLL India · CBRE India · Knight Frank India</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Scroll indicator — bottom center */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          >
            <button
              onClick={handleEnterExperience}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <span className="text-[9px] text-white/20 font-mono tracking-[0.15em] uppercase group-hover:text-white/40 transition-colors">
                Scroll
              </span>
              <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent group-hover:from-white/40 transition-colors" />
            </button>
          </motion.div>
        </section>
      </div>
    );
  }

  // ─── Walkthrough Mode ──────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Minimal walkthrough navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 mix-blend-difference pointer-events-none">
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setWalkthroughStarted(false)}
              className="pointer-events-auto flex items-center gap-2 group"
            >
              <div className="w-1.5 h-1.5 bg-white/50 rounded-full group-hover:bg-white transition-colors" />
              <span className="text-[9px] text-white/40 group-hover:text-white/70 tracking-[0.2em] uppercase font-mono transition-colors">
                LeadLuxe AI
              </span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="pointer-events-auto text-[9px] text-white/40 hover:text-white/70 tracking-[0.15em] uppercase font-mono transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Cinematic walkthrough — 8 architectural spaces */}
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#050505]">
            <div className="text-center space-y-4">
              <div className="w-6 h-6 border border-white/20 border-t-white/60 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-white/20 font-mono tracking-[0.1em]">
                Loading experience
              </p>
            </div>
          </div>
        }
      >
        <div id="walkthrough">
          <CinematicWalkthrough onEnterExperience={() => navigate('/login')} />
        </div>
      </Suspense>


    </div>
  );
}
