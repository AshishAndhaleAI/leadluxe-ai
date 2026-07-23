// ============================================================
// LeadLuxe AI — Cinematic Walkthrough
// Scroll-driven architectural camera system.
//
// ARCHITECTURE:
// The entire experience is PINNED via ScrollTrigger. As the
// user scrolls, a master GSAP timeline advances through
// "camera positions" — each position crossfades images,
// reveals content, and displays live data overlays sourced
// from global-data.ts.
//
// This is NOT a 3D scene. It uses cinematic image transitions
// (crossfade + scale + parallax) to simulate the feeling of
// moving through a real luxury building.
//
// CAMERA POSITIONS (by scroll progress):
//   0.00–0.14  City Approach (aerial skyline)
//   0.14–0.28  Arrival Plaza (building entrance)
//   0.28–0.42  Lobby Entry (interior + data walls)
//   0.42–0.56  Elevator Ascent (vertical reveal)
//   0.56–0.70  Sky Corridor (opportunity panels)
//   0.70–0.85  Penthouse Evidence Chamber
//   0.85–1.00  AI Command Center (final CTA)
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight, ShieldCheck, Globe, ExternalLink,
  Building2, BarChart3, MapPin, Award, Target,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useWalkthroughData } from '../../hooks/useWalkthroughData';
import { COUNTRIES, CITIES } from '../../lib/global-data';

// ─── Register GSAP Plugin ──────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ─── Camera Positions ───────────────────────────────────────
// Defines the 7 phases. Each has an image, narrative content,
// and a progress range (start → end as fraction of 0–1).
interface CameraPosition {
  id: string;
  label: string;
  title: string;
  body: string;
  image: string;
  // Progress range [start, end] 0–1
  range: [number, number];
  // Data-driven: which scene index from useWalkthroughData
  dataIndex: number;
}

const CAMERA_POSITIONS: CameraPosition[] = [
  {
    id: 'approach',
    label: '01 · City Approach',
    title: 'India\'s Most Valuable Buildings.',
    body: 'From Mumbai to Bengaluru, Pune to Gurugram — LeadLuxe monitors 27 Indian cities, tracking infrastructure signals, capital flows, and developer momentum to surface opportunities before the market moves.',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1920&q=85&auto=format',
    range: [0, 0.10],
    dataIndex: 0,
  },
  {
    id: 'plaza',
    label: '02 · Arrival Plaza',
    title: 'The Approach.',
    body: 'Scale, material, light — architecture communicates intent before a single word is spoken. LeadLuxe applies the same rigor to market analysis, reading RERA data, infrastructure signals, and transaction patterns to identify emerging Indian corridors.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85&auto=format',
    range: [0.10, 0.25],
    dataIndex: 1,
  },
  {
    id: 'lobby',
    label: '03 · Lobby Intelligence',
    title: 'Market Data, Materialized.',
    body: 'Inside the lobby, live market intelligence appears on architectural surfaces — price momentum, absorption rates, and AI confidence scores across Indian metros, updated from verified government and institutional sources.',
    image: 'https://images.unsplash.com/photo-1600607687644-cd4f0cc7b3f8?w=1920&q=85&auto=format',
    range: [0.25, 0.40],
    dataIndex: 2,
  },
  {
    id: 'elevator',
    label: '04 · Elevator Ascent',
    title: 'Vertical Intelligence.',
    body: 'As the elevator rises, floor-by-floor data reveals itself: infrastructure scores at the ground level, metro impact at mid-rise, and capital flow analytics at the top — the same layered intelligence LeadLuxe applies to every opportunity.',
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7c4a7c?w=1920&q=85&auto=format',
    range: [0.40, 0.55],
    dataIndex: 3,
  },
  {
    id: 'corridor',
    label: '05 · Sky Corridor',
    title: 'Connecting Indian Markets.',
    body: 'A corridor bridges spaces — just as capital flows bridge cities. LeadLuxe tracks cross-border investment corridors between Mumbai–Dubai, Bengaluru–Singapore, and Delhi NCR–London in real time, with verified source attribution.',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf5cb3?w=1920&q=85&auto=format',
    range: [0.55, 0.70],
    dataIndex: 4,
  },
  {
    id: 'penthouse',
    label: '06 · Evidence Chamber',
    title: 'Verified. Sourced. Transparent.',
    body: 'Every opportunity traced to a source URL — MahaRERA, state RERA portals, institutional research. No fabricated contacts. No invented addresses. A complete due-diligence workspace for institutional-grade property research.',
    image: 'https://images.unsplash.com/photo-1600607688964-a1925a9e0a0e?w=1920&q=85&auto=format',
    range: [0.70, 0.85],
    dataIndex: 5,
  },
  {
    id: 'command',
    label: '07 · AI Command Center',
    title: 'India Intelligence, Live.',
    body: 'From this vantage, the entire market is visible. LeadLuxe combines verified RERA data, infrastructure intelligence, capital flow analysis, and AI-driven scoring to give you clarity — before the market moves.',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1920&q=85&auto=format',
    range: [0.85, 1.0],
    dataIndex: 6,
  },
];

