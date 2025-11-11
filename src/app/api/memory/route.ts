export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { getUserMemory, saveUserMemory } from "@/lib/memory"
import type { ClaudeMemory } from "@/types/memory"

export async function GET(_request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const memory = await getUserMemory(session.user.id)
  return NextResponse.json({ memory })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as ClaudeMemory | null
  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const saved = await saveUserMemory(session.user.id, body)
  return NextResponse.json({ memory: saved })
}
