import type { NevuaSubscription, NevuaWatchlist } from "@/lib/nevua"
import type { ClaudeMemory } from "@/types/memory"

export type DemoTrade = {
  id: string
  market: string
  platform: string
  stance: string
  size: string
  conviction: number
  timeframe: string
  notes: string
}

export type FeaturedPeer = {
  id: string
  displayName: string
  handle: string
  address: string
  polymarketUrl: string
  predictfolioUrl: string
  style: string
  stats: {
    roi30d: string
    winRate: string
    brier: string
    edge: string
    drawdown: string
    calibration: string
  }
  positions: Array<{
    market: string
    side: string
    filled: string
    size: string
    confidence: string
  }>
  searchTerms: string[]
}

const agentMemory: ClaudeMemory = {
  summary:
    "Keeps a concentrated book in high-liquidity Polymarket macro and AI-interference questions. " +
    "Prefers 60-90 day windows, hedges with USD CPI ladders, and wants Claude to flag incoherent trades across modules.",
  highlights: [
    {
      label: "Focus",
      detail: "AI infra squeeze + US election integrity sweeps are priority watchlists.",
      timestamp: "2025-11-08T18:12:00Z",
    },
    {
      label: "Alerts",
      detail: "Needs a 5% jump ping or 24h-to-resolution reminder routed to webhook + SMS.",
      timestamp: "2025-11-08T18:14:00Z",
    },
    {
      label: "Risk",
      detail: "Will trim conflicting stances when Coherence flags mismatched trades.",
      timestamp: "2025-11-08T18:18:00Z",
    },
  ],
  lastUpdated: "2025-11-09T07:45:00Z",
}

export const demoUser = {
  id: "demo-aashir",
  name: "Aashir",
  email: "anola133@asu.edu",
  title: "Macro & AI interference plays",
  location: "Tempe  -  GMT-7",
  pnl30d: "+$4.2K  -  +24.7%",
  conviction: "0.72 avg conviction",
  watchlistKeywords: [
    "AI infrastructure bottlenecks",
    "election interference",
    "swing-state turnout",
    "CPI glide path",
    "Bitcoin halving volatility",
    "NFL QB injuries",
  ],
  modulesPipeline: [
    {
      name: "Coherence",
      detail: "Cross-check AI interference vs macro hedges for contradictions.",
      cadence: "Daily 08:00",
    },
    {
      name: "Resolve",
      detail: "Hold receipts for disinfo claims & SEC filings.",
      cadence: "On demand",
    },
    {
      name: "Factor",
      detail: "Blend CPI ladders with AI flow to size risk.",
      cadence: "Twice weekly",
    },
    {
      name: "Arena",
      detail: "Stress-test thesis before size-ups.",
      cadence: "Pre-trade",
    },
  ],
  trades: [
    {
      id: "trade-fed-cuts",
      market: "Fed cuts >=2 times before July?",
      platform: "Kalshi",
      stance: "Long YES @ 62c",
      size: "$1,200 notional",
      conviction: 0.74,
      timeframe: "Jun 2025",
      notes: "Positioned after weak ISM + dovish SEP dots.",
    },
    {
      id: "trade-ai-ban",
      market: "Swing states enact emergency AI bans pre-election?",
      platform: "Polymarket",
      stance: "Long NO @ 41c",
      size: "$1,050 notional",
      conviction: 0.69,
      timeframe: "Nov 2025",
      notes: "State AG calls + supply-chain cost base make bans unlikely.",
    },
    {
      id: "trade-nfl",
      market: "Bills cover -6.5 @ KC?",
      platform: "Polymarket",
      stance: "Short YES @ 58c",
      size: "$650 notional",
      conviction: 0.63,
      timeframe: "Week 12",
      notes: "Weather edge + OL injuries.",
    },
  ] as const,
  agentMemory,
}

export const demoWatchlists: NevuaWatchlist[] = [
  {
    id: "wl-ai-infra",
    name: "AI infrastructure squeeze",
    query: {
      keyphrases: [
        { text: "AI chip export control", include: true },
        { text: "data center curtailment", include: true },
      ],
      tags: [
        { tagSlug: "technology", include: true },
        { tagSlug: "economics", include: true },
      ],
      searchMatchOperator: "AND",
    },
    automaticallyAddMatchingEvents: true,
    createdAt: "2025-10-18T15:04:00Z",
  },
  {
    id: "wl-election-disinfo",
    name: "Election interference sweep",
    query: {
      keyphrases: [
        { text: "election interference", include: true },
        { text: "swing state turnout", include: true },
      ],
      tags: [{ tagSlug: "politics", include: true }],
      searchMatchOperator: "AND",
    },
    automaticallyAddMatchingEvents: true,
    createdAt: "2025-09-02T19:22:00Z",
  },
  {
    id: "wl-cpi-path",
    name: "CPI glide path",
    query: {
      keyphrases: [
        { text: "core cpi", include: true },
        { text: "recession odds", include: true },
      ],
      tags: [{ tagSlug: "economics", include: true }],
      searchMatchOperator: "OR",
    },
    automaticallyAddMatchingEvents: false,
    createdAt: "2025-08-14T13:11:00Z",
  },
  {
    id: "wl-bitcoin-vol",
    name: "Bitcoin volatility stack",
    query: {
      keyphrases: [
        { text: "bitcoin halving", include: true },
        { text: "btc volatility", include: true },
        { text: "crypto liquidity", include: true },
      ],
      tags: [{ tagSlug: "cryptocurrency", include: true }],
      searchMatchOperator: "OR",
    },
    automaticallyAddMatchingEvents: true,
    createdAt: "2025-10-05T10:05:00Z",
  },
]

