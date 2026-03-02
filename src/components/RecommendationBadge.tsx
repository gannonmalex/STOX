"use client";

import { Recommendation } from "@/types";

const config: Record<Recommendation, { bg: string; border: string; text: string }> = {
  BUY: { bg: "bg-green-500/15", border: "border-green-500/30", text: "text-green-400" },
  SELL: { bg: "bg-red-500/15", border: "border-red-500/30", text: "text-red-400" },
  HOLD: { bg: "bg-gray-400/15", border: "border-gray-400/30", text: "text-gray-400" },
};

export default function RecommendationBadge({ recommendation }: { recommendation: Recommendation }) {
  const c = config[recommendation];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider border ${c.bg} ${c.border} ${c.text}`}
    >
      {recommendation}
    </span>
  );
}
