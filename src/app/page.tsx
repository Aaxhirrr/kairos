import Link from "next/link"
import { ArrowRight } from "lucide-react"

import AnimatedHeading from "@/components/animated-heading"
import DotGridShader from "@/components/DotGridShader"
import ProjectCard from "@/components/project-card"
import RevealOnView from "@/components/reveal-on-view"
import { Button } from "@/components/ui/button"

const featureCards = [
  {
    title: "Agent Copilot",
    subtitle: "Claude memory + job runners",
    imageSrc: "/images/project-1.webp",
    tags: ["Jobs 3-5", "Personal context"],
    href: "/agent",
    gradientFrom: "#0f172a",
    gradientTo: "#6d28d9",
  },
  {
    title: "News Radar",
    subtitle: "Adjacent filter + claim links",
    imageSrc: "/images/project-4.webp",
    tags: ["Forward looking", "Load more"],
    href: "/news",
    gradientFrom: "#111827",
    gradientTo: "#2563eb",
  },
  {
    title: "User Lens",
    subtitle: "PredictFolio-grade stats",
    imageSrc: "/images/project-5.webp",
    tags: ["ROI", "Calibration"],
    href: "/users",
    gradientFrom: "#1f2937",
    gradientTo: "#8b5cf6",
  },
  {
    title: "Lists & Alerts",
    subtitle: "Nevua-style watch & ping",
    imageSrc: "/images/project-6.webp",
    tags: ["Watchlists", "Signals"],
    href: "/lists",
    gradientFrom: "#0b132b",
    gradientTo: "#10b981",
  },
]

const proofPillars = [
  "Claude agent remembers your watchlists, alerts, and trades.",
  "Personalized Nevua watchlists with wired alert rules.",
  "Theo-style leaderboard so you can copy winning portfolios.",
  "Adjacent news filtering with why-it-matters context.",
]


export default function Page() {
  return (
    <main className="bg-background text-foreground">
      <section className="px-4 pt-4 pb-16 lg:pb-8">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[420px_1fr]">
          <aside className="lg:sticky lg:top-4 lg:h-[calc(100svh-2rem)]">
            <RevealOnView
              as="div"
              intensity="hero"
              className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-6 sm:p-8"
              staggerChildren
            >
              <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
                <DotGridShader />
              </div>

              <div>
                <div className="mb-8 flex items-center gap-2">
                  <div className="text-2xl font-extrabold tracking-tight">Kairos</div>
                  <div className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden="true" />
                  <span className="text-xs uppercase tracking-[0.4em] text-white/40">Proof-first</span>
                </div>

                <AnimatedHeading
                  className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl"
                  lines={["Polymarket clarity", "without wallet stress"]}
                />

                <p className="mt-4 max-w-[46ch] text-lg text-white/70">
                  One friendly workspace that turns multiple markets into clean actions, receipts, and forward-looking context.
                  Claude compiles the text once; our math handles the rest -- offline, deterministic, audit-ready.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg" className="rounded-full">
                    <Link href="/agent">
                      Open agent
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="lg" className="rounded-full border border-white/15 bg-white/5">
                    <Link href="/news">See the signals</Link>
                  </Button>
                </div>

                <div className="mt-10">
                  <p className="mb-3 text-xs font-semibold tracking-widest text-white/50">WHAT SHIPS TODAY</p>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm font-semibold text-white/60 sm:grid-cols-1">
                    {proofPillars.map((pillar) => (
                      <li key={pillar} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        {pillar}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <p className="text-xs font-semibold tracking-[0.4em] text-white/50">FOCUS</p>
                <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-white/80">
                  <div className="rounded-2xl border border-white/15 bg-black/40 px-3 py-2">Agent</div>
                  <div className="rounded-2xl border border-white/15 bg-black/40 px-3 py-2">News</div>
                  <div className="rounded-2xl border border-white/15 bg-black/40 px-3 py-2">Users</div>
                  <div className="rounded-2xl border border-white/15 bg-black/40 px-3 py-2">Lists</div>
                </div>
              </div>
            </RevealOnView>
          </aside>

          <div className="space-y-4">
            {featureCards.map((feature, idx) => (
              <ProjectCard
                key={feature.title}
                {...feature}
                priority={idx === 0}
                imageContainerClassName="lg:h-full"
                containerClassName="lg:h-[calc(100svh-2rem)]"
                revealDelay={idx * 0.06}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
