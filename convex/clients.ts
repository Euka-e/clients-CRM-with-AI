import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Obtener todos los clientes
export const getClients = query({
  args: {
    status: v.optional(v.union(v.literal("Activo"), v.literal("Inactivo"), v.literal("Potencial"), v.literal("Todos"))),
    sortBy: v.optional(v.union(v.literal("lastInteraction"), v.literal("createdAt"), v.literal("fullName"))),
  },
  handler: async (ctx, args) => {
    let clients

    if (args.status && args.status !== "Todos") {
      clients = await ctx.db
        .query("clients")
        .withIndex("by_status", (q) => q.eq("relationshipStatus", args.status))
        .collect()
    } else {
      clients = await ctx.db.query("clients").collect()
    }

    // Ordenar según el criterio especificado
    if (args.sortBy === "lastInteraction") {
      clients.sort((a, b) => b.lastInteraction - a.lastInteraction)
    } else if (args.sortBy === "createdAt") {
      clients.sort((a, b) => b.createdAt - a.createdAt)
    } else if (args.sortBy === "fullName") {
      clients.sort((a, b) => a.fullName.localeCompare(b.fullName))
    }

    return clients
  },
})

// Obtener un cliente por ID
export const getClient = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

// Crear un nuevo cliente
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

// Actualizar un cliente
export const updateClient = mutation({
  args: {
    id: v.id("clients"),
    fullName: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    relationshipStatus: v.optional(v.union(v.literal("Activo"), v.literal("Inactivo"), v.literal("Potencial"))),
    company: v.optional(v.string()),
    notes: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("Alta"), v.literal("Media"), v.literal("Baja"))),
    aiAnalysis: v.optional(v.string()),
    aiPriority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

// Eliminar un cliente
export const deleteClient = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id)
  },
})

// Marcar interacción con cliente
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

    // Crear la interacción
    await ctx.db.insert("interactions", {
      ...args,
      date: now,
      createdAt: now,
    })

    // Actualizar la última interacción del cliente
    await ctx.db.patch(args.clientId, {
      lastInteraction: now,
      updatedAt: now,
    })
  },
})

// Obtener estadísticas del dashboard
export const getDashboardStats = query({
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").collect()

    const totalClients = clients.length
    const activeClients = clients.filter((c) => c.relationshipStatus === "Activo").length
    const potentialClients = clients.filter((c) => c.relationshipStatus === "Potencial").length
    const inactiveClients = clients.filter((c) => c.relationshipStatus === "Inactivo").length

    // Clientes con interacciones en los últimos 30 días
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

// Función para automatización - marcar clientes inactivos
export const markInactiveClients = mutation({
  args: { daysThreshold: v.number() },
  handler: async (ctx, args) => {
    const cutoffDate = Date.now() - args.daysThreshold * 24 * 60 * 60 * 1000

    const clients = await ctx.db.query("clients").collect()
    const clientsToUpdate = clients.filter(
      (client) => client.lastInteraction < cutoffDate && client.relationshipStatus !== "Inactivo",
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
