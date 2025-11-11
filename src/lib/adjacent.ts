const resolveEnv = (value: string | undefined, fallback: string) => {
  if (value && value.trim().length > 0) return value
  return fallback
}

const ADJACENT_API_BASE_URL = resolveEnv(process.env.ADJACENT_API_BASE_URL, "https://api.data.adj.news")
const ADJACENT_API_KEY = process.env.ADJACENT_API_KEY ?? ""

export type AdjacentMarket = {
  market_id: string
  platform_id?: string
  ticker?: string
  adj_ticker?: string
  market_slug?: string
  platform?: string
  market_type?: string
  question?: string
  description?: string
  rules?: string
  result?: string | null
  link?: string
  status?: string
  reported_date?: string
  created_at?: string
  updated_at?: string
  end_date?: string
  resolution_date?: string | null
  probability?: number
  volume?: number
  open_interest?: number
  liquidity?: number
  category?: string | null
  tags?: string[]
  platform_ids?: Record<string, string>
  status_details?: Record<string, unknown>
  settlement_sources?: string[]
  comments_count?: number
  has_comments?: number
  trades_count?: number
  event?: string
}

export type AdjacentMeta = {
  count?: number
  limit?: number
  offset?: number
  hasMore?: boolean
  page?: number
  totalPages?: number
  filters?: Record<string, unknown>
  sort?: string
}

export type AdjacentMarketsResponse = {
  data: AdjacentMarket[]
  meta?: AdjacentMeta
}

export type AdjacentNewsArticle = {
  title: string
  url: string
  publishedDate?: string
  author?: string
  domain?: string
  snippet?: string
}

export type AdjacentNewsResponse = {
  data: AdjacentNewsArticle[]
  meta?: {
    query?: string
    days?: number
    limit?: number
    totalResults?: number
    searchTime?: string
    excludeDomains?: string[]
    searchMethod?: string
    queryProcessed?: string
  }
}

export type AdjacentMarketFilters = {
  limit?: number
  offset?: number
  platform?: string
  status?: string
  category?: string
  market_type?: string
  q?: string
  question_contains?: string
  tags?: string
  probability_min?: number
  probability_max?: number
  volume_min?: number
  liquidity_min?: number
  end_date_before?: string
  end_date_after?: string
  created_after?: string
  created_before?: string
  sort?: string
  sort_by?: string
  sort_dir?: "asc" | "desc"
  include_closed?: boolean
  include_resolved?: boolean
}

export type AdjacentNewsOptions = {
  days?: number
  limit?: number
  excludeDomains?: string
  includeDomains?: string
}

function ensureAdjacentCredentials() {
  if (!ADJACENT_API_KEY) {
    throw new Error("ADJACENT_API_KEY missing in environment")
  }
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = new URL(normalizedPath, ADJACENT_API_BASE_URL)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return
      if (typeof value === "boolean") {
        url.searchParams.set(key, value ? "true" : "false")
      } else {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url
}

async function adjacentGet<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
  ensureAdjacentCredentials()
  const url = buildUrl(path, params)
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ADJACENT_API_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "")
    throw new Error(`adj.news API error (${res.status}): ${errorBody || res.statusText}`)
  }

  return (await res.json()) as T
}

export async function fetchAdjacentMarkets(filters: AdjacentMarketFilters = {}): Promise<AdjacentMarketsResponse> {
  const allowed: AdjacentMarketFilters = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    ;(allowed as Record<string, typeof value>)[key] = value
  })

  return await adjacentGet<AdjacentMarketsResponse>("/api/markets", allowed)
}

export async function fetchAdjacentNews(marketQuery: string, options: AdjacentNewsOptions = {}): Promise<AdjacentNewsResponse> {
  if (!marketQuery?.trim()) {
    throw new Error("Market query is required for adj.news news lookup")
  }

  const params: AdjacentNewsOptions = {}
  if (typeof options.days === "number" && Number.isFinite(options.days)) {
    params.days = options.days
  }
  if (typeof options.limit === "number" && Number.isFinite(options.limit)) {
    params.limit = options.limit
  }
  if (options.excludeDomains) {
    params.excludeDomains = options.excludeDomains
  }
  if (options.includeDomains) {
    params.includeDomains = options.includeDomains
  }

  const encoded = encodeURIComponent(marketQuery.trim())

  try {
    return await adjacentGet<AdjacentNewsResponse>(`/api/news/${encoded}`, params)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes("(404)")) {
      return { data: [], meta: { query: marketQuery, limit: params.limit, days: params.days } }
    }
    throw error
  }
}
