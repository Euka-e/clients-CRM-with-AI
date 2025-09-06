import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { client, interactions } = await request.json()

    if (!client) {
      return NextResponse.json({ error: "Cliente requerido" }, { status: 400 })
    }

    // Preparar información del cliente para el análisis
    const clientInfo = `
Cliente: ${client.fullName}
Estado actual: ${client.relationshipStatus}
Prioridad actual: ${client.priority}
Teléfono: ${client.phoneNumber}
Email: ${client.email || "No proporcionado"}
Empresa: ${client.company || "No proporcionada"}
Última interacción: ${new Date(client.lastInteraction).toLocaleDateString("es-ES")}
Notas: ${client.notes || "Sin notas"}

Historial de interacciones (${interactions?.length || 0} total):
${
  interactions?.length > 0
    ? interactions
        .slice(0, 10) // Limitar a las últimas 10 interacciones
        .map((int: any) => `- ${int.type} (${new Date(int.date).toLocaleDateString("es-ES")}): ${int.description}`)
        .join("\n")
    : "Sin interacciones registradas"
}
    `

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `Eres un asistente de CRM experto que analiza clientes y proporciona recomendaciones estratégicas. 
      
      Tu tarea es analizar la información del cliente y proporcionar:
      1. Un resumen del estado actual del cliente
      2. Una recomendación de prioridad (Alta, Media, Baja) con justificación
      3. Sugerencias de acciones específicas para mejorar la relación
      
      Responde en español de manera profesional y concisa. Máximo 200 palabras.`,
      prompt: `Analiza este cliente y proporciona recomendaciones:\n\n${clientInfo}`,
    })

    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error("Error en análisis de cliente:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
