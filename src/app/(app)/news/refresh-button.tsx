"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function RefreshMarketsButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      size="lg"
      className="rounded-full"
      onClick={() => startTransition(() => router.refresh())}
      disabled={isPending}
    >
      <RefreshCcw className={cn("mr-2 h-4 w-4 text-white/80", isPending && "animate-spin")} />
      Refresh feeds
    </Button>
  )
}
