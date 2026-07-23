import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Building2, MapPin, BarChart3, Globe, ShieldCheck, Award, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useWalkthroughData } from '../../hooks/useWalkthroughData';

// ─── Register GSAP Plugin ──────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ─── Architectural Spaces — image + narrative only ─────────
// Metrics and annotations are injected LIVE from useWalkthroughData hook.
// This separates presentation (images/copy) from data (real metrics).
const SPACES = [
  {
    id: 'exterior',
    label: '01 · Exterior',
    title: 'Building. Monument. Signal.',
    body: 'Every structure contains intelligence. LeadLuxe decodes the data embedded in the world\'s most valuable real estate — from facade materials to capital flows — and surfaces opportunities before the market moves.',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=85&auto=format',
    attribution: 'Source: Unsplash · Contemporary Architecture',
  },
  {
    id: 'entrance',
    label: '02 · Entrance Plaza',
    title: 'The Approach.',
    body: 'Scale, material, light — architecture communicates intent before a single word is spoken. LeadLuxe applies the same rigor to market analysis, reading infrastructure signals, zoning data, and transaction patterns to identify emerging corridors.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=85&auto=format',
    attribution: 'Source: Unsplash · Architectural Photography',
  },
  {
    id: 'doors',
    label: '03 · Glass Doors',
    title: 'Threshold.',
    body: 'The finest buildings reveal themselves gradually — each threshold a transition. Our intelligence engine works the same way, filtering thousands of data points to surface only the highest-conviction opportunities across global cities.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=85&auto=format',
    attribution: 'Source: Unsplash · Modern Architecture',
  },
  {
    id: 'lobby',
    label: '04 · Lobby',
    title: 'Context. Material. Light.',
    body: 'A lobby reveals a building\'s character through its material choices. Similarly, LeadLuxe evaluates every opportunity through multiple lenses — developer reputation, infrastructure proximity, currency stability, and capital flow momentum.',
    image: 'https://images.unsplash.com/photo-1600607687644-cd4f0cc7b3f8?w=1920&q=85&auto=format',
    attribution: 'Source: Unsplash · Interior Architecture',
  },
  {
    id: 'elevator',
    label: '05 · Elevator Ascent',
    title: 'Vertical Intelligence.',
    body: 'As the elevator rises, floor-by-floor data reveals itself — the same way LeadLuxe layers intelligence: macro-economic indicators at the top, project-level data at street level, and transaction details at every step between.',
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7c4a7c?w=1920&q=85&auto=format',
    attribution: 'Source: Unsplash · Interior Architecture',
  },
  {
    id: 'corridor',
    label: '06 · Sky Corridor',
    title: 'Connecting Markets.',
    body: 'A corridor bridges spaces — just as capital flows bridge markets. LeadLuxe tracks cross-border investment corridors between London–Dubai, Singapore–Tokyo, Mumbai–Dubai, and San Francisco–Singapore in real time.',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf5cb3?w=1920&q=85&auto=format',
    attribution: 'Source: Unsplash · Architectural Interior',
  },
  {
    id: 'penthouse',
    label: '07 · Evidence Chamber',
    title: 'Verified. Sourced. Transparent.',
    body: 'Every opportunity in the LeadLuxe network is backed by verifiable evidence — government registries, institutional research, and public market data. No fabricated contacts. No invented addresses. Every claim traces to a source URL.',
    image: 'https://images.unsplash.com/photo-1600607688964-a1925a9e0a0e?w=1920&q=85&auto=format',
    attribution: 'Source: Unsplash · Luxury Interior',
  },
  {
    id: 'terrace',
    label: '08 · Command Center',
    title: 'Intelligence for the World\'s Most Valuable Buildings.',
    body: 'From this vantage, the entire market is visible. LeadLuxe combines architectural intelligence, capital flow analysis, and institutional-grade data to give you clarity — before the market moves.',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=85&auto=format',
    attribution: 'Source: Unsplash · Cityscape',
  },
];

interface CinematicWalkthroughProps {
  onEnterExperience: () => void;
}

/**
 * Zaha Hadid–inspired cinematic scroll walkthrough.
 *
 * 8 architectural spaces, each paired with LIVE metrics and annotations
 * from the useWalkthroughData hook (sourced from global-data.ts).
 *
 * Every visible metric traces to a real country/city record.
 * No hardcoded placeholder values remain on the public surface.
 */
