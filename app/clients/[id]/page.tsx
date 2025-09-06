"use client"

import { useQuery } from "@/lib/convex"
import { useState } from "react"
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Users, Phone, Mail, Calendar, MessageSquare, Edit, Plus, Bot, Activity } from "lucide-react"
import { ClientFormDialog } from "@/components/client-form-dialog"
import { InteractionDialog } from "@/components/interaction-dialog"
import { AIAssistantDialog } from "@/components/ai-assistant-dialog"

interface ClientDetailPageProps {
  params: {
    id: string
  }
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)

  const client = useQuery<any>("clients:getById", params.id)
  const interactions = useQuery<any[]>("interactions:getByClientId", params.id)

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Cargando cliente...</h3>
        </div>
      </div>
    )
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

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case "high":
        return "Alta"
      case "medium":
        return "Media"
      case "low":
        return "Baja"
      default:
        return "Sin prioridad"
    }
  }

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "Llamada telefónica":
        return <Phone className="h-4 w-4" />
      case "Email enviado":
        return <Mail className="h-4 w-4" />
      case "Reunión":
        return <Calendar className="h-4 w-4" />
      case "Mensaje":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{client.name}</h1>
                  <p className="text-sm text-muted-foreground">Detalle del cliente</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setAiDialogOpen(true)}>
                <Bot className="h-4 w-4 mr-2" />
                Asistente IA
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del Cliente */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(client.status)}>{getStatusLabel(client.status)}</Badge>
                  {client.priority && (
                    <Badge className={getPriorityColor(client.priority)}>{getPriorityLabel(client.priority)}</Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{client.phone}</span>
                  </div>

                  {client.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{client.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="text-foreground">Última interacción</p>
                      <p className="text-muted-foreground">
                        {formatDistanceToNow(new Date(client.lastInteraction), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {client.notes && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground mb-2">Notas</h4>
                    <p className="text-sm text-muted-foreground">{client.notes}</p>
                  </div>
                )}

                {client.aiAnalysis && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      Análisis IA
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.aiAnalysis}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => setInteractionDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Marcar Interacción
                </Button>
                <Button variant="outline" className="w-full bg-transparent" onClick={() => setAiDialogOpen(true)}>
                  <Bot className="h-4 w-4 mr-2" />
                  Asistente IA
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Historial de Interacciones */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Historial de Interacciones
                </CardTitle>
                <CardDescription>
                  {interactions?.length || 0} interacción{(interactions?.length || 0) !== 1 ? "es" : ""} registrada
                  {(interactions?.length || 0) !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interactions && interactions.length > 0 ? (
                  <div className="space-y-4">
                    {interactions.map((interaction) => (
                      <div
                        key={interaction._id}
                        className="flex items-start gap-4 p-4 border border-border rounded-lg bg-card/50"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {getInteractionIcon(interaction.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {interaction.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(interaction.createdAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{interaction.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Sin interacciones</h3>
                    <p className="text-muted-foreground mb-4">No hay interacciones registradas con este cliente aún.</p>
                    <Button onClick={() => setInteractionDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Primera Interacción
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ClientFormDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} client={client} mode="edit" />

      <InteractionDialog
        open={interactionDialogOpen}
        onOpenChange={setInteractionDialogOpen}
        clientId={params.id}
        clientName={client.name}
      />

      <AIAssistantDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        client={client}
        interactions={interactions}
      />
    </div>
  )
}
