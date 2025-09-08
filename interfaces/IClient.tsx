export interface Client {
  _id: string
  fullName: string
  phoneNumber: string
  email: string
  relationshipStatus: "Activo" | "Inactivo" | "Potencial"
  notes?: string
  priority: "Alta" | "Media" | "Baja"
  company?: string
  aiAnalysis?: string
  lastInteraction: number
}

export interface Interaction {
  _id: string
  type: string
  description: string
  createdAt: number
}

export interface ClientStats {
  totalClients: number
  activeClients: number
  potentialClients: number
  inactiveClients: number
}
