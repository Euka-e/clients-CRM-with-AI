import { Id } from "../convex/_generated/dataModel"

export interface CreateClientArgs {
    fullName: string
    phoneNumber: string
    email?: string
    relationshipStatus: "Activo" | "Inactivo" | "Potencial"
    company?: string
    notes?: string
    priority?: "Alta" | "Media" | "Baja"
}

export interface UpdateClientArgs {
    id: Id<"clients">
    fullName?: string
    phoneNumber?: string
    email?: string
    relationshipStatus?: "Activo" | "Inactivo" | "Potencial"
    company?: string
    notes?: string
    priority?: "Alta" | "Media" | "Baja"
    aiAnalysis?: string
    aiPriority?: "Alta" | "Media" | "Baja"
}

export interface InteractionCreateArgs {
    clientId: Id<"clients">
    type: "Llamada" | "Email" | "Reunión" | "Mensaje" | "Otro"
    description: string
}