// ─── Evidence Chamber Items ─────────────────────────────────
const EVIDENCE_ITEMS = [
  { label: 'Government Registry', icon: ShieldCheck, source: 'MahaRERA / State RERA / DLD' },
  { label: 'Institutional Research', icon: BarChart3, source: 'JLL · CBRE · Knight Frank' },
  { label: 'Infrastructure Pipeline', icon: Building2, source: 'Metro authorities · NHAI' },
  { label: 'Capital Flow Analysis', icon: Globe, source: 'World Bank · RBI · IMF' },
  { label: 'Geospatial', icon: MapPin, source: 'Mapbox · OpenStreetMap' },
  { label: 'Transaction Registry', icon: Award, source: 'Land registries · County assessors' },
];

interface CinematicWalkthroughProps {
  onEnterExperience: () => void;
}

/**
 * Pinned scroll-driven cinematic experience with 7 camera positions.
 *
 * The entire container is pinned via ScrollTrigger while a master
 * GSAP timeline controls image crossfades, content reveals,
 * and data overlay animations based on a single progress value
 * (0 → 1 as the user scrolls through the pinned space).
 *
 * Built for the Zaha Hadid–inspired visual language:
 * slow, cinematic, editorial, minimal UI during movement.
 */
export function CinematicWalkthrough({ onEnterExperience }: CinematicWalkthroughProps) {
  const navigate = useNavigate();
  const sceneData = useWalkthroughData();

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  // Which camera position is currently active (for UI highlights)
  const [activeIndex, setActiveIndex] = useState(0);

  // India aggregate data
  const india = COUNTRIES.find(c => c.code === 'IN');
  const indiaCities = CITIES.IN || [];
  const indiaMetrics = {
    cities: indiaCities.length,
    avgConfidence: indiaCities.length > 0
      ? Math.round(indiaCities.reduce((s, c) => s + c.confidence, 0) / indiaCities.length)
      : 0,
    avgGrowth: indiaCities.length > 0
      ? (indiaCities.reduce((s, c) => s + c.priceTrend, 0) / indiaCities.length).toFixed(1)
      : '0',
    totalProjects: indiaCities.reduce((s, c) => s + c.activeProjects, 0),
    risingCities: indiaCities.filter(c => c.priceTrend > 10).length,
  };

  // ─── GSAP Master Timeline ─────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    const pinWrap = pinWrapRef.current;
    if (!container || !pinWrap) return;

    const ctx = gsap.context(() => {
      // ── Pin the entire experience ──────────────────────
      // The container takes 700vh of scroll space but the
      // visible content stays fixed while the camera moves.
      ScrollTrigger.create({
        trigger: container,
        pin: true,
        start: 'top top',
        end: '+=700%',
        scrub: 1.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          // Update active camera position index
          const p = self.progress;
          let idx = 0;
          for (let i = 0; i < CAMERA_POSITIONS.length; i++) {
            if (p >= CAMERA_POSITIONS[i].range[0] && p < CAMERA_POSITIONS[i].range[1]) {
              idx = i;
              break;
            }
            if (i === CAMERA_POSITIONS.length - 1 && p >= CAMERA_POSITIONS[i].range[0]) {
              idx = i;
            }
          }
          setActiveIndex(idx);
        },
      });

      // ── Image crossfade layer ──────────────────────────
      // Each image is absolutely positioned. Only one is
      // visible at a time based on progress.
      CAMERA_POSITIONS.forEach((pos, i) => {
        const img = pinWrap.querySelector(`.cam-img-${i}`) as HTMLElement;
        if (!img) return;

        // Image is visible during its range + a brief overlap
        const fadeIn = pos.range[0] - 0.04;
        const fadeOut = pos.range[1] + 0.04;

        gsap.fromTo(img,
          { opacity: 0, scale: 1.08 },
          {
            opacity: 1,
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: container,
              start: `top top+=${fadeIn * 700}%`,
              end: `top top+=${(fadeIn + 0.06) * 700}%`,
              scrub: 1.5,
            },
          }
        );

        gsap.to(img, {
          opacity: 0,
          scale: 0.96,
          ease: 'power2.in',
          scrollTrigger: {
            trigger: container,
            start: `top top+=${(fadeOut - 0.06) * 700}%`,
            end: `top top+=${fadeOut * 700}%`,
            scrub: 1.5,
          },
        });
      });

      // ── Content overlay per position ────────────────────
      CAMERA_POSITIONS.forEach((pos, i) => {
        const content = pinWrap.querySelector(`.cam-content-${i}`) as HTMLElement;
        if (!content) return;

        // Content visible during the middle 60% of its range
        const contentStart = pos.range[0] + 0.02;
        const contentEnd = pos.range[1] - 0.02;

        gsap.fromTo(content,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: container,
              start: `top top+=${contentStart * 700}%`,
              end: `top top+=${(contentStart + 0.05) * 700}%`,
              scrub: 1.5,
            },
          }
        );

        gsap.to(content, {
          opacity: 0,
          y: -20,
          ease: 'power3.in',
          scrollTrigger: {
            trigger: container,
            start: `top top+=${(contentEnd - 0.03) * 700}%`,
            end: `top top+=${contentEnd * 700}%`,
            scrub: 1.5,
          },
        });
      });

      // ── Data overlays (metrics + annotations) ──────────
      CAMERA_POSITIONS.forEach((pos, i) => {
        const metrics = pinWrap.querySelector(`.cam-metrics-${i}`) as HTMLElement;
        const annotation = pinWrap.querySelector(`.cam-annot-${i}`) as HTMLElement;
        const evidence = pinWrap.querySelector('.cam-evidence') as HTMLElement;

        // Metrics: appear during position range
        if (metrics) {
          gsap.fromTo(metrics,
            { opacity: 0, x: 20 },
            {
              opacity: 1,
              x: 0,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: container,
                start: `top top+=${(pos.range[0] + 0.03) * 700}%`,
                end: `top top+=${(pos.range[0] + 0.08) * 700}%`,
                scrub: 1.5,
              },
            }
          );
          gsap.to(metrics, {
            opacity: 0,
            x: -10,
            ease: 'power3.in',
            scrollTrigger: {
              trigger: container,
              start: `top top+=${(pos.range[1] - 0.04) * 700}%`,
              end: `top top+=${(pos.range[1] - 0.01) * 700}%`,
              scrub: 1.5,
            },
          });
        }

        // Annotation: appear slightly later
        if (annotation) {
          gsap.fromTo(annotation,
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: container,
                start: `top top+=${(pos.range[0] + 0.05) * 700}%`,
                end: `top top+=${(pos.range[0] + 0.1) * 700}%`,
                scrub: 1.5,
              },
            }
          );
          gsap.to(annotation, {
            opacity: 0,
            y: -10,
            ease: 'power3.in',
            scrollTrigger: {
              trigger: container,
              start: `top top+=${(pos.range[1] - 0.04) * 700}%`,
              end: `top top+=${(pos.range[1] - 0.01) * 700}%`,
              scrub: 1.5,
            },
          });
        }

        // Evidence chamber — only in penthouse position (70-85%)
        if (evidence && i === 5) {
          gsap.fromTo(evidence,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: container,
                start: `top top+=${0.72 * 700}%`,
                end: `top top+=${0.76 * 700}%`,
                scrub: 1.5,
              },
            }
          );
          gsap.to(evidence, {
            opacity: 0,
            ease: 'power3.in',
            scrollTrigger: {
              trigger: container,
              start: `top top+=${0.83 * 700}%`,
              end: `top top+=${0.85 * 700}%`,
              scrub: 1.5,
            },
          });
        }

        // India data badges — visible during lobby + corridor (25-70%)
        const indiaData = pinWrap.querySelector('.cam-india-data') as HTMLElement;
        if (indiaData) {
          gsap.fromTo(indiaData,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: container,
                start: `top top+=${0.27 * 700}%`,
                end: `top top+=${0.32 * 700}%`,
                scrub: 1.5,
              },
            }
          );
          gsap.to(indiaData, {
            opacity: 0,
            ease: 'power3.in',
            scrollTrigger: {
              trigger: container,
              start: `top top+=${0.67 * 700}%`,
              end: `top top+=${0.70 * 700}%`,
              scrub: 1.5,
            },
          });
        }
      });

      // ── Final CTA section ──────────────────────────────
      const cta = pinWrap.querySelector('.cam-cta') as HTMLElement;
      if (cta) {
        gsap.fromTo(cta,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: container,
              start: `top top+=${0.89 * 700}%`,
              end: `top top+=${0.94 * 700}%`,
              scrub: 1.5,
            },
          }
        );
      }

      // ── Attribution / footer ───────────────────────────
      const attr = pinWrap.querySelector('.cam-attribution') as HTMLElement;
      if (attr) {
        gsap.fromTo(attr,
          { opacity: 0 },
          {
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: container,
              start: `top top+=${0.92 * 700}%`,
              end: `top top+=${0.95 * 700}%`,
              scrub: 1.5,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative bg-[#050505]">
      {/* ─── Pinned wrapper (visible during scroll) ──────── */}
      <div ref={pinWrapRef} className="relative w-full h-screen overflow-hidden">
        {/* ─── Background images (camera positions) ──────── */}
        {CAMERA_POSITIONS.map((pos, i) => (
          <div
            key={pos.id}
            className={cn(
              'cam-img-' + i,
              'absolute inset-0 w-full h-full',
              'will-change-transform will-change-opacity'
            )}
          >
            <img
              src={pos.image}
              alt=""
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-[#050505]/20 to-[#050505]/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/30 via-transparent to-[#050505]/30" />
          </div>
        ))}

        {/* ─── Position label — top left (always visible) ── */}
        <div className="absolute top-8 left-6 sm:left-10 lg:left-16 z-20 pointer-events-none">
          <motion.span
            key={activeIndex}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="editorial-label"
          >
            {CAMERA_POSITIONS[activeIndex]?.label || ''}
          </motion.span>
        </div>

        {/* ─── Progress indicator — left rail ─────────────── */}
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          {CAMERA_POSITIONS.map((pos, i) => (
            <div key={pos.id} className="flex items-center gap-2 group">
              <div
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all duration-500',
                  i === activeIndex
                    ? 'bg-luxury-gold-400 scale-125'
                    : 'bg-white/15 group-hover:bg-white/30'
                )}
              />
              <span className={cn(
                'text-[8px] font-mono tracking-[0.15em] uppercase transition-all duration-300',
                i === activeIndex
                  ? 'text-white/60'
                  : 'text-white/0 group-hover:text-white/30'
              )}>
                {pos.label.split('·')[1]?.trim() || ''}
              </span>
            </div>
          ))}
        </div>

        {/* ─── Content overlays per camera position ──────── */}
        {CAMERA_POSITIONS.map((pos, i) => {
          const data = sceneData[pos.dataIndex];
          return (
            <div
              key={`content-${pos.id}`}
              className={cn(
                'cam-content-' + i,
                'absolute bottom-20 sm:bottom-24 lg:bottom-28',
                'left-6 sm:left-10 lg:left-16 right-6 sm:right-10 lg:right-16',
                'z-20 max-w-2xl pointer-events-none'
              )}
            >
              <h2 className="heading-lg text-white mb-3 font-display">
                {pos.title}
              </h2>
              <p className="body-md text-gray-400 max-w-xl leading-relaxed">
                {pos.body}
              </p>
            </div>
          );
        })}

        {/* ─── Data metrics strip (per position) ──────────── */}
        {CAMERA_POSITIONS.map((pos, i) => {
          const data = sceneData[pos.dataIndex];
          if (!data?.metrics) return null;
          return (
            <div
              key={`metrics-${pos.id}`}
              className={cn(
                'cam-metrics-' + i,
                'absolute top-16 sm:top-20 lg:top-24',
                'right-6 sm:right-10 lg:right-16',
                'z-20 flex items-center gap-4 sm:gap-6'
              )}
            >
              {data.metrics.map((m) => (
                <div key={m.label} className="text-right">
                  <p className="text-sm sm:text-base lg:text-lg font-display font-semibold text-luxury-gold-300">
                    {m.value}
                  </p>
                  <p className="text-[8px] sm:text-[9px] text-gray-500 font-mono tracking-[0.1em] uppercase">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          );
        })}

        {/* ─── Architectural annotation (per position) ────── */}
        {CAMERA_POSITIONS.map((pos, i) => {
          const data = sceneData[pos.dataIndex];
          if (!data?.annotation) return null;
          const isLeft = i % 2 === 0;
          return (
            <div
              key={`annot-${pos.id}`}
              className={cn(
                'cam-annot-' + i,
                'absolute z-20',
                isLeft ? 'left-[6%] sm:left-[8%]' : 'right-[6%] sm:right-[8%]',
                i < 3 ? 'bottom-[12%]' : 'top-[15%]'
              )}
            >
              <div className="arch-annotation-gold flex-col items-start gap-1 p-2.5 sm:p-3 min-w-[180px] sm:min-w-[220px]">
                <span className="editorial-label text-[7px] sm:text-[8px] text-luxury-gold-400/60">
                  {data.annotation.label}
                </span>
                <span className="text-xs sm:text-sm font-medium text-white leading-tight">
                  {data.annotation.value}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 leading-tight">
                  {data.annotation.detail}
                </span>
              </div>
              <div className={cn(
                'w-px h-5 bg-gradient-to-b from-luxury-gold-500/30 to-transparent',
                isLeft ? 'ml-3' : 'mr-3 ml-auto'
              )} />
            </div>
          );
        })}

        {/* ─── Evidence Chamber — exclusive to position 5 ─── */}
        <div className="cam-evidence absolute bottom-32 sm:bottom-36 left-6 sm:left-10 lg:left-16 z-20 max-w-xl">
          <div className="flex flex-wrap gap-2">
            {EVIDENCE_ITEMS.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm"
                >
                  <Icon className="w-3 h-3 text-luxury-gold-400/60" />
                  <span className="text-[8px] sm:text-[9px] text-gray-400 font-mono">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── India data badges — lobby position ──────────── */}
        <div className="absolute top-1/3 right-6 sm:right-10 lg:right-16 z-20 cam-india-data">
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
              <Target className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] text-emerald-300 font-mono">{indiaMetrics.cities} Indian Cities Tracked</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
              <BarChart3 className="w-3 h-3 text-luxury-gold-400" />
              <span className="text-[9px] text-luxury-gold-300 font-mono">{indiaMetrics.avgGrowth}% Avg Price Growth</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
              <Building2 className="w-3 h-3 text-blue-400" />
              <span className="text-[9px] text-blue-300 font-mono">{indiaMetrics.totalProjects} Active Projects</span>
            </span>
          </div>
        </div>

        {/* ─── Final CTA ───────────────────────────────────── */}
        <div className="cam-cta absolute inset-0 z-30 flex items-center justify-center bg-[#050505]/60 backdrop-blur-sm">
          <div className="text-center max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 py-20">
            <span className="editorial-label text-luxury-gold-400/60 mb-6 block">
              07 · Enter the Platform
            </span>
            <h2 className="heading-xl text-white mb-6">
              Intelligence for India's Most Valuable Buildings.
            </h2>
            <p className="body-lg text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed">
              LeadLuxe analyzes verified RERA data, infrastructure activity, capital flows, developer momentum, and market signals across India to identify high-probability real-estate opportunities — surfaced before traditional portals recognize them.
            </p>

            {/* Credibility strip */}
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
          </div>
        </div>

        {/* ─── Attribution — bottom right ──────────────────── */}
        <div className="cam-attribution absolute bottom-6 right-6 sm:right-10 lg:right-16 z-20">
          <div className="text-right space-y-0.5">
            <p className="text-[8px] text-white/10 font-mono">
              Sources: MahaRERA · State RERA Portals · HM Land Registry · World Bank · JLL · CBRE · Knight Frank
            </p>
            <p className="text-[8px] text-white/[0.07] font-mono">
              Architectural imagery sourced from Unsplash · Licensed for commercial use
            </p>
          </div>
        </div>
      </div>

      {/* ─── Spacer for scroll height ──────────────────────── */}
      {/* The container takes 700% scroll height (default views = 7) */}
      <div className="h-[700vh] pointer-events-none" />
    </div>
  );
}
