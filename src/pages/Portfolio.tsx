// ============================================================
// LeadLuxe AI — My Portfolio
// Aggregate view of saved deals, favorites, and tracked
// commissions with pipeline analytics and revenue tracking.
// ============================================================

import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Building2, Heart, Percent, TrendingUp, DollarSign,
  Target, ArrowUpRight, Clock, CheckCircle, X, MapPin,
  Star, Zap, FileText, Trash2, ExternalLink, ChevronRight,
  BarChart3, PieChart, Activity, Award, Bot, Lightbulb,
  Send, Phone, Calendar, MessageSquare, AlertTriangle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getPropertyDatabase } from '../lib/property-database';
import type { Property } from '../lib/property-database';
import { getCoachPreferences, type CoachPreferences } from '../lib/coach-preferences';
import { useAuth } from '../context/AuthContext';

// ============================================================
// HELPERS
// ============================================================

function formatPrice(price: number, cc: string): string {
  if (cc === 'IN') {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  }
  const syms: Record<string, string> = { AE: 'AED ', GB: '£', SG: 'S$', SA: 'SAR ', JP: '¥', KR: '₩', TH: '฿', VN: '₫', TR: '₺', ES: '€', IT: '€', DE: '€', FR: '€', NL: '€', CA: 'C$', AU: 'A$', MY: 'RM', QA: 'QAR ', BR: 'R$', MX: 'Mex$', ZA: 'R', NG: '₦', EG: 'E£' };
  return `${syms[cc] || '$'}${price >= 1000000 ? (price / 1000000).toFixed(2) + 'M' : price.toLocaleString()}`;
}

function getFlag(code: string): string {
  const map: Record<string, string> = { IN: '🇮🇳', AE: '🇦🇪', US: '🇺🇸', GB: '🇬🇧', SG: '🇸🇬', SA: '🇸🇦', DE: '🇩🇪', FR: '🇫🇷', JP: '🇯🇵', KR: '🇰🇷', TH: '🇹🇭', VN: '🇻🇳', BR: '🇧🇷', MX: '🇲🇽', TR: '🇹🇷', ES: '🇪🇸', IT: '🇮🇹', CA: '🇨🇦', AU: '🇦🇺', MY: '🇲🇾', QA: '🇶🇦', NL: '🇳🇱', ZA: '🇿🇦', NG: '🇳🇬', EG: '🇪🇬' };
  return map[code] || '🌍';
}

interface SavedDeal {
  id: string;
  propertyId: string;
  propertyName: string;
  developerName: string;
  city: string;
  country: string;
  countryCode: string;
  priceMin: number;
  priceMax: number;
  estimatedCommission: number;
  currency: string;
  currencySymbol: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  message: string;
  status: string;
  createdAt: string;
}

type PortfolioTab = 'overview' | 'deals' | 'favorites' | 'analytics' | 'coach';

// ============================================================
// AI DEAL COACH — Recommendation Engine
// ============================================================

interface CoachRecommendation {
  id: string;
  dealId: string;
  propertyName: string;
  developerName: string;
  city: string;
  country: string;
  countryCode: string;
  commission: number;
  currency: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  priorityScore: number;
  category: 'contact' | 'follow_up' | 'site_visit' | 'negotiation' | 'closing' | 'stale' | 'research';
  action: string;
  reasoning: string;
  tip: string;
  channel?: 'email' | 'phone' | 'whatsapp' | 'meeting';
  timeline: 'today' | 'this_week' | 'this_month' | 'flexible';
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  daysSinceCreation: number;
  dealStatus: string;
}

