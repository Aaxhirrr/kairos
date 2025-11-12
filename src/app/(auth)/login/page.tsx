import { Suspense } from "react"
import LoginForm from "./login-form"

export const metadata = {
  title: "Sign in · Kairos",
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-neutral-900/70 p-8 shadow-2xl">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">Kairos</p>
          <h1 className="mt-2 text-3xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-white/60">
            Connect your Polymarket credentials so Claude can pull your trades, coach coherence, and personalize signals.
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-white/60">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
