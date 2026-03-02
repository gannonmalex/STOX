"use client";

import { Asset, AIAnalysis } from "@/types";
import { formatPrice, formatChange } from "@/lib/format";
import SparklineChart from "./SparklineChart";
import RecommendationBadge from "./RecommendationBadge";

interface AssetRowProps {
  asset: Asset;
  analysis?: AIAnalysis;
  onClick: () => void;
}

export default function AssetRow({ asset, onClick }: AssetRowProps) {
  const isPositive = asset.priceChangePercent24h >= 0;

  return (
    <button
      onClick={onClick}
      className="w-full group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300 p-3 sm:p-4"
    >
      {/* Glass highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Symbol & Name */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-bold text-white truncate">{asset.symbol}</p>
          <p className="text-[11px] text-white/40 truncate">{asset.name}</p>
        </div>

        {/* Sparkline */}
        <div className="hidden sm:block flex-shrink-0">
          <SparklineChart data={asset.sparklineData} isPositive={isPositive} />
        </div>

        {/* Price & Change */}
        <div className="text-right flex-shrink-0 w-[90px]">
          <p className="text-sm font-semibold text-white font-mono">
            {formatPrice(asset.currentPrice)}
          </p>
          <p
            className={`text-[11px] font-medium font-mono ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            {formatChange(asset.priceChangePercent24h)}
          </p>
        </div>

        {/* Recommendation */}
        <div className="flex-shrink-0">
          <RecommendationBadge recommendation={asset.recommendation} />
        </div>
      </div>
    </button>
  );
}
