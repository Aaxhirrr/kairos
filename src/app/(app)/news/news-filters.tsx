"use client"

import { useEffect, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type NewsFilterFormState = {
  q: string
  platform: string
  status: string
  category: string
  market_type: string
  sort: string
  limit: string
  probabilityMin: string
  probabilityMax: string
}

type NewsFiltersProps = {
  initialValues: NewsFilterFormState
  defaultValues: NewsFilterFormState
}

const platformOptions = [
  { value: "all", label: "All platforms (default)" },
  { value: "kalshi,polymarket", label: "Kalshi + Polymarket" },
  { value: "kalshi", label: "Kalshi only" },
  { value: "polymarket", label: "Polymarket only" },
  { value: "manifold", label: "Manifold Markets" },
  { value: "metaculus", label: "Metaculus" },
]

const statusOptions = [
  { value: "active", label: "Active (default)" },
  { value: "all", label: "All statuses" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
  { value: "suspended", label: "Suspended" },
  { value: "cancelled", label: "Cancelled" },
]

const sortOptions = [
  { value: "volume:desc", label: "Highest volume" },
  { value: "created_at:desc", label: "Newest first" },
  { value: "updated_at:desc", label: "Recently updated" },
  { value: "probability:desc", label: "Highest probability" },
  { value: "probability:asc", label: "Lowest probability" },
  { value: "end_date:asc", label: "Ending soonest" },
  { value: "liquidity:desc", label: "Most liquid" },
]

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export function NewsFilters({ initialValues, defaultValues }: NewsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname() || "/news"
  const [values, setValues] = useState(initialValues)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const updateField = (field: keyof NewsFilterFormState, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleReset = () => {
    setValues(defaultValues)
    startTransition(() => {
      router.push(pathname)
    })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams()

    const trimmedQuery = values.q.trim()
    if (trimmedQuery) {
      params.set("q", trimmedQuery)
    }

    if (values.platform && values.platform !== "all") {
      params.set("platform", values.platform)
    }

    if (values.status === "all") {
      params.set("status", "all")
    } else if (values.status && values.status !== defaultValues.status) {
      params.set("status", values.status)
    }

    if (values.category && values.category !== "all") {
      params.set("category", values.category)
    }

    if (values.market_type && values.market_type !== "all") {
      params.set("market_type", values.market_type)
    }

    if (values.sort && values.sort !== defaultValues.sort) {
      params.set("sort", values.sort)
    }

    const parsedLimit = Number(values.limit)
    if (Number.isFinite(parsedLimit)) {
      const normalized = clamp(parsedLimit, 1, 16)
      if (normalized !== Number(defaultValues.limit)) {
        params.set("limit", String(normalized))
      }
    }

    const minPercent = Number(values.probabilityMin)
    if (Number.isFinite(minPercent) && minPercent > 0) {
      const normalized = clamp(minPercent / 100, 0, 1)
      params.set("probability_min", normalized.toFixed(2))
    }

    const maxPercent = Number(values.probabilityMax)
    if (Number.isFinite(maxPercent) && maxPercent > 0) {
      const normalized = clamp(maxPercent / 100, 0, 1)
      params.set("probability_max", normalized.toFixed(2))
    }

    startTransition(() => {
      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
        <div>
          <Label htmlFor="news-query" className="text-xs uppercase tracking-[0.2em] text-black/60">
            Keyword or question
          </Label>
          <Input
            id="news-query"
            placeholder="e.g. presidential election, CPI, Game 7"
            value={values.q}
            onChange={(event) => updateField("q", event.target.value)}
            className="mt-2 rounded-none border border-black/30 bg-white px-4 py-2 text-black placeholder:text-black/40"
          />
        </div>
        <div>
          <Label htmlFor="market-type" className="text-xs uppercase tracking-[0.2em] text-black/60">
            Market type
          </Label>
          <Select value={values.market_type} onValueChange={(val) => updateField("market_type", val)}>
            <SelectTrigger id="market-type" className="mt-2 rounded-none border border-black/30 bg-white text-black">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="binary">Binary</SelectItem>
              <SelectItem value="multiple_choice">Multiple choice</SelectItem>
              <SelectItem value="numerical">Numerical</SelectItem>
              <SelectItem value="conditional">Conditional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <Label className="text-xs uppercase tracking-[0.2em] text-black/60">Platform</Label>
          <Select value={values.platform} onValueChange={(val) => updateField("platform", val)}>
            <SelectTrigger className="mt-2 rounded-none border border-black/30 bg-white text-black">
              <SelectValue placeholder="All platforms" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              {platformOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.2em] text-black/60">Status</Label>
          <Select value={values.status} onValueChange={(val) => updateField("status", val)}>
            <SelectTrigger className="mt-2 rounded-none border border-black/30 bg-white text-black">
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-[0.2em] text-black/60">Category</Label>
          <Select value={values.category} onValueChange={(val) => updateField("category", val)}>
            <SelectTrigger className="mt-2 rounded-none border border-black/30 bg-white text-black">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="politics">Politics</SelectItem>
              <SelectItem value="economics">Economics</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="weather">Weather</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <Label className="text-xs uppercase tracking-[0.2em] text-black/60">Sort</Label>
          <Select value={values.sort} onValueChange={(val) => updateField("sort", val)}>
            <SelectTrigger className="mt-2 rounded-none border border-black/30 bg-white text-black">
              <SelectValue placeholder="Sort markets" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="limit-input" className="text-xs uppercase tracking-[0.2em] text-black/60">
            Result limit
          </Label>
          <Input
            id="limit-input"
            type="number"
            min={1}
            max={16}
            value={values.limit}
            onChange={(event) => updateField("limit", event.target.value)}
            className="mt-2 rounded-none border border-black/30 bg-white px-4 py-2 text-black"
          />
          <p className="mt-1 text-xs text-black/60">Max 16 markets per refresh.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="prob-min" className="text-xs uppercase tracking-[0.2em] text-black/60">
              Prob ≥ (%)
            </Label>
            <Input
              id="prob-min"
              type="number"
              min={0}
              max={100}
              step={5}
              value={values.probabilityMin}
              onChange={(event) => updateField("probabilityMin", event.target.value)}
              className="mt-2 rounded-none border border-black/30 bg-white px-4 py-2 text-black"
            />
          </div>
          <div>
            <Label htmlFor="prob-max" className="text-xs uppercase tracking-[0.2em] text-black/60">
              Prob ≤ (%)
            </Label>
            <Input
              id="prob-max"
              type="number"
              min={0}
              max={100}
              step={5}
              value={values.probabilityMax}
              onChange={(event) => updateField("probabilityMax", event.target.value)}
              className="mt-2 rounded-none border border-black/30 bg-white px-4 py-2 text-black"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-none border border-black bg-black px-6 py-2 text-sm font-semibold uppercase tracking-wider text-white"
          disabled={isPending}
        >
          Apply filters
        </button>
        <button
          type="button"
          className="rounded-none border border-black/40 px-6 py-2 text-sm font-semibold uppercase tracking-wider text-black"
          onClick={handleReset}
          disabled={isPending}
        >
          Reset
        </button>
      </div>
    </form>
  )
}
