import type { ReactNode } from "react"

import AppShell from "@/components/app-shell"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background text-foreground transition-colors">
      <AppShell>{children}</AppShell>
    </div>
  )
}
