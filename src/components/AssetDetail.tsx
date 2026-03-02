"use client";

import { useState } from "react";
import { X, Brain, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { Asset, AIAnalysis } from "@/types";
import { formatPrice, formatChange, formatLargeNumber } from "@/lib/format";
import SparklineChart from "./SparklineChart";
import RecommendationBadge from "./RecommendationBadge";

interface AssetDetailProps {
  asset: Asset;
  analysis?: AIAnalysis;
  onClose: () => void;
  onAnalyze: () => Promise<void>;
  apiKeySet: boolean;
}

export default function AssetDetail({
  asset,
  analysis,
  onClose,
  onAnalyze,
  apiKeySet,
}: AssetDetailProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isPositive = asset.priceChangePercent24h >= 0;

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await onAnalyze();
    setIsAnalyzing(false);
  };

  const pricePosition =
    asset.high24h - asset.low24h > 0
      ? ((asset.currentPrice - asset.low24h) / (asset.high24h - asset.low24h)) * 100
      : 50;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0d1235]/95 backdrop-blur-xl">
        {/* Glass highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-3xl" />

        <div className="p-5 sm:p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">{asset.symbol}</h2>
              <p className="text-sm text-white/50">{asset.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white/40" />
            </button>
          </div>

          {/* Price Card */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-white font-mono">
                {formatPrice(asset.currentPrice)}
              </span>
              <div className="text-right">
                <p
                  className={`text-lg font-bold font-mono flex items-center gap-1 ${
                    isPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {formatChange(asset.priceChangePercent24h)}
                </p>
                <p className="text-xs text-white/40 font-mono">
                  {isPositive ? "+" : ""}${asset.priceChange24h.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <RecommendationBadge recommendation={asset.recommendation} />
              {analysis && (
                <span className="text-xs text-purple-400 flex items-center gap-1">
                  <Brain size={12} />
                  {Math.round(analysis.confidence * 100)}% confidence
                </span>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card p-4">
            <SparklineChart
              data={asset.sparklineData}
              isPositive={isPositive}
              width={400}
              height={160}
              expanded
            />

            {/* High/Low bar */}
            <div className="flex items-center gap-2 mt-4 text-[11px] font-mono">
              <span className="text-red-400">L: {formatPrice(asset.low24h)}</span>
              <div className="flex-1 relative h-1 rounded-full bg-white/10">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-red-500 to-green-500"
                  style={{ width: `${pricePosition}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-lg"
                  style={{ left: `${pricePosition}%` }}
                />
              </div>
              <span className="text-green-400">H: {formatPrice(asset.high24h)}</span>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Brain size={16} className="text-purple-400" />
                AI Analysis
              </h3>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !apiKeySet}
                className="px-3 py-1.5 text-xs font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full hover:bg-purple-500/20 transition-colors disabled:opacity-40 flex items-center gap-1.5"
              >
                {isAnalyzing && <Loader2 size={12} className="animate-spin" />}
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </button>
            </div>

            {analysis ? (
              <div className="space-y-3">
                <p className="text-sm text-white/60 leading-relaxed">{analysis.reasoning}</p>

                {analysis.shortTermOutlook && (
                  <div className="flex gap-2 items-start">
                    <Minus size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-white/50">{analysis.shortTermOutlook}</p>
                  </div>
                )}

                {analysis.keyFactors.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                      Key Factors
                    </p>
                    {analysis.keyFactors.map((factor, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                        <p className="text-xs text-white/50">{factor}</p>
                      </div>
                    ))}
                  </div>
                )}

                {analysis.predictedPriceRange && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
                      Predicted Range ({analysis.predictedPriceRange.timeframe})
                    </p>
                    <p className="text-sm font-bold text-white font-mono">
                      {formatPrice(analysis.predictedPriceRange.low)} –{" "}
                      {formatPrice(analysis.predictedPriceRange.high)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-white/30">
                  {apiKeySet
                    ? "Tap Analyze to get AI-powered insights"
                    : "Set your Anthropic API key in Settings to enable AI analysis"}
                </p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-bold text-white mb-3">Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatItem label="24h High" value={formatPrice(asset.high24h)} />
              <StatItem label="24h Low" value={formatPrice(asset.low24h)} />
              <StatItem label="Volume" value={asset.volume > 0 ? formatLargeNumber(asset.volume) : "N/A"} />
              {asset.marketCap && <StatItem label="Market Cap" value={formatLargeNumber(asset.marketCap)} />}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-white/20 text-center leading-relaxed">
            AI recommendations are for educational and entertainment purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-white font-mono">{value}</p>
    </div>
  );
}
