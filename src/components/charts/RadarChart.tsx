// ============================================================
// LeadLuxe AI — Radar Chart (SVG, no external dependencies)
// Used by Deal Compass to compare market KPIs side-by-side.
// Pure SVG with Framer Motion animations.
// ============================================================

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface RadarMetric {
  key: string;
  label: string;
  maxValue: number;
}

export interface RadarDataPoint {
  id: string;
  label: string;
  color: string;
  values: Record<string, number>;
}

interface RadarChartProps {
  metrics: RadarMetric[];
  dataPoints: RadarDataPoint[];
  size?: number;
  levels?: number;
  className?: string;
}

const CHART_COLORS = [
  '#d4a030', // gold
  '#22c55e', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#a855f7', // purple
];

export function RadarChart({
  metrics,
  dataPoints,
  size = 400,
  levels = 4,
  className,
}: RadarChartProps) {
  const center = size / 2;
  const radius = size / 2 - 60;
  const angleStep = (Math.PI * 2) / metrics.length;

  // Generate grid polygon points for each level
  const gridLevels = useMemo(() => {
    return Array.from({ length: levels }, (_, level) => {
      const r = (radius / levels) * (level + 1);
      return metrics
        .map((_, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
        })
        .join(' ');
    });
  }, [metrics.length, radius, levels, center]);

  // Axis lines
  const axes = useMemo(() => {
    return metrics.map((_, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return { x1: center, y1: center, x2: x, y2: y };
    });
  }, [metrics.length, radius, center]);

  // Label positions
  const labelPositions = useMemo(() => {
    return metrics.map((m, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const labelRadius = radius + 30;
      let x = center + labelRadius * Math.cos(angle);
      let y = center + labelRadius * Math.sin(angle);

      // Adjust text alignment based on position
      const isLeft = x < center - 20;
      const isRight = x > center + 20;
      const isTop = y < center - 20;
      const isBottom = y > center + 20;

      let textAnchor: 'start' | 'end' | 'middle' = 'middle';
      let dy = '0.3em';

      if (isLeft) textAnchor = 'end';
      else if (isRight) textAnchor = 'start';
      else textAnchor = 'middle';

      if (isTop) dy = '1em';
      else if (isBottom) dy = '-0.5em';
      else dy = '0.3em';

      // Offset labels slightly from the edge
      if (isLeft) x -= 10;
      else if (isRight) x += 10;

      return { x, y, textAnchor, dy, label: m.label };
    });
  }, [metrics, radius, center]);

  if (dataPoints.length === 0) return null;

  return (
    <div className={cn('flex justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Grid levels */}
        {gridLevels.map((points, level) => (
          <polygon
            key={level}
            points={points}
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}

        {/* Axes */}
        {axes.map((axis, i) => (
          <line
            key={i}
            x1={axis.x1}
            y1={axis.y1}
            x2={axis.x2}
            y2={axis.y2}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}

        {/* Data polygons */}
        {dataPoints.map((point, pi) => {
          const polygonPoints = metrics
            .map((metric, mi) => {
              const value = point.values[metric.key] || 0;
              const ratio = Math.min(value / metric.maxValue, 1);
              const r = radius * ratio;
              const angle = -Math.PI / 2 + mi * angleStep;
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <motion.polygon
              key={point.id}
              points={polygonPoints}
              fill={point.color}
              fillOpacity={0.12}
              stroke={point.color}
              strokeWidth={2}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: pi * 0.15 }}
            />
          );
        })}

        {/* Data points */}
        {dataPoints.map((point, pi) =>
          metrics.map((metric, mi) => {
            const value = point.values[metric.key] || 0;
            const ratio = Math.min(value / metric.maxValue, 1);
            const r = radius * ratio;
            const angle = -Math.PI / 2 + mi * angleStep;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);

            return (
              <motion.circle
                key={`${point.id}-${metric.key}`}
                cx={x}
                cy={y}
                r={3}
                fill={point.color}
                stroke="#050510"
                strokeWidth={1.5}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: pi * 0.15 + mi * 0.05 }}
              />
            );
          })
        )}

        {/* Labels */}
        {labelPositions.map((pos, i) => (
          <text
            key={i}
            x={pos.x}
            y={pos.y}
            textAnchor={pos.textAnchor}
            dy={pos.dy}
            className="text-[11px] fill-gray-500 font-medium"
            style={{ fontSize: '11px', fontFamily: 'system-ui' }}
          >
            {pos.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ============================================================
// Comparison Table — shows numerical values for selected markets
// ============================================================

interface ComparisonTableProps {
  metrics: RadarMetric[];
  dataPoints: RadarDataPoint[];
  onRemove: (id: string) => void;
}

export function ComparisonTable({ metrics, dataPoints, onRemove }: ComparisonTableProps) {
  if (dataPoints.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-luxury-border">
            <th className="text-left py-2 px-3 text-gray-500 font-medium">Market</th>
            {metrics.map(m => (
              <th key={m.key} className="text-right py-2 px-3 text-gray-500 font-medium">
                {m.label}
              </th>
            ))}
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {dataPoints.map(point => (
            <motion.tr
              key={point.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="border-b border-luxury-border/50 hover:bg-white/5 transition-colors"
            >
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: point.color }}
                  />
                  <span className="text-white font-medium">{point.label}</span>
                </div>
              </td>
              {metrics.map(m => {
                const val = point.values[m.key] || 0;
                const displayVal = m.maxValue === 100
                  ? `${Math.round(val)}%`
                  : m.maxValue > 100
                    ? `${val.toFixed(1)}`
                    : `${Math.round(val)}`;

                // Highlight the highest value in each column
                const allVals = dataPoints.map(dp => dp.values[m.key] || 0);
                const maxVal = Math.max(...allVals);
                const isMax = val === maxVal && val > 0;

                return (
                  <td
                    key={m.key}
                    className={`text-right py-2.5 px-3 font-mono ${
                      isMax ? 'text-luxury-gold-400 font-semibold' : 'text-gray-300'
                    }`}
                  >
                    {displayVal}
                    {isMax && <span className="ml-1 text-[9px]">↑</span>}
                  </td>
                );
              })}
              <td className="py-2.5 px-1 text-center">
                <button
                  onClick={() => onRemove(point.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-[9px]"
                  title="Remove from comparison"
                >
                  ✕
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
