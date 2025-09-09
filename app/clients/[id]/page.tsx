"use client"

import { useQuery, useMutation } from "@/lib/convex"
import { useState, useEffect } from "react"
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Users, Phone, Mail, Calendar, MessageSquare, Edit, Plus, Bot, Activity, Settings, Trash2 } from "lucide-react"
import { ClientFormDialog } from "@/components/client-form-dialog"
import { InteractionDialog } from "@/components/interaction-dialog"
import { DeleteClientDialog } from "@/components/delete-client-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Id } from "@/convex/_generated/dataModel"
import ReactMarkdown from "react-markdown"
import { useRouter } from "next/navigation"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

type Client = {
  _id: string
  fullName: string
  phoneNumber: string
  email?: string
  relationshipStatus: "Activo" | "Inactivo" | "Potencial"
  notes?: string
  priority: "Alta" | "Media" | "Baja"
  company?: string
  aiAnalysis?: string
  aiAnalysisGeneratedAt?: number
  aiSuggestedCategory?: "Activo" | "Potencial" | "Inactivo"
  lastInteraction: number
}

type Interaction = {
  _id: string
  type: string
  description: string
  createdAt: number
}

interface ClientDetailPageProps {
  params: {
    id: string
  }
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCategorizing, setIsCategorizing] = useState(false)
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [analysisPreview, setAnalysisPreview] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()

  const client = useQuery<Client>("clients:getById", { id: params.id })
  const interactions = useQuery<Interaction[]>("interactions:getByClientId", { clientId: params.id })
  const updateClient = useMutation("clients:update")
  const { toast } = useToast()

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (!client) {
      timeout = setTimeout(() => setNotFound(true), 2000)
    }
    return () => clearTimeout(timeout)
  }, [client])

  useEffect(() => {
    if (notFound) {
      const redirectTimeout = setTimeout(() => {
        router.replace("/")
      }, 2000)
      return () => clearTimeout(redirectTimeout)
    }
  }, [notFound, router])

  useEffect(() => {
    if (client?.aiSuggestedCategory) {
      setSuggestedCategory(client.aiSuggestedCategory)
    }
  }, [client])

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {notFound ? "El cliente no existe. Redirigiendo..." : "Cargando cliente..."}
          </h3>
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

  const handleAnalyze = async () => {
    if (!client) return
    setIsAnalyzing(true)
    try {
      const res = await fetch("/api/ai/analyze-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, interactions }),
      })
      const data = await res.json()
      if (data.analysis) {
        setAnalysisPreview(data.analysis)
        setShowAnalysisModal(true)
        const priorityRegex = /\b(Alta|Media|Baja)\b/i
        const normalized = data.analysis.normalize("NFD").replace(/\p{Diacritic}/gu, "")
        const match = priorityRegex.exec(normalized)
        const aiPriority = match
          ? match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()
          : undefined

        const validPriorities = ["Alta", "Media", "Baja"] as const
        type ValidPriority = typeof validPriorities[number]

        const aiPriorityValid: ValidPriority | undefined =
          validPriorities.includes(aiPriority as ValidPriority)
            ? (aiPriority as ValidPriority)
            : undefined

        await updateClient({
          id: client._id as Id<"clients">,
          aiAnalysis: data.analysis,
          aiAnalysisGeneratedAt: Date.now(),
          ...(aiPriorityValid && { aiPriority: aiPriorityValid }),
        })
        toast({ title: "Análisis generado", variant: "success" })
      } else {
        toast({ title: "No se pudo generar el análisis", variant: "error" })
      }
    } catch {
      toast({ title: "Error al analizar cliente", variant: "error" })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCategorize = async () => {
    if (!client) return
    setIsCategorizing(true)
    try {
      const res = await fetch("/api/ai/categorize-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client, interactions }),
      })
      const data = await res.json()
      if (data.category) {
        setSuggestedCategory(data.category)
        await updateClient({
          id: client._id as Id<"clients">,
          aiSuggestedCategory: data.category,
          ...(client.relationshipStatus !== data.category && { relationshipStatus: data.category }),
        })
        if (client.relationshipStatus !== data.category) {
          toast({ title: `Estado actualizado a ${data.category}`, variant: "success" })
        } else {
          toast({ title: "El estado ya coincide", variant: "info" })
        }
      } else {
        toast({ title: "No se pudo categorizar", variant: "error" })
      }
    } catch {
      toast({ title: "Error al categorizar", variant: "error" })
    } finally {
      setIsCategorizing(false)
    }
  }

  return (
    <div className="space-y-2">
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
                  <h1 className="text-xl font-bold text-foreground">{client.fullName}</h1>
                  <p className="text-sm text-muted-foreground">Detalle del cliente</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDeleteOpen(true)}
                className="flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.7fr_1.5fr] gap-8">
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={getStatusColor(
                      client.relationshipStatus === "Activo"
                        ? "active"
                        : client.relationshipStatus === "Inactivo"
                          ? "inactive"
                          : "potential"
                    )}
                  >
                    {client.relationshipStatus}
                  </Badge>
                  {client.priority && (
                    <Badge className="border">{getPriorityLabel(client.priority)}</Badge>
                  )}
                  {client.aiAnalysisGeneratedAt && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-muted-foreground">
                      IA {formatDistanceToNow(new Date(client.aiAnalysisGeneratedAt), { addSuffix: true, locale: es })}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.phoneNumber}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm break-all">{client.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p>Última interacción</p>
                      <p className="text-muted-foreground">
                        {formatDistanceToNow(new Date(client.lastInteraction), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </div>
                </div>
                {client.notes && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Notas</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{client.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {(client.aiAnalysis || analysisPreview) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" /> Análisis IA
                  </CardTitle>
                  <CardDescription>
                    {client.aiAnalysisGeneratedAt
                      ? `Generado ${formatDistanceToNow(new Date(client.aiAnalysisGeneratedAt), { addSuffix: true, locale: es })}`
                      : "Generado recientemente"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose max-w-none text-sm">
                  <ReactMarkdown>
                    {analysisPreview || client.aiAnalysis || ""}
                  </ReactMarkdown>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="space-y-6 max-w-xs w-full mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" /> Acciones Rápidas
                </CardTitle>
                <CardDescription>Gestión rápida</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => setInteractionDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Marcar Interacción
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isAnalyzing}
                  onClick={handleAnalyze}
                >
                  {isAnalyzing && <Activity className="h-4 w-4 mr-2 animate-spin" />}
                  {isAnalyzing ? "Analizando..." : "Analizar Cliente (IA)"}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={isCategorizing}
                  onClick={handleCategorize}
                >
                  {isCategorizing && <Activity className="h-4 w-4 mr-2 animate-spin" />}
                  {isCategorizing ? "Categorizando..." : "Categorizar Automáticamente"}
                </Button>
                {suggestedCategory && (
                  <p className="text-xs text-muted-foreground">
                    Sugerido: <span className="font-medium">{suggestedCategory}</span>
                  </p>
                )}
              </CardContent>
            </Card>
            {suggestedCategory && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" /> Categoría sugerida
                  </CardTitle>
                  <CardDescription>Último resultado</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{suggestedCategory}</Badge>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Historial de Interacciones
                </CardTitle>
                <CardDescription>
                  {interactions?.length || 0} interacción{(interactions?.length || 0) !== 1 ? "es" : ""} registrada
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interactions && interactions.length > 0 ? (
                  <div className="space-y-4">
                    {interactions.map((interaction: Interaction) => (
                      <div key={interaction._id} className="flex items-start gap-4 p-4 border border-border rounded-lg bg-card/50">
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
                          <p className="text-sm text-foreground">
                            {interaction.description}
                          </p>
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
      <ClientFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        client={{
          ...client,
          email: client.email ?? ""
        }}
        mode="edit"
      />
      <InteractionDialog
        open={interactionDialogOpen}
        onOpenChange={setInteractionDialogOpen}
        clientId={params.id}
        clientName={client.fullName}
      />
      <DeleteClientDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        client={{
          _id: client._id,
          fullName: client.fullName,
        }}
        onDelete={() => router.push("/")}
      />
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDeleteOpen(false)
                setDeleteDialogOpen(true)
              }}
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="sm:max-w-[650px] max-h-[75vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Análisis del Cliente (IA)</DialogTitle>
            <DialogDescription>Resultado generado y guardado.</DialogDescription>
          </DialogHeader>
          <div className="prose max-w-none text-sm">
            <ReactMarkdown>{analysisPreview || client.aiAnalysis || ""}</ReactMarkdown>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnalysisModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
