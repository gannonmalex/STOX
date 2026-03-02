"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Settings, Brain, Loader2, Search, X, RefreshCw } from "lucide-react";
import { Asset, AssetCategory, AIAnalysis, TabConfig } from "@/types";
import AssetRow from "@/components/AssetRow";
import AssetDetail from "@/components/AssetDetail";
import SettingsModal from "@/components/SettingsModal";

const TABS: TabConfig[] = [
  { id: "stocks", label: "Stocks", icon: "📈" },
  { id: "crypto", label: "Crypto", icon: "₿" },
  { id: "commodities", label: "Commodities", icon: "🪙" },
  { id: "forex", label: "Forex", icon: "💱" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<AssetCategory>("stocks");
  const [assets, setAssets] = useState<Record<AssetCategory, Asset[]>>({
    stocks: [],
    crypto: [],
    commodities: [],
    forex: [],
  });
  const [analyses, setAnalyses] = useState<Record<string, AIAnalysis>>({});
  const [loading, setLoading] = useState<Record<AssetCategory, boolean>>({
    stocks: true,
    crypto: true,
    commodities: true,
    forex: true,
  });
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load API key from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("stox_anthropic_key");
    if (stored) setApiKey(stored);
  }, []);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem("stox_anthropic_key", key);
  };

  // Fetch data for a category
  const fetchCategory = useCallback(async (category: AssetCategory) => {
    setLoading((prev) => ({ ...prev, [category]: true }));
    try {
      const res = await fetch(`/api/${category}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAssets((prev) => ({ ...prev, [category]: data }));
        }
      }
    } catch (err) {
      console.error(`Failed to fetch ${category}:`, err);
    }
    setLoading((prev) => ({ ...prev, [category]: false }));
  }, []);

  // Fetch all data
  const fetchAll = useCallback(async () => {
    await Promise.all(TABS.map((t) => fetchCategory(t.id)));
    setLastRefresh(new Date());
  }, [fetchCategory]);

  // Initial load + auto refresh
  useEffect(() => {
    fetchAll();
    refreshTimer.current = setInterval(fetchAll, 30000);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [fetchAll]);

  // Analyze single asset
  const analyzeAsset = async (asset: Asset) => {
    if (!apiKey) return;
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset, apiKey }),
      });
      if (res.ok) {
        const analysis: AIAnalysis = await res.json();
        setAnalyses((prev) => ({ ...prev, [asset.id]: analysis }));

        // Update the asset's recommendation
        setAssets((prev) => {
          const updated = { ...prev };
          updated[asset.category] = updated[asset.category].map((a) =>
            a.id === asset.id ? { ...a, recommendation: analysis.recommendation } : a
          );
          return updated;
        });
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    }
  };

  // Analyze all visible assets
  const analyzeAll = async () => {
    if (!apiKey) return;
    setIsAnalyzingAll(true);
    const currentAssets = assets[activeTab].slice(0, 10);
    for (const asset of currentAssets) {
      await analyzeAsset(asset);
    }
    setIsAnalyzingAll(false);
  };

  // Filter assets
  const filteredAssets = assets[activeTab].filter((a) => {
    if (!searchText) return true;
    const q = searchText.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q);
  });

  // Summary stats
  const currentAssets = assets[activeTab];
  const gainers = currentAssets.filter((a) => a.priceChangePercent24h > 0).length;
  const losers = currentAssets.filter((a) => a.priceChangePercent24h < 0).length;
  const avgChange =
    currentAssets.length > 0
      ? currentAssets.reduce((sum, a) => sum + a.priceChangePercent24h, 0) / currentAssets.length
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0F1639] to-[#141B4D] text-white">
      <div className="max-w-2xl mx-auto px-4 pb-8">
        {/* Header */}
        <header className="pt-6 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              STOX
            </h1>
            {lastRefresh && (
              <p className="text-[10px] text-white/30 mt-0.5">
                Updated {timeAgo(lastRefresh)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={analyzeAll}
              disabled={isAnalyzingAll || !apiKey}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-300 hover:bg-purple-500/25 transition-all disabled:opacity-30"
            >
              {isAnalyzingAll ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Brain size={14} />
              )}
              AI
            </button>

            <button
              onClick={() => fetchAll()}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={16} className="text-white/50" />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Settings size={16} className="text-white/50" />
            </button>
          </div>
        </header>

        {/* Tab Bar */}
        <div className="glass-card p-1.5 mb-4 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-500/25 to-purple-500/25 border border-white/10 text-white"
                  : "text-white/35 hover:text-white/60 border border-transparent"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:border-blue-500/40 focus:outline-none transition-colors placeholder:text-white/20"
          />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Summary */}
        <div className="glass-card p-3 mb-4 flex justify-around text-center">
          <SummaryItem label="Assets" value={`${currentAssets.length}`} color="text-blue-400" />
          <SummaryItem label="Gainers" value={`${gainers}`} color="text-green-400" />
          <SummaryItem label="Losers" value={`${losers}`} color="text-red-400" />
          <SummaryItem
            label="Avg"
            value={`${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(1)}%`}
            color={avgChange >= 0 ? "text-green-400" : "text-red-400"}
          />
        </div>

        {/* Column Headers */}
        <div className="flex items-center gap-4 px-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/25">
          <span className="flex-1">Asset</span>
          <span className="hidden sm:block w-[80px] text-center">Chart</span>
          <span className="w-[90px] text-right">Price</span>
          <span className="w-[52px] text-center">Signal</span>
        </div>

        {/* Asset List */}
        <div className="space-y-2">
          {loading[activeTab] && currentAssets.length === 0 ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[68px] rounded-2xl bg-white/[0.03] animate-pulse"
              />
            ))
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-white/30">No assets found</p>
              <p className="text-xs text-white/15 mt-1">Try adjusting your search</p>
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                analysis={analyses[asset.id]}
                onClick={() => setSelectedAsset(asset)}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAsset && (
        <AssetDetail
          asset={selectedAsset}
          analysis={analyses[selectedAsset.id]}
          onClose={() => setSelectedAsset(null)}
          onAnalyze={() => analyzeAsset(selectedAsset)}
          apiKeySet={!!apiKey}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
        />
      )}
    </div>
  );
}

function SummaryItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <p className={`text-base font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-white/25">{label}</p>
    </div>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}
