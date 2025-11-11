import ListsClient from "@/app/(app)/lists/lists-client"
import { demoSubscriptions, demoWatchlists } from "@/data/demo-user"
import { fetchNevuaSubscriptions, fetchNevuaWatchlists, type NevuaSubscription } from "@/lib/nevua"

export default async function ListsPage() {
  let watchlists = demoWatchlists
  let subscriptionsMap = demoSubscriptions

  try {
    const apiWatchlists = await fetchNevuaWatchlists()
    if (apiWatchlists.length) {
      watchlists = apiWatchlists
    }
  } catch (error) {
    console.error("[nevua] watchlists fetch failed, using demo data", error)
  }

  try {
    const subscriptions = await fetchNevuaSubscriptions()
    if (subscriptions.length) {
      subscriptionsMap = subscriptions.reduce<Record<string, NevuaSubscription[]>>((acc, sub) => {
        const key = sub.watchlistId
        if (!acc[key]) acc[key] = []
        acc[key].push(sub)
        return acc
      }, {})
    }
  } catch (error) {
    console.error("[nevua] subscriptions fetch failed, using demo data", error)
  }

  return <ListsClient initialWatchlists={watchlists} initialSubscriptions={subscriptionsMap} />
}
