"use client"

import { useEffect, useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import type { PriceHistoryPoint, PriceHistoryInterval } from "@/lib/polymarket"
import { Button } from "@/components/ui/button"

type Props = {
  tokenId?: string
  marketTitle: string
  initialData?: PriceHistoryPoint[]
  className?: string
}

type ApiResponse = {
  history: PriceHistoryPoint[]
  source: "live" | "fallback"
}

const INTERVAL_OPTIONS: { label: string; value: PriceHistoryInterval }[] = [
  { label: "1H", value: "1h" },
  { label: "6H", value: "6h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "MAX", value: "max" },
]

export default function MarketPriceChart({ tokenId, marketTitle, initialData = [], className }: Props) {
  const [history, setHistory] = useState<PriceHistoryPoint[]>(initialData)
  const [range, setRange] = useState<PriceHistoryInterval>("1d")
  const [source, setSource] = useState<"live" | "fallback">(initialData.length ? "live" : "fallback")

  useEffect(() => {
    if (!tokenId) return
    let cancelled = false

    const fetchHistory = async () => {
      try {
        const params = new URLSearchParams({ token: tokenId, interval: range })
        const res = await fetch(`/api/polymarket/price-history?${params.toString()}`, {
          cache: "no-store",
        })
        if (!res.ok) throw new Error("Failed to load price history")
        const json = (await res.json()) as ApiResponse
        if (!cancelled) {
          setHistory(json.history ?? [])
          setSource(json.source)
        }
      } catch (error) {
        console.error("[polymarket] price history fetch failed", error)
        if (!cancelled) {
          setSource("fallback")
        }
      }
    }

    fetchHistory()
    const intervalId = window.setInterval(fetchHistory, 30_000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [tokenId, range])

  const chartData = useMemo(
    () =>
      history.map((point) => ({
        timestamp: point.t * 1000,
        label: new Date(point.t * 1000).toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }),
        price: Number(point.p ?? 0),
      })),
    [history]
  )

  const latestPrice = chartData.at(-1)?.price ?? null

  return (
    <div className={`rounded-3xl border border-white/10 bg-black/40 p-4 ${className ?? ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Live chart</p>
          <h4 className="text-lg font-semibold text-white">{marketTitle}</h4>
          {latestPrice !== null ? (
            <p className="text-sm text-white/60">
              Last trade · {(latestPrice * 100).toFixed(1)}¢ ({source === "fallback" ? "demo" : "live"})
            </p>
          ) : (
            <p className="text-sm text-white/60">Waiting for trades…</p>
          )}
        </div>
        <div className="flex gap-2">
          {INTERVAL_OPTIONS.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={range === option.value ? "default" : "ghost"}
              className={
                range === option.value
                  ? "h-8 rounded-full bg-white/90 text-black"
                  : "h-8 rounded-full border border-white/10 text-white/70"
              }
              onClick={() => setRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-64 w-full">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                minTickGap={20}
              />
              <YAxis
                domain={[0, 1]}
                tickFormatter={(value) => `${Math.round(value * 100)}¢`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f0f0f", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}
                formatter={(value: number) => [`${(value * 100).toFixed(2)}¢`, "Price"]}
                labelFormatter={(label) => label}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#a855f7"
                fillOpacity={1}
                fill="url(#priceGradient)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/60">No trades yet</div>
        )}
      </div>
    </div>
  )
}