export function CinematicWalkthrough({ onEnterExperience }: CinematicWalkthroughProps) {
  const navigate = useNavigate();
  const sceneData = useWalkthroughData();
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const annotationsRef = useRef<(HTMLDivElement | null)[]>([]);
  const metricsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Evidence chamber — static structure, could be replaced with Supabase query
  const evidenceItems = [
    { label: 'Government Registry', icon: ShieldCheck, source: 'DLD / MahaRERA / URA / HM Land Registry' },
    { label: 'Institutional Research', icon: BarChart3, source: 'JLL · CBRE · Savills · Knight Frank' },
    { label: 'Infrastructure Pipeline', icon: Building2, source: 'Government planning portals · Metro authorities' },
    { label: 'Capital Flow Analysis', icon: Globe, source: 'World Bank · IMF · OECD · UN Habitat' },
    { label: 'Satellite & Geospatial', icon: MapPin, source: 'Mapbox · OpenStreetMap · Cesium Ion' },
    { label: 'Transaction Registry', icon: Award, source: 'Land registries · County assessors · Planning authorities' },
  ];

  // ─── GSAP ScrollTrigger Setup ─────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      SPACES.forEach((_, i) => {
        const section = sectionsRef.current[i];
        if (!section) return;

        // Image zoom effect — 1.1 → 1.0
        const img = section.querySelector('.walkthrough-image') as HTMLElement;
        if (img) {
          gsap.fromTo(img,
            { scale: 1.12 },
            {
              scale: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'top center',
                scrub: 1.5,
              },
            }
          );
        }

        // Content text — fade up
        const content = section.querySelector('.walkthrough-content') as HTMLElement;
        if (content) {
          gsap.fromTo(content,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 70%',
                end: 'top 30%',
                scrub: 1.2,
              },
            }
          );
        }

        // Annotation — slide from side
        const annot = annotationsRef.current[i];
        if (annot) {
          gsap.fromTo(annot,
            { opacity: 0, x: i % 2 === 0 ? -30 : 30 },
            {
              opacity: 1,
              x: 0,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 60%',
                end: 'center center',
                scrub: 1.5,
              },
            }
          );
        }

        // Metrics row — stagger
        const metricsEl = metricsRef.current[i];
        if (metricsEl) {
          const items = metricsEl.querySelectorAll('.metric-item');
          gsap.fromTo(items,
            { opacity: 0, scale: 0.9 },
            {
              opacity: 1,
              scale: 1,
              ease: 'back.out(1.4)',
              stagger: 0.15,
              scrollTrigger: {
                trigger: section,
                start: 'top 55%',
                end: 'center 40%',
                scrub: 1,
              },
            }
          );
        }

        // Attribution — fade
        const attr = section.querySelector('.walkthrough-attribution') as HTMLElement;
        if (attr) {
          gsap.fromTo(attr,
            { opacity: 0 },
            {
              opacity: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 60%',
                end: 'top 35%',
                scrub: 1,
              },
            }
          );
        }
      });

      // Final CTA section
      const ctaSection = container.querySelector('.walkthrough-cta');
      if (ctaSection) {
        gsap.fromTo(ctaSection,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaSection,
              start: 'top 80%',
              end: 'top 40%',
              scrub: 1.5,
            },
          }
        );
      }
    }, container);

    return () => ctx.revert();
  }, []);

  // ─── Refs ─────────────────────────────────────────────────
  const setSectionRef = useCallback((el: HTMLElement | null, i: number) => {
    sectionsRef.current[i] = el;
  }, []);

  const setAnnotationRef = useCallback((el: HTMLDivElement | null, i: number) => {
    annotationsRef.current[i] = el;
  }, []);

  const setMetricsRef = useCallback((el: HTMLDivElement | null, i: number) => {
    metricsRef.current[i] = el;
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* ─── Progress indicator ──────────────────────────── */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-3">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="flex flex-col items-center gap-2">
          {SPACES.map((space, i) => (
            <a
              key={space.id}
              href={`#space-${space.id}`}
              className="group flex items-center gap-3"
            >
              <span
                className={cn(
                  'block w-1.5 h-1.5 rounded-full transition-all duration-500',
                  'bg-white/20 group-hover:bg-luxury-gold-400/60'
                )}
              />
              <span className="text-[9px] text-white/0 group-hover:text-white/40 transition-all duration-300 font-mono tracking-[0.15em] uppercase">
                {space.label.split('·')[1]?.trim() || space.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* ─── Walkthrough Sections ────────────────────────── */}
      {SPACES.map((space, i) => {
        const data = sceneData[i];
        return (
          <section
            key={space.id}
            id={`space-${space.id}`}
            ref={(el) => setSectionRef(el, i)}
            className="relative w-full h-screen overflow-hidden"
          >
            {/* ── Background image ────────────────────────── */}
            <div
              className="walkthrough-image absolute inset-0 w-full h-full"
              style={{ willChange: 'transform' }}
            >
              <img
                src={space.image}
                alt={space.title}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/20 to-[#050505]/80" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/30 via-transparent to-[#050505]/30" />
            </div>

            {/* ── Space label ─────────────────────────────── */}
            <div className="absolute top-8 left-6 sm:left-10 lg:left-16 z-10">
              <span className="editorial-label">{space.label}</span>
            </div>

            {/* ── Attribution ─────────────────────────────── */}
            <div className="walkthrough-attribution absolute bottom-6 right-6 sm:right-10 lg:right-16 z-10 opacity-0">
              <span className="text-[9px] text-white/20 font-mono">{space.attribution}</span>
            </div>

            {/* ── Content overlay — bottom left ───────────── */}
            <div className="walkthrough-content absolute bottom-16 sm:bottom-20 lg:bottom-24 left-6 sm:left-10 lg:left-16 right-6 sm:right-10 lg:right-16 z-10 max-w-2xl opacity-0">
              <h2 className="heading-lg text-white mb-3 font-display">
                {space.title}
              </h2>
              <p className="body-md text-gray-400 max-w-xl leading-relaxed">
                {space.body}
              </p>
            </div>

            {/* ── LIVE Architectural annotation ────────────── */}
            {data?.annotation && (
              <div
                ref={(el) => setAnnotationRef(el, i)}
                className={cn(
                  'absolute z-20 opacity-0',
                  i % 2 === 0 ? 'left-[6%] sm:left-[8%]' : 'right-[6%] sm:right-[8%]',
                  i < 3 ? 'bottom-[15%]' : 'top-[20%]'
                )}
              >
                <div className="arch-annotation-gold flex-col items-start gap-1 p-3 min-w-[200px] sm:min-w-[240px]">
                  <span className="editorial-label text-[8px] text-luxury-gold-400/60">
                    {data.annotation.label}
                  </span>
                  <span className="text-sm font-medium text-white leading-tight">
                    {data.annotation.value}
                  </span>
                  <span className="text-[10px] text-gray-500 leading-tight">
                    {data.annotation.detail}
                  </span>
                </div>
                <div className="ml-3 mt-1 w-px h-6 bg-gradient-to-b from-luxury-gold-500/30 to-transparent" />
              </div>
            )}

            {/* ── LIVE Metrics strip ───────────────────────── */}
            {data?.metrics && (
              <div
                ref={(el) => setMetricsRef(el, i)}
                className="absolute bottom-32 sm:bottom-36 lg:bottom-40 right-6 sm:right-10 lg:right-16 z-10 flex items-center gap-4 sm:gap-6"
              >
                {data.metrics.map((m) => (
                  <div key={m.label} className="metric-item text-right opacity-0">
                    <p className="text-lg sm:text-xl lg:text-2xl font-display font-semibold text-luxury-gold-300">
                      {m.value}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-mono tracking-[0.1em] uppercase">
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Scene 7 exclusive: Evidence Chamber icons ── */}
            {i === 6 && (
              <div className="absolute bottom-36 sm:bottom-40 left-6 sm:left-10 lg:left-16 z-10 max-w-xl">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {evidenceItems.slice(0, 4).map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm"
                      >
                        <Icon className="w-3 h-3 text-luxury-gold-400/60" />
                        <span className="text-[9px] text-gray-400 font-mono">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        );
      })}

      {/* ─── Final CTA Section ───────────────────────────── */}
      <section className="walkthrough-cta relative min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="absolute inset-0 arch-grid opacity-30" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
          <span className="editorial-label text-luxury-gold-400/60 mb-6 block">
            08 · Enter the Platform
          </span>
          <h2 className="heading-xl text-white mb-6">
            Intelligence for the World's Most Valuable Buildings.
          </h2>
          <p className="body-lg text-gray-400 mb-10 max-w-xl mx-auto">
            LeadLuxe analyzes verified global real-estate signals, capital flows, infrastructure activity, and developer momentum to identify high-probability investment opportunities — surfaced before traditional portals recognize them.
          </p>

          {/* Data credibility strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10 text-[9px] text-white/20 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-luxury-gold-400/40" />
              Zero fabricated data
            </span>
            <span className="hidden sm:inline text-white/10">·</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-luxury-gold-400/40" />
              Source-attributed records
            </span>
            <span className="hidden sm:inline text-white/10">·</span>
            <span className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3 text-luxury-gold-400/40" />
              Verified public registries
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterExperience}
              className="btn-arch-filled group text-sm tracking-[0.12em]"
            >
              Enter the Experience
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/enterprise')}
              className="btn-arch text-xs tracking-[0.12em]"
            >
              Request AI Deal Report
            </button>
          </div>

          {/* Source credits */}
          <div className="mt-16 space-y-2">
            <p className="text-[9px] text-white/10 font-mono tracking-[0.1em]">
              Market data sourced from: DLD · MahaRERA · URA · HM Land Registry · World Bank · CBRE · JLL · Knight Frank
            </p>
            <p className="text-[9px] text-white/10 font-mono tracking-[0.1em]">
              Architectural imagery sourced from Unsplash · Licensed for commercial use
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
