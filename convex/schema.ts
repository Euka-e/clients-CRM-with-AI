import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  clients: defineTable({
    // Campos básicos del cliente
    fullName: v.string(),
    phoneNumber: v.string(),
    email: v.optional(v.string()),

    // Estado de la relación
    relationshipStatus: v.union(v.literal("Activo"), v.literal("Inactivo"), v.literal("Potencial")),

    // Fechas importantes
    lastInteraction: v.number(), // timestamp
    createdAt: v.number(), // timestamp
    updatedAt: v.number(), // timestamp

    // Información adicional
    company: v.optional(v.string()),
    notes: v.optional(v.string()),
    priority: v.union(v.literal("Alta"), v.literal("Media"), v.literal("Baja")),

    // Campos para IA
    aiAnalysis: v.optional(v.string()),
    aiPriority: v.optional(v.string()),
  })
    .index("by_status", ["relationshipStatus"])
    .index("by_last_interaction", ["lastInteraction"])
    .index("by_priority", ["priority"])
    .index("by_created_at", ["createdAt"]),

  interactions: defineTable({
    clientId: v.id("clients"),
    type: v.union(
      v.literal("Llamada"),
      v.literal("Email"),
      v.literal("Reunión"),
      v.literal("Mensaje"),
      v.literal("Otro"),
    ),
    description: v.string(),
    date: v.number(), // timestamp
    createdAt: v.number(), // timestamp
  })
    .index("by_client", ["clientId"])
    .index("by_date", ["date"]),
})