function generateCoachRecommendations(deals: SavedDeal[], prefs?: CoachPreferences): CoachRecommendation[] {
  const p = prefs || getCoachPreferences();
  const recommendations: CoachRecommendation[] = [];
  const now = Date.now();

  for (const deal of deals) {
    const createdAt = new Date(deal.createdAt).getTime();
    const daysSinceCreation = Math.round((now - createdAt) / (1000 * 60 * 60 * 24));
    const commissionValue = deal.estimatedCommission;
    const countryCode = deal.countryCode || 'IN';

    // Skip deals below minimum commission threshold
    if (commissionValue < p.minCommissionThreshold) continue;

    // Skip completed/lost deals unless user wants to see them
    if (!p.showCompletedDeals && (deal.status === 'closed' || deal.status === 'lost')) continue;

    // Determine the best channel from user's preferences
    const topChannel = p.preferredChannels[0] || 'email';
    const altChannel = p.preferredChannels[1] || 'phone';

    // Map coaching style/tone to prefix and framing
    const stylePrefix = (() => {
      if (p.style === 'friendly' && p.tone === 'conversational') return 'Hey! ';
      if (p.style === 'motivational') return 'Let\'s go! ';
      if (p.style === 'professional' && p.tone === 'formal') return 'Recommendation: ';
      if (p.tone === 'urgent') return 'Action required: ';
      return '';
    })();

    const urgencyAdverb = (() => {
      if (p.tone === 'urgent') return 'immediately';
      if (p.tone === 'formal') return 'at your earliest convenience';
      if (p.tone === 'encouraging') return 'when you\'re ready';
      return 'soon';
    })();

    const channelLabel = (() => {
      const map: Record<string, string> = { email: 'send an email', phone: 'make a call', whatsapp: 'send a WhatsApp message', meeting: 'schedule a meeting' };
      const primary = map[topChannel] || 'reach out';
      const alt = map[altChannel] || 'follow up';
      return { primary, alt };
    })();

    // Base priority score from commission value
    const commissionScore = Math.min(commissionValue / 1000000, 1) * 30;

    switch (deal.status) {
      case 'new': {
        // Urgency increases with days since creation — use user's stale threshold
        const urgencyScore = Math.min(daysSinceCreation / p.staleThresholdDays, 1) * 40;
        const priorityScore = commissionScore + urgencyScore + 20;
        const isStale = daysSinceCreation > p.staleThresholdDays;

        const action = isStale
          ? `${stylePrefix}Urgent: Contact ${deal.contactName} about ${deal.propertyName} — idle for ${daysSinceCreation} days`
          : `${stylePrefix}Reach out to ${deal.contactName} about ${deal.propertyName} in ${deal.city}`;

        const reasoning = isStale
          ? `This deal has been idle for ${daysSinceCreation} days. ${deal.contactName}'s interest may be cooling. ${p.tone === 'urgent' ? 'Contact them today before they explore other options.' : 'A timely follow-up can re-engage them before they explore other options.'}`
          : `${deal.contactName} expressed interest ${daysSinceCreation === 0 ? 'today' : `${daysSinceCreation} days ago`}. Quick outreach now builds momentum and shows professionalism.`;

        const tip = isStale
          ? (p.style === 'friendly' ? 'Try a warm re-engagement message: "Hey, just checking in! We have some exciting updates on this project."' :
             p.style === 'motivational' ? 'Don\'t let this deal slip away! Send a limited-time offer and light a fire under this lead.' :
             'Send a re-engagement message with updated information or a time-sensitive update to spark renewed interest.')
          : (p.style === 'friendly' ? 'Lead with a friendly greeting and reference their expressed interest. Keep it light and helpful!' :
             p.style === 'professional' ? 'Open with a value proposition: reference their specific interest and offer 2-3 relevant insights about the property.' :
             'Lead with value: share why this property matches their needs. Reference their message in your outreach.')

        recommendations.push({
          id: `coach-new-${deal.id}`,
          dealId: deal.id,
          propertyName: deal.propertyName,
          developerName: deal.developerName,
          city: deal.city,
          country: deal.country,
          countryCode,
          commission: commissionValue,
          currency: deal.currency,
          priority: priorityScore >= 70 ? 'critical' : priorityScore >= 50 ? 'high' : 'medium',
          priorityScore,
          category: isStale ? 'stale' : 'contact',
          action,
          reasoning,
          tip,
          channel: topChannel,
          timeline: isStale ? 'today' : 'today',
          contactName: deal.contactName,
          contactEmail: deal.contactEmail,
          contactPhone: deal.contactPhone,
          daysSinceCreation,
          dealStatus: deal.status,
        });
        break;
      }

      case 'contacted': {
        const daysSinceContact = Math.max(daysSinceCreation - 1, 0);
        const urgencyScore = Math.min(daysSinceContact / Math.max(p.staleThresholdDays - 1, 1), 1) * 35;
        const priorityScore = commissionScore + urgencyScore + 15;
        const needsFollowUp = daysSinceContact > Math.max(p.staleThresholdDays - 2, 1);

        const action = needsFollowUp
          ? `${stylePrefix}Follow up with ${deal.contactName} — no response in ${daysSinceContact} days`
          : `${stylePrefix}Deepen the conversation with ${deal.contactName} — ${channelLabel.primary} now`;

        const reasoning = needsFollowUp
          ? `You contacted ${deal.contactName} ${daysSinceContact} days ago but the deal hasn't progressed. ${p.tone === 'urgent' ? 'Follow up today.' : 'A gentle nudge with fresh information could re-ignite their interest.'}`
          : `${deal.contactName} has been contacted. Now qualify their timeline and budget. Ask about their move-in date and financing to identify any blockers.`;

        const tip = needsFollowUp
          ? (p.style === 'friendly' ? 'Try a different approach — maybe a quick call or a WhatsApp message this time. Keep it personal!' :
             `Try a different channel — ${channelLabel.alt} instead of ${channelLabel.primary} to break through the noise.`)
          : (p.style === 'friendly' ? 'Ask friendly questions: "What drew you to this property?" and "What would help you decide?"' :
             'Ask discovery questions to qualify: budget timeline, financing status, and decision criteria.');

        recommendations.push({
          id: `coach-follow-${deal.id}`,
          dealId: deal.id,
          propertyName: deal.propertyName,
          developerName: deal.developerName,
          city: deal.city,
          country: deal.country,
          countryCode,
          commission: commissionValue,
          currency: deal.currency,
          priority: needsFollowUp ? 'high' : priorityScore >= 55 ? 'high' : 'medium',
          priorityScore,
          category: 'follow_up',
          action,
          reasoning,
          tip,
          channel: needsFollowUp ? altChannel : topChannel,
          timeline: needsFollowUp ? 'today' : 'this_week',
          contactName: deal.contactName,
          contactEmail: deal.contactEmail,
          contactPhone: deal.contactPhone,
          daysSinceCreation,
          dealStatus: deal.status,
        });
        break;
      }

      case 'qualified': {
        const priorityScore = commissionScore + 40;
        recommendations.push({
          id: `coach-site-${deal.id}`,
          dealId: deal.id,
          propertyName: deal.propertyName,
          developerName: deal.developerName,
          city: deal.city,
          country: deal.country,
          countryCode,
          commission: commissionValue,
          currency: deal.currency,
          priority: priorityScore >= 65 ? 'high' : 'medium',
          priorityScore,
          category: 'site_visit',
          action: `${stylePrefix}Schedule a site visit for ${deal.contactName} at ${deal.propertyName}`,
          reasoning: `${deal.contactName} is a qualified lead for ${deal.propertyName}. A physical site visit is the highest-conversion activity. ${p.style === 'friendly' ? 'Let\'s make it happen!' : 'Coordinate with the sales team to arrange a guided tour.'}`,
          tip: p.style === 'friendly'
            ? 'Make it easy for them — offer to arrange transportation or a virtual tour if they\'re busy. A little hospitality goes a long way!'
            : 'Prepare a comparison sheet showing 2-3 similar properties in the area. Offer transportation to reduce friction.',
          channel: 'meeting',
          timeline: 'this_week',
          contactName: deal.contactName,
          contactEmail: deal.contactEmail,
          contactPhone: deal.contactPhone,
          daysSinceCreation,
          dealStatus: deal.status,
        });
        break;
      }

      case 'site_visit': {
        const priorityScore = commissionScore + 45;
        const daysSinceVisit = Math.max(daysSinceCreation - 3, 0);
        const visitUrgentThreshold = Math.max(p.staleThresholdDays + 2, 7);

        recommendations.push({
          id: `coach-neg-${deal.id}`,
          dealId: deal.id,
          propertyName: deal.propertyName,
          developerName: deal.developerName,
          city: deal.city,
          country: deal.country,
          countryCode,
          commission: commissionValue,
          currency: deal.currency,
          priority: daysSinceVisit > visitUrgentThreshold ? 'critical' : priorityScore >= 60 ? 'high' : 'medium',
          priorityScore,
          category: 'negotiation',
          action: daysSinceVisit > visitUrgentThreshold
            ? `${stylePrefix}Follow up urgently — ${deal.contactName} visited ${daysSinceVisit} days ago`
            : `${stylePrefix}Begin negotiation with ${deal.contactName} for ${deal.propertyName}`,
          reasoning: daysSinceVisit > visitUrgentThreshold
            ? `It's been ${daysSinceVisit} days since the site visit. ${p.tone === 'urgent' ? 'The lead is getting cold! Act now.' : 'Send a recap with photos and a time-sensitive offer to re-engage before interest fades.'}`
            : `The site visit is complete. ${deal.contactName} has seen the property firsthand. Now discuss payment plans and the booking process while the impression is fresh.`,
          tip: daysSinceVisit > visitUrgentThreshold
            ? (p.style === 'friendly' ? 'Send a photo from their visit with a personal note: "Remember this view? Let me share something special."' : 'Share a photo from their visit with a personalized message to re-engage emotionally.')
            : (p.style === 'professional' ? 'Prepare a side-by-side comparison vs competitors highlighting the unique advantages you discussed.' : 'Highlight the unique advantages you discussed during the visit. Address any concerns they raised.'),
          channel: altChannel,
          timeline: 'today',
          contactName: deal.contactName,
          contactEmail: deal.contactEmail,
          contactPhone: deal.contactPhone,
          daysSinceCreation,
          dealStatus: deal.status,
        });
        break;
      }

      case 'negotiation': {
        const priorityScore = commissionScore + 50;
        recommendations.push({
          id: `coach-close-${deal.id}`,
          dealId: deal.id,
          propertyName: deal.propertyName,
          developerName: deal.developerName,
          city: deal.city,
          country: deal.country,
          countryCode,
          commission: commissionValue,
          currency: deal.currency,
          priority: priorityScore >= 70 ? 'critical' : 'high',
          priorityScore,
          category: 'closing',
          action: `${stylePrefix}Push to close ${deal.propertyName} — commission of ${formatPrice(commissionValue, deal.currency)} at stake`,
          reasoning: `This deal is in negotiation with a potential commission of ${formatPrice(commissionValue, deal.currency)}. ${p.style === 'motivational' ? 'You\'re so close! Stay on top of every detail.' : 'Maintain momentum by being responsive to their concerns and facilitating communication with the developer.'}`,
          tip: p.style === 'motivational'
            ? 'Identify the top 3 objections and crush them one by one. Offer a limited-time add-on to tip the scale. Keep daily contact until signed!'
            : 'Identify top objections and prepare counter-arguments. Offer a limited-time add-on (upgrade package, free club membership) to encourage signing.',
          channel: topChannel,
          timeline: 'today',
          contactName: deal.contactName,
          contactEmail: deal.contactEmail,
          contactPhone: deal.contactPhone,
          daysSinceCreation,
          dealStatus: deal.status,
        });
        break;
      }

      case 'booked': {
        const priorityScore = commissionScore + 55;
        recommendations.push({
          id: `coach-booked-${deal.id}`,
          dealId: deal.id,
          propertyName: deal.propertyName,
          developerName: deal.developerName,
          city: deal.city,
          country: deal.country,
          countryCode,
          commission: commissionValue,
          currency: deal.currency,
          priority: priorityScore >= 75 ? 'critical' : 'high',
          priorityScore,
          category: 'closing',
          action: `${stylePrefix}Finalize booking — ${formatPrice(commissionValue, deal.currency)} commission`,
          reasoning: `The deal is booked! Your commission of ${formatPrice(commissionValue, deal.currency)} is within reach. ${p.style === 'motivational' ? 'Almost there! Push through the final steps.' : 'Confirm documentation, payment schedules, and developer acknowledgment.'}`,
          tip: p.style === 'friendly'
            ? 'Send a congratulations message and confirm everything is on track. Happy clients refer more clients!'
            : 'Confirm payment schedules with the developer. Send a congratulations message and request referrals.',
          channel: topChannel,
          timeline: 'today',
          contactName: deal.contactName,
          contactEmail: deal.contactEmail,
          contactPhone: deal.contactPhone,
          daysSinceCreation,
          dealStatus: deal.status,
        });
        break;
      }

      case 'closed': {
        const priorityScore = commissionScore;
        recommendations.push({
          id: `coach-closed-${deal.id}`,
          dealId: deal.id,
          propertyName: deal.propertyName,
          developerName: deal.developerName,
          city: deal.city,
          country: deal.country,
          countryCode,
          commission: commissionValue,
          currency: deal.currency,
          priority: 'medium',
          priorityScore,
          category: 'research',
          action: `${stylePrefix}Request a referral from ${deal.contactName} after ${deal.propertyName} closed`,
          reasoning: `This deal closed successfully. ${p.style === 'friendly' ? 'Congratulate them and ask for introductions to friends who might be looking.' : 'Satisfied clients are the best source of warm leads. Ask for referrals and a Google review.'}`,
          tip: 'Send a personalized thank-you note and a small gift. Follow up in 30 days to ask for referrals and reviews.',
          channel: 'email',
          timeline: 'this_month',
          contactName: deal.contactName,
          contactEmail: deal.contactEmail,
          contactPhone: deal.contactPhone,
          daysSinceCreation,
          dealStatus: deal.status,
        });
        break;
      }

      default:
        break;
    }
  }

  // Sort by priority score descending
  recommendations.sort((a, b) => b.priorityScore - a.priorityScore);

  return recommendations;
}

