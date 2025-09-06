"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Play, Clock } from "lucide-react"
import { toast } from "sonner"
import { useMutation } from "@/lib/convex"

export function AutomationPanel() {
  const [isLoading, setIsLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [automationStatus, setAutomationStatus] = useState<"active" | "inactive" | "unknown">("inactive")

  const markInactiveClients = useMutation("clients:markInactive")

  const setupAutomation = async () => {
    setIsLoading(true)
    try {
      // Simular delay de configuración
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setAutomationStatus("active")
      toast.success("Automatización configurada correctamente (simulada)")
      toast.info("En producción, esto configuraría un job recurrente en QStash")
    } catch (error) {
      console.error("[v0] Automation setup error:", error)
      toast.error("Error al configurar automatización")
    } finally {
      setIsLoading(false)
    }
  }

  const runAutomationNow = async () => {
    setIsRunning(true)
    try {
      const result = await markInactiveClients()

      if (result > 0) {
        toast.success(`Se marcaron ${result} clientes como inactivos`)
      } else {
        toast.info("No se encontraron clientes para marcar como inactivos")
      }
    } catch (error) {
      console.error("[v0] Manual automation error:", error)
      toast.error("Error al ejecutar automatización")
    } finally {
      setIsRunning(false)
    }
  }

  const checkStatus = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      // En modo simulado, siempre mostrar como configurado si ya se configuró
      if (automationStatus === "unknown") {
        setAutomationStatus("inactive")
      }
      toast.info("Estado verificado (simulado)")
    } catch (error) {
      setAutomationStatus("unknown")
    }
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Settings className="h-5 w-5" />
          Automatización QStash (Simulada)
        </CardTitle>
        <CardDescription>
          Job recurrente que marca clientes como inactivos después de 30 días sin interacción
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">Estado:</span>
            <Badge
              variant={automationStatus === "active" ? "default" : "secondary"}
              className={automationStatus === "active" ? "bg-blue-100 text-blue-800" : ""}
            >
              {automationStatus === "active" ? "Activo" : automationStatus === "inactive" ? "Inactivo" : "Desconocido"}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkStatus}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
          >
            Verificar Estado
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={setupAutomation} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            <Play className="h-4 w-4 mr-2" />
            {isLoading ? "Configurando..." : "Configurar Automatización"}
          </Button>

          {automationStatus === "active" && (
            <Button
              onClick={runAutomationNow}
              disabled={isRunning}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
            >
              {isRunning ? "Ejecutando..." : "Ejecutar Ahora"}
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <strong>Configuración:</strong> En producción se ejecutaría cada 6 horas y marcaría como "Inactivo" a los
          clientes que no han tenido interacciones en los últimos 30 días. En modo simulado, puedes ejecutar
          manualmente.
        </div>
      </CardContent>
    </Card>
  )
}
