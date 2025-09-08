"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useMutation } from "@/lib/convex"

export function AutomationPanel() {
  const [status, setStatus] = useState<"activo" | "inactivo">("inactivo")
  const { toast } = useToast()
  const markInactiveClients = useMutation("clients:markInactive")

  useEffect(() => {
    setStatus("activo")
    const interval = setInterval(async () => {
      try {
        const result = await markInactiveClients({})
        if (result.count > 0) {
          toast({ title: `Se marcaron ${result.count} clientes como inactivos`, variant: "success" })
        }
      } catch {
        toast({ title: "Error al ejecutar automatización", variant: "error" })
      }
    }, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [markInactiveClients, toast])

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Clock className="h-5 w-5" />
          Automatización de clientes inactivos (testing)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Estado:</span>
          <Badge variant={status === "activo" ? "default" : "secondary"}>{status === "activo" ? "Activo" : "Inactivo"}</Badge>
        </div>
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mt-4">
          Este proceso marcará automáticamente como &quot;Inactivo&quot; a los clientes sin interacciones en la última hora.
          <br />
          (Se ejecuta cada 1 hora para testing)
        </div>
      </CardContent>
    </Card>
  )
}