// ============================================================
// PORTFOLIO PAGE
// ============================================================

export function Portfolio() {
  const { user } = useAuth();
  const allProperties = useMemo(() => getPropertyDatabase(), []);
  const [activeTab, setActiveTab] = useState<PortfolioTab>('overview');
  const [syncVersion, setSyncVersion] = useState(0);

  // Load saved deals from localStorage
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>(() => {
    try { return JSON.parse(localStorage.getItem('leadluxe-deals') || '[]'); }
    catch { return []; }
  });

  // Load favorites from localStorage
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('leadluxe-favorites');
      return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    } catch { return new Set<string>(); }
  });

  // Resolve favorite properties
  const favoriteProperties = useMemo(() =>
    allProperties.filter(p => favoriteIds.has(p.id)),
    [allProperties, favoriteIds]
  );

  // Analytics computed from saved deals
  const dealAnalytics = useMemo(() => {
    const totalDeals = savedDeals.length;
    const totalCommission = savedDeals.reduce((s, d) => s + d.estimatedCommission, 0);
    const avgCommission = totalDeals > 0 ? totalCommission / totalDeals : 0;
    const totalPipelineValue = savedDeals.reduce((s, d) => s + (d.priceMin + d.priceMax) / 2, 0);
    const statusBreakdown = savedDeals.reduce<Record<string, number>>((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {});
    const newDeals = savedDeals.filter(d => d.status === 'new').length;
    const contactedDeals = savedDeals.filter(d => d.status === 'contacted').length;

    return { totalDeals, totalCommission, avgCommission, totalPipelineValue, statusBreakdown, newDeals, contactedDeals };
  }, [savedDeals]);

  // Favorites analytics
  const favoriteAnalytics = useMemo(() => {
    const count = favoriteProperties.length;
    const totalValue = favoriteProperties.reduce((s, p) => s + (p.price_min + p.price_max) / 2, 0);
    const totalCommission = favoriteProperties.reduce((s, p) => s + p.estimated_commission, 0);
    const countries = new Set(favoriteProperties.map(p => p.country));
    return { count, totalValue, totalCommission, countries: countries.size };
  }, [favoriteProperties]);

  // Combined stats
  const portfolioValue = useMemo(() =>
    dealAnalytics.totalPipelineValue + favoriteAnalytics.totalValue,
    [dealAnalytics.totalPipelineValue, favoriteAnalytics.totalValue]
  );

  const commissionForecast = useMemo(() =>
    dealAnalytics.totalCommission + favoriteAnalytics.totalCommission,
    [dealAnalytics.totalCommission, favoriteAnalytics.totalCommission]
  );

  // Status badge helper
  const statusBadge = (status: string): { label: string; color: string } => {
    const map: Record<string, { label: string; color: string }> = {
      new: { label: 'New', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
      contacted: { label: 'Contacted', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
      qualified: { label: 'Qualified', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
      site_visit: { label: 'Site Visit', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
      negotiation: { label: 'Negotiation', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
      booked: { label: 'Booked', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
      closed: { label: 'Closed', color: 'bg-luxury-gold-500/15 text-luxury-gold-400 border-luxury-gold-500/30' },
      lost: { label: 'Lost', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
    };
    return map[status] || { label: status, color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' };
  };

  const getNextStatus = (status: string): string => {
    const flow: Record<string, string> = {
      new: 'contacted',
      contacted: 'qualified',
      qualified: 'site_visit',
      site_visit: 'negotiation',
      negotiation: 'booked',
      booked: 'closed',
      closed: 'closed',
      lost: 'lost',
    };
    return flow[status] || status;
  };

  const getNextStatusLabel = (status: string): string => {
    const next = getNextStatus(status);
    return statusBadge(next).label;
  };

  const removeDeal = (id: string) => {
    const updated = savedDeals.filter(d => d.id !== id);
    localStorage.setItem('leadluxe-deals', JSON.stringify(updated));
    setSavedDeals(updated);
  };

  const updateDealStatus = (id: string, newStatus: string) => {
    const updated = savedDeals.map(d =>
      d.id === id ? { ...d, status: newStatus } : d
    );
    localStorage.setItem('leadluxe-deals', JSON.stringify(updated));
    setSavedDeals(updated);
  };

  const removeFavorite = (id: string) => {
    const next = new Set(favoriteIds);
    next.delete(id);
    localStorage.setItem('leadluxe-favorites', JSON.stringify([...next]));
    setFavoriteIds(next);
  };

  // AI Deal Coach — attempt to sync from Supabase on mount (cross-device)
  // so users who log in on a new device get their cloud preferences immediately
  // without needing to visit Settings first.
  useEffect(() => {
    if (!user?.id) return;
    const syncCloud = async () => {
      const { tryLoadFromSupabase } = await import('../lib/coach-preferences');
      const cloudPrefs = await tryLoadFromSupabase(user.id);
      if (cloudPrefs) {
        const { saveCoachPreferences } = await import('../lib/coach-preferences');
        saveCoachPreferences(cloudPrefs);
        // Force re-render by toggling a counter
        setSyncVersion(v => v + 1);
      }
    };
    syncCloud();
  }, [user?.id]);

  const coachRecommendations = useMemo(() =>
    generateCoachRecommendations(savedDeals, getCoachPreferences()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedDeals, syncVersion]
  );

  const criticalCount = useMemo(() =>
    coachRecommendations.filter(r => r.priority === 'critical').length,
    [coachRecommendations]
  );

  const tabs: { key: PortfolioTab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: Briefcase },
    { key: 'coach', label: criticalCount > 0 ? `AI Coach (${criticalCount})` : 'AI Coach', icon: Bot },
    { key: 'deals', label: `Deals (${savedDeals.length})`, icon: FileText },
    { key: 'favorites', label: `Favorites (${favoriteProperties.length})`, icon: Heart },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-luxury-gold-500/20 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-luxury-gold-400" />
            </div>
            <h1 className="text-xl font-bold text-white font-display">My Portfolio</h1>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl">
            Track your saved deals, favorite properties, and commission pipeline all in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-card px-3 py-1.5 text-center">
            <p className="text-[8px] text-gray-500 uppercase tracking-wider">Portfolio Value</p>
            <p className="text-sm font-bold text-luxury-gold-400">{formatPrice(portfolioValue, 'IN')}</p>
          </div>
          <div className="glass-card px-3 py-1.5 text-center">
            <p className="text-[8px] text-gray-500 uppercase tracking-wider">Potential Commission</p>
            <p className="text-sm font-bold text-emerald-400">{formatPrice(commissionForecast, 'IN')}</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Deals', value: savedDeals.length, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Favorites', value: favoriteProperties.length, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Pipeline Value', value: formatPrice(dealAnalytics.totalPipelineValue, 'IN'), icon: DollarSign, color: 'text-luxury-gold-400', bg: 'bg-luxury-gold-500/10' },
          { label: 'Commission Forecast', value: formatPrice(commissionForecast, 'IN'), icon: Percent, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Avg Commission/Deal', value: formatPrice(dealAnalytics.avgCommission, 'IN'), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'New (Needs Follow-up)', value: dealAnalytics.newDeals, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Countries Watching', value: favoriteAnalytics.countries, icon: MapPin, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Deal-to-Favorite Ratio', value: savedDeals.length > 0 ? `${Math.round(favoriteProperties.length / savedDeals.length * 100)}%` : '0%', icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="premium-card p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-3 h-3', stat.color)} />
              </div>
              <p className="text-[10px] text-gray-400">{stat.label}</p>
            </div>
            <p className={cn('text-lg font-bold', stat.color)}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all',
              activeTab === tab.key
                ? 'bg-luxury-gold-500/15 text-luxury-gold-400 border border-luxury-gold-500/20'
                : 'text-gray-400 hover:text-white border border-transparent'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Recent Deals */}
            <div className="premium-card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-luxury-gold-400" />
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Recent Deals</h2>
                </div>
                <button
                  onClick={() => setActiveTab('deals')}
                  className="text-[10px] text-luxury-gold-400 hover:text-luxury-gold-300 flex items-center gap-0.5"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {savedDeals.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-1">No deals yet</p>
                  <p className="text-[10px] text-gray-600">Express interest in a property from the Deal Room to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedDeals.slice(0, 5).map((deal, i) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          deal.status === 'new' ? 'bg-blue-500/10' :
                          deal.status === 'contacted' ? 'bg-purple-500/10' :
                          deal.status === 'booked' ? 'bg-emerald-500/10' :
                          'bg-gray-800'
                        )}>
                          <Building2 className={cn(
                            'w-4 h-4',
                            deal.status === 'new' ? 'text-blue-400' :
                            deal.status === 'contacted' ? 'text-purple-400' :
                            deal.status === 'booked' ? 'text-emerald-400' :
                            'text-gray-400'
                          )} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{deal.propertyName}</p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {deal.developerName} · {deal.city}, {getFlag(deal.countryCode || deal.currency)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-medium border', statusBadge(deal.status).color)}>
                          {statusBadge(deal.status).label}
                        </span>
                        <p className="text-xs font-bold text-emerald-400">{formatPrice(deal.estimatedCommission, deal.currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Commission Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="premium-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-luxury-gold-400" />
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Commission Pipeline</h2>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'New Deals', value: dealAnalytics.newDeals, commission: savedDeals.filter(d => d.status === 'new').reduce((s, d) => s + d.estimatedCommission, 0), color: 'bg-blue-500' },
                    { label: 'Contacted', value: dealAnalytics.contactedDeals, commission: savedDeals.filter(d => d.status === 'contacted').reduce((s, d) => s + d.estimatedCommission, 0), color: 'bg-purple-500' },
                    { label: 'Closing Soon', value: savedDeals.filter(d => ['negotiation', 'booked'].includes(d.status)).length, commission: savedDeals.filter(d => ['negotiation', 'booked'].includes(d.status)).reduce((s, d) => s + d.estimatedCommission, 0), color: 'bg-emerald-500' },
                    { label: 'Total Pipeline', value: savedDeals.length, commission: dealAnalytics.totalCommission, color: 'bg-luxury-gold-500' },
                  ].map((item, i) => (
                    <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', item.color)} />
                        <span className="text-[10px] text-gray-400">{item.label}</span>
                        <span className="text-[10px] text-gray-500">({item.value})</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">{formatPrice(item.commission, 'IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Distribution */}
              <div className="premium-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <PieChart className="w-4 h-4 text-luxury-gold-400" />
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Deal Status Distribution</h2>
                </div>
                {Object.keys(dealAnalytics.statusBreakdown).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-gray-500">No deals to analyze</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(dealAnalytics.statusBreakdown).map(([status, count], i) => {
                      const pct = Math.round(count / dealAnalytics.totalDeals * 100);
                      const badge = statusBadge(status);
                      return (
                        <div key={status}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-medium border', badge.color)}>
                                {badge.label}
                              </span>
                              <span className="text-[10px] text-gray-500">{count} deals</span>
                            </div>
                            <span className="text-[10px] font-bold text-white">{pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all', badge.color.split(' ')[0])}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'coach' && (
          <motion.div
            key="coach"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Coach Header */}
            <div className="premium-card p-4 bg-gradient-to-r from-gray-900 via-gray-900/80 to-luxury-gold-500/5 border-luxury-gold-500/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6 text-luxury-gold-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-bold text-white">AI Deal Coach</h2>
                    {criticalCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[9px] font-medium border border-red-500/20 animate-pulse">
                        {criticalCount} urgent
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {coachRecommendations.length === 0
                      ? 'Express interest in properties to receive AI-powered coaching and next-step recommendations.'
                      : `Analyzing ${savedDeals.length} deal${savedDeals.length > 1 ? 's' : ''} · ${criticalCount > 0 ? `${criticalCount} need${criticalCount > 1 ? '' : 's'} immediate attention` : 'All deals are on track'}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Priority Filter */}
            {coachRecommendations.length > 0 && (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Critical', count: coachRecommendations.filter(r => r.priority === 'critical').length, color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: 'High Priority', count: coachRecommendations.filter(r => r.priority === 'high').length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'Medium Priority', count: coachRecommendations.filter(r => r.priority === 'medium').length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Low Priority', count: coachRecommendations.filter(r => r.priority === 'low').length, color: 'text-gray-400', bg: 'bg-gray-500/10' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="premium-card p-3"
                    >
                      <p className="text-[10px] text-gray-500 mb-0.5">{item.label}</p>
                      <p className={cn('text-xl font-bold', item.color)}>{item.count}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Coaching Cards */}
                <div className="space-y-3">
                  {coachRecommendations.map((rec, i) => {
                    const categoryConfig = (() => {
                      const map: Record<string, { label: string; icon: React.ElementType; color: string }> = {
                        contact: { label: 'Contact Lead', icon: Send, color: 'text-blue-400' },
                        follow_up: { label: 'Follow Up', icon: MessageSquare, color: 'text-purple-400' },
                        site_visit: { label: 'Site Visit', icon: Calendar, color: 'text-amber-400' },
                        negotiation: { label: 'Negotiation', icon: Target, color: 'text-orange-400' },
                        closing: { label: 'Closing', icon: CheckCircle, color: 'text-emerald-400' },
                        stale: { label: 'Stale Deal', icon: AlertTriangle, color: 'text-red-400' },
                        research: { label: 'Research', icon: Lightbulb, color: 'text-indigo-400' },
                      };
                      return map[rec.category] || { label: 'Action', icon: Lightbulb, color: 'text-gray-400' };
                    })();

                    const priorityConfig = (() => {
                      const map: Record<string, { label: string; color: string; border: string }> = {
                        critical: { label: 'Critical', color: 'text-red-400 bg-red-500/10 border-red-500/20', border: 'border-l-red-500' },
                        high: { label: 'High Priority', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', border: 'border-l-amber-500' },
                        medium: { label: 'Medium Priority', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', border: 'border-l-blue-500' },
                        low: { label: 'Low Priority', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20', border: 'border-l-gray-500' },
                      };
                      return map[rec.priority] || map.low;
                    })();

                    const timelineLabel = (() => {
                      const map: Record<string, string> = {
                        today: 'Do Today',
                        this_week: 'Do This Week',
                        this_month: 'Do This Month',
                        flexible: 'Flexible',
                      };
                      return map[rec.timeline] || rec.timeline;
                    })();

                    return (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className={cn(
                          'premium-card p-4 border-l-4 overflow-hidden',
                          priorityConfig.border
                        )}
                      >
                        <div className="flex items-start gap-4">
                          {/* Category icon */}
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                            rec.priority === 'critical' ? 'bg-red-500/15' :
                            rec.priority === 'high' ? 'bg-amber-500/15' :
                            'bg-gray-800'
                          )}>
                            <categoryConfig.icon className={cn('w-5 h-5', categoryConfig.color)} />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <h3 className="text-xs font-bold text-white">{rec.action}</h3>
                                  <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-medium border', priorityConfig.color)}>
                                    {priorityConfig.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                  <span className="font-medium text-luxury-gold-400">{rec.propertyName}</span>
                                  <span>·</span>
                                  <span>{rec.developerName}</span>
                                  <span>·</span>
                                  <span>{rec.city}, {getFlag(rec.countryCode)}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-bold text-emerald-400">{formatPrice(rec.commission, rec.currency)}</p>
                                <p className={cn(
                                  'text-[8px] font-medium',
                                  rec.timeline === 'today' ? 'text-red-400' :
                                  rec.timeline === 'this_week' ? 'text-amber-400' :
                                  'text-gray-500'
                                )}>{timelineLabel}</p>
                              </div>
                            </div>

                            {/* Reasoning */}
                            <p className="text-[10px] text-gray-400 leading-relaxed mb-2">{rec.reasoning}</p>

                            {/* Coach Tip */}
                            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-luxury-gold-500/5 border border-luxury-gold-500/10 mb-3">
                              <Lightbulb className="w-3 h-3 text-luxury-gold-400 mt-0.5 shrink-0" />
                              <p className="text-[9px] text-gray-400 italic">
                                <span className="font-medium text-luxury-gold-400">AI Tip:</span> {rec.tip}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {rec.contactEmail && (
                                <a
                                  href={`mailto:${rec.contactEmail}?subject=Following up on ${rec.propertyName}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[9px] font-medium text-blue-400 hover:bg-blue-500/20 transition-colors"
                                >
                                  <Send className="w-3 h-3" />
                                  Send Email
                                </a>
                              )}
                              {rec.contactPhone && (
                                <a
                                  href={`tel:${rec.contactPhone}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                >
                                  <Phone className="w-3 h-3" />
                                  Call {rec.contactName.split(' ')[0]}
                                </a>
                              )}
                              {rec.category === 'site_visit' && (
                                <Link
                                  to="/deal-room"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[9px] font-medium text-amber-400 hover:bg-amber-500/20 transition-colors"
                                >
                                  <Calendar className="w-3 h-3" />
                                  Browse Properties
                                </Link>
                              )}
                              <button
                                onClick={() => updateDealStatus(rec.dealId, getNextStatus(rec.dealStatus))}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-luxury-gold-500/10 border border-luxury-gold-500/20 text-[9px] font-medium text-luxury-gold-400 hover:bg-luxury-gold-500/20 transition-colors"
                              >
                                <ArrowUpRight className="w-3 h-3" />
                                Move to {getNextStatusLabel(rec.dealStatus)}
                              </button>
                            </div>

                            {/* Deal info footer */}
                            <div className="flex items-center gap-3 mt-2 text-[8px] text-gray-600">
                              <span>{rec.daysSinceCreation === 0 ? 'Created today' : `${rec.daysSinceCreation} days ago`}</span>
                              <span>·</span>
                              <span>Contact: {rec.contactName}</span>
                              <span>·</span>
                              <span className="capitalize">Status: {statusBadge(rec.dealStatus).label}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Empty state */}
            {coachRecommendations.length === 0 && (
              <div className="premium-card p-8 text-center">
                <Bot className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white mb-1">No Coaching Yet</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Express interest in properties from the Deal Room to get AI-powered coaching. 
                  The Deal Coach analyzes your deal pipeline and provides actionable next steps 
                  for every lead.
                </p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <Link to="/deal-room" className="btn-primary text-xs">
                    Browse Properties
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'deals' && (
          <motion.div
            key="deals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {savedDeals.length === 0 ? (
              <div className="premium-card p-8 text-center">
                <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white mb-1">No Deals Yet</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Express interest in properties from the Deal Room to build your deal pipeline. 
                  Every interest you submit is saved here as a trackable deal.
                </p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <Link to="/deal-room" className="btn-primary text-xs">
                    Browse Properties
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {savedDeals.map((deal, i) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="premium-card p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-white">{deal.propertyName}</h3>
                          <select
                            value={deal.status}
                            onChange={(e) => updateDealStatus(deal.id, e.target.value)}
                            className={cn(
                              'px-1.5 py-0.5 rounded text-[8px] font-medium border cursor-pointer',
                              statusBadge(deal.status).color
                            )}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="site_visit">Site Visit</option>
                            <option value="negotiation">Negotiation</option>
                            <option value="booked">Booked</option>
                            <option value="closed">Closed</option>
                            <option value="lost">Lost</option>
                          </select>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-2">
                          {deal.developerName} · {deal.city}, {deal.country}
                        </p>

                        {/* Contact info */}
                        <div className="flex items-center gap-4 text-[10px] text-gray-500">
                          <span>👤 {deal.contactName}</span>
                          <span>📧 {deal.contactEmail}</span>
                          {deal.contactPhone && <span>📞 {deal.contactPhone}</span>}
                        </div>
                        {deal.message && (
                          <p className="text-[10px] text-gray-600 mt-1 italic">
                            "{deal.message.slice(0, 100)}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <div className="text-right">
                          <p className="text-[8px] text-gray-500">Property Range</p>
                          <p className="text-[10px] text-gray-400">{formatPrice(deal.priceMin, deal.currency)} - {formatPrice(deal.priceMax, deal.currency)}</p>
                          <p className="text-xs font-bold text-emerald-400 mt-0.5">{formatPrice(deal.estimatedCommission, deal.currency)}</p>
                          <p className="text-[8px] text-gray-600">commission</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => removeDeal(deal.id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-600 hover:text-red-400 transition-colors"
                            title="Remove deal"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[8px] text-gray-600">Created {new Date(deal.createdAt).toLocaleDateString()}</span>
                      <span className="text-gray-700">·</span>
                      <span className="text-[8px] text-gray-600">ID: {deal.id.slice(0, 16)}...</span>
                    </div>
                  </motion.div>
                ))}

                {/* Summary bar */}
                <div className="premium-card p-3 flex items-center justify-between">
                  <p className="text-[10px] text-gray-500">
                    <span className="font-bold text-white">{savedDeals.length}</span> total deals
                    · <span className="font-bold text-amber-400">{dealAnalytics.newDeals}</span> new
                    · <span className="font-bold text-purple-400">{dealAnalytics.contactedDeals}</span> contacted
                  </p>
                  <p className="text-xs font-bold text-emerald-400">
                    Total Commission: {formatPrice(dealAnalytics.totalCommission, 'IN')}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'favorites' && (
          <motion.div
            key="favorites"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {favoriteProperties.length === 0 ? (
              <div className="premium-card p-8 text-center">
                <Heart className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-white mb-1">No Favorites Yet</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Heart properties in the Deal Room to save them here. Favorites are a quick way to track 
                  properties you're interested in without expressing interest.
                </p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <Link to="/deal-room" className="btn-primary text-xs">
                    Browse Properties
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {favoriteProperties.map((property, i) => {
                  const statusBadgeStyle = (() => {
                    const map: Record<string, { label: string; color: string }> = {
                      pre_launch: { label: 'Pre-Launch', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
                      under_construction: { label: 'Under Construction', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
                      ready_to_move: { label: 'Ready to Move', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
                      resale: { label: 'Resale', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
                    };
                    return map[property.status] || { label: property.status, color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' };
                  })();
                  const imgUrl = property.images[0]?.url || 'https://images.unsplash.com/photo-1504385120-68dac6aecd5e?w=800&h=600&fit=crop&auto=format';

                  return (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="premium-card overflow-hidden group"
                    >
                      <div className="relative h-32 bg-gray-900 overflow-hidden">
                        <img src={imgUrl} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-2 left-2">
                          <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-medium border backdrop-blur-sm', statusBadgeStyle.color)}>
                            {statusBadgeStyle.label}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFavorite(property.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                        </button>
                      </div>
                      <div className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate">{property.name}</p>
                            <p className="text-[9px] text-gray-500 truncate">{property.developer_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-2">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{property.city}, {getFlag(property.countryCode)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-luxury-gold-400">
                            {formatPrice(property.price_min, property.countryCode)}
                          </p>
                          <p className="text-[9px] font-medium text-emerald-400">
                            {formatPrice(property.estimated_commission, property.countryCode)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Revenue Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="premium-card p-4 lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-luxury-gold-400" />
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Revenue Analytics</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Pipeline Value', value: formatPrice(dealAnalytics.totalPipelineValue, 'IN'), color: 'text-luxury-gold-400' },
                    { label: 'Expected Commission', value: formatPrice(dealAnalytics.totalCommission, 'IN'), color: 'text-emerald-400' },
                    { label: 'Favorites Value', value: formatPrice(favoriteAnalytics.totalValue, 'IN'), color: 'text-rose-400' },
                    { label: 'Combined Portfolio', value: formatPrice(portfolioValue, 'IN'), color: 'text-blue-400' },
                  ].map((item, i) => (
                    <div key={item.label} className="glass-card p-3 text-center">
                      <p className="text-[9px] text-gray-500 uppercase mb-1">{item.label}</p>
                      <p className={cn('text-sm font-bold', item.color)}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="premium-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-luxury-gold-400" />
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Top Metrics</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Deal Count', value: savedDeals.length, icon: FileText },
                    { label: 'Avg Commission/Deal', value: formatPrice(dealAnalytics.avgCommission, 'IN'), icon: Percent },
                    { label: 'Favorites Count', value: favoriteProperties.length, icon: Heart },
                    { label: 'Countries', value: favoriteAnalytics.countries, icon: MapPin },
                  ].map((item, i) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-3 h-3 text-gray-500" />
                        <span className="text-[10px] text-gray-400">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status funnel */}
            <div className="premium-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-luxury-gold-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Deal Funnel</h2>
              </div>
              {savedDeals.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-500">No deals yet — express interest in properties to build your funnel.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {['new', 'contacted', 'qualified', 'site_visit', 'negotiation', 'booked', 'closed'].map((stage) => {
                    const count = savedDeals.filter(d => d.status === stage).length;
                    const pct = savedDeals.length > 0 ? Math.round(count / savedDeals.length * 100) : 0;
                    const badge = statusBadge(stage);
                    const commission = savedDeals.filter(d => d.status === stage).reduce((s, d) => s + d.estimatedCommission, 0);
                    return (
                      <div key={stage} className="flex items-center gap-3">
                        <span className={cn('w-20 text-[9px] font-medium capitalize', badge.color)}>{badge.label}</span>
                        <div className="flex-1 h-5 rounded bg-gray-800 overflow-hidden relative">
                          <div
                            className={cn('h-full rounded transition-all', badge.color.split(' ')[0])}
                            style={{ width: `${pct}%`, minWidth: count > 0 ? '20px' : '0' }}
                          />
                          <span className="absolute inset-0 flex items-center px-2 text-[9px] text-gray-400">
                            {count} deals
                          </span>
                        </div>
                        <span className="w-20 text-right text-[9px] font-bold text-emerald-400">{formatPrice(commission, 'IN')}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Commission Forecast */}
            <div className="premium-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-luxury-gold-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Commission Forecast</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Conservative',
                    value: formatPrice(dealAnalytics.totalCommission * 0.3, 'IN'),
                    desc: '30% of pipeline — only highest-confidence deals',
                    color: 'text-amber-400',
                    bars: 1,
                  },
                  {
                    label: 'Moderate',
                    value: formatPrice(dealAnalytics.totalCommission * 0.6, 'IN'),
                    desc: '60% of pipeline — qualified and in-progress deals',
                    color: 'text-luxury-gold-400',
                    bars: 2,
                  },
                  {
                    label: 'Optimistic',
                    value: formatPrice(dealAnalytics.totalCommission, 'IN'),
                    desc: '100% of pipeline — every deal closes successfully',
                    color: 'text-emerald-400',
                    bars: 3,
                  },
                ].map((scenario, i) => (
                  <div key={scenario.label} className="glass-card p-4 text-center">
                    <p className="text-[9px] text-gray-500 uppercase mb-1">{scenario.label}</p>
                    <p className={cn('text-lg font-bold mb-1', scenario.color)}>{scenario.value}</p>
                    <p className="text-[9px] text-gray-600">{scenario.desc}</p>
                    <div className="flex items-center justify-center gap-1 mt-3">
                      {[1, 2, 3].map(b => (
                        <div key={b} className={cn('w-3 h-1 rounded-full', b <= scenario.bars ? scenario.color.replace('text-', 'bg-') : 'bg-gray-700')} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
