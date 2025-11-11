"use client"

import { useMemo, useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = useMemo(() => searchParams.get("callbackUrl") ?? "/", [searchParams])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [skipPending, startSkip] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get("email")?.toString().trim() ?? ""
    const name = formData.get("name")?.toString().trim()
    const apiKey = formData.get("apiKey")?.toString().trim()
    const apiSecret = formData.get("apiSecret")?.toString().trim()
    const apiPassphrase = formData.get("apiPassphrase")?.toString().trim()

    if (!email) {
      setError("Email is required")
      return
    }

    setError(null)

    startTransition(async () => {
      const response = await signIn("credentials", {
        redirect: false,
        email,
        name,
        apiKey,
        apiSecret,
        apiPassphrase,
        callbackUrl,
      })

      if (response?.error) {
        setError(response.error)
        return
      }

      window.location.href = callbackUrl
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-white/50" htmlFor="email">
          Email
        </label>
        <Input id="email" name="email" type="email" placeholder="you@trader.com" className="bg-black/30 text-white" required />
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-white/50" htmlFor="name">
          Display name
        </label>
        <Input id="name" name="name" placeholder="Polymarket pro" className="bg-black/30 text-white" />
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-white/50" htmlFor="apiKey">
          Polymarket API key
        </label>
        <Input id="apiKey" name="apiKey" placeholder="pmk_live_..." className="bg-black/30 text-white" />
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-white/50" htmlFor="apiSecret">
          API secret
        </label>
        <Input id="apiSecret" name="apiSecret" type="password" placeholder="••••••" className="bg-black/30 text-white" />
      </div>
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-white/50" htmlFor="apiPassphrase">
          API passphrase
        </label>
        <Input id="apiPassphrase" name="apiPassphrase" type="password" placeholder="••••••" className="bg-black/30 text-white" />
      </div>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <Button type="submit" disabled={pending || skipPending} className="w-full rounded-full">
        {pending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Connecting
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={pending || skipPending}
        className="w-full rounded-full border border-white/10 bg-transparent text-white"
        onClick={() =>
          startSkip(async () => {
            setError(null)
            const response = await signIn("credentials", {
              redirect: false,
              email: "guest@kairos.dev",
              name: "Guest trader",
              callbackUrl,
            })

            if (response?.error) {
              setError("Guest mode is unavailable. Please try again in a moment.")
              return
            }

            window.location.href = callbackUrl
          })
        }
      >
        {skipPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing guest workspace
          </span>
        ) : (
          "Skip for now"
        )}
      </Button>
      <p className="text-xs text-white/50">
        Keys are stored in your encrypted session cookie for now. Backend storage + per-user Claude memory lands next.
      </p>
    </form>
  )
}
