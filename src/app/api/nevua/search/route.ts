import { NextRequest, NextResponse } from "next/server"

import { searchNevuaByKeyphrases, searchNevuaByTags } from "@/lib/nevua"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tags = [], keyphrases = [], operator = "OR" } = body as {
      tags?: string[]
      keyphrases?: string[]
      operator?: "AND" | "OR"
    }

    if (tags.length) {
      const results = await searchNevuaByTags(tags, operator)
      return NextResponse.json({ results })
    }

    if (keyphrases.length) {
      const results = await searchNevuaByKeyphrases(keyphrases, operator)
      return NextResponse.json({ results })
    }

    return NextResponse.json({ results: [] })
  } catch (error) {
    console.error("[nevua] search route error", error)
    return NextResponse.json({ error: "Unable to fetch feed" }, { status: 500 })
  }
}
