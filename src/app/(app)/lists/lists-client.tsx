"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pencil, Plus, Send, Trash2 } from "lucide-react"

import {
  createAlertAction,
  createWatchlistAction,
  deleteSubscriptionAction,
  deleteWatchlistAction,
  renameWatchlistAction,
} from "@/app/(app)/lists/actions"
import type { NevuaSearchEvent, NevuaSubscription, NevuaWatchlist } from "@/lib/nevua"
import MarketSparkline from "@/components/market-sparkline"
import RevealOnView from "@/components/reveal-on-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
const exampleTags = ["Trump", "AI Models", "Bitcoin", "Middle East Conflict", "Russia - Ukraine Conflict"]

const alertRuleOptions = [
  { label: "Crossing Up", value: "Crossing Up", description: "Alert when price crosses above threshold." },
  { label: "Crossing Down", value: "Crossing Down", description: "Alert when price crosses below threshold." },
  { label: "Crossing", value: "Crossing", description: "Alert when price crosses threshold in either direction." },
  { label: "Crossing Step", value: "Crossing Step", description: "Alert when price crosses threshold by a step." },
  { label: "Greater Than", value: "Greater Than", description: "Alert when price is greater than threshold." },
  { label: "Less Than", value: "Less Than", description: "Alert when price is less than threshold." },
]

interface ListsClientProps {
  initialWatchlists: NevuaWatchlist[]
  initialSubscriptions: Record<string, NevuaSubscription[]>
}

interface MarketDetail {
  tokenId?: string | null
  volume?: string | null
  lastTradePrice?: number | null
  createdAt?: string | null
  endDate?: string | null
}

