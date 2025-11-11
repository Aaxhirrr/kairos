import { CheckCircle2, ShieldAlert } from "lucide-react"

import PageHeader from "@/components/page-header"
import RevealOnView from "@/components/reveal-on-view"
import ProjectCard from "@/components/project-card"
import MarketPriceChart from "@/components/market-price-chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchTopicMarkets } from "@/lib/polymarket"
import { fallbackTopicMarkets } from "@/data/polymarket-fallback"
import { fallbackPriceHistory } from "@/data/polymarket-history-fallback"

const matrix = {
  columns: ["w1", "w2", "w3", "w4"],
  rows: [
    { label: "BTC > 55k", values: [1, 1, 0, 0] },
    { label: "BTC > 50k", values: [1, 0, 1, 0] },
    { label: "Soft landing", values: [0, 1, 1, 0] },
    { label: "ETH outperforms", values: [0, 0, 1, 1] },
  ],
}

const tradePlan = [
  { market: "BTC > 50k", side: "Sell", qty: "12", limit: "0.71" },
  { market: "BTC > 55k", side: "Buy", qty: "15", limit: "0.55" },
  { market: "ETH outperforms", side: "Buy", qty: "6", limit: "0.39" },
]

export default async function CoherencePage() {
  let topicMarkets = fallbackTopicMarkets
  let dataSource: "live" | "fallback" = "fallback"

  try {
    const markets = await fetchTopicMarkets()
    if (markets.length) {
      topicMarkets = markets
      dataSource = "live"
    }
  } catch (error) {
    console.error("[polymarket] falling back to seed data", error)
  }

  const [firstMarket, secondMarket] = topicMarkets
  const probabilityGap =
    firstMarket && secondMarket ? Math.abs(firstMarket.probability - secondMarket.probability) : null

  const violations =
    probabilityGap !== null
      ? [
          `${firstMarket.title} trades at ${firstMarket.tags[0]} while ${secondMarket.title} shows ${secondMarket.tags[0]} (spread ${Math.round(probabilityGap * 100)}¢)`,
          "Select any two overlapping markets to auto-generate a coherence proof.",
        ]
      : [
          "Add at least two overlapping markets to generate a coherence violation.",
          "Partition {Market A, Market B, Market C} inconsistent.",
        ]

  const initialHistory = fallbackPriceHistory

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Module 01"
        title="Coherence · do these prices add up?"
        description="Live Polymarket prices drop straight into the solver. Claude compiles boolean rules once, our math checks whether the sheet balances, and if not, you get a trade/hedge vector plus a proof."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full">
              Find mispricing
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white">
              Download certificate
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <RevealOnView className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-rose-300/80">infeasible</p>
              <h2 className="text-2xl font-semibold text-white">Topic · BTC macro & finals</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/20 text-white/70">
                Source: {dataSource === "live" ? "Polymarket API" : "Offline seed"}
              </Badge>
              <Badge variant="outline" className="border-rose-400/40 text-rose-200">
                Statewise deficit ≥ +$12
              </Badge>
            </div>
          </header>

          <div className="mt-6 space-y-4">
            {topicMarkets.map((market) => (
              <div
                key={market.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{market.title}</p>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/40">{market.groupLabel}</p>
                  <p className="text-xs text-white/50">{market.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{market.tags[0]}</p>
                  <p className="text-xs text-white/50">Polymarket</p>
                </div>
              </div>
            ))}
          </div>

          {firstMarket?.tokenId ? (
            <div className="mt-6">
              <MarketPriceChart
                tokenId={firstMarket.tokenId}
                marketTitle={firstMarket.title}
                initialData={initialHistory}
              />
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/40">violations</p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {violations.map((rule) => (
                <li key={rule} className="flex items-start gap-2">
                  <ShieldAlert className="mt-0.5 h-4 w-4 text-rose-400" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </RevealOnView>

        <RevealOnView className="space-y-4 rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">world matrix</p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-sm text-white/70">
                <thead>
                  <tr className="bg-white/5 text-xs uppercase tracking-[0.3em] text-white/50">
                    <th className="px-4 py-2 text-left">Market</th>
                    {matrix.columns.map((col) => (
                      <th key={col} className="px-3 py-2 text-center">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.rows.map((row) => (
                    <tr key={row.label} className="border-t border-white/5">
                      <td className="px-4 py-2 font-semibold text-white">{row.label}</td>
                      {row.values.map((value, idx) => (
                        <td key={`${row.label}-${idx}`} className="px-3 py-2 text-center">
                          <span
                            className={
                              value === 1
                                ? "inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200"
                                : "inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-white/40"
                            }
                          >
                            {value}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">trade plan</p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/30">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.3em] text-white/40">
                    <th className="px-4 py-2 text-left">Market</th>
                    <th className="px-4 py-2 text-left">Side</th>
                    <th className="px-4 py-2 text-left">Qty</th>
                    <th className="px-4 py-2 text-left">Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {tradePlan.map((trade) => (
                    <tr key={trade.market} className="border-t border-white/5 text-white/80">
                      <td className="px-4 py-2 font-medium">{trade.market}</td>
                      <td className="px-4 py-2">{trade.side}</td>
                      <td className="px-4 py-2">{trade.qty}</td>
                      <td className="px-4 py-2">{trade.limit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-white/60">Guaranteed ≥ +$14.20 across all feasible worlds (ε = $0.32).</p>
          </div>
        </RevealOnView>
      </div>

      <RevealOnView className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">proof bundle</p>
          <h3 className="mt-1 text-xl font-semibold text-white">coherence_certificate.json · trade_plan.csv · patch_proof.json</h3>
          <p className="text-sm text-white/70">Statewise payoff table + dual witness for infeasibility. No LLM in the loop.</p>
        </div>
        <Button size="lg" className="rounded-full">
          Export bundle
        </Button>
      </RevealOnView>

      <RevealOnView className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {["LP solver", "Dual witness", "DP rebalance"].map((item) => (
          <div key={item} className="rounded-3xl border border-white/10 bg-neutral-900/60 p-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            <p className="mt-2 text-lg font-semibold text-white">{item}</p>
            <p className="text-sm text-white/60">
              Deterministic math step. Logs stream to the artifact bundle for human verification.
            </p>
          </div>
        ))}
      </RevealOnView>

      <div className="space-y-4">
        {topicMarkets.map((market, idx) => (
          <ProjectCard
            key={market.id}
            title={market.title}
            subtitle={market.subtitle}
            imageSrc={market.imageSrc}
            tags={market.tags}
            href={market.href}
            priority={idx === 0}
            gradientFrom={market.gradientFrom}
            gradientTo={market.gradientTo}
            imageContainerClassName="lg:h-full"
            containerClassName="lg:h-[calc(100svh-2rem)]"
            revealDelay={idx * 0.06}
          />
        ))}
      </div>
    </div>
  )
}
