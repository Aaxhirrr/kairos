"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Send, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { demoUser } from "@/data/demo-user"
import { cn } from "@/lib/utils"

const quickActions = [
  {
    label: "Coherence - contradiction scan",
    prompt:
      "Use Coherence to scan my AI interference and CPI glide trades and call out any positions that fight each other. Return a short explanation and suggest trims.",
  },
  {
    label: "Resolve - receipts pack",
    prompt:
      "Outline the evidence I need to defend the swing-state AI ban market. List primary sources, filings, and witness coverage Resolve should pull.",
  },
  {
    label: "Factor - scenario blend",
    prompt:
      "Blend my CPI glide and AI infra watchlists into a factor JSON with exposures, hedges, and net delta. Show how it feeds the Factor module.",
  },
  {
    label: "Arena - Bitcoin watchlist",
    prompt:
      "Run an Arena-style interrogation on the Bitcoin volatility stack watchlist. Stress test my BTC hedges, cite conflicts, and highlight the best follow-up action.",
  },
  {
    label: "Job 3 - news filter",
    prompt:
      "Job 3 - You have 12 Adjacent news items. Return the top 3 forward-looking headlines with a one-line why-it-matters tag and note which market variable is affected.",
  },
  {
    label: "Job 4 - alerts JSON",
    prompt:
      "Job 4 - Convert: 'Ping me if price jumps 5% or 24h before resolution' into the JSON Nevua alert schema. Include thresholdPercent, triggerType, and channels.",
  },
  {
    label: "Job 5 - import cleanup",
    prompt: "Job 5 - Normalize the user's pasted portfolio into { marketIds[], handles[], positions[] }.",
  },
]

const initialAssistantMessage = [
  "Hey Aashir - I'm holding onto your watchlists, alert rules, and trade memory so the modules stay in sync.",
  "Ask for news triage, alert JSON, imports, or let me stress-test a thesis.",
].join("\n")

type DemoJobKey = "coherence" | "resolve" | "factor" | "arena" | "job3" | "job4" | "job5" | "default"

type ReplyBuilder = (prompt: string) => string

const cannedReplies: Record<DemoJobKey, ReplyBuilder> = {
  coherence: () =>
    [
      "Done - Coherence scan complete.",
      "- Trimmed overlap between the AI-ban NO and CPI hedge YES so net exposure stays balanced.",
      "- Logged the adjustment in the agent memory and synced it to the watchlist dashboard.",
    ].join("\n"),
  resolve: () =>
    [
      "Done - Resolve pack is staged.",
      "- Pulled DOJ filings, state AG statements, and newsroom transcripts into the receipts queue.",
      "- Added a reminder for you to attach the Nevua clip before sharing.",
    ].join("\n"),
  factor: () =>
    [
      "Done - Factor blend ready.",
      "```json",
      JSON.stringify(
        {
          factors: [
            { name: "AI supply squeeze", weight: 0.42 },
            { name: "CPI glide path", weight: 0.35 },
            { name: "Tail hedges", weight: 0.23 },
          ],
          netDelta: "+0.11",
          commentary: "BTC hedge offsets CPI surprise, leaving AI disinfo long as the driver.",
        },
        null,
        2
      ),
      "```",
    ].join("\n"),
  arena: () =>
    [
      "Done - Arena challenge logged on the Bitcoin volatility stack.",
      "- No incoherent trades detected; BTC watchlist stays green.",
      "- Flagged a follow-up to size the halving straddle after the Nevua alert fires.",
    ].join("\n"),
  job3: () =>
    [
      "Done - Job 3 done. Forward-looking news worth watching:",
      "1. White House floats export guardrails for AI chips - why it matters: shifts liquidity in the AI infra watchlist.",
      "2. Swing-state board of elections fast-tracks poll watcher funding - hits the election interference list.",
      "3. Bitcoin miner curtailment rumor in Texas - lines up with the Bitcoin volatility stack you pinned.",
    ].join("\n"),
  job4: () =>
    [
      "Done - Job 4 done. Nevua alert JSON synced to the Bitcoin volatility stack watchlist.",
      "```json",
      JSON.stringify(
        {
          watchlistId: "wl-bitcoin-vol",
          rule: {
            thresholdPercent: 5,
            windowMinutes: 60,
            direction: "up",
            fallback: "resolutionMinus24h",
          },
          channels: ["webhook", "sms"],
        },
        null,
        2
      ),
      "```",
      "Webhook + SMS are armed, and the watchlist card shows the new rule.",
    ].join("\n"),
  job5: () =>
    [
      "Done - Job 5 complete. Portfolio normalized.",
      "```json",
      JSON.stringify(
        {
          marketIds: ["BTC-HALVING-2024", "AI-BAN-STATE-SWEEP", "FED-CUTS-2X"],
          handles: ["@Theo4", "0x5668...5839"],
          positions: [
            { marketId: "BTC-HALVING-2024", side: "YES", size: "$1,500" },
            { marketId: "AI-BAN-STATE-SWEEP", side: "NO", size: "$1,050" },
            { marketId: "FED-CUTS-2X", side: "YES", size: "$1,200" },
          ],
        },
        null,
        2
      ),
      "```",
      "You can copy/paste that straight into Nevua imports.",
    ].join("\n"),
  default: (prompt) =>
    [
      "Logged it. Agent memory is updated and Nevua watchlists are already synced.",
      `You asked for: "${prompt}".`,
      "Ping me again if you want a news triage, alert rule, or import clean up.",
    ].join("\n"),
}

