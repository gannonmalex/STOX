import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Asset, AIAnalysis } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { asset, apiKey } = (await req.json()) as { asset: Asset; apiKey: string };

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });

    const sparklineStr = asset.sparklineData
      .slice(-20)
      .map((v) => v.toFixed(2))
      .join(", ");

    const prompt = `Analyze this ${asset.category} asset and provide an investment recommendation.

Asset: ${asset.name} (${asset.symbol})
Category: ${asset.category}
Current Price: $${asset.currentPrice.toFixed(2)}
24h Change: ${asset.priceChangePercent24h.toFixed(2)}%
24h High: $${asset.high24h.toFixed(2)}
24h Low: $${asset.low24h.toFixed(2)}
Recent Price Trend: [${sparklineStr}]

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "recommendation": "BUY" or "SELL" or "HOLD",
  "confidence": 0.0 to 1.0,
  "reasoning": "2-3 sentence analysis",
  "shortTermOutlook": "1 sentence outlook for next 1-7 days",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "predictedLow": number or null,
  "predictedHigh": number or null,
  "timeframe": "7 days"
}

IMPORTANT: This is for educational/entertainment purposes only. Base analysis on the price trend data provided.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const parsed = JSON.parse(textContent.text);

    const analysis: AIAnalysis = {
      id: crypto.randomUUID(),
      assetId: asset.id,
      recommendation: parsed.recommendation ?? "HOLD",
      confidence: parsed.confidence ?? 0.5,
      reasoning: parsed.reasoning ?? "Analysis unavailable",
      shortTermOutlook: parsed.shortTermOutlook ?? "",
      keyFactors: parsed.keyFactors ?? [],
      predictedPriceRange:
        parsed.predictedLow && parsed.predictedHigh
          ? {
              low: parsed.predictedLow,
              high: parsed.predictedHigh,
              timeframe: parsed.timeframe ?? "7 days",
            }
          : undefined,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze asset" },
      { status: 500 }
    );
  }
}
