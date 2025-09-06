"use client"

import { useState } from "react"
import { useMutation } from "@/lib/convex"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Bot, Sparkles, Target } from "lucide-react"

interface AIAssistantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: {
    _id: string
    name: string
    phone: string
    email: string
    status: "active" | "inactive" | "potential"
    notes?: string
    priority?: "high" | "medium" | "low"
    lastInteraction: string
    createdAt: string
  }
  interactions?: Array<{
    _id: string
    type: string
    notes: string
    createdAt: string
  }>
}

export function AIAssistantDialog({ open, onOpenChange, client, interactions }: AIAssistantDialogProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCategorizing, setIsCategorizing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null)

  const updateClient = useMutation("clients:update")

  const handleAnalyzeClient = async () => {
    setIsAnalyzing(true)
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const daysSinceLastInteraction = Math.floor(
        (new Date().getTime() - new Date(client.lastInteraction).getTime()) / (1000 * 60 * 60 * 24),
      )

      let analysisText = ""
      let priority = "medium"

      if (daysSinceLastInteraction > 30) {
        analysisText = `⚠️ PRIORIDAD ALTA: Este cliente lleva ${daysSinceLastInteraction} días sin contacto. Recomiendo marcarlo como prioridad alta y realizar seguimiento inmediato.\n\nSugerencias:\n• Llamada telefónica para reconectar\n• Revisar si cambió su situación\n• Ofrecer nuevos servicios o promociones`
        priority = "high"
      } else if (daysSinceLastInteraction > 14) {
        analysisText = `📋 PRIORIDAD MEDIA: Cliente con ${daysSinceLastInteraction} días desde última interacción. Mantener seguimiento regular.\n\nSugerencias:\n• Email de seguimiento\n• Compartir contenido de valor\n• Programar próxima reunión`
        priority = "medium"
      } else {
        analysisText = `✅ PRIORIDAD BAJA: Cliente activo con interacción reciente (${daysSinceLastInteraction} días). Relación saludable.\n\nSugerencias:\n• Continuar con el plan actual\n• Buscar oportunidades de upselling\n• Solicitar referencias`
        priority = "low"
      }

      setAnalysis(analysisText)

      // Actualizar prioridad del cliente
      await updateClient(client._id, {
        priority: priority as "high" | "medium" | "low",
        aiAnalysis: analysisText,
      })

      toast.success("Análisis completado")
    } catch (error) {
      toast.error("Error al analizar el cliente")
      console.error("Error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCategorizeClient = async () => {
    setIsCategorizing(true)
    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const daysSinceLastInteraction = Math.floor(
        (new Date().getTime() - new Date(client.lastInteraction).getTime()) / (1000 * 60 * 60 * 24),
      )

      let suggestedStatus = client.status

      if (daysSinceLastInteraction > 30) {
        suggestedStatus = "inactive"
      } else if (daysSinceLastInteraction <= 7) {
        suggestedStatus = "active"
      } else {
        suggestedStatus = "potential"
      }

      setSuggestedCategory(suggestedStatus)

      // Actualizar estado del cliente si es diferente
      if (suggestedStatus !== client.status) {
        await updateClient(client._id, { status: suggestedStatus })
        toast.success(`Cliente recategorizado como ${getStatusLabel(suggestedStatus)}`)
      } else {
        toast.info(`El cliente ya está correctamente categorizado como ${getStatusLabel(suggestedStatus)}`)
      }
    } catch (error) {
      toast.error("Error al categorizar el cliente")
      console.error("Error:", error)
    } finally {
      setIsCategorizing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "potential":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activo"
      case "potential":
        return "Potencial"
      case "inactive":
        return "Inactivo"
      default:
        return status
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Asistente IA - {client.name}
          </DialogTitle>
          <DialogDescription>
            Utiliza inteligencia artificial para analizar y categorizar automáticamente a tu cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Análisis del Cliente */}
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Análisis Inteligente</h3>
                </div>
                <Button onClick={handleAnalyzeClient} disabled={isAnalyzing} size="sm">
                  {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isAnalyzing ? "Analizando..." : "Analizar Cliente"}
                </Button>
              </div>

              {analysis ? (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{analysis}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Haz clic en "Analizar Cliente" para obtener un resumen inteligente del estado del cliente y
                  recomendaciones de prioridad.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Categorización Automática */}
          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Categorización Automática</h3>
                </div>
                <Button onClick={handleCategorizeClient} disabled={isCategorizing} size="sm" variant="outline">
                  {isCategorizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCategorizing ? "Categorizando..." : "Categorizar Automáticamente"}
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Estado actual:</span>
                  <Badge className={`ml-2 ${getStatusColor(client.status)}`}>{getStatusLabel(client.status)}</Badge>
                </div>
                {suggestedCategory && suggestedCategory !== client.status && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Sugerido:</span>
                    <Badge className={`ml-2 ${getStatusColor(suggestedCategory)}`}>
                      {getStatusLabel(suggestedCategory)}
                    </Badge>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                La IA analizará las interacciones del cliente para determinar automáticamente si debe ser categorizado
                como Activo, Inactivo o Potencial.
              </p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
