import { v } from "convex/values"
import { query } from "./_generated/server"

// Obtener interacciones de un cliente
export const getClientInteractions = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interactions")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect()
  },
})

// Obtener interacciones recientes (para dashboard)
export const getRecentInteractions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const interactions = await ctx.db
      .query("interactions")
      .withIndex("by_date")
      .order("desc")
      .take(args.limit || 10)

    // Obtener información del cliente para cada interacción
    const interactionsWithClient = await Promise.all(
      interactions.map(async (interaction) => {
        const client = await ctx.db.get(interaction.clientId)
        return {
          ...interaction,
          client,
        }
      }),
    )

    return interactionsWithClient
  },
})