export const demoSubscriptions: Record<string, NevuaSubscription[]> = {
  "wl-ai-infra": [
    {
      subscriptionId: "sub-ai-velocity",
      watchlistId: "wl-ai-infra",
      watchlistName: "AI infrastructure squeeze",
      subscriptionScope: "Watchlist",
      subscriptionTypeConfig: {
        type: "PriceMove",
        config: {
          thresholdPercent: 5,
          windowMinutes: 60,
          direction: "up",
        },
      },
      createdAt: "2025-11-06T12:42:00Z",
      triggerType: "Recurring",
      status: { enabled: true },
    },
  ],
  "wl-election-disinfo": [
    {
      subscriptionId: "sub-election-window",
      watchlistId: "wl-election-disinfo",
      watchlistName: "Election interference sweep",
      subscriptionScope: "Watchlist",
      subscriptionTypeConfig: {
        type: "ResolutionWindow",
        config: {
          hoursBeforeResolution: 24,
          route: ["webhook", "sms"],
        },
      },
      createdAt: "2025-11-04T09:00:00Z",
      triggerType: "One Time",
      status: { enabled: true },
    },
  ],
  "wl-cpi-path": [
    {
      subscriptionId: "sub-cpi-hedge",
      watchlistId: "wl-cpi-path",
      watchlistName: "CPI glide path",
      subscriptionScope: "Watchlist",
      subscriptionTypeConfig: {
        type: "Threshold",
        config: {
          level: 0.35,
          comparison: "lessThan",
        },
      },
      createdAt: "2025-10-28T16:18:00Z",
      triggerType: "Recurring",
      status: { enabled: true },
    },
  ],
  "wl-bitcoin-vol": [
    {
      subscriptionId: "sub-btc-vol",
      watchlistId: "wl-bitcoin-vol",
      watchlistName: "Bitcoin volatility stack",
      subscriptionScope: "Watchlist",
      subscriptionTypeConfig: {
        type: "PriceMove",
        config: {
          thresholdPercent: 4,
          windowMinutes: 30,
          direction: "up",
        },
      },
      createdAt: "2025-11-07T08:30:00Z",
      triggerType: "Recurring",
      status: { enabled: true },
    },
  ],
}

export const featuredPeers: FeaturedPeer[] = [
  {
    id: "peer-theo4",
    displayName: "Theo",
    handle: "@Theo4",
    address: "0x56687bf447db6ffa42ffe2204a05edaa20f55839",
    polymarketUrl: "https://polymarket.com/@Theo4",
    predictfolioUrl: "https://predictfolio.com/0x56687bf447db6ffa42ffe2204a05edaa20f55839",
    style: "Seasonality  -  event-driven",
    stats: {
      roi30d: "+29%",
      winRate: "64%",
      brier: "0.138",
      edge: "+3.1%",
      drawdown: "-9%",
      calibration: "1.04x accurate vs crowd",
    },
    positions: [
      {
        market: "Will the Colts clinch AFC South?",
        side: "Long YES 58c",
        filled: "10/25",
        size: "$2,400",
        confidence: "0.71",
      },
      {
        market: "US passes federal AI Act by 2025?",
        side: "Short YES 36c",
        filled: "10/30",
        size: "$3,100",
        confidence: "0.66",
      },
      {
        market: "ETH above $5k by Q2?",
        side: "Long YES 42c",
        filled: "11/01",
        size: "$1,750",
        confidence: "0.62",
      },
    ],
    searchTerms: [
      "theo4",
      "@theo4",
      "0x56687bf447db6ffa42ffe2204a05edaa20f55839",
      "https://polymarket.com/@Theo4".toLowerCase(),
      "https://predictfolio.com/0x56687bf447db6ffa42ffe2204a05edaa20f55839".toLowerCase(),
    ],
  },
  {
    id: "peer-fengdubiying",
    displayName: "fengdubiying",
    handle: "@fengdubiying",
    address: "0x17db3fcd93ba12d38382a0cade24b200185c5f6d",
    polymarketUrl: "https://polymarket.com/@fengdubiying",
    predictfolioUrl: "https://predictfolio.com/0x17db3fcd93ba12d38382a0cade24b200185c5f6d",
    style: "Macro pod  -  options bleed",
    stats: {
      roi30d: "+17%",
      winRate: "59%",
      brier: "0.151",
      edge: "+1.6%",
      drawdown: "-7%",
      calibration: "1.02x accurate vs crowd",
    },
    positions: [
      {
        market: "CPI print >=0.4% in Dec?",
        side: "Long YES 47c",
        filled: "10/28",
        size: "$2,050",
        confidence: "0.68",
      },
      {
        market: "BTC hits $90k before 2026?",
        side: "Short YES 35c",
        filled: "11/04",
        size: "$1,600",
        confidence: "0.58",
      },
      {
        market: "US recession in 2025?",
        side: "Long YES 39c",
        filled: "09/19",
        size: "$2,900",
        confidence: "0.65",
      },
    ],
    searchTerms: [
      "fengdubiying",
      "@fengdubiying",
      "0x17db3fcd93ba12d38382a0cade24b200185c5f6d",
    ],
  },
]



