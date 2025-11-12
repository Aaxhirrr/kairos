"use client"

import { useMemo, useState, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"

import PageHeader from "@/components/page-header"
import RevealOnView from "@/components/reveal-on-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { demoUser, featuredPeers, type FeaturedPeer } from "@/data/demo-user"

type PolymarketUser = {
  username: string
  address: string
  profileUrl: string
  avatarUrl?: string
  volume?: number
  marketsTraded?: number
}

export default function UsersPage() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [fetchedUser, setFetchedUser] = useState<PolymarketUser | null>(null)
  const normalizedQuery = query.trim().toLowerCase()

  const highlightedPeer = useMemo<FeaturedPeer | null>(() => {
    if (!normalizedQuery || fetchedUser) return null
    return (
      featuredPeers.find((peer) =>
        peer.searchTerms.some((term) => term.toLowerCase().includes(normalizedQuery))
      ) ?? null
    )
  }, [normalizedQuery, fetchedUser])

  const handleFetchUser = async (searchQuery?: string) => {
    const queryToUse = searchQuery || query
    if (!queryToUse.trim() || isLoading) return

    setIsLoading(true)
    setFetchedUser(null)

    try {
      // Extract username or address from various input formats
      let searchTerm = queryToUse.trim()

      // Handle Polymarket URLs
      if (searchTerm.includes('polymarket.com')) {
        const match = searchTerm.match(/polymarket\.com\/profile\/([^/?]+)/)
        if (match) searchTerm = match[1]
      }

      // Handle @mentions
      if (searchTerm.startsWith('@')) {
        searchTerm = searchTerm.slice(1)
      }

      // Try multiple API endpoints
      let data = null

      // Try gamma API first
      try {
        const response = await fetch(`https://gamma-api.polymarket.com/users/${searchTerm}`, {
          headers: {
            'Accept': 'application/json',
          },
        })
        if (response.ok) {
          data = await response.json()
        }
      } catch (err) {
        console.log('Gamma API failed, trying alternatives')
      }

      // If gamma fails, try the main API
      if (!data) {
        try {
          const response = await fetch(`https://api.polymarket.com/users/${searchTerm}`)
          if (response.ok) {
            data = await response.json()
          }
        } catch (err) {
          console.log('Main API failed')
        }
      }

      if (data) {
        setFetchedUser({
          username: data.username || data.name || searchTerm,
          address: data.address || data.wallet_address || searchTerm,
          profileUrl: `https://polymarket.com/profile/${data.username || data.name || searchTerm}`,
          avatarUrl: data.avatar_url || data.avatarUrl || data.profile_image,
          volume: data.total_volume || data.volume || data.volumeNum,
          marketsTraded: data.markets_traded || data.marketsTraded || data.total_markets,
        })
      } else {
        // Fallback: create basic profile
        setFetchedUser({
          username: searchTerm,
          address: searchTerm,
          profileUrl: `https://polymarket.com/profile/${searchTerm}`,
        })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      // Even on error, show basic profile
      setFetchedUser({
        username: queryToUse.trim(),
        address: queryToUse.trim(),
        profileUrl: `https://polymarket.com/profile/${queryToUse.trim()}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-fetch when user types
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleFetchUser()
      } else {
        setFetchedUser(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query])

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
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
          <Search className="h-5 w-5 text-white/40" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try @fengubiying as a sample profile"
            className="border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0"
          />
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-white/40" />}
        </div>
        {fetchedUser ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Polymarket user</p>
                <h3 className="text-2xl font-semibold text-white">{fetchedUser.username}</h3>
                <p className="text-sm text-white/60">{fetchedUser.address}</p>
                {fetchedUser.volume && (
                  <p className="text-xs text-emerald-300">Volume: ${fetchedUser.volume.toLocaleString()}</p>
                )}
                {fetchedUser.marketsTraded && (
                  <p className="text-xs text-white/60">Markets traded: {fetchedUser.marketsTraded}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild className="rounded-full">
                  <a href={fetchedUser.profileUrl} target="_blank" rel="noreferrer">
                    View Polymarket
                  </a>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-white/30 text-white">
                  <a href={`/agent?prompt=Copy portfolio for ${fetchedUser.username}`}>
                    Copy with Claude
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ) : highlightedPeer ? (
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
            Search for any Polymarket user by username, wallet address, or profile URL. Try @fengubiying to see it in action.
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
    </div>
  )
}
