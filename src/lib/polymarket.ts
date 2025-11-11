const GAMMA_BASE = process.env.POLYMARKET_GAMMA_BASE ?? "https://gamma-api.polymarket.com"
const CLOB_BASE = process.env.POLYMARKET_CLOB_BASE ?? "https://clob.polymarket.com"

export type GammaMarket = {
  id: string
  question?: string
  title?: string
  slug?: string
  category?: string
  description?: string
  image?: string
  icon?: string
  endDate?: string
  outcomes?: string | string[]
  outcomePrices?: string | number[]
  lastTradePrice?: number
  bestBid?: number
  bestAsk?: number
  liquidity?: string
  liquidityNum?: number
  clobTokenIds?: string | string[]
}

export type TopicMarketCard = {
  id: string
  marketId?: string
  title: string
  subtitle: string
  href: string
  imageSrc: string
  tags: string[]
  gradientFrom: string
  gradientTo: string
  probability: number
  groupLabel: string
  tokenId?: string
}

type FetchMarketsOptions = {
  limit?: number
  active?: boolean
  closed?: boolean
  order?: string
}

export type PriceHistoryPoint = {
  t: number
  p: number
}

export type PriceHistoryInterval = "1h" | "6h" | "1d" | "1w" | "max"

const TOPIC_GROUPS = [
  {
    groupLabel: "Crypto",
    keywords: ["btc", "bitcoin", "eth", "ethereum", "crypto", "token"],
    gradientFrom: "#0f172a",
    gradientTo: "#6d28d9",
  },
  {
    groupLabel: "Macro",
    keywords: ["fed", "inflation", "cpi", "rate", "treasury", "macro"],
    gradientFrom: "#111827",
    gradientTo: "#2563eb",
  },
  {
    groupLabel: "Sports",
    keywords: ["nba", "nfl", "match", "game", "tournament", "final", "vs", "draw"],
    gradientFrom: "#0b132b",
    gradientTo: "#5bc0be",
  },
] as const

const DEFAULT_STYLE = {
  groupLabel: "Watchlist",
  gradientFrom: "#1f2937",
  gradientTo: "#8b5cf6",
}

function parseOutcomePrice(raw: GammaMarket["outcomePrices"], index: number) {
  if (!raw) return null
  let data: unknown = raw
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw)
    } catch {
      return null
    }
  }

  if (!Array.isArray(data)) return null
  const value = data[index]
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }
  return null
}

const USD_CENTS = (probability: number) => `${Math.round(probability * 100)}¢`

function formatSubtitle(market: GammaMarket) {
  if (!market.endDate) return "Live · Polymarket"
  const endDate = new Date(market.endDate)
  return `Ends ${endDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${market.category ?? "Polymarket"}`
}

function parseTokenIds(market: GammaMarket) {
  if (!market.clobTokenIds) return []
  if (Array.isArray(market.clobTokenIds)) return market.clobTokenIds
  try {
    const parsed = JSON.parse(market.clobTokenIds)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function fetchMarkets(options: FetchMarketsOptions = {}) {
  const url = new URL(`${GAMMA_BASE}/markets`)
  const { limit = 40, active = true, closed = false, order = "liquidityNum" } = options

  url.searchParams.set("limit", String(limit))
  url.searchParams.set("active", active ? "true" : "false")
  url.searchParams.set("closed", closed ? "true" : "false")
  url.searchParams.set("order", order)

  const res = await fetch(url.toString(), {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`Polymarket API error: ${res.status}`)
  }

  const json = (await res.json()) as unknown
  if (!Array.isArray(json)) {
    throw new Error("Unexpected Polymarket response")
  }

  return json as GammaMarket[]
}

/**
 * Fetches markets and picks a curated subset focused on crypto/macro/sports.
 * Falls back to the raw list if not enough matches are found.
 */
export async function fetchTopicMarkets(limit = 8): Promise<TopicMarketCard[]> {
  const markets = await fetchMarkets({ limit: 60 })

  const prioritized = markets
    .filter((market) => {
      const title = (market.question ?? market.title ?? "").toLowerCase()
      return TOPIC_GROUPS.some((group) => group.keywords.some((kw) => title.includes(kw)))
    })
    .map(decorateMarket)

  if (prioritized.length >= limit) {
    return prioritized.slice(0, limit)
  }

  const remaining = markets
    .filter((market) => !prioritized.find((item) => item.id === `${market.id}`))
    .map(decorateMarket)

  return [...prioritized, ...remaining].slice(0, limit)
}

const normalizeInterval = (interval?: string): PriceHistoryInterval => {
  if (interval === "1h" || interval === "6h" || interval === "1w" || interval === "max") return interval
  return "1d"
}

export async function fetchPriceHistory(tokenId?: string, interval?: string): Promise<PriceHistoryPoint[]> {
  if (!tokenId) return []

  const url = new URL(`${CLOB_BASE}/prices-history`)
  url.searchParams.set("market", tokenId)
  url.searchParams.set("interval", normalizeInterval(interval))

  const res = await fetch(url.toString(), { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`Prices history error: ${res.status}`)
  }

  const json = (await res.json()) as { history?: PriceHistoryPoint[] }
  return json.history ?? []
}

export async function fetchMarketById(marketId: string): Promise<GammaMarket> {
  const res = await fetch(`${GAMMA_BASE}/markets/${marketId}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Polymarket market lookup error: ${res.status}`)
  }

  const json = (await res.json()) as GammaMarket
  return json
}

function decorateMarket(market: GammaMarket): TopicMarketCard {
  const title = market.question ?? market.title ?? "Untitled market"
  const yesPrice = parseOutcomePrice(market.outcomePrices, 0)
  const implied = yesPrice ?? market.lastTradePrice ?? 0
  const normalized = Number.isFinite(implied) ? Math.max(0, Math.min(1, implied)) : 0

  const style =
    TOPIC_GROUPS.find((group) => group.keywords.some((kw) => title.toLowerCase().includes(kw))) ?? DEFAULT_STYLE

  const tags = [USD_CENTS(normalized), style.groupLabel]
  if (market.category) {
    tags.push(market.category)
  }

  const tokenIds = parseTokenIds(market)

  return {
    id: `${market.id}`,
    marketId: `${market.id}`,
    title,
    subtitle: formatSubtitle(market),
    href: market.slug ? `https://polymarket.com/event/${market.slug}` : "https://polymarket.com",
    imageSrc: market.image || market.icon || "/images/project-1.webp",
    tags,
    gradientFrom: style.gradientFrom,
    gradientTo: style.gradientTo,
    probability: normalized,
    groupLabel: style.groupLabel,
    tokenId: tokenIds[0],
  }
}
