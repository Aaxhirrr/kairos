import {
  type AdjacentMarket,
  type AdjacentNewsArticle,
  type AdjacentMarketFilters,
  fetchAdjacentMarkets,
  fetchAdjacentNews,
} from "@/lib/adjacent"

import { NewsFilters, type NewsFilterFormState } from "./news-filters"

export const revalidate = 0

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>
type RawSearchParams = Record<string, string | string[] | undefined>

const DEFAULT_LIMIT = 6
const MAX_LIMIT = 16
const MAX_NEWS_REQUESTS = 8
const DEFAULT_PLATFORM = "all"
const DEFAULT_STATUS = "all"
const DEFAULT_SORT = "volume:desc"
const MOVERS_PROB_THRESHOLD = 0.7
const NEWS_LOOKBACK_DAYS = 10
const NEWS_PER_MARKET = 4

type MarketWithArticles = {
  market: AdjacentMarket
  articles: AdjacentNewsArticle[]
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value ?? undefined
}

function buildQueryString(base: RawSearchParams, overrides: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  Object.entries(base).forEach(([key, value]) => {
    if (!value) return
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry) params.append(key, entry)
      })
    } else {
      params.set(key, value)
    }
  })

  Object.entries(overrides).forEach(([key, value]) => {
    params.delete(key)
    if (value !== undefined && value !== "") {
      params.set(key, value)
    }
  })

  const query = params.toString()
  return query ? `?${query}` : ""
}

