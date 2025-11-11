"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  Compass,
  Newspaper,
  Sparkles,
  Users2,
} from "lucide-react"

import ThemeToggle from "@/components/theme-toggle"
import SignOutButton from "@/components/sign-out-button"
import { demoUser } from "@/data/demo-user"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/agent", label: "Agent", description: "Claude copilot", icon: Sparkles },
  { href: "/users", label: "Users", description: "Compare stats", icon: Users2 },
  { href: "/lists", label: "Lists & Alerts", description: "Watch & ping", icon: BellRing },
  { href: "/live", label: "Live", description: "Streaming view", icon: Compass },
  { href: "/news", label: "News", description: "Forward looking", icon: Newspaper },
]

export default function SideNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const initials = session?.user?.name?.[0]?.toUpperCase() ?? session?.user?.email?.[0]?.toUpperCase() ?? "A"
  const profileName = session?.user?.name ?? demoUser.name
  const profileEmail = session?.user?.email ?? demoUser.email
  const memoryPreview = demoUser.agentMemory.summary ?? ""

  return (
    <aside className="relative z-50 hidden w-64 shrink-0 flex-col gap-4 pointer-events-auto lg:flex">
      <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">kairos</p>
            <p className="text-lg font-semibold text-white">Polymarket engine</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <BadgeCheck className="h-6 w-6 text-emerald-300" />
          </div>
        </div>
        <p className="mt-3 text-sm text-white/70">
          Offline demo uses a single Claude compiler pass + deterministic math. Proofs over prose.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-white/80"
        >
          View landing
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <nav className="rounded-3xl border border-white/10 bg-neutral-900/60 p-2">
        <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
          <span>Modules</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white">offline</span>
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname?.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition",
                    "border border-transparent hover:border-white/20 hover:bg-white/5",
                    isActive ? "border-white/30 bg-white/10 text-white" : "text-white/70"
                  )}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/70 group-hover:bg-white/10">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-base font-semibold leading-tight">{item.label}</span>
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">{item.description}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{profileName}</p>
            <p className="text-xs text-white/50">{profileEmail}</p>
            <p className="text-xs text-emerald-300">{demoUser.pnl30d}</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <Link
            href="/agent"
            className="flex flex-col rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white transition hover:border-white/30"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Personal knowledge base</span>
              <Sparkles className="h-4 w-4 text-emerald-300" />
            </div>
            <p className="mt-1 text-xs text-white/60 line-clamp-3">{memoryPreview}</p>
          </Link>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Focus rails</p>
            <p className="mt-1 text-sm font-semibold text-white">AI interference & CPI glide</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {demoUser.watchlistKeywords.slice(0, 3).map((keyword) => (
                <span key={keyword} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>
    </aside>
  )
}


