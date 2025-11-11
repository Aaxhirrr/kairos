import { Clock8, Download, FileDigit, Link2Icon, Shield } from "lucide-react"

import PageHeader from "@/components/page-header"
import RevealOnView from "@/components/reveal-on-view"
import ProjectCard from "@/components/project-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchTopicMarkets } from "@/lib/polymarket"
import { fallbackTopicMarkets } from "@/data/polymarket-fallback"

const specSources = [
  { name: "Coinbase", field: "close", interval: "1m" },
  { name: "Kraken", field: "last", interval: "1m" },
  { name: "Kaiko", field: "agg", interval: "1m" },
]

export default async function ResolvePage() {
  let topicMarkets = fallbackTopicMarkets
  let dataSource: "live" | "fallback" = "fallback"

  try {
    const markets = await fetchTopicMarkets()
    if (markets.length) {
      topicMarkets = markets
      dataSource = "live"
    }
  } catch (error) {
    console.error("[polymarket] resolve fallback data", error)
  }

  const primary = topicMarkets[0]
  const evidence = [
    {
      url: primary?.href ?? "https://polymarket.com",
      ts: new Date().toISOString(),
      price: primary ? primary.tags[0] : "—",
      hash: "0x01f9…8cd2",
    },
    {
      url: "https://data.chain.link/streams/btc-usd",
      ts: new Date().toISOString(),
      price: primary ? (Number(primary.probability * 100).toFixed(2) + "¢") : "—",
      hash: "0x92ae…a101",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Module 02"
        title="Resolve · show the receipts"
        description="Pick any market, compile resolution text into a deterministic spec, press run, and you immediately get the TRUE/FALSE outcome plus a notarized evidence bundle."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full">
              Compile spec
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white">
              Run monitor
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <RevealOnView className="space-y-5 rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">spec</p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">Market</p>
                  <p className="text-base font-semibold">{primary?.title ?? "Preset topic"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">Source</p>
                  <p className="text-base font-semibold capitalize">{dataSource}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">Rule</p>
                <p className="mt-1 text-sm text-white/80">
                  {primary
                    ? `Resolve TRUE if ${primary.title} outcome occurs before ${primary.subtitle.split("•")[0].trim()}.`
                    : "TRUE if condition is satisfied, otherwise FALSE."}
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">Quorum</p>
                  <p className="text-sm text-white/80">2 of 3 feeds</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">Tolerance</p>
                  <p className="text-sm text-white/80">0.1%</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">Monitor</p>
                  <p className="text-sm text-white/80">60s cadence</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">sources</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {specSources.map((source) => (
                <div key={source.name} className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/80">
                  <p className="text-sm font-semibold text-white">{source.name}</p>
                  <p>{source.field}</p>
                  <p className="text-xs text-white/50">{source.interval} snapshots</p>
                </div>
              ))}
            </div>
          </div>
        </RevealOnView>

        <RevealOnView className="space-y-4 rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">outcome</p>
              <h2 className="text-2xl font-semibold text-rose-200">
                {primary ? `${primary.tags[0]} · pending` : "PENDING"}
                <span className="ml-2 text-xs text-white/50">at fix time</span>
              </h2>
            </div>
            <Badge variant="outline" className="border-emerald-400/50 text-emerald-200">
              monitor ready
            </Badge>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">timeline</p>
            <ul className="mt-3 space-y-3">
              <li className="flex items-center gap-3">
                <Clock8 className="h-4 w-4 text-white/50" />
                Window opens · payload hashed
              </li>
              <li className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-white/50" />
                Quorum satisfied from two feeds
              </li>
              <li className="flex items-center gap-3">
                <FileDigit className="h-4 w-4 text-white/50" />
                Bundle sealed, signature stored locally
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">evidence</p>
            <ul className="mt-3 space-y-3">
              {evidence.map((item) => (
                <li key={item.url} className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/70">
                  <div className="flex items-center justify-between gap-3">
                    <Link2Icon className="h-4 w-4 text-white/40" />
                    <span className="truncate text-xs text-white/50">{item.url}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-white">
                    <span>{item.ts}</span>
                    <span>{item.price}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/50">SHA-256 {item.hash}</p>
                </li>
              ))}
            </ul>
          </div>
        </RevealOnView>
      </div>

      <RevealOnView className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">downloadables</p>
          <p className="text-lg font-semibold text-white">resolution_spec.json · resolution_proof.json · monitor_log.txt</p>
          <p className="text-sm text-white/60">Each includes sources, parsed rows, hashes, timestamps, and deterministic verdict.</p>
        </div>
        <Button size="lg" className="rounded-full">
          <Download className="mr-2 h-4 w-4" />
          Export receipts
        </Button>
      </RevealOnView>

      <RevealOnView className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-white/40">resolution queue</p>
        {topicMarkets.map((market, idx) => (
          <ProjectCard
            key={`resolve-${market.id}`}
            title={market.title}
            subtitle={`${market.subtitle} · ${market.tags[0]}`}
            imageSrc={market.imageSrc}
            tags={[idx === 0 ? "monitor running" : "queued", ...market.tags.slice(0, 2)]}
            href={market.href}
            priority={idx === 0}
            gradientFrom={market.gradientFrom}
            gradientTo={market.gradientTo}
            revealDelay={idx * 0.05}
          />
        ))}
      </RevealOnView>
    </div>
  )
}
