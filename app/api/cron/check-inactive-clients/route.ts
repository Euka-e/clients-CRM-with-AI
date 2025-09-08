import { NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../../convex/_generated/api"

function verifyQStashSignature(req: NextRequest) {
  const sig = req.headers.get("Upstash-Signature")
  if (!sig && process.env.ENFORCE_QSTASH_SIGNATURE === "true") {
    throw new Error("Firma QStash ausente")
  }
}

export async function POST(req: NextRequest) {
  try {
    verifyQStashSignature(req)
    const url = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT
    if (!url) return NextResponse.json({ error: "Convex URL no configurada" }, { status: 500 })

    const client = new ConvexHttpClient(url)
    const { count } = await client.mutation(api.clients.markInactiveClients, { daysThreshold: 1 / 24 })
    return NextResponse.json({ updated: count })
  } catch (e) {
    console.error("Cron error", e)
    const errorMessage = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
