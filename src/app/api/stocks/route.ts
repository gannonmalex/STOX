import { NextResponse } from "next/server";
import { Asset } from "@/types";
import { STOCK_SYMBOLS } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  marketCap: number;
  regularMarketPreviousClose: number;
}

async function fetchYahooQuotes(symbols: string[]): Promise<YahooQuote[]> {
  const symbolStr = symbols.join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);

  const data = await res.json();
  return data?.quoteResponse?.result ?? [];
}

function generateSparkline(prevClose: number, current: number, high: number, low: number): number[] {
  const points: number[] = [];
  const steps = 24;
  for (let i = 0; i < steps; i++) {
    const progress = i / (steps - 1);
    const base = prevClose + (current - prevClose) * progress;
    const noise = (Math.random() - 0.5) * (high - low) * 0.15;
    points.push(Math.min(high, Math.max(low, base + noise)));
  }
  points[points.length - 1] = current;
  return points;
}

export async function GET() {
  try {
    const symbols = STOCK_SYMBOLS.map((s) => s.symbol);
    const quotes = await fetchYahooQuotes(symbols);

    const assets: Asset[] = quotes
      .map((q) => {
        const info = STOCK_SYMBOLS.find((s) => s.symbol === q.symbol);
        if (!info || !q.regularMarketPrice) return null;

        return {
          id: q.symbol,
          symbol: q.symbol,
          name: info.name,
          category: "stocks" as const,
          currentPrice: q.regularMarketPrice,
          priceChange24h: q.regularMarketChange ?? 0,
          priceChangePercent24h: q.regularMarketChangePercent ?? 0,
          high24h: q.regularMarketDayHigh ?? q.regularMarketPrice,
          low24h: q.regularMarketDayLow ?? q.regularMarketPrice,
          volume: q.regularMarketVolume ?? 0,
          marketCap: q.marketCap,
          sparklineData: generateSparkline(
            q.regularMarketPreviousClose ?? q.regularMarketPrice,
            q.regularMarketPrice,
            q.regularMarketDayHigh ?? q.regularMarketPrice * 1.01,
            q.regularMarketDayLow ?? q.regularMarketPrice * 0.99
          ),
          recommendation: "HOLD" as const,
          lastUpdated: new Date().toISOString(),
        };
      })
      .filter(Boolean) as Asset[];

    return NextResponse.json(assets);
  } catch (error) {
    console.error("Stocks fetch error:", error);
    // Return demo data on failure
    const demoAssets: Asset[] = STOCK_SYMBOLS.map((s) => {
      const price = Math.random() * 500 + 50;
      const change = (Math.random() - 0.5) * 10;
      return {
        id: s.symbol,
        symbol: s.symbol,
        name: s.name,
        category: "stocks",
        currentPrice: price,
        priceChange24h: price * change / 100,
        priceChangePercent24h: change,
        high24h: price * 1.02,
        low24h: price * 0.98,
        volume: Math.random() * 50000000,
        marketCap: Math.random() * 2e12,
        sparklineData: Array.from({ length: 24 }, () => price * (1 + (Math.random() - 0.5) * 0.04)),
        recommendation: "HOLD",
        lastUpdated: new Date().toISOString(),
      };
    });
    return NextResponse.json(demoAssets);
  }
}
