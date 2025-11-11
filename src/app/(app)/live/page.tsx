import { Activity, Signal } from "lucide-react"

import PageHeader from "@/components/page-header"
import RevealOnView from "@/components/reveal-on-view"
import MarketPriceChart from "@/components/market-price-chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fallbackTopicMarkets } from "@/data/polymarket-fallback"
import { fallbackPriceHistory } from "@/data/polymarket-history-fallback"

const highlights = [
  { title: "Facts rail sync", copy: "Right rail refreshes every 15s with the same snapshot as the live board." },
  { title: "Bitcoin tracker", copy: "Demo stream pins the Bitcoin volatility stack so you can reference watchlists mid-call." },
  { title: "Offline cache", copy: "Stream reads deterministic demo JSON, ready to swap with the real feed." },
]

const demoTrades = [
  { title: "Bitcoin volatility stack", price: "Demo 48c", ours: "61c" },
  { title: "AI interference sweep", price: "Demo 43c", ours: "59c" },
  { title: "Swing-state turnout", price: "Demo 57c", ours: "64c" },
]

export default function LivePage() {
  const topicMarkets = fallbackTopicMarkets
  const featured = topicMarkets[0]
  const initialHistory = fallbackPriceHistory

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Module 07"
        title="Live - streaming dashboard"
        description="Probability sparkline, depth snapshots, posterior overlay, and a scripted gap badge when the math disagrees with the book."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full">
              Start stream
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white">
              Sync facts rail
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <RevealOnView className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">sparkline</p>
              <h2 className="text-2xl font-semibold text-white">{featured?.title ?? "Preset market"}</h2>
            </div>
            <Badge variant="outline" className="border-rose-400/40 text-rose-200">
              demo seed
            </Badge>
          </div>
          <div className="mt-6">
            <MarketPriceChart
              tokenId={featured?.tokenId}
              marketTitle={featured?.title ?? "Preset market"}
              initialData={initialHistory}
            />
          </div>
        </RevealOnView>

        <RevealOnView className="space-y-4 rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
          <div className="flex items-center gap-3 text-white">
            <Activity className="h-10 w-10 text-emerald-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">last trades</p>
              <p className="text-lg font-semibold">Demo feed</p>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-white/80">
            {demoTrades.map((trade) => (
              <li
                key={trade.title}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
              >
                <span className="text-white">{trade.title}</span>
                <span>{trade.price}</span>
                <span className="text-emerald-300">{trade.ours}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">book depth</p>
            <p className="mt-2">
              Bid: {featured ? `${(featured.probability * 100).toFixed(1)}c` : "--"} - Ask:{" "}
              {featured ? `${(100 - featured.probability * 100).toFixed(1)}c` : "--"} - Spread 3c
            </p>
          </div>
        </RevealOnView>
      </div>

      <RevealOnView className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.title} className="rounded-3xl border border-white/10 bg-neutral-900/60 p-5">
            <Signal className="h-8 w-8 text-indigo-300" />
            <p className="mt-3 text-lg font-semibold text-white">{item.title}</p>
            <p className="text-sm text-white/70">{item.copy}</p>
          </div>
        ))}
      </RevealOnView>
    </div>
  )
}
