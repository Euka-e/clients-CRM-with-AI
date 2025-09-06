import { type NextRequest, NextResponse } from "next/server"

// const qstash = new Client({ token: process.env.QSTASH_TOKEN! })

const simulatedSchedules: Array<{
  id: string
  destination: string
  cron: string
  createdAt: string
}> = []

export async function POST(req: NextRequest) {
  try {
    const { schedule = "0 */6 * * *" } = await req.json() // Default: every 6 hours

    const scheduleId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newSchedule = {
      id: scheduleId,
      destination: `${process.env.VERCEL_URL || "http://localhost:3000"}/api/cron/check-inactive-clients`,
      cron: schedule,
      createdAt: new Date().toISOString(),
    }

    simulatedSchedules.push(newSchedule)

    console.log("[v0] Simulated QStash schedule created:", scheduleId)

    return NextResponse.json({
      success: true,
      scheduleId,
      message: "Automation configured successfully (simulated)",
      schedule,
      note: "This is a simulated response. In production, this would create a real QStash schedule.",
    })
  } catch (error) {
    console.error("[v0] Simulated QStash setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to setup simulated automation",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200)) // Simular delay de API

    return NextResponse.json({
      success: true,
      schedules: simulatedSchedules.filter((s) => s.destination?.includes("/api/cron/check-inactive-clients")),
      note: "These are simulated schedules. In production, this would fetch real QStash schedules.",
    })
  } catch (error) {
    console.error("[v0] Simulated QStash list error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch simulated schedules",
      },
      { status: 500 },
    )
  }
}
