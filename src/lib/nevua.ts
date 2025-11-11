const resolveEnv = (value: string | undefined, fallback: string) => {
  if (value && value.trim().length > 0) return value
  return fallback
}

const NEVUA_API_BASE_URL = resolveEnv(process.env.NEVUA_API_BASE_URL, "https://api.nevua.markets")
const NEVUA_API_KEY = process.env.NEVUA_API_KEY ?? ""

type WatchlistTag = {
  tagSlug: string
  include: boolean
}

type WatchlistKeyphrase = {
  text: string
  include: boolean
}

export type NevuaWatchlistResponse = {
  watchListId: string
  name: string
  tags?: WatchlistTag[]
  searchMatchOperator?: "AND" | "OR"
  automaticallyAddMatchingEvents?: boolean
}

export type NevuaWatchlist = {
  id: string
  name: string
  query?: {
    keyphrases?: WatchlistKeyphrase[]
    tags?: WatchlistTag[]
    searchMatchOperator?: "AND" | "OR"
  }
  automaticallyAddMatchingEvents?: boolean
  createdAt?: string
}

export type NevuaSubscription = {
  subscriptionId: string
  watchlistId: string
  watchlistName?: string
  subscriptionScope?: string
  subscriptionTypeConfig?: {
    type: string
    config?: Record<string, unknown>
  }
  createdAt?: string
  triggerType?: string
  status?: {
    enabled: boolean
    reason?: string
  }
}

export type NevuaSubscriptionResponse = {
  subscriptionId: string
  status?: string
}

export type NevuaMarketSummary = {
  id: string
  image: string
  question: string
  outcomes: string
  outcomePrices: string
  nevuaSVGLink?: string
}

export type NevuaSearchEvent = {
  id: string
  title: string
  slug: string
  image: string
  type: string
  markets: NevuaMarketSummary[]
}

function ensureKey() {
  if (!NEVUA_API_KEY) {
    throw new Error("NEVUA_API_KEY missing in environment")
  }
}

async function nevuaRequest<T>(endpoint: string, body: unknown): Promise<T> {
  ensureKey()
  const res = await fetch(`${NEVUA_API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NEVUA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`Nevua API error (${res.status}): ${errorBody}`)
  }

  return (await res.json()) as T
}

async function nevuaGet<T>(endpoint: string): Promise<T> {
  ensureKey()
  const res = await fetch(`${NEVUA_API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${NEVUA_API_KEY}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`Nevua API error (${res.status}): ${errorBody}`)
  }

  return (await res.json()) as T
}

export async function createNevuaWatchlistFromTags(input: {
  name: string
  tags: WatchlistTag[]
  searchMatchOperator: "AND" | "OR"
  automaticallyAddMatchingEvents: boolean
}): Promise<NevuaWatchlistResponse> {
  return await nevuaRequest<NevuaWatchlistResponse>("/watchlists/create-from-tags", input)
}

export async function fetchNevuaWatchlists(watchlistId?: string): Promise<NevuaWatchlist[]> {
  const endpoint = watchlistId ? `/watchlists/${watchlistId}` : "/watchlists"
  const response = await nevuaGet<{ watchLists?: NevuaWatchlist[] }>(endpoint)
  return response.watchLists ?? []
}

export async function fetchNevuaSubscriptions(watchlistId?: string): Promise<NevuaSubscription[]> {
  const endpoint = watchlistId ? `/subscriptions/${watchlistId}` : "/subscriptions"
  const response = await nevuaGet<{ subscriptions?: NevuaSubscription[] }>(endpoint)
  return response.subscriptions ?? []
}

export async function deleteNevuaSubscriptions(subscriptionIds: string[]) {
  if (!subscriptionIds.length) return
  await nevuaRequest("/subscriptions/delete", { subscriptionIds })
}

export async function deleteNevuaWatchlists(watchlistIds: string[]) {
  if (!watchlistIds.length) return
  await nevuaRequest("/watchlists/delete", { watchListIds: watchlistIds, watchlistIds })
}

export async function createNevuaSubscription(
  watchlistId: string,
  payload: {
    scope: "Watchlist"
    rule: Record<string, unknown>
    channels: Array<{ type: string; settings: Record<string, unknown> }>
  }
): Promise<NevuaSubscriptionResponse> {
  return await nevuaRequest<NevuaSubscriptionResponse>(`/subscriptions/${watchlistId}`, payload)
}

export async function searchNevuaByTags(tags: string[], operator: "AND" | "OR" = "OR") {
  if (!tags.length) return []
  const body = {
    tags: tags.map((tag) => ({ tagSlug: tag, include: true })),
    searchMatchOperator: operator,
  }
  return await nevuaRequest<NevuaSearchEvent[]>("/search/tag-slugs", body)
}

export async function searchNevuaByKeyphrases(keyphrases: string[], operator: "AND" | "OR" = "OR", partial = true) {
  if (!keyphrases.length) return []
  const body = {
    keyphrases: keyphrases.map((phrase) => ({ text: phrase, include: true })),
    searchMatchOperator: operator,
    partial,
  }
  return await nevuaRequest<NevuaSearchEvent[]>("/search", body)
}
