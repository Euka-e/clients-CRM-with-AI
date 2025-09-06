"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface MockClient {
  _id: string
  name: string
  phone: string
  email: string
  status: "active" | "inactive" | "potential"
  lastInteraction: string
  notes?: string
  priority?: "high" | "medium" | "low"
  aiAnalysis?: string
  createdAt: string
}

interface MockInteraction {
  _id: string
  clientId: string
  type: string
  notes: string
  createdAt: string
}

// Datos simulados
const mockClients: MockClient[] = [
  {
    _id: "1",
    name: "Ana García",
    phone: "+34 612 345 678",
    email: "ana.garcia@email.com",
    status: "active",
    lastInteraction: "2024-12-15",
    notes: "Cliente muy interesado en nuestros servicios premium",
    priority: "high",
    createdAt: "2024-11-01",
  },
  {
    _id: "2",
    name: "Carlos Rodríguez",
    phone: "+34 687 654 321",
    email: "carlos.rodriguez@email.com",
    status: "potential",
    lastInteraction: "2024-12-10",
    notes: "Pendiente de seguimiento para propuesta comercial",
    priority: "medium",
    createdAt: "2024-11-15",
  },
  {
    _id: "3",
    name: "María López",
    phone: "+34 654 987 123",
    email: "maria.lopez@email.com",
    status: "inactive",
    lastInteraction: "2024-10-20",
    notes: "No ha respondido a las últimas comunicaciones",
    priority: "low",
    createdAt: "2024-09-10",
  },
]

const mockInteractions: MockInteraction[] = [
  {
    _id: "int1",
    clientId: "1",
    type: "Llamada telefónica",
    notes: "Discutimos los nuevos servicios premium. Muy interesada.",
    createdAt: "2024-12-15",
  },
  {
    _id: "int2",
    clientId: "2",
    type: "Email enviado",
    notes: "Enviada propuesta comercial personalizada.",
    createdAt: "2024-12-10",
  },
]

interface MockConvexContext {
  clients: MockClient[]
  interactions: MockInteraction[]
  createClient: (data: Omit<MockClient, "_id" | "createdAt">) => Promise<string>
  updateClient: (id: string, data: Partial<MockClient>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  addInteraction: (data: Omit<MockInteraction, "_id" | "createdAt">) => Promise<string>
  getClientStats: () => { total: number; active: number; inactive: number; potential: number }
  markInactiveClients: () => Promise<number>
}

const MockConvexContext = createContext<MockConvexContext | null>(null)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<MockClient[]>(mockClients)
  const [interactions, setInteractions] = useState<MockInteraction[]>(mockInteractions)

  const createClient = async (data: Omit<MockClient, "_id" | "createdAt">): Promise<string> => {
    const newClient: MockClient = {
      ...data,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setClients((prev) => [...prev, newClient])
    return newClient._id
  }

  const updateClient = async (id: string, data: Partial<MockClient>): Promise<void> => {
    setClients((prev) => prev.map((client) => (client._id === id ? { ...client, ...data } : client)))
  }

  const deleteClient = async (id: string): Promise<void> => {
    setClients((prev) => prev.filter((client) => client._id !== id))
    setInteractions((prev) => prev.filter((interaction) => interaction.clientId !== id))
  }

  const addInteraction = async (data: Omit<MockInteraction, "_id" | "createdAt">): Promise<string> => {
    const newInteraction: MockInteraction = {
      ...data,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setInteractions((prev) => [...prev, newInteraction])

    // Actualizar lastInteraction del cliente
    await updateClient(data.clientId, {
      lastInteraction: new Date().toISOString().split("T")[0],
    })

    return newInteraction._id
  }

  const getClientStats = () => {
    const total = clients.length
    const active = clients.filter((c) => c.status === "active").length
    const inactive = clients.filter((c) => c.status === "inactive").length
    const potential = clients.filter((c) => c.status === "potential").length
    return { total, active, inactive, potential }
  }

  const markInactiveClients = async (): Promise<number> => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    let markedCount = 0
    setClients((prev) =>
      prev.map((client) => {
        const lastInteractionDate = new Date(client.lastInteraction)
        if (lastInteractionDate < thirtyDaysAgo && client.status !== "inactive") {
          markedCount++
          return { ...client, status: "inactive" as const }
        }
        return client
      }),
    )

    return markedCount
  }

  const value: MockConvexContext = {
    clients,
    interactions,
    createClient,
    updateClient,
    deleteClient,
    addInteraction,
    getClientStats,
    markInactiveClients,
  }

  return <MockConvexContext.Provider value={value}>{children}</MockConvexContext.Provider>
}

// Hook personalizado para usar el contexto simulado
export function useQuery<T>(queryName: string, ...args: any[]): T | undefined {
  const context = useContext(MockConvexContext)
  if (!context) throw new Error("useQuery must be used within ConvexClientProvider")

  if (queryName === "clients:list") {
    return context.clients as T
  }
  if (queryName === "clients:getById") {
    const [id] = args
    return context.clients.find((c) => c._id === id) as T
  }
  if (queryName === "clients:getStats") {
    return context.getClientStats() as T
  }
  if (queryName === "interactions:getByClientId") {
    const [clientId] = args
    return context.interactions.filter((i) => i.clientId === clientId) as T
  }

  return undefined
}

export function useMutation(mutationName: string) {
  const context = useContext(MockConvexContext)
  if (!context) throw new Error("useMutation must be used within ConvexClientProvider")

  if (mutationName === "clients:create") {
    return context.createClient
  }
  if (mutationName === "clients:update") {
    return context.updateClient
  }
  if (mutationName === "clients:delete") {
    return context.deleteClient
  }
  if (mutationName === "interactions:create") {
    return context.addInteraction
  }
  if (mutationName === "clients:markInactive") {
    return context.markInactiveClients
  }

  return () => Promise.resolve()
}
