// ============================================================
// Phase 1: AI Investor Command Bar
// Persistent search bar that parses natural language queries
// and returns ranked investment results
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Zap, Globe, MapPin, TrendingUp, ArrowRight, X, Sparkles, IndianRupee, Building2, Loader2 } from 'lucide-react';
import { useOpportunityEngine } from '../../hooks/useOpportunityEngine';
import { COUNTRIES, CITIES } from '../../lib/global-data';
import { formatIndianCurrency, formatCommission } from '../../lib/format';
import { cn } from '../../lib/utils';

interface ParsedQuery {
  intent: 'find_opportunities' | 'compare_cities' | 'find_by_budget' | 'find_by_type' | 'infrastructure_search' | 'general_inquiry';
  budgetMin?: number;
  budgetMax?: number;
  city?: string;
  country?: string;
  propertyType?: string;
  comparisonCities?: string[];
  investmentGoal?: string;
}

// =====================
// QUERY PARSER
// =====================
function parseQuery(text: string): ParsedQuery | null {
  const lower = text.toLowerCase().trim();
  if (!lower) return null;

  // Try to extract budget amounts
  const budgetPatterns = [
    /(\d+)\s*(cr|crore|m|million|l|lakh)/gi,
    /₹?\s*(\d+[,\d]*)\s*(cr|crore|m|million|l|lakh)?/gi,
    /\$?\s*(\d+[,\d]*)\s*(m|million|k|thousand)?/gi,
  ];

  let budgetMin: number | undefined;
  let budgetMax: number | undefined;

  for (const pattern of budgetPatterns) {
    const matches = [...lower.matchAll(pattern)];
    if (matches.length > 0) {
      const nums = matches.map(m => {
        let val = parseFloat(m[1].replace(/,/g, ''));
        const unit = (m[2] || '').toLowerCase();
        if (unit === 'cr' || unit === 'crore') val *= 10000000;
        else if (unit === 'l' || unit === 'lakh') val *= 100000;
        else if (unit === 'm' || unit === 'million') val *= 10000000;
        else if (unit === 'k' || unit === 'thousand') val *= 1000;
        return val;
      });

      if (nums.length === 1) {
        budgetMax = nums[0];
        budgetMin = nums[0] * 0.5;
      } else if (nums.length >= 2) {
        budgetMin = Math.min(...nums);
        budgetMax = Math.max(...nums);
      }
    }
  }

  // Extract city names
  const allCities = Object.values(CITIES).flat();
  const mentionedCities = allCities.filter(c =>
    lower.includes(c.name.toLowerCase()) ||
    lower.includes(c.name.split(' ')[0].toLowerCase())
  );

  // Extract country names
  const mentionedCountries = COUNTRIES.filter(c =>
    lower.includes(c.name.toLowerCase()) ||
    lower.includes(c.code.toLowerCase())
  );

  // Detect property type
  const typePatterns: Record<string, string[]> = {
    apartment: ['apartment', 'flat', 'condo'],
    villa: ['villa', 'bungalow', 'house'],
    penthouse: ['penthouse', 'duplex'],
    commercial: ['commercial', 'office', 'retail', 'shop'],
    land: ['land', 'plot', 'vacant'],
    luxury: ['luxury', 'premium', 'high-end'],
  };

  let propertyType: string | undefined;
  for (const [type, keywords] of Object.entries(typePatterns)) {
    if (keywords.some(k => lower.includes(k))) {
      propertyType = type;
      break;
    }
  }

  // Detect intent
  let intent: ParsedQuery['intent'] = 'general_inquiry';

  if (lower.includes('compare') || lower.includes('vs') || lower.includes('versus')) {
    intent = 'compare_cities';
  } else if (lower.includes('infrastructure') || lower.includes('metro') || lower.includes('airport') || lower.includes('highway')) {
    intent = 'infrastructure_search';
  } else if (budgetMin || budgetMax) {
    intent = 'find_by_budget';
  } else if (mentionedCities.length > 0 || mentionedCountries.length > 0) {
    intent = 'find_opportunities';
  }

  // Detect investment goal
  let investmentGoal: string | undefined;
  if (lower.includes('rental') || lower.includes('yield') || lower.includes('income')) investmentGoal = 'rental';
  else if (lower.includes('appreciation') || lower.includes('growth') || lower.includes('capital')) investmentGoal = 'appreciation';
  else if (lower.includes('commercial')) investmentGoal = 'commercial';

  return {
    intent,
    budgetMin,
    budgetMax,
    city: mentionedCities[0]?.name,
    country: mentionedCountries[0]?.name,
    propertyType,
    comparisonCities: mentionedCities.map(c => c.name),
    investmentGoal,
  };
}

