import { NextResponse } from "next/server";
import { Asset } from "@/types";
import { CRYPTO_IDS } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: { price: number[] };
}

export async function GET() {
  try {
    const ids = CRYPTO_IDS.map((c) => c.id).join(",");
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status}`);
    }

    const data: CoinGeckoMarket[] = await res.json();

    const assets: Asset[] = data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      category: "crypto",
      currentPrice: coin.current_price,
      priceChange24h: coin.price_change_24h ?? 0,
      priceChangePercent24h: coin.price_change_percentage_24h ?? 0,
      high24h: coin.high_24h ?? coin.current_price,
      low24h: coin.low_24h ?? coin.current_price,
      volume: coin.total_volume ?? 0,
      marketCap: coin.market_cap,
      sparklineData: coin.sparkline_in_7d?.price ?? [],
      recommendation: "HOLD",
      lastUpdated: new Date().toISOString(),
    }));

    return NextResponse.json(assets);
  } catch (error) {
    console.error("Crypto fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crypto data" },
      { status: 500 }
    );
  }
}
