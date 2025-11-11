import { Download, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import RevealOnView from "@/components/reveal-on-view"

type Fact = {
  label: string
  value: string
  updated: string
  trend?: "up" | "down" | "flat"
}

type Artifact = {
  label: string
  description: string
  filename: string
}

type Props = {
  facts?: Fact[]
  artifacts?: Artifact[]
}

const factTrendColor: Record<NonNullable<Fact["trend"]>, string> = {
  up: "text-emerald-400",
  down: "text-rose-400",
  flat: "text-white/60",
}

export default function FactsRail({
  facts = [
    { label: "BTC spot", value: "$73,420", updated: "refreshed 14s ago", trend: "up" },
    { label: "Game 7 clock", value: "04:16 Q4", updated: "synced 8s ago", trend: "flat" },
    { label: "Funding skew", value: "-1.2 sigma", updated: "model 30s ago", trend: "down" },
  ],
  artifacts = [
    { label: "Trade plan", description: "statewise payoff >= +$12", filename: "trade_plan.csv" },
    { label: "Coherence cert", description: "A*s = prices infeasible", filename: "coherence_certificate.json" },
    { label: "Resolution proof", description: "SHA bundle + quorum", filename: "resolution_proof_market-42.json" },
  ],
}: Props) {
  return (
    <aside className="facts-rail hidden w-72 shrink-0 flex-col gap-4 xl:flex">
      <RevealOnView className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.4em] text-white/50">
          <span>Facts</span>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full border border-white/10 bg-black/40">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <ul className="mt-4 space-y-4">
          {facts.map((fact) => (
            <li key={fact.label} className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">{fact.label}</p>
              <p className="mt-2 text-2xl font-semibold">{fact.value}</p>
              <p className="mt-1 text-xs text-white/50">
                <span className={fact.trend ? factTrendColor[fact.trend] : ""}>
                  {fact.trend === "up" && "^ "}
                  {fact.trend === "down" && "v "}
                </span>
                {fact.updated}
              </p>
            </li>
          ))}
        </ul>
      </RevealOnView>

      <RevealOnView className="rounded-3xl border border-white/10 bg-neutral-900/60 p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">Artifacts</div>
        <p className="mt-1 text-sm text-white/70">Deterministic bundles you hand to judges. No prose, only proofs.</p>
        <ul className="mt-4 space-y-3">
          {artifacts.map((artifact) => (
            <li key={artifact.filename} className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{artifact.label}</p>
                  <p className="text-xs text-white/60">{artifact.description}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full border border-white/10 bg-white/5">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <Badge variant="outline" className="mt-3 w-full justify-between border-white/10 text-white/60">
                {artifact.filename}
              </Badge>
            </li>
          ))}
        </ul>
      </RevealOnView>
    </aside>
  )
}