interface FeedRow {
  id: string
  title: string
  eventTitle: string
  chance: string
  trendToken?: string | null
  volumeDisplay: string
  volumeValue: number
  createdLabel: string
  closesLabel: string
}
export default function ListsClient({ initialWatchlists, initialSubscriptions }: ListsClientProps) {
  const router = useRouter()

  const [watchlists, setWatchlists] = useState(initialWatchlists)
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions)
  const [selectedWatchlistId, setSelectedWatchlistId] = useState(initialWatchlists[0]?.id ?? null)

  const [feed, setFeed] = useState<NevuaSearchEvent[]>([])
  const [feedLoading, setFeedLoading] = useState(false)
  const [feedFilter, setFeedFilter] = useState("")

  const [marketDetails, setMarketDetails] = useState<Record<string, MarketDetail>>({})
  const [marketDetailsLoading, setMarketDetailsLoading] = useState(false)
  const [marketDetailsError, setMarketDetailsError] = useState<string | null>(null)

  const [manageOpen, setManageOpen] = useState(false)
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [watchlistPanelOpen, setWatchlistPanelOpen] = useState(false)
  const [liveFeedOpen, setLiveFeedOpen] = useState(false)

  const [selectedWatchlistIds, setSelectedWatchlistIds] = useState<string[]>([])
  const [bulkMessage, setBulkMessage] = useState<string | null>(null)

  const [keywordInput, setKeywordInput] = useState("")
  const [keywordChips, setKeywordChips] = useState<string[]>([])
  const keywords = useMemo(
    () =>
      `${keywordInput} ${keywordChips.join(" ")}`.split(/[\s,]+/).map((value) => value.trim()).filter(Boolean),
    [keywordInput, keywordChips]
  )

  const [ruleType, setRuleType] = useState(alertRuleOptions[0].value)
  const [threshold, setThreshold] = useState(90)
  const [triggerType, setTriggerType] = useState<"One Time" | "Recurring">("One Time")
  const [channels, setChannels] = useState({ webhook: true })
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [watchlistMessage, setWatchlistMessage] = useState<string | null>(null)

  const [renameTarget, setRenameTarget] = useState<NevuaWatchlist | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<NevuaWatchlist | null>(null)

  const [isCreatingWatchlist, startCreateWatchlist] = useTransition()
  const [isCreatingAlert, startCreateAlert] = useTransition()
  const [isDeletingSubscription, startDeleteSubscription] = useTransition()
  const [isRenaming, startRenaming] = useTransition()
  const [isDeletingWatchlist, startDeletingWatchlist] = useTransition()

  useEffect(() => {
    setWatchlists(initialWatchlists)
    if (!selectedWatchlistId && initialWatchlists.length) {
      setSelectedWatchlistId(initialWatchlists[0].id)
    }
    setSelectedWatchlistIds((prev) => prev.filter((id) => initialWatchlists.some((wl) => wl.id === id)))
    if (initialWatchlists.length) {
      setWatchlistMessage(null)
    }
  }, [initialWatchlists, selectedWatchlistId])

  useEffect(() => {
    setSubscriptions(initialSubscriptions)
  }, [initialSubscriptions])

  const selectedWatchlist = useMemo(
    () => watchlists.find((watchlist) => watchlist.id === selectedWatchlistId) ?? null,
    [watchlists, selectedWatchlistId]
  )

  const selectedSubscriptions = useMemo(
    () => (selectedWatchlistId ? subscriptions[selectedWatchlistId] ?? [] : []),
    [subscriptions, selectedWatchlistId]
  )

  useEffect(() => {
    if (selectedWatchlist) {
      setRenameValue(selectedWatchlist.name ?? "")
    }
  }, [selectedWatchlist])

  useEffect(() => {
    const active = watchlists.find((w) => w.id === selectedWatchlistId)
    if (!active) {
      setFeed([])
      return
    }
    const tags = active.query?.tags?.filter((tag) => tag.include !== false).map((tag) => tag.tagSlug) ?? []
    const keyphrases = active.query?.keyphrases?.filter((k) => k.include !== false).map((k) => k.text) ?? []
    const operator = active.query?.searchMatchOperator ?? "OR"
    const payload =
      tags.length > 0
        ? { tags, operator }
        : {
            keyphrases: keyphrases.length ? keyphrases : [active.name ?? "polymarket"],
            operator,
          }

    setFeedLoading(true)
    fetch("/api/nevua/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("search failed")
        const json = await res.json()
        setFeed(json.results ?? [])
      })
      .catch(() => setFeed([]))
      .finally(() => setFeedLoading(false))
  }, [selectedWatchlistId, watchlists])

  useEffect(() => {
    if (!liveFeedOpen) return
    const ids = Array.from(
      new Set(
        feed.flatMap((event) => event.markets.map((market) => market.id).filter((id): id is string => Boolean(id)))
      )
    )
    if (!ids.length) return
    setMarketDetailsLoading(true)
    Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`/api/polymarket/market?marketId=${id}`)
          if (!res.ok) throw new Error("market fetch failed")
          const json = (await res.json()) as { market?: Record<string, unknown> }
          const market = json.market ?? {}
          return [
            id,
            {
              tokenId: extractTokenIdFromClob(market["clobTokenIds"]),
              volume: typeof market["volume"] === "string" ? (market["volume"] as string) : null,
              lastTradePrice: typeof market["lastTradePrice"] === "number" ? (market["lastTradePrice"] as number) : null,
              createdAt: (market["createdAt"] as string) ?? null,
              endDate: (market["endDate"] as string) ?? null,
            } as MarketDetail,
          ] as const
        } catch {
          return [id, {} as MarketDetail] as const
        }
      })
    )
      .then((entries) => {
        setMarketDetails((prev) => ({ ...prev, ...Object.fromEntries(entries) }))
        setMarketDetailsError(null)
      })
      .catch(() => setMarketDetailsError("Unable to sync Polymarket details right now."))
      .finally(() => setMarketDetailsLoading(false))
  }, [liveFeedOpen, feed])

  const activeFilterCount =
    (selectedWatchlist?.query?.tags?.filter((tag) => tag.include !== false).length ?? 0) +
    (selectedWatchlist?.query?.keyphrases?.filter((k) => k.include !== false).length ?? 0)

  const summaryFilters = [
    ...(selectedWatchlist?.query?.tags?.filter((tag) => tag.include !== false).map((tag) => tag.tagSlug) ?? []),
    ...(selectedWatchlist?.query?.keyphrases?.filter((phrase) => phrase.include !== false).map((phrase) => phrase.text) ?? []),
  ].slice(0, 4)
  const feedRows: FeedRow[] = useMemo(() => {
    const rows: FeedRow[] = []
    feed.forEach((event) => {
      event.markets.forEach((market) => {
        if (!market.id) return
        const detail = marketDetails[market.id] ?? {}
        const probability = detail.lastTradePrice ?? parseOutcomeProbability(market.outcomePrices)
        const chance = probability !== null ? `${(probability * 100).toFixed(2)}%` : "--"
        rows.push({
          id: market.id,
          title: market.question,
          eventTitle: event.title,
          chance,
          trendToken: detail.tokenId,
          volumeDisplay: formatVolume(detail.volume),
          volumeValue: detail.volume ? Number(detail.volume) || 0 : 0,
          createdLabel: formatDateStamp(detail.createdAt),
          closesLabel: formatRelative(detail.endDate, "in"),
        })
      })
    })
    const normalizedFilter = feedFilter.trim().toLowerCase()
    return rows
      .filter((row) => (normalizedFilter ? row.title.toLowerCase().includes(normalizedFilter) : true))
      .slice(0, 25)
  }, [feed, marketDetails, feedFilter])

  const totalFeedVolume = useMemo(
    () => feedRows.reduce((acc, row) => acc + (Number.isFinite(row.volumeValue) ? row.volumeValue : 0), 0),
    [feedRows]
  )

  const handleCreateWatchlist = (e: React.FormEvent) => {
    e.preventDefault()
    if (!keywords.length) return
    startCreateWatchlist(async () => {
      try {
        await createWatchlistAction({
          keywords,
          name: keywords.join(" "),
          operator: "OR",
          autoAdd: true,
        })
        setKeywordInput("")
        setKeywordChips([])
        setWatchlistMessage("Watchlist saved. Open Show feed to explore it.")
        router.refresh()
      } catch (error) {
        setWatchlistMessage("We couldn't reach Nevua. Try another tag.")
      }
    })
  }

  const handleCreateAlert = () => {
    if (!selectedWatchlistId) return
    startCreateAlert(async () => {
      await createAlertAction({
        watchlistId: selectedWatchlistId,
        ruleType,
        thresholdPercent: threshold,
        triggerType,
        channels: { inApp: true, webhook: channels.webhook, discord: false },
      })
      setAlertMessage("Alert created. We&apos;ll ping you if prices move.")
      setAlertDialogOpen(false)
      router.refresh()
    })
  }

  const handleDeleteSubscription = (subscriptionId: string) => {
    startDeleteSubscription(async () => {
      await deleteSubscriptionAction(subscriptionId)
      router.refresh()
    })
  }

  const handleRenameWatchlist = () => {
    if (!renameTarget) return
    startRenaming(async () => {
      await renameWatchlistAction({ watchlist: renameTarget, newName: renameValue })
      setRenameTarget(null)
      router.refresh()
    })
  }

  const handleDeleteWatchlist = () => {
    if (!deleteTarget) return
    startDeletingWatchlist(async () => {
      await deleteWatchlistAction(deleteTarget.id)
      setDeleteTarget(null)
      router.refresh()
    })
  }

  const handleBulkDelete = () => {
    if (!selectedWatchlistIds.length) return
    startDeletingWatchlist(async () => {
      await deleteWatchlistAction(selectedWatchlistIds)
      setBulkMessage(`${selectedWatchlistIds.length} watchlist(s) deleted.`)
      setSelectedWatchlistIds([])
      router.refresh()
    })
  }

  const toggleWatchlistSelection = (watchlistId: string, checked: boolean) => {
    setSelectedWatchlistIds((prev) =>
      checked ? [...new Set([...prev, watchlistId])] : prev.filter((id) => id !== watchlistId)
    )
  }
  return (
    <div className="space-y-8 text-neutral-900 dark:text-white" data-hide-right-rail>
      <section className="rounded-[28px] border border-neutral-200 bg-white px-6 py-10 text-center shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-1">
          <p className="text-lg font-semibold text-neutral-900 dark:text-white">
            Create live <span className="font-semibold">Polymarket</span> watchlists.
          </p>
          <p className="mt-1 flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-white/60">
            Get real-time alerts on Telegram
            <Send className="h-4 w-4 text-sky-500" />
          </p>
        </div>
        <form onSubmit={handleCreateWatchlist} className="mx-auto mt-6 max-w-2xl space-y-4">
          <Input
            placeholder="Enter keywords or phrases"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            className="h-14 rounded-2xl border-neutral-200 text-base placeholder:text-neutral-500 dark:border-white/20 dark:bg-neutral-800 dark:text-white"
          />
          <Button type="submit" className="rounded-full px-8" disabled={!keywords.length || isCreatingWatchlist}>
            {isCreatingWatchlist ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sync with Nevua
          </Button>
        </form>
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-400 dark:text-white/50">Watchlist examples</p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {exampleTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100 dark:border-white/15 dark:bg-white/5 dark:text-white"
                onClick={() => setKeywordChips((prev) => (prev.includes(tag) ? prev : [...prev, tag]))}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        {keywords.length ? (
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-neutral-600 dark:text-white/70">
            {keywords.map((kw, idx) => (
              <span key={`${kw}-${idx}`} className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-white/10">
                {kw}
              </span>
            ))}
          </div>
        ) : null}
        {watchlistMessage ? <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-300">{watchlistMessage}</p> : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 dark:text-white/50">Active watchlist</p>
              <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">
                {selectedWatchlist?.name ?? "No watchlist yet"}
              </h3>
            </div>
            <Badge variant="outline" className="border-neutral-200 text-neutral-600 dark:border-white/20 dark:text-white/70">
              {watchlists.length} saved
            </Badge>
          </div>
          <p className="mt-2 text-sm text-neutral-600 dark:text-white/60">
            {selectedWatchlist
              ? `Auto-add ${selectedWatchlist.automaticallyAddMatchingEvents ? "on" : "off"} (Nevua-backed)`
              : "Create or import a Nevua watchlist to start."}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm text-neutral-600 dark:text-white/70">
            <div>
              <dt className="text-xs uppercase tracking-[0.3em] text-neutral-400 dark:text-white/40">Filters</dt>
              <dd className="text-2xl font-semibold text-neutral-900 dark:text-white">{activeFilterCount}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.3em] text-neutral-400 dark:text-white/40">Created</dt>
              <dd className="text-lg font-semibold text-neutral-900 dark:text-white">
                {selectedWatchlist?.createdAt ? dateFormatter.format(new Date(selectedWatchlist.createdAt)) : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.3em] text-neutral-400 dark:text-white/40">Alerts</dt>
              <dd className="text-lg font-semibold text-neutral-900 dark:text-white">{selectedSubscriptions.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.3em] text-neutral-400 dark:text-white/40">Filters in use</dt>
              <dd className="text-sm">{summaryFilters.length ? summaryFilters.join(", ") : "Awaiting tags"}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full" onClick={() => setWatchlistPanelOpen(true)}>
              Edit query
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setLiveFeedOpen(true)}
              disabled={!feed.length}
            >
              Show feed
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 dark:text-white/50">Alerts</p>
              <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">Never babysit prices</h3>
            </div>
            <Badge variant="outline" className="border-neutral-200 text-neutral-600 dark:border-white/20 dark:text-white/70">
              {selectedSubscriptions.length} live
            </Badge>
          </div>
          <p className="mt-2 text-sm text-neutral-600 dark:text-white/60">
            Spin up Nevua-powered alerts without touching a webhook. We&apos;ll ping you in Kairos first.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-white/70">
            {selectedSubscriptions.slice(0, 3).map((subscription) => (
              <li
                key={subscription.subscriptionId}
                className="flex items-center justify-between rounded-2xl border border-neutral-200 px-3 py-2 dark:border-white/15"
              >
                <span>{subscription.subscriptionTypeConfig?.type ?? "Alert"}</span>
                <span className="text-xs text-neutral-400">
                  {subscription.status?.reason ?? (subscription.status?.enabled ? "Enabled" : "Paused")}
                </span>
              </li>
            ))}
            {!selectedSubscriptions.length ? (
              <li className="rounded-2xl border border-dashed border-neutral-300 px-3 py-4 text-center text-xs text-neutral-500 dark:border-white/20 dark:text-white/60">
                No alerts yet.
              </li>
            ) : null}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="rounded-full" onClick={() => setAlertDialogOpen(true)} disabled={!selectedWatchlist}>
              <Plus className="mr-2 h-4 w-4" /> Create alert
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setManageOpen(true)}
              disabled={!selectedSubscriptions.length}
            >
              Manage alerts
            </Button>
            {alertMessage ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-300">{alertMessage}</p>
            ) : null}
          </div>
        </section>
      </div>
      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create alert</DialogTitle>
            <DialogDescription>{selectedWatchlist?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold">Watchlist alert</p>
              <Select value={ruleType} onValueChange={(val) => setRuleType(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rule" />
                </SelectTrigger>
                <SelectContent>
                  {alertRuleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-neutral-500">{alertRuleOptions.find((opt) => opt.value === ruleType)?.description}</p>
            </div>
            <div>
              <label className="text-xs text-neutral-500">Threshold (%)</label>
              <Input type="number" min={1} max={100} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
            </div>
            <div>
              <p className="text-sm font-semibold">Trigger frequency</p>
              <RadioGroup value={triggerType} onValueChange={(val: "One Time" | "Recurring") => setTriggerType(val)}>
                <label className="flex items-start gap-2 text-sm">
                  <RadioGroupItem value="One Time" className="mt-1" />
                  <div>
                    <span className="font-semibold">Once</span>
                    <p className="text-xs text-neutral-500">Trigger the first time the condition is met.</p>
                  </div>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <RadioGroupItem value="Recurring" className="mt-1" />
                  <div>
                    <span className="font-semibold">Recurring</span>
                    <p className="text-xs text-neutral-500">Trigger every time the condition is met.</p>
                  </div>
                </label>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Notification channels</p>
              <label className="flex items-center gap-2 text-sm text-neutral-500">
                <Checkbox checked disabled className="text-gray-400" /> In app (default)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={channels.webhook}
                  onCheckedChange={(checked) => setChannels({ webhook: Boolean(checked) })}
                />
                Webhook
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAlertDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAlert} disabled={isCreatingAlert}>
              {isCreatingAlert ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={manageOpen} onOpenChange={setManageOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Manage alerts</SheetTitle>
            <SheetDescription>{selectedWatchlist?.name}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {selectedSubscriptions.length ? (
              selectedSubscriptions.map((sub) => (
                <div
                  key={sub.subscriptionId}
                  className="flex items-start justify-between rounded-xl border border-neutral-200 p-4 dark:border-white/15"
                >
                  <div>
                    <p className="font-semibold">{sub.subscriptionTypeConfig?.type ?? "Alert"}</p>
                    <p className="text-xs text-neutral-500">
                      Trigger: {sub.triggerType ?? "Recurring"}  Status: {sub.status?.reason ?? "Active"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-neutral-200 text-rose-500 dark:border-white/20"
                    onClick={() => handleDeleteSubscription(sub.subscriptionId)}
                    disabled={isDeletingSubscription}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500">No alerts yet.</p>
            )}
          </div>
          <SheetFooter>
            <Button variant="ghost" onClick={() => setManageOpen(false)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <Sheet
        open={watchlistPanelOpen}
        onOpenChange={(open) => {
          setWatchlistPanelOpen(open)
          if (!open) {
            setSelectedWatchlistIds([])
            setBulkMessage(null)
          }
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Edit watchlists</SheetTitle>
            <SheetDescription>Select, rename, or remove Nevua-backed lists.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Checkbox
                checked={selectedWatchlistIds.length === watchlists.length && watchlists.length > 0}
                onCheckedChange={(checked) =>
                  checked ? setSelectedWatchlistIds(watchlists.map((wl) => wl.id)) : setSelectedWatchlistIds([])
                }
              />
              Select all
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedWatchlistIds([])}>
                Clear
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={!selectedWatchlistIds.length || isDeletingWatchlist}
              >
                {isDeletingWatchlist ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete selected
              </Button>
            </div>
          </div>
          {bulkMessage ? <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-300">{bulkMessage}</p> : null}
          <RevealOnView className="mt-4 space-y-3" staggerChildren>
            {watchlists.map((watchlist) => (
              <div
                key={watchlist.id}
                className="flex items-start justify-between rounded-2xl border border-neutral-200 p-4 dark:border-white/15"
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedWatchlistIds.includes(watchlist.id)}
                    onCheckedChange={(checked) => toggleWatchlistSelection(watchlist.id, Boolean(checked))}
                  />
                  <div>
                    <p className="text-base font-semibold">{watchlist.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-white/60">
                      {watchlist.createdAt ? dateFormatter.format(new Date(watchlist.createdAt)) : "-"} 
                      {" "}
                      {(watchlist.query?.tags?.length ?? 0) + (watchlist.query?.keyphrases?.length ?? 0)} filters
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-neutral-200 dark:border-white/20"
                    onClick={() => {
                      setRenameTarget(watchlist)
                      setRenameValue(watchlist.name ?? "")
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-neutral-200 text-rose-500 dark:border-white/20"
                    onClick={() => setDeleteTarget(watchlist)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {!watchlists.length ? <p className="text-sm text-neutral-500">No watchlists yet.</p> : null}
          </RevealOnView>
        </SheetContent>
      </Sheet>
      <Dialog open={liveFeedOpen} onOpenChange={setLiveFeedOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Watchlist feed</DialogTitle>
            <DialogDescription>{selectedWatchlist?.name ?? "Pick a watchlist"}</DialogDescription>
          </DialogHeader>
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white">{selectedWatchlist?.name ?? ""}</p>
                <p className="text-sm text-neutral-500 dark:text-white/60">
                  {feedRows.length} markets  {currencyFormatter.format(totalFeedVolume)} total volume
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className="rounded-full" onClick={() => setAlertDialogOpen(true)} disabled={!selectedWatchlist}>
                  <Plus className="mr-2 h-4 w-4" /> Create alert
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setManageOpen(true)}
                  disabled={!selectedSubscriptions.length}
                >
                  Manage alerts
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => setWatchlistPanelOpen(true)}>
                  Edit query
                </Button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Input
                placeholder="Filter events"
                value={feedFilter}
                onChange={(e) => setFeedFilter(e.target.value)}
                className="w-full max-w-sm rounded-2xl"
              />
              {marketDetailsLoading ? (
                <p className="text-xs text-neutral-500 dark:text-white/60">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Syncing Polymarket data
                </p>
              ) : null}
              {marketDetailsError ? <p className="text-xs text-rose-500">{marketDetailsError}</p> : null}
            </div>
            <div className="mt-4 max-h-[60vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-[0.2em] text-neutral-400 dark:text-white/40">
                  <tr>
                    <th className="py-2">Title</th>
                    <th className="py-2">Chance</th>
                    <th className="py-2">Trend</th>
                    <th className="py-2">Volume</th>
                    <th className="py-2">Created</th>
                    <th className="py-2">Closes</th>
                  </tr>
                </thead>
                <tbody>
                  {feedRows.length ? (
                    feedRows.map((row) => (
                      <tr key={row.id} className="border-t border-neutral-100 dark:border-white/5">
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-semibold text-neutral-900 dark:text-white">{row.title}</p>
                            <p className="text-xs text-neutral-500 dark:text-white/60">{row.eventTitle}</p>
                          </div>
                        </td>
                        <td className="py-3 pr-4">{row.chance}</td>
                        <td className="py-3 pr-4">
                          <MarketSparkline tokenId={row.trendToken} />
                        </td>
                        <td className="py-3 pr-4">{row.volumeDisplay}</td>
                        <td className="py-3 pr-4">{row.createdLabel}</td>
                        <td className="py-3 pr-4">{row.closesLabel}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-sm text-neutral-500 dark:text-white/60">
                        {feedLoading ? "Loading Nevua feed" : "No matching markets yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(renameTarget)} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename watchlist</DialogTitle>
            <DialogDescription>Change how this watchlist appears in Kairos.</DialogDescription>
          </DialogHeader>
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleRenameWatchlist} disabled={isRenaming}>
              {isRenaming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete watchlist</DialogTitle>
            <DialogDescription>This will remove the watchlist and any Nevua subscriptions tied to it.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWatchlist} disabled={isDeletingWatchlist}>
              {isDeletingWatchlist ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function parseOutcomeProbability(outcomePrices?: string): number | null {
  if (!outcomePrices) return null
  try {
    const parsed = JSON.parse(outcomePrices)
    const value = Array.isArray(parsed) ? parsed[0] : null
    if (typeof value === "number") return value
    if (typeof value === "string") {
      const numeric = Number(value)
      return Number.isFinite(numeric) ? numeric : null
    }
    return null
  } catch {
    return null
  }
}

function formatVolume(value?: string | null) {
  if (!value) return "$0"
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return "$0"
  return currencyFormatter.format(numeric)
}

function formatDateStamp(iso?: string | null) {
  if (!iso) return "-"
  const value = new Date(iso)
  if (Number.isNaN(value.getTime())) return "-"
  return dateFormatter.format(value)
}

function formatRelative(iso?: string | null, direction: "ago" | "in" = "ago") {
  if (!iso) return "-"
  const target = new Date(iso)
  if (Number.isNaN(target.getTime())) return "-"
  const diffMs = target.getTime() - Date.now()
  const days = Math.round(Math.abs(diffMs) / (1000 * 60 * 60 * 24))
  if (days === 0) return "today"
  return direction === "ago" && diffMs < 0 ? `${days} days ago` : `in ${days} days`
}

function extractTokenIdFromClob(raw?: unknown): string | null {
  if (!raw) return null
  if (Array.isArray(raw)) {
    const first = raw[0]
    return typeof first === "string" ? first : null
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && typeof parsed[0] === "string") {
        return parsed[0]
      }
    } catch {
      return raw
    }
    return raw
  }
  return null
}
