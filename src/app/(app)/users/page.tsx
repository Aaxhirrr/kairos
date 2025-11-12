"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import PageHeader from "@/components/page-header"
import RevealOnView from "@/components/reveal-on-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { demoUser, featuredPeers, type FeaturedPeer } from "@/data/demo-user"

const helperCards = ["Positions snapshot", "Hedge me with $250", "Peer compare"]

export default function UsersPage() {
  const [query, setQuery] = useState("")
  const normalizedQuery = query.trim().toLowerCase()

  const highlightedPeer = useMemo<FeaturedPeer | null>(() => {
    if (!normalizedQuery) return null
    return (
      featuredPeers.find((peer) =>
        peer.searchTerms.some((term) => term.toLowerCase().includes(normalizedQuery))
      ) ?? null
    )
  }, [normalizedQuery])

  const leaderboard = useMemo(() => {
    if (!highlightedPeer) return featuredPeers
    return [highlightedPeer, ...featuredPeers.filter((peer) => peer.id !== highlightedPeer.id)]
  }, [highlightedPeer])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Module 05"
        title="Users · follow & compare"
        description="Paste a Polymarket profile or wallet, sync their PredictFolio stats, and let Kairos build calibration, ROI, and exposure gaps."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full">
              Import profile
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white">
              Compare handles
            </Button>
          </div>
        }
      />

      <RevealOnView className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Signed in as</p>
            <h2 className="text-3xl font-semibold text-white">{demoUser.name}</h2>
            <p className="text-sm text-white/70">{demoUser.email}</p>
            <p className="mt-2 text-sm text-emerald-300">{demoUser.pnl30d}</p>
            <p className="text-xs text-white/50">{demoUser.title}</p>
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            {demoUser.trades.map((trade) => (
              <div key={trade.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">{trade.platform}</p>
                <p className="mt-1 text-white">{trade.market}</p>
                <p className="text-sm text-white/70">{trade.stance}</p>
                <p className="text-xs text-white/50">{trade.size}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealOnView>

      <RevealOnView className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 space-y-4">
        <form
          className="flex flex-col gap-4 lg:flex-row lg:items-center"
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
            <Search className="h-5 w-5 text-white/40" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Paste a profile URL, wallet, or @handle"
              className="border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0"
            />
          </div>
          <Button size="lg" className="rounded-full">
            Fetch stats
          </Button>
        </form>
        {highlightedPeer ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Match found</p>
                <h3 className="text-2xl font-semibold text-white">{highlightedPeer.handle}</h3>
                <p className="text-sm text-white/60">{highlightedPeer.address}</p>
                <p className="text-xs text-emerald-300">{highlightedPeer.style}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild className="rounded-full">
                  <a href={highlightedPeer.polymarketUrl} target="_blank" rel="noreferrer">
                    View Polymarket
                  </a>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-white/30 text-white">
                  <a href={highlightedPeer.predictfolioUrl} target="_blank" rel="noreferrer">
                    Copy portfolio
                  </a>
                </Button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {highlightedPeer.positions.map((position) => (
                <div key={position.market} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-sm font-semibold text-white">{position.market}</p>
                  <p className="text-xs text-white/60">{position.side}</p>
                  <p className="text-xs text-white/40">
                    Filled {position.filled} · {position.size}
                  </p>
                  <p className="text-xs text-emerald-300">Confidence {position.confidence}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/60">
            Paste @Theo4, the wallet 0x5668…5839, or a PredictFolio link to pull their open positions automatically.
          </p>
        )}
      </RevealOnView>

      <RevealOnView className="grid grid-cols-1 gap-6 lg:grid-cols-2" staggerChildren>
        {leaderboard.map((user) => (
          <div key={user.id} className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">profile</p>
                <h2 className="text-2xl font-semibold text-white">{user.handle}</h2>
                <p className="text-sm text-white/60">{user.address}</p>
              </div>
              <Badge variant="outline" className="border-emerald-400/40 text-emerald-200">
                {user.style}
              </Badge>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 text-white">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">ROI 30d</p>
                <p className="text-3xl font-semibold">{user.stats.roi30d}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Win rate</p>
                <p className="text-3xl font-semibold">{user.stats.winRate}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Brier</p>
                <p className="text-3xl font-semibold">{user.stats.brier}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Edge vs market</p>
                <p className="text-3xl font-semibold">{user.stats.edge}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Max drawdown</p>
                <p className="text-3xl font-semibold text-rose-300">{user.stats.drawdown}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Calibration</p>
                <p className="text-base text-white/70">{user.stats.calibration}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="sm" className="rounded-full">
                <a href={user.polymarketUrl} target="_blank" rel="noreferrer">
                  Polymarket
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-full border-white/30 text-white">
                <a href={user.predictfolioUrl} target="_blank" rel="noreferrer">
                  PredictFolio
                </a>
              </Button>
            </div>
          </div>
        ))}
      </RevealOnView>

      <RevealOnView className="grid grid-cols-1 gap-4 md:grid-cols-3" staggerChildren>
        {helperCards.map((item) => (
          <div key={item} className="rounded-3xl border border-white/10 bg-neutral-900/60 p-5">
            <p className="text-lg font-semibold text-white">{item}</p>
            <p className="text-sm text-white/70">
              Conditioning the coherence solver on a user&apos;s exposure produces a hedge-aware trade vector.
            </p>
          </div>
        ))}
      </RevealOnView>
    </div>
  )
}
