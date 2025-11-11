## 🚀 Inspiration

Prediction markets already surface brilliant signals, but we kept losing the thread between spotting a mispricing, proving it’s incoherent, logging the alert, and prepping the resolution receipts. Kairos was born to be that “markets mission control”—something a solo trader or a newsroom desk can open and instantly see how AI agents, watchlists, math, and evidence fit together without tab chaos.

## 🛠️ How I Built It

**Stack:**
* Next.js 15 App Router + React 19, Server Components, Server Actions, Tailwind v4, Radix UI, Recharts for sparklines, and Lucide icons.
* Authentication rides NextAuth 5 beta with the Prisma adapter and a Neon/Postgres database (JSONB fields store Claude memory + Polymarket credentials).

**Data layer:**
* Custom clients for Polymarket Gamma + CLOB, Nevua, Adjacent, and Anthropic Claude. Each helper normalizes env vars, throws typed errors, and ships demo fallbacks so the UI keeps working offline (hackathon-friendly).

**APIs & caching:**
* `/api/polymarket/price-history` memoizes token/interval pairs for 30 s; Nevua and Adjacent fetchers run on the server with concurrency caps (MAX 8 news lookups) to stay within rate limits.

**Math & logic:**
* **Coherence** encodes overlapping markets as a binary matrix (rows = markets, cols = world states) and checks whether price vectors violate ∑p_i = 1. Probability gaps generate trade recommendations with limit prices and certificates.
* **Factor** runs belief propagation on a six-node graph and exposes attribution by storing deltas per edge, while a knapsack DP maximizes signal lift under a toggle budget.
* **Arena** treats loophole coverage as a set-cover problem; we mark severity, patch type, and residual risk so judges see why the spec is now airtight.

**Agent memory:**
* Claude conversations persist via Prisma `claudeMemory` JSONB, exposed through `/api/memory`, so every module (alerts, factor, resolve) can read/write the same state.

**UI polish:**
* Motion-powered reveals, shader backgrounds, responsive side nav, and turbopack dev for instant feedback.

## 🧠 What I Learned

* React Server Components + Server Actions drastically simplify multi-API products when you keep all secrets on the server.
* Traders trust automation only when they see the math; even lightweight linear algebra + DP visualizations go a long way.
* Good fallbacks (seed data, graceful errors) are essential for hackathons where API quotas will fail right before judging.
* Prompt engineering is easier when the rest of the stack has typed schemas (Nevua alert JSON, watchlist payloads, etc.).

## 🧗 Challenges I Faced

* Wiring four external APIs with different auth styles while keeping keys server-only on a React 19 app router.
* Handling Polymarket CORS/timeouts; we solved it with our own caching route + seeded fallback data.
* Getting NextAuth 5 beta + Prisma to play nicely with the new React Server Components data flow.
* Translating qualitative prompts (“ping me if price jumps 5%”) into strict Nevua alert JSON without exposing secrets.
* Designing math explanations that feel trustworthy to market makers as well as policy analysts.

## ✨ What’s Next

* Connect to Polymarket’s order API so trade vectors can be executed (with risk rails) straight from Coherence.
* Stream live news + price deltas via websockets instead of refetching.
* That’s the full story behind Kairos—logic, math, and all the glue that keeps prediction-market operators in sync.

A HUGE SHOUTOUT TO NUEVA AND ADJACENT FOR PROVIDING ME PERSONALLY WITH THEIR APIs !
