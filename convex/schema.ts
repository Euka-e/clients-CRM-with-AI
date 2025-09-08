import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  clients: defineTable({
    fullName: v.string(),
    phoneNumber: v.string(),
    email: v.optional(v.string()),
    relationshipStatus: v.union(
      v.literal("Activo"),
      v.literal("Inactivo"),
      v.literal("Potencial"),
    ),
    lastInteraction: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
    priority: v.optional(v.union(v.literal("Alta"), v.literal("Media"), v.literal("Baja"))),
    aiAnalysis: v.optional(v.string()),
    aiPriority: v.optional(v.union(v.literal("Alta"), v.literal("Media"), v.literal("Baja"))),
    aiAnalysisGeneratedAt: v.optional(v.number()),
  })
    .index("by_status", ["relationshipStatus"])
    .index("by_last_interaction", ["lastInteraction"])
    .index("by_full_name", ["fullName"])
    .index("by_status_last_interaction", ["relationshipStatus", "lastInteraction"])
    .index("by_status_full_name", ["relationshipStatus", "fullName"]),

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
    date: v.number(),
    createdAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_date", ["date"]),
})
