
import React from 'react';

interface MiniChartProps {
  data: number[];
  color?: string;
  type?: 'line' | 'bar';
}

export function MiniChart({ data, color = '#F7931E', type = 'line' }: MiniChartProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const width = 60;
  const height = 20;

  if (type === 'bar') {
    return (
      <div className="flex items-end gap-0.5 h-5">
        {data.slice(-8).map((value, index) => {
          const barHeight = ((value - min) / range) * height;
          return (
            <div
              key={index}
              className="w-1.5 rounded-t-sm opacity-60"
              style={{
                height: `${Math.max(barHeight, 2)}px`,
                backgroundColor: color
              }}
            />
          );
        })}
      </div>
    );
  }

  // Line chart
  const points = data.slice(-8).map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}
