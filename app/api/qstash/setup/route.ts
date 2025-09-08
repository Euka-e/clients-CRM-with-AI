import { type NextRequest, NextResponse } from "next/server"
import { Client } from "@upstash/qstash"

const simulatedSchedules: Array<{
  id: string
  destination: string
  cron: string
  createdAt: string
}> = []

export async function POST(req: NextRequest) {
  try {
    const { schedule = "0 */6 * * *" } = await req.json()
    const destination = `${process.env.VERCEL_URL?.startsWith("http") ? process.env.VERCEL_URL : "https://" + process.env.VERCEL_URL}/api/cron/check-inactive-clients`

    if (process.env.QSTASH_TOKEN) {
      const qstash = new Client({ token: process.env.QSTASH_TOKEN })
      const created = await qstash.schedules.create({
        destination,
        cron: schedule,
      })
      return NextResponse.json({
        success: true,
        scheduleId: created.scheduleId,
        message: "Automation configured successfully (QStash real)",
        schedule,
        note: "This is a real QStash schedule.",
      })
    }

    const scheduleId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newSchedule = {
      id: scheduleId,
      destination,
      cron: schedule,
      createdAt: new Date().toISOString(),
    }
    simulatedSchedules.push(newSchedule)
    return NextResponse.json({
      success: true,
      scheduleId,
      message: "Automation configured successfully (simulated)",
      schedule,
      note: "This is a simulated response. In production, this would create a real QStash schedule.",
    })
  } catch {
    return NextResponse.json({ error: "Failed to setup automation" }, { status: 500 })
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      schedules: simulatedSchedules,
      note: "Simulated schedules. In production, fetch from QStash.",
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
  }
}
