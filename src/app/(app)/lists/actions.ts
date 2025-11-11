"use server"

import { revalidatePath } from "next/cache"

import {
  createNevuaSubscription,
  createNevuaWatchlistFromTags,
  deleteNevuaSubscriptions,
  deleteNevuaWatchlists,
  type NevuaSubscriptionResponse,
  type NevuaWatchlist,
} from "@/lib/nevua"

export async function createWatchlistAction({
  keywords,
  name,
  operator,
  autoAdd,
}: {
  keywords: string[]
  name: string
  operator: "AND" | "OR"
  autoAdd: boolean
}) {
  const tags = keywords
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .map((keyword) => ({
      tagSlug: keyword.toLowerCase().replace(/\s+/g, "-"),
      include: true,
    }))

  if (!tags.length) {
    throw new Error("Add at least one keyword or tag.")
  }

  const watchlist = await createNevuaWatchlistFromTags({
    name,
    tags,
    searchMatchOperator: operator,
    automaticallyAddMatchingEvents: autoAdd,
  })

  revalidatePath("/lists")
  return watchlist
}

const DEFAULT_WEBHOOK_URL = process.env.NEVUA_DEFAULT_WEBHOOK ?? "https://dev-webhook.nevua.markets/webhook"

type AlertChannels = {
  inApp: boolean
  discord: boolean
  webhook: boolean
}

export async function createAlertAction({
  watchlistId,
  ruleType,
  thresholdPercent,
  triggerType,
  channels,
}: {
  watchlistId: string
  ruleType: string
  thresholdPercent: number
  triggerType: "One Time" | "Recurring"
  channels: AlertChannels
}): Promise<NevuaSubscriptionResponse> {
  const ruleParams: Record<string, unknown> = {}
  if (["Less Than", "Greater Than", "Crossing Up", "Crossing Down", "Crossing", "Crossing Step"].includes(ruleType)) {
    ruleParams.thresholdPercent = thresholdPercent
  }
  ruleParams.triggerType = triggerType

  const payload = {
    scope: "Watchlist" as const,
    rule: {
      type: ruleType,
      params: ruleParams,
    },
    channels: [
      ...(channels.webhook
        ? [
            {
              type: "Webhook",
              settings: { webhookUrl: DEFAULT_WEBHOOK_URL },
            },
          ]
        : []),
    ],
  }

  const subscription = await createNevuaSubscription(watchlistId, payload)
  revalidatePath("/lists")
  return subscription
}

export async function deleteSubscriptionAction(subscriptionId: string) {
  await deleteNevuaSubscriptions([subscriptionId])
  revalidatePath("/lists")
}

export async function deleteWatchlistAction(watchlistIds: string | string[]) {
  const ids = Array.isArray(watchlistIds) ? watchlistIds : [watchlistIds]
  await deleteNevuaWatchlists(ids)
  revalidatePath("/lists")
}

export async function renameWatchlistAction({
  watchlist,
  newName,
}: {
  watchlist: NevuaWatchlist
  newName: string
}) {
  const tags = watchlist.query?.tags?.filter((tag) => tag.include !== false)

  if (!tags?.length) {
    throw new Error("Renaming is currently supported only for tag-based watchlists.")
  }

  const newWatchlist = await createNevuaWatchlistFromTags({
    name: newName,
    tags: tags.map((tag) => ({ tagSlug: tag.tagSlug, include: true })),
    searchMatchOperator: (watchlist.query?.searchMatchOperator as "AND" | "OR") ?? "OR",
    automaticallyAddMatchingEvents: watchlist.automaticallyAddMatchingEvents ?? true,
  })

  await deleteNevuaWatchlists([watchlist.id])
  revalidatePath("/lists")
  return newWatchlist
}
