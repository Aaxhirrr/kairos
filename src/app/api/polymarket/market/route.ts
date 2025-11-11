import { NextRequest, NextResponse } from "next/server"

import { fetchMarketById } from "@/lib/polymarket"

export async function GET(request: NextRequest) {
  const marketId = request.nextUrl.searchParams.get("marketId")

  if (!marketId) {
    return NextResponse.json({ error: "marketId query param required" }, { status: 400 })
  }

  try {
    const market = await fetchMarketById(marketId)
    return NextResponse.json({ market }, { status: 200 })
  } catch (error) {
    console.error("[polymarket] market lookup failed", error)
    return NextResponse.json({ error: "Unable to load market detail" }, { status: 502 })
  }
}