// =====================
// COMMAND BAR COMPONENT
// =====================
export function InvestorCommandBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { opportunities, loading } = useOpportunityEngine();

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const executeSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setParsedQuery(null);
      return;
    }

    setIsProcessing(true);
    const parsed = parseQuery(q);
    setParsedQuery(parsed);

    // Simulate processing delay for natural feel
    await new Promise(r => setTimeout(r, 300));

    if (!parsed) {
      // Fallback: search opportunities by text
      const filtered = opportunities.filter(o =>
        o.title.toLowerCase().includes(q.toLowerCase()) ||
        o.summary?.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8);
      setResults(filtered);
      setIsProcessing(false);
      return;
    }

    // Intent-based filtering
    let filtered = [...opportunities];

    if (parsed.budgetMin) {
      filtered = filtered.filter(o => o.estimated_value >= (parsed.budgetMin || 0));
    }
    if (parsed.budgetMax) {
      filtered = filtered.filter(o => o.estimated_value <= (parsed.budgetMax || Infinity));
    }
    if (parsed.city) {
      filtered = filtered.filter(o =>
        o.title.toLowerCase().includes(parsed.city!.toLowerCase()) ||
        o.summary?.toLowerCase().includes(parsed.city!.toLowerCase())
      );
    }
    if (parsed.country) {
      filtered = filtered.filter(o =>
        o.title.toLowerCase().includes(parsed.country!.toLowerCase())
      );
    }
    if (parsed.propertyType) {
      filtered = filtered.filter(o =>
        o.title.toLowerCase().includes(parsed.propertyType!.toLowerCase())
      );
    }

    // Sort by confidence
    filtered.sort((a, b) => b.confidence_score - a.confidence_score);
    setResults(filtered.slice(0, 8));
    setSelectedIndex(0);
    setIsProcessing(false);
  }, [opportunities]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => executeSearch(query), 200);
    return () => clearTimeout(timer);
  }, [query, executeSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      navigate(`/opportunity/${results[selectedIndex].id}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const getSuggestedQueries = () => [
    { label: 'Best ₹5 Cr opportunities in Dubai', icon: IndianRupee },
    { label: 'Compare London vs Singapore rental yield', icon: Globe },
    { label: 'Find commercial near new metro infrastructure', icon: Building2 },
    { label: 'Where to deploy $2M for 7-year growth', icon: TrendingUp },
  ];

  const formatResult = (opp: any) => ({
    id: opp.id,
    title: opp.title?.split('—')[0]?.trim() || opp.title || 'Opportunity',
    developer: opp.title?.split('—')[1]?.trim() || 'Unknown',
    value: opp.estimated_value,
    commission: opp.estimated_commission,
    confidence: opp.confidence_score,
  });

  return (
    <>
      {/* Trigger Button — always visible in header area */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-luxury-border hover:bg-white/10 transition-colors text-xs text-gray-400 group w-full max-w-md"
      >
        <Search className="w-3.5 h-3.5 text-gray-500 group-hover:text-luxury-gold-400 transition-colors" />
        <span className="flex-1 text-left">Ask AI Investor... "Find best ₹5Cr in Dubai"</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] text-gray-600 bg-white/5 rounded border border-luxury-border">
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => { setIsOpen(false); setQuery(''); }}
            />

            {/* Command Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-luxury-black border border-luxury-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-luxury-border">
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 text-luxury-gold-400 animate-spin shrink-0" />
                ) : (
                  <Search className="w-4 h-4 text-gray-500 shrink-0" />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything... e.g., 'Best ₹5Cr opportunities in Dubai'"
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                />
                <button
                  onClick={() => { setIsOpen(false); setQuery(''); }}
                  className="p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Parsed Query Display */}
              {parsedQuery && query.length > 0 && (
                <div className="px-4 py-2 bg-white/[0.02] border-b border-luxury-border">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Filters:</span>
                    {parsedQuery.budgetMin && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-luxury-gold-500/10 text-luxury-gold-400 border border-luxury-gold-500/20">
                        Budget: {formatIndianCurrency(parsedQuery.budgetMin)} - {formatIndianCurrency(parsedQuery.budgetMax || parsedQuery.budgetMin * 2)}
                      </span>
                    )}
                    {parsedQuery.city && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <MapPin className="w-2.5 h-2.5 inline mr-0.5" />
                        {parsedQuery.city}
                      </span>
                    )}
                    {parsedQuery.propertyType && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {parsedQuery.propertyType}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-600 ml-auto capitalize">
                      Intent: {parsedQuery.intent.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              )}

              {/* Results */}
              <div className="max-h-[40vh] overflow-y-auto">
                {query.length === 0 ? (
                  <div className="p-4">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">Suggested Queries</p>
                    <div className="space-y-1">
                      {getSuggestedQueries().map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setQuery(s.label)}
                          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-left transition-colors group"
                        >
                          <s.icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-luxury-gold-400" />
                          <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : results.length === 0 && !isProcessing ? (
                  <div className="p-8 text-center">
                    <Sparkles className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No matching opportunities found</p>
                    <p className="text-xs text-gray-600 mt-1">Try a broader search or check different markets</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-0.5">
                    {results.map((opp, i) => {
                      const f = formatResult(opp);
                      return (
                        <button
                          key={opp.id}
                          onClick={() => { navigate(`/opportunity/${opp.id}`); setIsOpen(false); setQuery(''); }}
                          onMouseEnter={() => setSelectedIndex(i)}
                          className={cn(
                            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all duration-150',
                            selectedIndex === i
                              ? 'bg-luxury-gold-500/10 border border-luxury-gold-500/20'
                              : 'hover:bg-white/5 border border-transparent'
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            opp.confidence_score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                            opp.confidence_score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-gray-500/20 text-gray-400'
                          )}>
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-white truncate">{f.title}</p>
                              <span className={cn(
                                'text-[9px] px-1 py-0.5 rounded font-medium ml-2',
                                opp.confidence_score >= 80 ? 'text-emerald-400 bg-emerald-500/10' :
                                opp.confidence_score >= 60 ? 'text-amber-400 bg-amber-500/10' :
                                'text-gray-400 bg-gray-500/10'
                              )}>
                                {opp.confidence_score}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-gray-500 mt-0.5">
                              <span className="text-luxury-gold-400">{formatIndianCurrency(f.value)}</span>
                              {f.commission > 0 && (
                                <>
                                  <span>·</span>
                                  <span className="text-emerald-400">{formatCommission(f.commission)}</span>
                                </>
                              )}
                              {f.developer && f.developer !== 'Unknown' && (
                                <>
                                  <span>·</span>
                                  <span>{f.developer}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-3 h-3 text-gray-600 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-luxury-border flex items-center justify-between">
                <div className="flex items-center gap-3 text-[9px] text-gray-600">
                  <span><kbd className="px-1 py-0.5 rounded bg-white/5 border border-luxury-border">↑↓</kbd> Navigate</span>
                  <span><kbd className="px-1 py-0.5 rounded bg-white/5 border border-luxury-border">↵</kbd> Select</span>
                  <span><kbd className="px-1 py-0.5 rounded bg-white/5 border border-luxury-border">Esc</kbd> Close</span>
                </div>
                <span className="text-[9px] text-gray-700">{results.length} results</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
