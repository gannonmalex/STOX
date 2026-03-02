import { NextResponse } from "next/server";
import { Asset } from "@/types";
import { COMMODITY_SYMBOLS } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function fetchYahooChart(symbol: string) {
  const encoded = encodeURIComponent(symbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=1mo`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!res.ok) return null;

  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) return null;

  const meta = result.meta;
  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];
  const sparkline = closes.filter((v): v is number => v !== null);

  return {
    price: meta.regularMarketPrice,
    previousClose: meta.chartPreviousClose ?? meta.previousClose,
    sparkline,
  };
}

export async function GET() {
  try {
    const assets: Asset[] = [];

    const results = await Promise.allSettled(
      COMMODITY_SYMBOLS.map(async (c) => {
        const data = await fetchYahooChart(c.symbol);
        if (!data) return null;

        const change = data.price - data.previousClose;
        const changePercent = (change / data.previousClose) * 100;

        return {
          id: c.symbol,
          symbol: c.displaySymbol,
          name: c.name,
          category: "commodities" as const,
          currentPrice: data.price,
          priceChange24h: change,
          priceChangePercent24h: changePercent,
          high24h: Math.max(...data.sparkline),
          low24h: Math.min(...data.sparkline),
          volume: 0,
          sparklineData: data.sparkline,
          recommendation: "HOLD" as const,
          lastUpdated: new Date().toISOString(),
        } satisfies Asset;
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        assets.push(r.value);
      }
    }

    if (assets.length === 0) {
      // Demo data fallback
      return NextResponse.json(
        COMMODITY_SYMBOLS.map((c) => {
          const price = c.name.includes("Gold") ? 2300 + Math.random() * 100 :
                        c.name.includes("Silver") ? 28 + Math.random() * 3 :
                        c.name.includes("Oil") ? 70 + Math.random() * 10 :
                        50 + Math.random() * 50;
          const change = (Math.random() - 0.5) * 4;
          return {
            id: c.symbol,
            symbol: c.displaySymbol,
            name: c.name,
            category: "commodities",
            currentPrice: price,
            priceChange24h: price * change / 100,
            priceChangePercent24h: change,
            high24h: price * 1.015,
            low24h: price * 0.985,
            volume: Math.random() * 1e8,
            sparklineData: Array.from({ length: 20 }, () => price * (1 + (Math.random() - 0.5) * 0.03)),
            recommendation: "HOLD",
            lastUpdated: new Date().toISOString(),
          } satisfies Asset;
        })
      );
    }

    return NextResponse.json(assets);
  } catch (error) {
    console.error("Commodities fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch commodities" }, { status: 500 });
  }
}
