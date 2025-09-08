import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getClients = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("Activo"),
        v.literal("Inactivo"),
        v.literal("Potencial"),
        v.literal("Todos"),
      ),
    ),
    sortBy: v.optional(
      v.union(
        v.literal("lastInteraction"),
        v.literal("createdAt"),
        v.literal("fullName"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const sortBy = args.sortBy
    const status = args.status && args.status !== "Todos" ? args.status : undefined

    let clients
    if (status) {
      if (sortBy === "lastInteraction") {
        clients = await ctx.db
          .query("clients")
          .withIndex("by_status_last_interaction", (q) =>
            q.eq("relationshipStatus", status),
          )
          .collect()
      } else if (sortBy === "fullName") {
        clients = await ctx.db
          .query("clients")
          .withIndex("by_status_full_name", (q) =>
            q.eq("relationshipStatus", status),
          )
          .collect()
      } else {
        clients = await ctx.db
          .query("clients")
          .withIndex("by_status", (q) => q.eq("relationshipStatus", status))
          .collect()
      }
    } else {
      if (sortBy === "lastInteraction") {
        clients = await ctx.db
          .query("clients")
          .withIndex("by_last_interaction")
          .collect()
      } else if (sortBy === "fullName") {
        clients = await ctx.db
          .query("clients")
          .withIndex("by_full_name")
          .collect()
      } else {
        clients = await ctx.db.query("clients").collect()
      }
    }

    if (sortBy === "lastInteraction") {
      clients.sort((a, b) => b.lastInteraction - a.lastInteraction)
    } else if (sortBy === "createdAt") {
      clients.sort((a, b) => b.createdAt - a.createdAt)
    } else if (sortBy === "fullName") {
      clients.sort((a, b) => a.fullName.localeCompare(b.fullName))
    }

    return clients
  },
})

export const getClient = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const createClient = mutation({
  args: {
    fullName: v.string(),
    phoneNumber: v.string(),
    email: v.optional(v.string()),
    relationshipStatus: v.union(v.literal("Activo"), v.literal("Inactivo"), v.literal("Potencial")),
    company: v.optional(v.string()),
    notes: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("Alta"), v.literal("Media"), v.literal("Baja"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    return await ctx.db.insert("clients", {
      ...args,
      priority: args.priority || "Media",
      lastInteraction: now,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const updateClient = mutation({
  args: {
    id: v.id("clients"),
    aiAnalysis: v.optional(v.string()),
    aiAnalysisGeneratedAt: v.optional(v.number()),
    aiPriority: v.optional(v.union(v.literal("Alta"), v.literal("Media"), v.literal("Baja"))),
    fullName: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    relationshipStatus: v.optional(v.union(v.literal("Activo"), v.literal("Inactivo"), v.literal("Potencial"))),
    company: v.optional(v.string()),
    notes: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("Alta"), v.literal("Media"), v.literal("Baja"))),
    lastInteraction: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args
    await ctx.db.patch(id, fields)
  },
})

export const deleteClient = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const interactions = await ctx.db
      .query("interactions")
      .withIndex("by_client", (q) => q.eq("clientId", args.id))
      .collect()
    for (const interaction of interactions) {
      await ctx.db.delete(interaction._id)
    }
    return await ctx.db.delete(args.id)
  },
})

export const markInteraction = mutation({
  args: {
    clientId: v.id("clients"),
    type: v.union(
      v.literal("Llamada"),
      v.literal("Email"),
      v.literal("Reunión"),
      v.literal("Mensaje"),
      v.literal("Otro"),
    ),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    await ctx.db.insert("interactions", {
      ...args,
      date: now,
      createdAt: now,
    })

    await ctx.db.patch(args.clientId, {
      lastInteraction: now,
      updatedAt: now,
    })
  },
})

export const getDashboardStats = query({
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").collect()

    const totalClients = clients.length
    const activeClients = clients.filter((c) => c.relationshipStatus === "Activo").length
    const potentialClients = clients.filter((c) => c.relationshipStatus === "Potencial").length
    const inactiveClients = clients.filter((c) => c.relationshipStatus === "Inactivo").length

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const recentInteractions = clients.filter((c) => c.lastInteraction > thirtyDaysAgo).length

    return {
      totalClients,
      activeClients,
      potentialClients,
      inactiveClients,
      recentInteractions,
    }
  },
})

export const markInactiveClients = mutation({
  args: { daysThreshold: v.number() },
  handler: async (ctx, args) => {
    const daysThreshold = args.daysThreshold ?? 30
    const cutoffDate = Date.now() - daysThreshold * 24 * 60 * 60 * 1000

    const clients = await ctx.db.query("clients").collect()
    const clientsToUpdate = clients.filter(
      (client) =>
        client.lastInteraction < cutoffDate &&
        client.relationshipStatus === "Activo"
    )

    for (const client of clientsToUpdate) {
      await ctx.db.patch(client._id, {
        relationshipStatus: "Inactivo",
        updatedAt: Date.now(),
      })
    }

    return { count: clientsToUpdate.length }
  },
})

export const update = mutation({
  args: {
    id: v.id("clients"),
    fullName: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    relationshipStatus: v.optional(
      v.union(
        v.literal("Activo"),
        v.literal("Inactivo"),
        v.literal("Potencial"),
      ),
    ),
    priority: v.optional(
      v.union(
        v.literal("Alta"),
        v.literal("Media"),
        v.literal("Baja"),
      ),
    ),
    notes: v.optional(v.string()),
    company: v.optional(v.string()),
    aiAnalysis: v.optional(v.string()),
    lastInteraction: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args
    await ctx.db.patch(id, fields)
  },
})

export { getClient as getById }
