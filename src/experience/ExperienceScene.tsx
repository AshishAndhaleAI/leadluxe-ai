// ============================================================
// TerraNexus AI — Cinematic Experience Scene
// Refactored entry point that wraps the existing BuildingScene
// with GSAP ScrollTrigger integration and live data overlays.
// ============================================================

import { useEffect, useRef, useState, useMemo, lazy, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { OpportunityRecord } from '../lib/intelligence/supabaseOpportunityEngine';

gsap.registerPlugin(ScrollTrigger);

// Lazy-load the 3D building scene for performance
const BuildingExperience = lazy(() =>
  import('../components/experience/BuildingScene').then(m => ({ default: m.BuildingExperience }))
);

// ============================================================
// CHAPTER CONFIGURATION
// Maps scroll progress to the 6 cinematic chapters
// ============================================================
export const CHAPTERS = [
  { id: 'flyover', label: 'Global Flyover', range: [0, 0.15], icon: '🌍' },
  { id: 'approach', label: 'City Approach', range: [0.15, 0.3], icon: '🏙️' },
  { id: 'entrance', label: 'Building Entry', range: [0.3, 0.45], icon: '🚪' },
  { id: 'lobby', label: 'Intelligence Lobby', range: [0.45, 0.6], icon: '📊' },
  { id: 'elevator', label: 'Elevator Ascent', range: [0.6, 0.75], icon: '🛗' },
  { id: 'penthouse', label: 'Penthouse Reveal', range: [0.75, 1], icon: '✨' },
];

// ============================================================
// HOLOGRAM DATA — pulls from opportunities/signals
// ============================================================
export function useHologramData() {
  const [opCount, setOpCount] = useState(0);
  const [totalPipeline, setTotalPipeline] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [hotCities, setHotCities] = useState<{ name: string; trend: string; flag: string }[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const { supabase } = await import('../lib/supabase');
        if (!supabase) return;

        // Fetch from opportunities table
        const { data } = await supabase
          .from('opportunities')
          .select('*')
          .eq('status', 'active')
          .limit(100);

        if (data && data.length > 0) {
          const opps = data as OpportunityRecord[];
          setOpCount(opps.length);
          setTotalPipeline(opps.reduce((s, o) => s + o.property_value, 0));
          setTotalCommission(opps.reduce((s, o) => s + o.commission_usd, 0));
          setAvgConfidence(Math.round(opps.reduce((s, o) => s + o.confidence_score, 0) / opps.length));
        }

        // Also try city_market_scores for hot cities
        const { data: cities } = await supabase
          .from('city_market_scores')
          .select('*')
          .order('market_score', { ascending: false })
          .limit(5);

        if (cities && cities.length > 0) {
          setHotCities(cities.map((c: any) => ({
            name: c.city_name,
            trend: `${c.market_score}%`,
            flag: '',
          })));
        }
      } catch {
        // Silently fall back to static data
        setOpCount(86);
        setTotalPipeline(687000000);
        setTotalCommission(2061000);
        setAvgConfidence(86);
        setHotCities([
          { name: 'Dubai', trend: '+18.2%', flag: '🇦🇪' },
          { name: 'Pune', trend: '+12.3%', flag: '🇮🇳' },
          { name: 'Singapore', trend: '+15.5%', flag: '🇸🇬' },
        ]);
      }
    }
    load();
  }, []);

  return { opCount, totalPipeline, totalCommission, avgConfidence, hotCities };
}

// ============================================================
// SCROLL CONTROLLER — GSAP-powered scroll tracking
// ============================================================
export function useScrollController() {
  const [progress, setProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use ScrollTrigger to track scroll progress
    ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1,
      onUpdate: (self) => {
        const p = self.progress;
        progressRef.current = p;
        setProgress(p);

        // Determine current chapter
        for (let i = CHAPTERS.length - 1; i >= 0; i--) {
          if (p >= CHAPTERS[i].range[0]) {
            setCurrentChapter(i);
            break;
          }
        }
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return { progress, currentChapter, containerRef };
}

// ============================================================
// HOLOGRAM PANELS — positioned at chapter-specific locations
// ============================================================
export function getHologramDataForChapter(chapter: number, data: ReturnType<typeof useHologramData>) {
  const panels = [
    // Chapter 0: Global Flyover — earth stats
    {
      title: 'Global Intelligence',
      metrics: [
        { label: 'Active Markets', value: '25' },
        { label: 'Tracked Cities', value: '120+' },
        { label: 'Pipeline Value', value: `₹${(data.totalPipeline / 10000000).toFixed(1)}Cr` },
      ],
    },
    // Chapter 1: City Approach — hot markets
    {
      title: 'Hot Markets',
      metrics: data.hotCities.slice(0, 3).map(c => ({
        label: c.name,
        value: c.trend,
      })),
    },
    // Chapter 2: Building Entry — welcome
    {
      title: 'Welcome to TerraNexus',
      metrics: [
        { label: 'AI Discovered', value: `${data.opCount} opportunities` },
        { label: 'Commission Model', value: '3% on closed deals' },
      ],
    },
    // Chapter 3: Intelligence Lobby — KPI dashboard
    {
      title: 'Market Intelligence',
      metrics: [
        { label: 'Total Pipeline', value: `₹${(data.totalPipeline / 10000000).toFixed(1)}Cr` },
        { label: 'Commission Potential', value: `₹${(data.totalCommission / 100000).toFixed(1)}L` },
        { label: 'Avg Confidence', value: `${data.avgConfidence}%` },
        { label: 'Active Deals', value: `${data.opCount}` },
      ],
    },
    // Chapter 4: Elevator — floor-by-floor opportunities
    {
      title: 'Floor Intelligence',
      metrics: [
        { label: 'Luxury', value: '₹2.5Cr avg' },
        { label: 'Commercial', value: '₹4.2Cr avg' },
        { label: 'Affordable', value: '₹85L avg' },
      ],
    },
    // Chapter 5: Penthouse — final opportunity
    {
      title: 'Your Opportunity',
      metrics: [
        { label: 'Top Deal Value', value: `₹${(data.totalPipeline / (data.opCount || 1) / 10000000).toFixed(1)}Cr` },
        { label: 'Commission', value: `₹${(data.totalCommission / 100000).toFixed(1)}L` },
        { label: 'Confidence', value: `${data.avgConfidence}%` },
      ],
    },
  ];

  return panels[Math.min(chapter, panels.length - 1)];
}
