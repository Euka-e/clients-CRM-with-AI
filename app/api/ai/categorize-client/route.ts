import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { type NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../../convex/_generated/api"

export async function POST(request: NextRequest) {
  const { GOOGLE_GENERATIVE_AI_API_KEY, NEXT_PUBLIC_CONVEX_URL, NEXT_PUBLIC_CONVEX_DEPLOYMENT } = process.env
  try {
    const { client, interactions } = await request.json()

    if (!client) {
      return NextResponse.json({ error: "Cliente requerido" }, { status: 400 })
    }

    if (!GOOGLE_GENERATIVE_AI_API_KEY) {
      const now = Date.now()
      let category: "Activo" | "Potencial" | "Inactivo" = "Potencial"
      if (!interactions || interactions.length === 0) {
        category = "Potencial"
      } else {
        const last = interactions[0]?.date || client.lastInteraction
        const days = Math.floor((now - last) / (1000 * 60 * 60 * 24))
        if (days > 60) category = "Inactivo"
        else if (days < 30) category = "Activo"
        else category = "Potencial"
      }

      const url = NEXT_PUBLIC_CONVEX_URL || NEXT_PUBLIC_CONVEX_DEPLOYMENT
      if (url) {
        const convex = new ConvexHttpClient(url)
        await convex.mutation(api.clients.updateClient, { id: client._id, relationshipStatus: category })
      }

      return NextResponse.json({
        category,
        reasoning: `Categorizado como ${category} (simulado) basado en las interacciones.`,
      })
    }

    const clientInfo = `
Cliente: ${client.fullName}
Estado actual: ${client.relationshipStatus}
Última interacción: ${new Date(client.lastInteraction).toLocaleDateString("es-ES")}
Días desde última interacción: ${Math.floor((Date.now() - client.lastInteraction) / (1000 * 60 * 60 * 24))}

Historial de las últimas 5 interacciones:
${interactions?.length > 0
        ? interactions
          .sort((a: { date: number }, b: { date: number }) => b.date - a.date)
          .slice(0, 5)
          .map((int: { type: string; date: number; description: string }) => `- ${int.type} (${new Date(int.date).toLocaleDateString("es-ES")}): ${int.description}`)
          .join("\n")
        : "Sin interacciones registradas"
      }
    `

    const { text } = await generateText({
      model: google("models/gemini-2.0-flash"),
      system: `Eres un sistema de categorización automática de clientes CRM.

Basándote en la información del cliente y su historial de interacciones, determina el estado más apropiado:

- ACTIVO: Cliente con interacciones frecuentes (últimos 30 días), responde bien, hay oportunidades de negocio
- POTENCIAL: Cliente nuevo o con interés mostrado pero sin relación establecida, o cliente que necesita seguimiento
- INACTIVO: Cliente sin interacciones recientes (más de 60 días), no responde, o relación comercial terminada

Responde ÚNICAMENTE con una de estas tres palabras: ACTIVO, POTENCIAL, o INACTIVO
No agregues explicaciones adicionales.`,
      prompt: `Categoriza este cliente:\n\n${clientInfo}`,
    })

    const category = text.trim().toUpperCase()
    const validCategories = ["ACTIVO", "POTENCIAL", "INACTIVO"]

    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Categoría inválida generada" }, { status: 500 })
    }

    const statusMap: { [key: string]: "Activo" | "Potencial" | "Inactivo" } = {
      ACTIVO: "Activo",
      POTENCIAL: "Potencial",
      INACTIVO: "Inactivo",
    }

    const url = NEXT_PUBLIC_CONVEX_URL || NEXT_PUBLIC_CONVEX_DEPLOYMENT
    if (url) {
      const convex = new ConvexHttpClient(url)
      await convex.mutation(api.clients.updateClient, { id: client._id, relationshipStatus: statusMap[category] })
    }

    return NextResponse.json({
      category: statusMap[category],
      reasoning: `Categorizado como ${statusMap[category]} basado en el análisis de interacciones y actividad reciente.`,
    })
  } catch (error) {
    console.error("Error en categorización de cliente:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
