// ============================================================
// LeadLuxe AI — Geo Search (Autocomplete + Fly-to)
// Debounced search across all cities with keyboard navigation
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, Globe, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { searchCities } from '../../lib/geo/GeocodingEngine';
import type { GeoSearchResult } from '../../lib/geo/GeocodingEngine';

interface GeoSearchProps {
  onSelect: (result: GeoSearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function GeoSearch({ onSelect, placeholder = 'Search city or country…', className }: GeoSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const res = searchCities(query, 8);
      setResults(res);
      setIsOpen(res.length > 0);
      setSelectedIndex(-1);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((result: GeoSearchResult) => {
    setQuery(result.label);
    setIsOpen(false);
    onSelect(result);
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [isOpen, results, selectedIndex, handleSelect]);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="flex items-center bg-luxury-black/90 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden focus-within:border-luxury-gold-500/30 transition-colors">
        {isSearching ? (
          <Loader2 className="w-4 h-4 text-gray-500 ml-3 animate-spin shrink-0" />
        ) : (
          <Search className="w-4 h-4 text-gray-500 ml-3 shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-600 px-3 py-2.5 w-full"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); inputRef.current?.focus(); }}
            className="mr-2 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-luxury-black/95 backdrop-blur-xl border border-gray-800 rounded-lg overflow-hidden shadow-2xl z-50"
          >
            <div className="py-1 max-h-64 overflow-y-auto">
              {results.map((result, i) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                    selectedIndex === i ? 'bg-luxury-gold-500/10 border-l-2 border-luxury-gold-400' : 'border-l-2 border-transparent hover:bg-white/5'
                  )}
                >
                  <MapPin className={cn(
                    'w-4 h-4 mt-0.5 shrink-0',
                    selectedIndex === i ? 'text-luxury-gold-400' : 'text-gray-500'
                  )} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-sm font-medium truncate',
                        selectedIndex === i ? 'text-luxury-gold-300' : 'text-white'
                      )}>
                        {result.label}
                      </span>
                      <span className="text-[9px] text-gray-600 shrink-0">
                        {result.matchScore}%
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">{result.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
