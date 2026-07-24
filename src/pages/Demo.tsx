// ============================================================
// TerraNexus AI — Investor Demo Mode
// 90-second guided auto-play presentation for India launch.
// Shows: Zaha-style hero → India intelligence map → Verified
// property → Source evidence → Deal Room onboarding → Commission
// pipeline.
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Play, Pause, ChevronLeft, Globe,
  BarChart3, FileText, Target, Shield, Award,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { SEOHelmet } from '../components/seo/SEOHelmet';

// ─── Demo Steps ─────────────────────────────────────────────
const DEMO_STEPS = [
  {
    id: 'welcome',
    title: 'TerraNexus AI',
    subtitle: 'Intelligence for India\'s Most Valuable Buildings',
    body: 'Watch a 90-second overview of India\'s first AI-powered real estate investment intelligence platform.',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=85&auto=format',
    duration: 10000,
  },
  {
    id: 'india',
    title: 'India Intelligence Network',
    subtitle: '27 Cities · 25+ Developers · AI-Powered Scoring',
    body: 'TerraNexus tracks verified real estate data across 27 Indian cities — from Mumbai to Bhubaneswar — analyzing RERA-registered projects, infrastructure pipelines, capital flows, and developer momentum.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=85&auto=format',
    duration: 12000,
    metrics: [
      { value: '27', label: 'Indian Cities' },
      { value: '25+', label: 'Developers' },
      { value: '92%', label: 'Data Confidence' },
    ],
  },
  {
    id: 'property',
    title: 'Verified Property Intelligence',
    subtitle: 'Every Project Traces to a Source URL',
    body: 'Property data is verified against government registries — MahaRERA, state RERA portals, and official developer sources. No fabricated contacts. No invented addresses.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=85&auto=format',
    duration: 12000,
    badges: [
      { label: 'RERA Verified', icon: Shield },
      { label: 'Official Sources', icon: FileText },
      { label: 'AI Confidence', icon: Award },
    ],
  },
  {
    id: 'evidence',
    title: 'Source Verification Panel',
    subtitle: 'See Where Every Number Comes From',
    body: 'Every property detail page includes a Source Verification tab showing field-level provenance — whether the developer name, address, or RERA ID is verified or pending. Absolute transparency.',
    image: 'https://images.unsplash.com/photo-1600607687644-cd4f0cc7b3f8?w=1920&q=85&auto=format',
    duration: 12000,
  },
  {
    id: 'dealroom',
    title: 'Deal Room Onboarding',
    subtitle: 'Revenue-Capturing Deal Infrastructure',
    body: 'When a buyer expresses interest, they enter a structured onboarding flow — investor profile, budget, timeline, funding source, and digital introduction agreement. TerraNexus earns only when deals close.',
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7c4a7c?w=1920&q=85&auto=format',
    duration: 14000,
  },
  {
    id: 'pipeline',
    title: 'Commission Pipeline Dashboard',
    subtitle: 'Track Every Introduction',
    body: 'Every qualified buyer, site visit, and negotiation is tracked through the Deal Passport system — the core defensible asset that proves TerraNexus-originated introductions for commission entitlement.',
    image: 'https://images.unsplash.com/photo-1600607688964-a1925a9e0a0e?w=1920&q=85&auto=format',
    duration: 12000,
    metrics: [
      { value: '3%', label: 'Success Fee' },
      { value: '12 Mo', label: 'Entitlement Window' },
      { value: 'Full', label: 'Audit Trail' },
    ],
  },
  {
    id: 'cta',
    title: 'Ready to Transform Your Real Estate Intelligence?',
    subtitle: 'India Launch — Live Now',
    body: 'Request an AI Deal Report for any Indian city. Join the growing network of developers, family offices, and institutional investors using TerraNexus AI.',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=85&auto=format',
    duration: 12000,
    isCta: true,
  },
];

