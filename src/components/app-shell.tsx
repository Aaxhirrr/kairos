"use client"

import type { PropsWithChildren } from "react"
import { usePathname } from "next/navigation"

import FactsRail from "@/components/facts-rail"
import SideNav from "@/components/side-nav"

export default function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const hideFacts = pathname?.startsWith("/lists") || pathname?.startsWith("/news")

  return (
    <div className="app-shell mx-auto flex max-w-[1600px] gap-6 px-4 py-6 lg:px-8">
      <SideNav />
      <div className="flex-1 space-y-6">{children}</div>
      {!hideFacts ? <FactsRail /> : null}
    </div>
  )
}
