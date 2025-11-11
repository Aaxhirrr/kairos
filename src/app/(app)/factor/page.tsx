import { BrainCircuit, PlugZap } from "lucide-react"

import PageHeader from "@/components/page-header"
import RevealOnView from "@/components/reveal-on-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

const nodes = [
  { id: "btc", label: "BTC > 55k", role: "target", belief: "0.58" },
  { id: "macro", label: "Macro regime soft landing", role: "factor", belief: "0.47" },
  { id: "etf", label: "ETF inflows surge", role: "evidence", belief: "+0.08" },
  { id: "vol", label: "Volatility spike", role: "evidence", belief: "-0.04" },
  { id: "funding", label: "Funding premium", role: "latent", belief: "0.12" },
]

const evidenceToggles = [
  { id: "item-1", label: "BTC weekly close > 71k", delta: "+0.06", selected: true },
  { id: "item-2", label: "FOMC hold w/ dovish SEP", delta: "+0.03", selected: true },
  { id: "item-3", label: "CPI surprise +0.4%", delta: "-0.07", selected: false },
]

export default function FactorPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Module 03"
        title="Factor · transparent belief circuit"
        description="Claude sketches the structure once; message passing keeps probabilities interpretable. We show which evidence moved odds, by how much, and recommend the top-k updates under an attention budget."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full">
              Toggle evidence
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white">
              Export posterior trace
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <RevealOnView className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">graph</p>
              <h2 className="text-2xl font-semibold text-white">6 nodes · 10 edges</h2>
            </div>
            <Badge variant="outline" className="border-emerald-400/50 text-emerald-200">
              disagreement alert
            </Badge>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {nodes.map((node) => (
              <div key={node.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{node.label}</p>
                  <span
                    className={
                      node.role === "target"
                        ? "rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-200"
                        : "rounded-full bg-white/10 px-3 py-1 text-xs text-white/60"
                    }
                  >
                    {node.role}
                  </span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">{node.belief}</p>
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">belief/proxy</p>
              </div>
            ))}
          </div>
        </RevealOnView>

        <RevealOnView className="space-y-4 rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">evidence budget</p>
            <div className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
              Pick best 3 (knapsack DP)
            </div>
          </div>
          <div className="space-y-4">
            {evidenceToggles.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <Switch checked={item.selected} readOnly />
                </div>
                <p className={`mt-1 text-xs ${item.delta.startsWith("-") ? "text-rose-300" : "text-emerald-300"}`}>
                  Δ {item.delta} vs market
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">attribution</p>
            <div className="mt-3 space-y-2 text-sm text-white/80">
              <p>ETF inflows → +3.4%</p>
              <p>Macro regime → +2.1%</p>
              <p>Volatility spike → -1.7%</p>
            </div>
          </div>
        </RevealOnView>
      </div>

      <RevealOnView className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
          <div className="flex items-center gap-3 text-white">
            <BrainCircuit className="h-10 w-10 text-emerald-300" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/40">posterior trace</p>
              <p className="text-2xl font-semibold">0.63 market vs 0.58 Kairos</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-white/70">
            When the gap exceeds 5pts, we raise a disagreement badge and feed it into the alerts system.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
          <div className="flex items-center gap-3 text-white">
            <PlugZap className="h-10 w-10 text-indigo-300" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-white/40">attention budget</p>
              <p className="text-2xl font-semibold">3 best signals = 81% of swing</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-white/70">
            Lightweight dynamic programming chooses which feed updates to show in the demo so you never see noise.
          </p>
        </div>
      </RevealOnView>
    </div>
  )
}