function classifyPrompt(prompt: string): DemoJobKey {
  const normalized = prompt.toLowerCase()
  if (normalized.includes("job 3") || normalized.includes("news")) return "job3"
  if (normalized.includes("job 4") || normalized.includes("alert") || normalized.includes("nevua")) return "job4"
  if (normalized.includes("job 5") || normalized.includes("import") || normalized.includes("normalize")) return "job5"
  if (normalized.includes("coherence")) return "coherence"
  if (normalized.includes("resolve") || normalized.includes("receipt")) return "resolve"
  if (normalized.includes("factor")) return "factor"
  if (normalized.includes("arena") || normalized.includes("bitcoin") || normalized.includes("btc")) return "arena"
  return "default"
}

function buildDemoReply(prompt: string) {
  const key = classifyPrompt(prompt)
  const builder = cannedReplies[key] ?? cannedReplies.default
  return builder(prompt)
}

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const generateMessageId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2)
}

export default function AgentClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: generateMessageId(), role: "assistant", content: initialAssistantMessage },
  ])
  const [memorySummary, setMemorySummary] = useState<string>(demoUser.agentMemory.summary ?? "")
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const agentHighlights = demoUser.agentMemory.highlights ?? []
  const focusTrades = demoUser.trades.slice(0, 2)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/memory")
        if (!res.ok) {
          if (res.status === 401) {
            setMemorySummary(demoUser.agentMemory.summary ?? "")
          }
          return
        }
        const data = await res.json()
        if (data?.memory?.summary) {
          setMemorySummary(data.memory.summary)
          return
        }
        if (demoUser.agentMemory.summary) {
          setMemorySummary(demoUser.agentMemory.summary)
          await fetch("/api/memory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(demoUser.agentMemory),
          }).catch(() => {
            // ignore seeding failure in demo
          })
        }
      } catch (error) {
        console.warn("[agent] memory bootstrap failed", error)
        setMemorySummary(demoUser.agentMemory.summary ?? "")
      }
    })()
  }, [])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isSending) return
    const trimmed = text.trim()
    const userMessage: ChatMessage = { id: generateMessageId(), role: "user", content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsSending(true)

    try {
      const statusId = generateMessageId()
      setMessages((prev) => [...prev, { id: statusId, role: "assistant", content: "Thinking..." }])

      await delay(3000)
      setMessages((prev) =>
        prev.map((msg) => (msg.id === statusId ? { ...msg, content: "Analyzing user prompt..." } : msg))
      )

      await delay(3000)
      setMessages((prev) =>
        prev.map((msg) => (msg.id === statusId ? { ...msg, content: "Creating response..." } : msg))
      )

      await delay(3000)
      const reply = buildDemoReply(trimmed)

      setMessages((prev) => prev.filter((msg) => msg.id !== statusId))

      const assistantMessage: ChatMessage = { id: generateMessageId(), role: "assistant", content: reply }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: "assistant",
        content: "Something glitched on my side. Try again in a moment and I'll keep the context frozen.",
      }
      setMessages((prev) => [...prev, assistantMessage])
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-white/10 bg-neutral-900/70 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Kairos Agent</p>
            <h1 className="text-3xl font-semibold text-white">Claude keeps the context fresh</h1>
            <p className="mt-2 text-sm text-white/60">
              Memory, alerts, and market hygiene live here. Ask anything, or tap a job to have Claude do the heavy lifting.
            </p>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-200">
            <Sparkles className="mr-2 h-4 w-4" /> Claude-3.5 Sonnet
          </Badge>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Account</p>
            <p className="mt-1 text-lg font-semibold text-white">{demoUser.name}</p>
            <p className="text-sm text-white/70">{demoUser.email}</p>
            <p className="mt-2 text-sm text-emerald-300">{demoUser.pnl30d}</p>
            <p className="text-xs text-white/50">{demoUser.title}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Workflow</p>
            <ul className="mt-2 space-y-1.5 text-sm text-white/70">
              {demoUser.modulesPipeline.map((module) => (
                <li key={module.name} className="flex items-start justify-between gap-2">
                  <span className="text-white">{module.name}</span>
                  <span className="text-right text-xs text-white/60">
                    {module.detail}
                    <br />
                    <span className="text-white/40">{module.cadence}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {memorySummary ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white/70">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Memory snapshot</p>
            <p className="mt-1 whitespace-pre-line">{memorySummary}</p>
            {agentHighlights.length ? (
              <ul className="mt-3 space-y-1.5 text-xs text-white/60">
                {agentHighlights.map((highlight) => (
                  <li key={highlight.timestamp} className="flex items-start gap-2">
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/50">
                      {highlight.label}
                    </span>
                    <span>{highlight.detail}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </header>

      <section className="rounded-3xl border border-white/10 bg-neutral-900/70 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Personal signal</p>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Active trades</p>
            <ul className="mt-2 space-y-2 text-sm text-white/80">
              {focusTrades.map((trade) => (
                <li key={trade.id}>
                  <p className="font-semibold text-white">{trade.market}</p>
                  <p className="text-xs text-white/60">
                    {trade.stance}  -  {trade.size}
                  </p>
                  <p className="text-xs text-emerald-300">Conviction {Math.round(trade.conviction * 100)}%</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Watchlist keywords</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {demoUser.watchlistKeywords.map((keyword) => (
                <span key={keyword} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Agent reminders</p>
            <p className="mt-2 text-sm text-white/70">
              Claude stores alert rules (5% jump + 24h resolution), CPI hedges, and disinfo receipts so jobs 3-5 stay contextual.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-900/70 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Jobs</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left text-sm text-white transition hover:border-white/30"
              onClick={() => sendMessage(action.prompt)}
            >
              <span className="block font-semibold text-white">{action.label}</span>
              <span className="mt-1 text-xs text-white/60">Tap to auto-prompt the agent.</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-900/70 p-4">
        <div className="h-[440px] overflow-y-auto pr-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "mb-4 flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                  message.role === "user" ? "bg-white text-black" : "bg-black/30 text-white"
                )}
              >
                <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form
          className="mt-4 flex flex-col gap-3 md:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            sendMessage(input)
          }}
        >
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask Claude anything about your markets, alerts, or imports..."
            className="flex-1 resize-none bg-black/30 text-white"
          />
          <Button type="submit" disabled={isSending || !input.trim()} className="rounded-2xl px-6">
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="ml-2">Send</span>
          </Button>
        </form>
      </section>
    </div>
  )
}



