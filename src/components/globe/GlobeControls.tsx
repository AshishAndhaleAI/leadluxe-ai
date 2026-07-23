import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Minus, RotateCcw, Search, MapPin,
  Globe, Maximize2, Minimize2
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface GlobeControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  onSearch?: (query: string) => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
  className?: string;
  loading?: boolean;
}

export function GlobeControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onSearch,
  onFullscreen,
  isFullscreen = false,
  className,
  loading = false,
}: GlobeControlsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery && onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Search */}
      <motion.form
        onSubmit={handleSearch}
        initial={false}
        animate={{ width: showSearch ? 200 : 36 }}
        className="flex items-center bg-luxury-black/80 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden"
      >
        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0"
        >
          <Search className="w-4 h-4" />
        </button>
        {showSearch && (
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search city..."
            className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-600 w-full pr-2"
            autoFocus
          />
        )}
      </motion.form>

      {/* Zoom controls */}
      <div className="flex flex-col bg-luxury-black/80 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden">
        <button
          onClick={onZoomIn}
          disabled={loading}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
          title="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="h-px bg-gray-800" />
        <button
          onClick={onZoomOut}
          disabled={loading}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
          title="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Reset / Fullscreen */}
      <div className="flex flex-col bg-luxury-black/80 backdrop-blur-md border border-gray-800 rounded-lg overflow-hidden">
        <button
          onClick={onReset}
          disabled={loading}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
          title="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="h-px bg-gray-800" />
        <button
          onClick={onFullscreen}
          disabled={loading}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-luxury-black/80 backdrop-blur-md border border-gray-800 rounded-lg">
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          loading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
        )} />
        <span className="text-[9px] text-gray-500">{loading ? 'Loading' : 'Live'}</span>
      </div>
    </div>
  );
}
