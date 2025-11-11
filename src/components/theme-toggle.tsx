"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

type ThemeMode = "light" | "dark"
export const THEME_STORAGE_KEY = "kairos-theme"

export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(mode)
  root.setAttribute("data-theme", mode)
  const body = document.body
  if (body) {
    body.classList.remove("light", "dark")
    body.classList.add(mode)
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    const initial: ThemeMode = stored === "light" || stored === "dark" ? (stored as ThemeMode) : "dark"
    setTheme(initial)
    applyTheme(initial)
    setMounted(true)
  }, [])

  const handleToggle = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark"
    setTheme(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    }
    applyTheme(next)
  }

  const icon = theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className="h-10 w-10 rounded-full border border-white/10 bg-black/30 text-white"
      onClick={handleToggle}
      disabled={!mounted}
    >
      {icon}
    </Button>
  )
}
