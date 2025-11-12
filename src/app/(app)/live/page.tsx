import { Activity, Signal } from "lucide-react"

import PageHeader from "@/components/page-header"
import RevealOnView from "@/components/reveal-on-view"
import MarketPriceChart from "@/components/market-price-chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchTopicMarkets } from "@/lib/polymarket"
import { fallbackTopicMarkets } from "@/data/polymarket-fallback"
import { fallbackPriceHistory } from "@/data/polymarket-history-fallback"

const highlights = [
  { title: "Facts rail sync", copy: "Right rail refreshes every 15s with the same snapshot as the live board." },
  { title: "Live trending markets", copy: "Stream fetches the latest trending markets from Polymarket in real-time." },
  { title: "Offline fallback", copy: "Gracefully falls back to cached data when API quota is exhausted." },
]

export default async function LivePage() {
  let topicMarkets = fallbackTopicMarkets
  let dataSource: "live" | "fallback" = "fallback"

  try {
    const liveMarkets = await fetchTopicMarkets(12)
    if (liveMarkets && liveMarkets.length > 0) {
      topicMarkets = liveMarkets
      dataSource = "live"
    }
  } catch (error) {
    console.error("[live] Failed to fetch markets, using fallback:", error)
  }

  const featured = topicMarkets[0]
  const recentTrades = topicMarkets.slice(1, 4)
  const initialHistory = fallbackPriceHistory

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Module 07"
        title="Live - streaming dashboard"
        description="Real-time probability tracking, depth snapshots, and market analysis powered by Polymarket's trending markets."
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
            <Badge variant="outline" className={dataSource === "live" ? "border-emerald-400/40 text-emerald-200" : "border-rose-400/40 text-rose-200"}>
              {dataSource === "live" ? "live" : "fallback"}
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
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">trending markets</p>
              <p className="text-lg font-semibold">{dataSource === "live" ? "Live feed" : "Demo feed"}</p>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-white/80">
            {recentTrades.map((trade) => (
              <li
                key={trade.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
              >
                <span className="text-white line-clamp-1">{trade.title}</span>
                <span className="text-emerald-300">{Math.round(trade.probability * 100)}¢</span>
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">book depth</p>
            <p className="mt-2">
              Bid: {featured ? `${(featured.probability * 100).toFixed(1)}¢` : "--"} - Ask:{" "}
              {featured ? `${(100 - featured.probability * 100).toFixed(1)}¢` : "--"} - Spread ~2¢
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
