import { NextRequest, NextResponse } from "next/server"

import { fetchPriceHistory, type PriceHistoryInterval } from "@/lib/polymarket"
import { fallbackPriceHistory } from "@/data/polymarket-history-fallback"

const cache = new Map<
  string,
  {
    history: { t: number; p: number }[]
    timestamp: number
    source: "live" | "fallback"
  }
>()

const CACHE_TTL_MS = 30 * 1000

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  const intervalParam = request.nextUrl.searchParams.get("interval") as PriceHistoryInterval | null

  if (!token) {
    return NextResponse.json({ error: "token query param required" }, { status: 400 })
  }

  const interval = intervalParam ?? "1d"
  const cacheKey = `${token}-${interval}`
  const now = Date.now()
  const cached = cache.get(cacheKey)

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ history: cached.history, source: cached.source }, { status: 200 })
  }

  try {
    const history = await fetchPriceHistory(token, interval)
    cache.set(cacheKey, { history, timestamp: now, source: "live" })
    return NextResponse.json({ history, source: "live" }, { status: 200 })
  } catch {
    cache.set(cacheKey, { history: fallbackPriceHistory, timestamp: now, source: "fallback" })
    return NextResponse.json({ history: fallbackPriceHistory, source: "fallback" }, { status: 200 })
  }
}
