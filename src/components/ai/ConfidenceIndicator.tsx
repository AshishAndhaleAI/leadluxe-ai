import { cn } from '../../lib/utils';

interface ConfidenceIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceIndicator({ score, size = 'md', showLabel = true, className }: ConfidenceIndicatorProps) {
  const radius = size === 'sm' ? 20 : size === 'md' ? 26 : 34;
  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = radius + strokeWidth;
  const dimension = (radius + strokeWidth) * 2;

  const getColor = () => {
    if (score >= 85) return '#22c55e';
    if (score >= 70) return '#f59e0b';
    if (score >= 50) return '#f97316';
    return '#ef4444';
  };

  const getLabel = () => {
    if (score >= 85) return 'High Confidence';
    if (score >= 70) return 'Good Opportunity';
    if (score >= 50) return 'Moderate';
    return 'Low Confidence';
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg width={dimension} height={dimension} className="transform -rotate-90 shrink-0">
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-800"
        />
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {showLabel && (
        <div>
          <p className={cn('font-bold tracking-tight', size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl')}>
            {score}%
          </p>
          <p className={cn('font-medium', size === 'sm' ? 'text-xs' : 'text-sm')} style={{ color: getColor() }}>
            {getLabel()}
          </p>
        </div>
      )}
    </div>
  );
}
