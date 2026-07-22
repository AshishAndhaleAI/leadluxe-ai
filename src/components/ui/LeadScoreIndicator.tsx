import { cn } from '../../lib/utils';
import { getLeadCategory } from '../../lib/ai-scoring';

interface LeadScoreIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function LeadScoreIndicator({ score, size = 'md', showLabel = true }: LeadScoreIndicatorProps) {
  const category = getLeadCategory(score);
  const radius = size === 'sm' ? 18 : size === 'md' ? 22 : 28;
  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = radius + strokeWidth;
  const dimension = (radius + strokeWidth) * 2;

  const getColor = () => {
    if (score >= 80) return '#f87171';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#eab308';
    return '#9ca3af';
  };

  return (
    <div className={cn('flex items-center gap-3', size === 'sm' ? 'gap-2' : 'gap-3')}>
      <svg
        width={dimension}
        height={dimension}
        className="transform -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-800"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {showLabel && (
        <div>
          <p className={cn(
            'font-bold',
            size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-xl'
          )}>
            {score}/100
          </p>
          <p className={cn(
            'font-medium',
            category.color.split(' ')[0],
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          )}>
            {category.label}
          </p>
        </div>
      )}
    </div>
  );
}
