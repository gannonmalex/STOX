export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  marketCap?: number;
  sparklineData: number[];
  recommendation: Recommendation;
  lastUpdated: string;
}

export type AssetCategory = "stocks" | "crypto" | "commodities" | "forex";

export type Recommendation = "BUY" | "SELL" | "HOLD";

export interface AIAnalysis {
  id: string;
  assetId: string;
  recommendation: Recommendation;
  confidence: number;
  reasoning: string;
  shortTermOutlook: string;
  keyFactors: string[];
  predictedPriceRange?: {
    low: number;
    high: number;
    timeframe: string;
  };
  generatedAt: string;
}

export interface TabConfig {
  id: AssetCategory;
  label: string;
  icon: string;
}
