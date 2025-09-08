import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { GOOGLE_GENERATIVE_AI_API_KEY } = process.env

  if (!GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json({
      analysis: "Este cliente lleva 3 meses sin contacto. Recomendaría marcarlo como prioridad alta.",
    })
  }
  try {
    const { client, interactions } = await request.json()

    if (!client) {
      return NextResponse.json({ error: "Cliente requerido" }, { status: 400 })
    }

    const clientInfo = `
    Cliente: ${client.fullName}
    Estado actual: ${client.relationshipStatus}
    Prioridad actual: ${client.priority}
    Teléfono: ${client.phoneNumber}
    Email: ${client.email || "No proporcionado"}
    Empresa: ${client.company || "No proporcionada"}
    Última interacción: ${new Date(client.lastInteraction).toLocaleDateString("es-ES")}
    Notas: ${client.notes || "Sin notas"}

    Historial de las últimas 5 interacciones (${Math.min(interactions?.length || 0, 5)} mostradas):
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
      system: `Eres un asistente de CRM experto que analiza clientes y proporciona recomendaciones estratégicas en formato markdown. 
      Tu tarea es analizar la información del cliente y proporcionar:
      1. Un resumen del estado actual del cliente
      2. Una recomendación de prioridad (Alta, Media, Baja) con justificación
      3. Sugerencias de acciones específicas para mejorar la relación
      
      Responde en español de manera profesional y concisa. Máximo 150 palabras.`,
      prompt: `Analiza este cliente y proporciona recomendaciones:\n\n${clientInfo}`,
    })

    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error("Error en análisis de cliente:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