function hasParam(params: RawSearchParams, key: string) {
  return Object.prototype.hasOwnProperty.call(params, key)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function clampProbability(value: number) {
  if (!Number.isFinite(value)) return undefined
  return Math.min(Math.max(value, 0), 1)
}

function deriveNewsQuery(market: AdjacentMarket) {
  return market.question ?? market.event ?? market.adj_ticker ?? market.market_slug ?? market.market_id
}

function formatStoryDate(iso?: string) {
  if (!iso) return ""
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return ""
  const month = parsed.getMonth() + 1
  const day = parsed.getDate()
  const year = parsed.getFullYear()
  return `${month}.${day}.${year}`
}

const heroImages = [
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=60",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=60",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=60",
  "https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=1000&q=60",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=60",
]

type StoryCard = {
  id: string
  title: string
  dek: string
  byline: string
  dateLabel: string
  href: string
  market: AdjacentMarket
  article?: AdjacentNewsArticle
}

function heroImageForMarket(market: AdjacentMarket, index: number) {
  const base = market.category ?? market.platform ?? market.market_id ?? ""
  const hash = Array.from(base).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const poolIndex = Number.isFinite(hash) ? hash % heroImages.length : index % heroImages.length
  return heroImages[poolIndex]
}

function cleanMarketQuestion(question?: string): string {
  if (!question) return "Forward-looking signal"

  // Remove patterns like "yes New England,yes Baltimore" -> "New England, Baltimore"
  let cleaned = question.replace(/,yes /g, ', ')
  cleaned = cleaned.replace(/^yes /i, '')
  cleaned = cleaned.replace(/,no /g, ', ')
  cleaned = cleaned.replace(/^no /i, '')

  // Clean up any double spaces or commas
  cleaned = cleaned.replace(/\s+/g, ' ')
  cleaned = cleaned.replace(/,\s*,/g, ',')
  cleaned = cleaned.trim()

  return cleaned || "Forward-looking signal"
}

function toStoryCard(market: AdjacentMarket, article: AdjacentNewsArticle | null, idx: number): StoryCard {
  // Prioritize article title, then clean market question
  const title = article?.title ?? cleanMarketQuestion(market.question) ?? market.market_slug ?? "Forward-looking signal"

  const dek =
    article?.snippet ??
    market.description ??
    "Prediction markets flagged this storyline. Adjacent highlights the forward-looking context."
  const dateSource = article?.publishedDate ?? market.updated_at ?? market.created_at ?? new Date().toISOString()
  const authorLine = article?.author
    ? article.domain
      ? `${article.author} · ${article.domain}`
      : article.author
    : `Driven by ${market.platform ?? "Adjacent"}`

  return {
    id: `${market.market_id}-${article?.url ?? idx}`,
    title,
    dek,
    byline: authorLine,
    dateLabel: formatStoryDate(dateSource),
    href: article?.url ?? market.link ?? "#",
    market,
    article: article ?? undefined,
  }
}
function isTruthy<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

const DEFAULT_FORM_VALUES: NewsFilterFormState = {
  q: "",
  platform: DEFAULT_PLATFORM,
  status: DEFAULT_STATUS,
  category: "all",
  market_type: "all",
  sort: DEFAULT_SORT,
  limit: String(DEFAULT_LIMIT),
  probabilityMin: "",
  probabilityMax: "",
}

export default async function NewsPage({ searchParams }: { searchParams?: SearchParamsInput }) {
  const params = ((await searchParams) ?? {}) as RawSearchParams

  const filters: AdjacentMarketFilters = {}
  const formValues: NewsFilterFormState = { ...DEFAULT_FORM_VALUES }

  const qValue = normalizeParam(params.q)
  if (qValue) {
    filters.q = qValue
    formValues.q = qValue
  }

  const platformValue = normalizeParam(params.platform)
  const selectedPlatform =
    platformValue && platformValue.length ? platformValue : DEFAULT_FORM_VALUES.platform
  if (selectedPlatform !== "all") {
    filters.platform = selectedPlatform
  }
  formValues.platform = selectedPlatform

  const hasStatusParam = hasParam(params, "status")
  const statusValue = normalizeParam(params.status)
  const selectedStatus = !hasStatusParam || statusValue === undefined ? DEFAULT_FORM_VALUES.status : statusValue ?? ""
  if (selectedStatus && selectedStatus !== "all") {
    filters.status = selectedStatus
  }
  formValues.status = hasStatusParam ? (statusValue && statusValue.length ? statusValue : "all") : DEFAULT_FORM_VALUES.status

  const categoryValue = normalizeParam(params.category)
  if (categoryValue && categoryValue !== "all") {
    filters.category = categoryValue
  }
  formValues.category = categoryValue ?? "all"

  const marketTypeValue = normalizeParam(params.market_type)
  if (marketTypeValue && marketTypeValue !== "all") {
    filters.market_type = marketTypeValue
  }
  formValues.market_type = marketTypeValue ?? "all"

  const hasSortParam = hasParam(params, "sort")
  const sortValue = normalizeParam(params.sort)
  const selectedSort = hasSortParam ? sortValue ?? "" : DEFAULT_FORM_VALUES.sort
  if (selectedSort) {
    filters.sort = selectedSort
  }
  formValues.sort = selectedSort || DEFAULT_FORM_VALUES.sort

  const limitValueRaw = normalizeParam(params.limit)
  const parsedLimit = limitValueRaw ? Number(limitValueRaw) : DEFAULT_LIMIT
  const finalLimit = Number.isFinite(parsedLimit) ? clamp(parsedLimit, 1, MAX_LIMIT) : DEFAULT_LIMIT
  filters.limit = finalLimit
  formValues.limit = String(finalLimit)

  const probMinValue = normalizeParam(params.probability_min)
  const probMaxValue = normalizeParam(params.probability_max)
  const probMin = probMinValue ? clampProbability(Number(probMinValue)) : undefined
  const probMax = probMaxValue ? clampProbability(Number(probMaxValue)) : undefined
  if (typeof probMin === "number") {
    filters.probability_min = probMin
    formValues.probabilityMin = String(Math.round(probMin * 100))
  }
  if (typeof probMax === "number") {
    filters.probability_max = probMax
    formValues.probabilityMax = String(Math.round(probMax * 100))
  }

  const requestFilters: AdjacentMarketFilters = { ...filters }
  const platformParam = requestFilters.platform
  const multiPlatforms =
    typeof platformParam === "string" && platformParam.includes(",")
      ? platformParam.split(",").map((value) => value.trim()).filter(Boolean)
      : null
  if (multiPlatforms && multiPlatforms.length > 1) {
    delete requestFilters.platform
  }
  const requestLimit = requestFilters.limit ?? DEFAULT_LIMIT

  let markets: MarketWithArticles[] = []
  let marketsError: string | null = null
  let metaCount: number | undefined

  try {
    let rawMarkets: AdjacentMarket[] = []

    if (multiPlatforms && multiPlatforms.length > 1) {
      const perPlatformLimit = Math.max(1, Math.ceil(requestLimit / multiPlatforms.length))
      const responses = await Promise.all(
        multiPlatforms.map((platform) => fetchAdjacentMarkets({ ...requestFilters, platform, limit: perPlatformLimit }))
      )
      metaCount = responses.reduce((sum, response) => sum + (response.meta?.count ?? 0), 0)
      const merged = responses.flatMap((response) => response.data ?? [])
      const deduped = new Map<string, AdjacentMarket>()
      merged.forEach((market) => deduped.set(market.market_id, market))
      rawMarkets = Array.from(deduped.values()).slice(0, requestLimit)
    } else {
      const marketResponse = await fetchAdjacentMarkets(requestFilters)
      metaCount = marketResponse.meta?.count
      rawMarkets = marketResponse.data ?? []
    }

    const marketsNeedingNews = rawMarkets.slice(0, MAX_NEWS_REQUESTS)
    const newsMap = new Map<string, AdjacentNewsArticle[]>()

    await Promise.all(
      marketsNeedingNews.map(async (market) => {
        const lookup = deriveNewsQuery(market)
        if (!lookup) {
          newsMap.set(market.market_id, [])
          return
        }
        try {
          const newsResponse = await fetchAdjacentNews(lookup, { days: NEWS_LOOKBACK_DAYS, limit: NEWS_PER_MARKET })
          newsMap.set(market.market_id, newsResponse.data ?? [])
        } catch (error) {
          console.error("[adj.news] news fetch failed", lookup, error)
          newsMap.set(market.market_id, [])
        }
      })
    )

    markets = rawMarkets.map((market) => ({
      market,
      articles: newsMap.get(market.market_id) ?? [],
    }))
  } catch (error) {
    marketsError = error instanceof Error ? error.message : "Unable to load Adjacent markets right now."
  }

  const loadMoreStep = DEFAULT_LIMIT
  const canLoadMore = finalLimit < MAX_LIMIT
  const nextLimit = canLoadMore ? Math.min(MAX_LIMIT, finalLimit + loadMoreStep) : finalLimit
  const loadMoreHref = canLoadMore ? `/news${buildQueryString(params, { limit: String(nextLimit) })}` : null

  const storyCards = markets
    .flatMap(({ market, articles }, marketIndex) => {
      if (articles.length) {
        return articles.map((article, idx) => toStoryCard(market, article, marketIndex * 100 + idx))
      }
      return [toStoryCard(market, null, marketIndex)]
    })
    .filter(isTruthy)

  const heroStory = storyCards[0]
  const latestStories = heroStory ? storyCards.slice(1) : storyCards

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="border-b border-black/10 px-4 py-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-black/40">Driven by Adjacent</p>
          <h1 className="mt-4 text-4xl font-light uppercase tracking-tight sm:text-5xl">Forward Looking News</h1>
          <p className="mt-4 max-w-3xl text-lg text-black/70">
            Prediction markets and forecasting platforms surface tomorrow’s headlines. We curate the signals, contextualize the odds,
            and link you to the underlying markets.
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-black/60">
            <a href="https://x.com/adjacent" target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
              X
            </a>
            <span>|</span>
            <a href="https://t.me/adjacent" target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
              Telegram
            </a>
          </div>
          <form className="mt-6 flex w-full max-w-md border border-black bg-white">
            <input
              type="email"
              placeholder="lucas@adj.news"
              className="flex-1 border-0 bg-transparent px-4 py-2 text-left text-black placeholder:text-black/40 focus:outline-none"
              disabled
            />
            <button type="button" className="bg-black px-6 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white" disabled>
              Subscribe
            </button>
          </form>
          {marketsError ? (
            <p className="mt-4 text-sm text-red-600">
              {marketsError}. Double-check your Adjacent API key or try refreshing.
            </p>
          ) : null}
        </div>
      </section>

      {heroStory ? (
        <section className="px-4 py-12">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 border-b border-black/10 pb-10 md:flex-row">
            <div className="flex-1 space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-black/60">{heroStory.dateLabel}</p>
              <h2 className="text-4xl font-light leading-tight">{heroStory.title}</h2>
              <p className="text-base text-black/80">{heroStory.dek}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/60">{heroStory.byline}</p>
              <div className="pt-4">
                <a
                  href={heroStory.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block border border-black px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em]"
                >
                  Read story
                </a>
              </div>
            </div>
            <div className="flex-1">
              <div className="aspect-[3/2] w-full border border-black/10 bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImageForMarket(heroStory.market, 0)}
                  alt={heroStory.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 py-12">
          <div className="mx-auto max-w-3xl border-t border-black/10 px-6 py-12 text-center text-black/60">
            <p>No markets matched those filters. Relax the filters below to load fresh briefs.</p>
          </div>
        </section>
      )}

      <section className="px-4 py-12">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-wrap items-baseline justify-between border-b border-black/10 pb-4">
            <h3 className="text-3xl font-light">Latest stories</h3>
            <span className="text-lg text-black/60">{metaCount ?? storyCards.length} posts</span>
          </div>
          <div className="mt-6 grid gap-6 border-l border-b border-black/10 md:grid-cols-3">
            {latestStories.map((story) => (
              <article key={story.id} className="flex flex-col border-r border-t border-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">{story.dateLabel}</p>
                <h4 className="mt-2 text-2xl font-light leading-snug">{story.title}</h4>
                <p className="mt-2 line-clamp-3 text-sm text-black/70">{story.dek}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-black/60">{story.byline}</p>
                <a
                  href={story.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto pt-4 text-sm font-semibold uppercase tracking-[0.3em] text-black underline-offset-2 hover:underline"
                >
                  Open
                </a>
              </article>
            ))}
            {!latestStories.length ? (
              <div className="border-r border-t border-black/10 p-8 text-center text-sm text-black/60 md:col-span-3">
                We highlight every story we can find—refresh the filters to load more coverage.
              </div>
            ) : null}
          </div>
          <div className="mt-8 text-center">
            {canLoadMore ? (
              <a
                href={loadMoreHref ?? "#"}
                className="inline-block rounded-none border border-black bg-black px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white"
              >
                Load more
              </a>
            ) : (
              <button
                type="button"
                className="rounded-none border border-black/40 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black/50"
                disabled
              >
                All caught up
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-neutral-50 px-4 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <details className="group" open>
            <summary className="flex cursor-pointer items-center justify-between text-sm uppercase tracking-[0.3em] text-black">
              Discovery filters
              <span className="text-xs text-black/50">Adjust Adjacent market query</span>
            </summary>
            <div className="mt-6 rounded-3xl border border-black/10 bg-white p-6">
              <NewsFilters initialValues={formValues} defaultValues={DEFAULT_FORM_VALUES} />
            </div>
            <p className="mt-4 text-xs text-black/50">
              Showing movers over {MOVERS_PROB_THRESHOLD * 100}%? Try{" "}
              <a
                href={`/news?platform=kalshi,polymarket&status=${DEFAULT_STATUS}&probability_min=${MOVERS_PROB_THRESHOLD}&sort=probability:desc`}
                className="underline"
              >
                this preset
              </a>
              .
            </p>
          </details>
        </div>
      </section>
    </main>
  )
}
