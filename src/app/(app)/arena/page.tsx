import { PencilLine, Shield } from "lucide-react"

import PageHeader from "@/components/page-header"
import RevealOnView from "@/components/reveal-on-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const exploits = [
  {
    title: "Overtime scoring ambiguity",
    detail: "Resolution text never states if OT points count, so an underdog exploit could dispute.",
    severity: "high",
  },
  {
    title: "Data source fallback missing",
    detail: "If Source A is offline, the spec never clarifies fallback order.",
    severity: "medium",
  },
]

const patches = [
  { type: "text", content: "Add: “Overtime scoring counts toward the final total.”" },
  { type: "text", content: "Add: “If Source A fails, use Source B snapshot within 60s.”" },
  { type: "policy", content: "Set residual risk threshold ≤ 0.5%." },
]

export default function ArenaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Module 04"
        title="Arena · harden the criteria"
        description="One agent drafts the resolution spec, another tries to break it. We iterate until every exploit is neutralized and produce a loophole score with the minimal patch set."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full">
              Harden criteria
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white">
              Export loophole report
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <RevealOnView className="space-y-4 rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">resolution text</p>
              <h2 className="text-2xl font-semibold text-white">NBA Finals Game 7 total points</h2>
            </div>
            <Badge variant="outline" className="border-rose-400/40 text-rose-200">
              loophole score 0.78 → needs patch
            </Badge>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/70">
            <p>
              “Market resolves to TRUE if the combined score of Game 7 exceeds 215.5 according to League.com final box score.
              If the total is 215 or lower it resolves FALSE. Review takes place at 00:05 UTC following the game.”
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">exploits</p>
            <ul className="mt-3 space-y-3">
              {exploits.map((exploit) => (
                <li key={exploit.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{exploit.title}</p>
                    <Badge
                      variant="outline"
                      className={`border-white/20 text-xs ${
                        exploit.severity === "high" ? "text-rose-300" : "text-amber-200"
                      }`}
                    >
                      {exploit.severity}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-white/70">{exploit.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </RevealOnView>

        <RevealOnView className="space-y-4 rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">patch set</p>
              <h2 className="text-2xl font-semibold text-white">Minimal edits kill 100% exploits</h2>
            </div>
            <Shield className="h-10 w-10 text-emerald-300" />
          </div>

          <div className="space-y-3">
            {patches.map((patch, idx) => (
              <div key={`${patch.content}-${idx}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">{patch.type}</p>
                <p className="mt-1 text-sm text-white/80">{patch.content}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">coverage proof</p>
            <p className="mt-1">Patch mask verified via DP set cover. Residual risk: 0.0% · judge approves.</p>
          </div>

          <Button size="lg" className="w-full rounded-full">
            Show diff & apply
          </Button>
        </RevealOnView>
      </div>

      <RevealOnView className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { title: "Red-team agent", copy: "Searches for timing & source exploits" },
          { title: "Patch composer", copy: "String DP to propose smallest edits" },
          { title: "Judge", copy: "Scores whether exploit flips outcome" },
        ].map((item) => (
          <div key={item.title} className="rounded-3xl border border-white/10 bg-neutral-900/60 p-5">
            <PencilLine className="h-8 w-8 text-indigo-300" />
            <p className="mt-3 text-lg font-semibold text-white">{item.title}</p>
            <p className="text-sm text-white/70">{item.copy}</p>
          </div>
        ))}
      </RevealOnView>
    </div>
  )
}