export function Demo() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // ─── Auto-play timer ──────────────────────────────────────
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const step = DEMO_STEPS[currentStep];
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / step.duration) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        if (currentStep < DEMO_STEPS.length - 1) {
          setCurrentStep((prev) => prev + 1);
          setProgress(0);
        } else {
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }
    }, 50);
  }, [currentStep]);

  useEffect(() => {
    if (isPlaying) {
      startTimer();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentStep, startTimer]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const goToStep = (index: number) => {
    if (index >= 0 && index < DEMO_STEPS.length) {
      setCurrentStep(index);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const step = DEMO_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === DEMO_STEPS.length - 1;

  if (!step) return null;

  return (
    <>
      <SEOHelmet
        title="Investor Demo — 90-Second Guided Overview"
        description="Watch a 90-second guided overview of TerraNexus AI — India's first AI-powered real estate investment intelligence platform with verified data, source attribution, and Deal Room onboarding."
        url="https://terranexus-ai.vercel.app/demo"
        canonical="https://terranexus-ai.vercel.app/demo"
      />
      <div className="relative min-h-screen bg-[#050505] overflow-hidden">
      {/* ─── Progress bar ──────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-white/5">
        <motion.div
          className="h-full bg-luxury-gold-500"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: 'linear' }}
        />
      </div>

      {/* ─── Step counter ──────────────────────────────────── */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <span className="text-[9px] text-white/30 font-mono tracking-[0.1em]">
          {String(currentStep + 1).padStart(2, '0')} / {String(DEMO_STEPS.length).padStart(2, '0')}
        </span>
      </div>

      {/* ─── Background image ──────────────────────────────── */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={step.id}
            src={step.image}
            alt=""
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/30 to-[#050505]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/50 via-transparent to-[#050505]/30" />
      </div>

      {/* ─── Content ───────────────────────────────────────── */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="w-full">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
            {/* Step number label */}
            <motion.span
              key={`label-${step.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="editorial-label text-luxury-gold-400/60 mb-4 block"
            >
              {String(currentStep + 1).padStart(2, '0')} · {step.title}
            </motion.span>

            {/* Headline */}
            <motion.h1
              key={`h1-${step.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="heading-xl text-white mb-3"
            >
              {step.subtitle}
            </motion.h1>

            {/* Body */}
            <motion.p
              key={`body-${step.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="body-lg text-gray-400 max-w-2xl leading-relaxed mb-8"
            >
              {step.body}
            </motion.p>

            {/* Metrics strip */}
            {(step as any).metrics && (
              <motion.div
                key={`metrics-${step.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex items-center gap-6 sm:gap-10 mb-8"
              >
                {(step as any).metrics.map((m: {value:string; label:string}) => (
                  <div key={m.label}>
                    <p className="text-2xl sm:text-3xl font-display font-semibold text-luxury-gold-300">
                      {m.value}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono tracking-[0.1em] uppercase">
                      {m.label}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Badges */}
            {(step as any).badges && (
              <motion.div
                key={`badges-${step.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap items-center gap-3 mb-8"
              >
                {(step as any).badges.map((b: {label:string; icon: any}) => {
                  const Icon = b.icon;
                  return (
                    <span
                      key={b.label}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-300 font-mono"
                    >
                      <Icon className="w-3 h-3 text-luxury-gold-400/60" />
                      {b.label}
                    </span>
                  );
                })}
              </motion.div>
            )}

            {/* CTA buttons */}
            {step.isCta && (
              <motion.div
                key={`cta-${step.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <button
                  onClick={() => navigate('/enterprise')}
                  className="btn-arch-filled group text-sm tracking-[0.12em]"
                >
                  Request AI Deal Report
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/deal-room')}
                  className="btn-arch text-xs tracking-[0.12em]"
                >
                  Explore Deal Room
                </button>
              </motion.div>
            )}

            {/* Source attribution */}
            <motion.div
              key={`src-${step.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="mt-8"
            >
              <p className="text-[9px] text-white/10 font-mono">
                Sources: MahaRERA · State RERA Portals · DLD · URA · HM Land Registry · World Bank
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── Controls ──────────────────────────────────────── */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
        {/* Previous */}
        <button
          onClick={() => goToStep(currentStep - 1)}
          disabled={isFirst}
          className={cn(
            'p-2 rounded-full border border-white/10 transition-all',
            isFirst ? 'opacity-20 cursor-not-allowed' : 'hover:border-white/30 hover:bg-white/5'
          )}
        >
          <ChevronLeft className="w-4 h-4 text-white/50" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="p-3 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white/70" />
          ) : (
            <Play className="w-4 h-4 text-white/70" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={() => goToStep(currentStep + 1)}
          disabled={isLast}
          className={cn(
            'p-2 rounded-full border border-white/10 transition-all',
            isLast ? 'opacity-20 cursor-not-allowed' : 'hover:border-white/30 hover:bg-white/5'
          )}
        >
          <ChevronRight className="w-4 h-4 text-white/50" />
        </button>

        {/* Skip to end */}
        {!isLast && (
          <button
            onClick={() => goToStep(DEMO_STEPS.length - 1)}
            className="text-[9px] text-white/20 font-mono hover:text-white/40 transition-colors ml-2"
          >
            Skip
          </button>
        )}
      </div>

      {/* ─── Exit button ────────────────────────────────────── */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 group"
      >
        <div className="w-1.5 h-1.5 bg-white/30 rounded-full group-hover:bg-white/60 transition-colors" />
        <span className="text-[9px] text-white/20 group-hover:text-white/40 font-mono tracking-[0.2em] uppercase transition-colors">
          Exit Demo
        </span>
      </button>      </div>
    </>
  );
}
