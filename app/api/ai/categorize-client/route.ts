import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { client, interactions } = await request.json()

    if (!client) {
      return NextResponse.json({ error: "Cliente requerido" }, { status: 400 })
    }

    // Preparar información para categorización
    const clientInfo = `
Cliente: ${client.fullName}
Estado actual: ${client.relationshipStatus}
Última interacción: ${new Date(client.lastInteraction).toLocaleDateString("es-ES")}
Días desde última interacción: ${Math.floor((Date.now() - client.lastInteraction) / (1000 * 60 * 60 * 24))}

Historial de interacciones recientes:
${
  interactions?.length > 0
    ? interactions
        .slice(0, 5) // Últimas 5 interacciones
        .map((int: any) => `- ${int.type} (${new Date(int.date).toLocaleDateString("es-ES")}): ${int.description}`)
        .join("\n")
    : "Sin interacciones registradas"
}
    `

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
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

    // Mapear a los valores esperados por la base de datos
    const statusMap: { [key: string]: "Activo" | "Potencial" | "Inactivo" } = {
      ACTIVO: "Activo",
      POTENCIAL: "Potencial",
      INACTIVO: "Inactivo",
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
