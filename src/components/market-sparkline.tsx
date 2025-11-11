"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

import type { PriceHistoryPoint } from "@/lib/polymarket"

type Props = {
  tokenId?: string | null
}

export default function MarketSparkline({ tokenId }: Props) {
  const [history, setHistory] = useState<PriceHistoryPoint[]>([])

  useEffect(() => {
    if (!tokenId) {
      setHistory([])
      return
    }
    let cancelled = false

    const fetchHistory = async () => {
      try {
        const params = new URLSearchParams({ token: tokenId, interval: "1w" })
        const res = await fetch(`/api/polymarket/price-history?${params.toString()}`, { cache: "no-store" })
        if (!res.ok) throw new Error("history failed")
        const json = (await res.json()) as { history?: PriceHistoryPoint[] }
        if (!cancelled) {
          setHistory(json.history ?? [])
        }
      } catch {
        if (!cancelled) {
          setHistory([])
        }
      }
    }

    fetchHistory()
    return () => {
      cancelled = true
    }
  }, [tokenId])

  if (!tokenId || !history.length) {
    return <span className="text-xs text-neutral-400 dark:text-white/40">--</span>
  }

  const chartData = history.map((point) => ({
    timestamp: point.t * 1000,
    value: Number(point.p ?? 0),
  }))

  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <Area
            type="monotone"
            dataKey="value"
            stroke="#34d399"
            fill="rgba(52, 211, 153, 0.2)"
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
