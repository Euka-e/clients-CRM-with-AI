import { NextResponse } from "next/server"

export async function POST() {
  const { QSTASH_TOKEN, NEXT_PUBLIC_BASE_URL } = process.env
  if (!QSTASH_TOKEN) {
    return NextResponse.json({ error: "QSTASH_TOKEN no configurado" }, { status: 500 })
  }
  if (!NEXT_PUBLIC_BASE_URL) {
    return NextResponse.json({ error: "NEXT_PUBLIC_BASE_URL no configurado" }, { status: 500 })
  }

  const destination = `${NEXT_PUBLIC_BASE_URL}/api/cron/check-inactive-clients`

  const res = await fetch("https://qstash.upstash.io/v2/schedules", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${QSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      destination,
      cron: "0 */6 * * *",
      description: "Mark inactive clients (Convex)",
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json({ error: data }, { status: res.status })
  }

  return NextResponse.json({ scheduled: true, data })
}
