"use client";

import { useMemo } from "react";

interface SparklineChartProps {
  data: number[];
  isPositive: boolean;
  width?: number;
  height?: number;
  expanded?: boolean;
}

export default function SparklineChart({
  data,
  isPositive,
  width = 80,
  height = 32,
  expanded = false,
}: SparklineChartProps) {
  const pathData = useMemo(() => {
    if (data.length < 2) return { line: "", area: "" };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = expanded ? 4 : 2;

    const points = data.map((val, i) => ({
      x: padding + ((width - padding * 2) * i) / (data.length - 1),
      y: padding + (height - padding * 2) * (1 - (val - min) / range),
    }));

    const line = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    const area =
      `M ${points[0].x.toFixed(1)} ${height} ` +
      points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
      ` L ${points[points.length - 1].x.toFixed(1)} ${height} Z`;

    return { line, area };
  }, [data, width, height, expanded]);

  const color = isPositive ? "#00E676" : "#FF5252";
  const gradientId = `sparkline-${isPositive ? "green" : "red"}-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={expanded ? 0.3 : 0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={pathData.area} fill={`url(#${gradientId})`} />
      <path
        d={pathData.line}
        fill="none"
        stroke={color}
        strokeWidth={expanded ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Current price dot */}
      {data.length >= 2 && (
        <circle
          cx={width - (expanded ? 4 : 2)}
          cy={
            (expanded ? 4 : 2) +
            (height - (expanded ? 8 : 4)) *
              (1 - (data[data.length - 1] - Math.min(...data)) / (Math.max(...data) - Math.min(...data) || 1))
          }
          r={expanded ? 3 : 2}
          fill={color}
        />
      )}
    </svg>
  );
}
