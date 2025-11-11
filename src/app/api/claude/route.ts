export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { callClaude, type ClaudeRequest } from "@/lib/claude"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as ClaudeRequest

  if (!body?.messages?.length) {
    return NextResponse.json({ error: "messages required" }, { status: 400 })
  }

  try {
    const result = await callClaude(body)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[claude] request failed", error)
    return NextResponse.json({ error: "Claude request failed" }, { status: 502 })
  }
}
