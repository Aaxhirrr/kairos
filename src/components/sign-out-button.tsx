"use client"

import { useTransition } from "react"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function SignOutButton() {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start rounded-2xl border border-white/10 bg-white/5 text-white"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOut({ callbackUrl: "/login" })
        })
      }
    >
      <LogOut className="mr-2 h-4 w-4" /> Sign out
    </Button>
  )
}
