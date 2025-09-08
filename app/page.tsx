"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Users,
  UserPlus,
  BarChart3,
  Phone,
  Search,
  Filter,
} from "lucide-react"
import { useQuery } from "@/lib/convex"
import { useState } from "react"
import { ClientFormDialog } from "@/components/client-form-dialog"
import { DeleteClientDialog } from "@/components/delete-client-dialog"
import { AutomationPanel } from "@/components/automation-panel"
import Link from "next/link"
import { Client, ClientStats } from "@/interfaces/IClient"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"

export default function HomePage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"all" | "Activo" | "Inactivo" | "Potencial">("all")
  const [sortBy, setSortBy] = useState<"lastInteraction" | "createdAt" | "fullName">("lastInteraction")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [doubleConfirmOpen, setDoubleConfirmOpen] = useState(false)

  const convexStatus = statusFilter === "all" ? undefined : statusFilter

  const convexSort =
    sortBy === "fullName"
      ? "fullName"
      : sortBy === "lastInteraction"
        ? "lastInteraction"
        : "createdAt"

  const stats = useQuery<ClientStats>("clients:getStats")
  const clients = useQuery<Client[]>("clients:list", { status: convexStatus, sortBy: convexSort })

  const filteredClients = clients?.filter((client) => {
    const matchesSearch =
      client.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  CRM
                </h1>
                <p className="text-sm text-muted-foreground">Customer Relationship Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Gestiona tus clientes de manera inteligente</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.totalClients || 0}</div>
              <p className="text-xs text-muted-foreground">En tu cartera</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Clientes Activos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.activeClients || 0}</div>
              <p className="text-xs text-muted-foreground">Con relación activa</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Potenciales</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.potentialClients || 0}</div>
              <p className="text-xs text-muted-foreground">Oportunidades de negocio</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Inactivos</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats?.inactiveClients || 0}</div>
              <p className="text-xs text-muted-foreground">Requieren atención</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <AutomationPanel />
        </div>

        <Card className="border-border mb-6">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: "all" | "Activo" | "Inactivo" | "Potencial") => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Potencial">Potencial</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: "lastInteraction" | "createdAt" | "fullName") => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastInteraction">Última interacción</SelectItem>
                <SelectItem value="createdAt">Fecha de creación</SelectItem>
                <SelectItem value="name">Nombre</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Lista de Clientes</CardTitle>
              <CardDescription>
                {filteredClients?.length || 0} cliente{(filteredClients?.length || 0) !== 1 ? "s" : ""} encontrado
                {(filteredClients?.length || 0) !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Cliente
            </Button>
          </CardHeader>
          <CardContent>
            {filteredClients && filteredClients.length > 0 ? (
              <div className="space-y-4">
                {filteredClients.map((client) => (
                  <div
                    key={client._id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Link href={`/clients/${client._id}`} className="flex items-center gap-4 group">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {client.fullName?.charAt(0) || "C"}
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:underline">{client.fullName}</p>
                        {client.phoneNumber && (
                          <p className="text-xs text-muted-foreground">{client.phoneNumber}</p>
                        )}
                        {client.email && (
                          <p className="text-xs text-muted-foreground">{client.email}</p>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(toFrontendStatus(client.relationshipStatus))}>
                        {client.relationshipStatus}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedClient(client)
                              setEditDialogOpen(true)
                            }}
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedClient(client)
                              setConfirmDeleteOpen(true)
                            }}
                            className="text-destructive"
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No hay clientes</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "No se encontraron clientes con los filtros aplicados"
                    : "Comienza agregando tu primer cliente"}
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Agregar Primer Cliente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <ClientFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} mode="create" />
      {selectedClient && (
        <>
          <ClientFormDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            client={{
              ...selectedClient,
              phoneNumber: selectedClient.phoneNumber ?? "",
              email: selectedClient.email ?? "",
            }}
            mode="edit"
          />

          <DeleteClientDialog
            open={confirmDeleteOpen}
            onOpenChange={(open) => {
              setConfirmDeleteOpen(open)
              if (!open && doubleConfirmOpen) setDoubleConfirmOpen(false)
            }}
            client={selectedClient}
            onDelete={() => setDoubleConfirmOpen(true)}
            confirmOnly
          />

          <DeleteClientDialog
            open={doubleConfirmOpen}
            onOpenChange={setDoubleConfirmOpen}
            client={selectedClient}
          />
        </>
      )}
    </div>
  )
}

function toFrontendStatus(r: string) {
  if (r === "Activo") return "active"
  if (r === "Inactivo") return "inactive"
  return "potential"
}
