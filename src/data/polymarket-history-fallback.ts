import type { PriceHistoryPoint } from "@/lib/polymarket"

export const fallbackPriceHistory: PriceHistoryPoint[] = Array.from({ length: 30 }).map((_, idx) => ({
  t: Math.floor(Date.now() / 1000) - (30 - idx) * 300,
  p: 0.5 + Math.sin(idx / 3) * 0.05,
}))
