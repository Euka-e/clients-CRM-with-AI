"use client"
import { ConvexProvider, ConvexReactClient, useQuery as convexUseQuery, useMutation as convexUseMutation } from "convex/react"
import type { ReactNode } from "react"
import { api } from "../convex/_generated/api"
import { Id } from "../convex/_generated/dataModel"
import { CreateClientArgs, InteractionCreateArgs, UpdateClientArgs } from "@/interfaces/IConvex"

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT

if (!CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL no está definido")
}

const realClient = new ConvexReactClient(CONVEX_URL)

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={realClient}>{children}</ConvexProvider>
}

type StatusFilter = "all" | "Activo" | "Inactivo" | "Potencial"
type SortBy = "lastInteraction" | "createdAt" | "fullName"
interface ClientsListArgs {
  status?: StatusFilter
  sortBy?: SortBy
}

type MarkInactiveArgs = { daysThreshold?: number }

interface GetByIdArgs { id: string }
interface GetInteractionsArgs { clientId: string }

export function useQuery<T>(name: string, args?: unknown): T | undefined {
  if (name === "clients:list") {
    const raw = (args as ClientsListArgs) || {}
    const statusMap: Record<string, "Activo" | "Inactivo" | "Potencial" | "Todos" | undefined> = {
      all: "Todos",
      Activo: "Activo",
      Inactivo: "Inactivo",
      Potencial: "Potencial",
    }
    const mapped = {
      ...raw,
      status: raw.status ? statusMap[raw.status] : raw.status,
    }
    return convexUseQuery(api.clients.getClients, mapped) as T
  }
  if (name === "clients:getById" && args && typeof (args as GetByIdArgs).id === "string") {
    return convexUseQuery(api.clients.getClient, { id: (args as GetByIdArgs).id as Id<"clients"> }) as T
  }
  if (name === "clients:getStats" || name === "clients:stats")
    return convexUseQuery(api.clients.getDashboardStats) as T
  if (name === "interactions:getByClientId" && args && typeof (args as GetInteractionsArgs).clientId === "string") {
    return convexUseQuery(api.interactions.getClientInteractions, { clientId: (args as GetInteractionsArgs).clientId as Id<"clients"> }) as T
  }
  return undefined
}

export function useMutation(name: "clients:create"): (data: CreateClientArgs) => Promise<Id<"clients">>
export function useMutation(name: "clients:update"): (data: UpdateClientArgs) => Promise<void>
export function useMutation(name: "clients:delete"): (data: { id: Id<"clients"> }) => Promise<void>
export function useMutation(name: "interactions:create"): (data: InteractionCreateArgs) => Promise<void>
export function useMutation(name: "clients:markInactive"): (data?: MarkInactiveArgs) => Promise<{ count: number }>
export function useMutation(name: string): unknown {
  const createClient = convexUseMutation(api.clients.createClient)
  const updateClient = convexUseMutation(api.clients.updateClient)
  const deleteClient = convexUseMutation(api.clients.deleteClient)
  const markInteraction = convexUseMutation(api.clients.markInteraction)
  const markInactiveClients = convexUseMutation(api.clients.markInactiveClients)

  if (name === "clients:create") {
    return (data: CreateClientArgs) => createClient(data)
  }
  if (name === "clients:update") {
    return (data: UpdateClientArgs) => updateClient(data)
  }
  if (name === "clients:delete") {
    return (data: { id: Id<"clients"> }) => deleteClient({ id: data.id })
  }
  if (name === "interactions:create") {
    return (data: InteractionCreateArgs) => markInteraction(data)
  }
  if (name === "clients:markInactive") {
    return (data?: MarkInactiveArgs) =>
      markInactiveClients({ daysThreshold: data?.daysThreshold ?? 30 })
  }
  return undefined
}
