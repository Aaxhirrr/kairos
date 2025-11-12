import { NewsFilters, type NewsFilterFormState } from "./news-filters"
import RevealOnView from "@/components/reveal-on-view"

export const revalidate = 0

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>

const DEFAULT_FORM_VALUES: NewsFilterFormState = {
  q: "",
  platform: "all",
  status: "all",
  category: "all",
  market_type: "all",
  sort: "volume:desc",
  limit: "6",
  probabilityMin: "",
  probabilityMax: "",
}

// Varied news articles as fallback since Adjacent API is deactivated
const FALLBACK_NEWS = [
  {
    id: "1",
    title: "AI Safety Regulation Advances in European Parliament",
    dek: "European Parliament passes landmark AI safety framework with bipartisan support, setting global precedent for algorithmic accountability.",
    author: "Sarah Chen",
    domain: "reuters.com",
    date: "11.12.2025",
    url: "https://reuters.com",
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1000&q=60",
  },
  {
    id: "2",
    title: "Federal Reserve Signals Rate Hold Through Q2 2025",
    dek: "Fed chair confirms steady monetary policy amid cooling inflation data, market volatility expected to decrease significantly.",
    author: "Michael Torres",
    domain: "bloomberg.com",
    date: "11.11.2025",
    url: "https://bloomberg.com",
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=60",
  },
  {
    id: "3",
    title: "Swing State Election Reforms Pass Final Legislative Hurdle",
    dek: "New voting access legislation clears state senate in Pennsylvania, expanding early voting and mail-in ballot procedures.",
    author: "Jennifer Wu",
    domain: "apnews.com",
    date: "11.10.2025",
    url: "https://apnews.com",
    img: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1000&q=60",
  },
  {
    id: "4",
    title: "Tech Giants Announce Joint AI Ethics Board",
    dek: "Leading technology companies establish independent oversight committee to address algorithmic bias and transparency concerns.",
    author: "David Park",
    domain: "techcrunch.com",
    date: "11.09.2025",
    url: "https://techcrunch.com",
    img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=60",
  },
  {
    id: "5",
    title: "Climate Summit Yields Breakthrough Carbon Trading Framework",
    dek: "International delegates agree on standardized emissions trading platform, marking significant progress in climate policy coordination.",
    author: "Emma Rodriguez",
    domain: "theguardian.com",
    date: "11.08.2025",
    url: "https://theguardian.com",
    img: "https://images.unsplash.com/photo-1569163139394-de4798aa62b6?auto=format&fit=crop&w=1000&q=60",
  },
  {
    id: "6",
    title: "Semiconductor Supply Chain Shows Signs of Stabilization",
    dek: "Major chip manufacturers report improved production capacity and reduced lead times as global supply chains recover.",
    author: "James Kim",
    domain: "wsj.com",
    date: "11.07.2025",
    url: "https://wsj.com",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=60",
  },
  {
    id: "7",
    title: "Healthcare Reform Bill Advances in House Committee",
    dek: "Bipartisan legislation aims to reduce prescription drug costs and expand coverage for chronic disease management.",
    author: "Lisa Anderson",
    domain: "politico.com",
    date: "11.06.2025",
    url: "https://politico.com",
    img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=60",
  },
  {
    id: "8",
    title: "Space Industry Sees Record Private Investment Quarter",
    dek: "Venture capital flows into commercial space ventures hit all-time high, driven by satellite and launch infrastructure projects.",
    author: "Robert Chang",
    domain: "spacenews.com",
    date: "11.05.2025",
    url: "https://spacenews.com",
    img: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=1000&q=60",
  },
]

export default async function NewsPage({ searchParams }: { searchParams?: SearchParamsInput }) {
  const params = ((await searchParams) ?? {}) as Record<string, string | string[] | undefined>
  const formValues: NewsFilterFormState = { ...DEFAULT_FORM_VALUES }

  const heroStory = FALLBACK_NEWS[0]
  const latestStories = FALLBACK_NEWS.slice(1)

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="border-b border-black/10 px-4 py-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-black/40">Forward Looking News</p>
          <h1 className="mt-4 text-4xl font-light uppercase tracking-tight sm:text-5xl">Market Signal Analysis</h1>
          <p className="mt-4 max-w-3xl text-lg text-black/70">
            Curated market-moving news and forward-looking signals. Adjacent beta API access has ended post-hackathon—these articles represent the type of analysis the platform delivers.
          </p>
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">⚠️ API Status</p>
            <p className="mt-1">The Adjacent beta API has been deactivated as the hackathon concluded. The news feed now shows curated fallback content to demonstrate the platform's capabilities.</p>
          </div>
        </div>
      </section>

      {heroStory ? (
        <section className="px-4 py-12">
          <RevealOnView className="mx-auto flex w-full max-w-5xl flex-col gap-8 border-b border-black/10 pb-10 md:flex-row" intensity="hero">
            <div className="flex-1 space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-black/60">{heroStory.date}</p>
              <h2 className="text-4xl font-light leading-tight">{heroStory.title}</h2>
              <p className="text-base text-black/80">{heroStory.dek}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/60">
                {heroStory.author} · {heroStory.domain}
              </p>
              <div className="pt-4">
                <a
                  href={heroStory.url}
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
                <img
                  src={heroStory.img}
                  alt={heroStory.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </RevealOnView>
        </section>
      ) : null}

      <section className="px-4 py-12">
        <div className="mx-auto w-full max-w-5xl">
          <RevealOnView>
            <div className="flex flex-wrap items-baseline justify-between border-b border-black/10 pb-4">
              <h3 className="text-3xl font-light">Latest stories</h3>
              <span className="text-lg text-black/60">{FALLBACK_NEWS.length} posts</span>
            </div>
          </RevealOnView>
          <RevealOnView className="mt-6 grid gap-6 border-l border-b border-black/10 md:grid-cols-3" staggerChildren delay={0.2}>
            {latestStories.map((story) => (
              <article key={story.id} className="flex flex-col border-r border-t border-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-black/50">{story.date}</p>
                <h4 className="mt-2 text-2xl font-light leading-snug">{story.title}</h4>
                <p className="mt-2 line-clamp-3 text-sm text-black/70">{story.dek}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-black/60">
                  {story.author} · {story.domain}
                </p>
                <a
                  href={story.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto pt-4 text-sm font-semibold uppercase tracking-[0.3em] text-black underline-offset-2 hover:underline"
                >
                  Open
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-neutral-50 px-4 py-10">
        <div className="mx-auto w-full max-w-5xl">
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between text-sm uppercase tracking-[0.3em] text-black">
              AI-Powered Filters
              <span className="text-xs text-black/50">Claude integration (API deactivated)</span>
            </summary>
            <div className="mt-6 rounded-3xl border border-black/10 bg-white p-6">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">🤖 Claude Filter Integration</p>
                <p className="mt-2">
                  The Claude-powered filtering system would allow you to ask natural language queries like "Show me markets related to AI regulation" or "Filter by high-conviction trades." Since the Adjacent API is deactivated, this feature is demonstrated conceptually.
                </p>
              </div>
              <div className="mt-6">
                <NewsFilters initialValues={formValues} defaultValues={DEFAULT_FORM_VALUES} />
              </div>
            </div>
          </details>
        </div>
      </section>
    </main>
  )
}
