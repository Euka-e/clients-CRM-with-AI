/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { AnyDataModel } from "convex/server"
import type { GenericId } from "convex/values"

/**
 * No `schema.ts` file found!
 *
 * This generated code has permissive types like `Doc = any` because
 * Convex doesn't know your schema. If you'd like more type safety, see
 * https://docs.convex.dev/database/schemas.
 */
export type DataModel = AnyDataModel

export type Doc<TableName extends string = string> = {
  _id: GenericId<TableName>
  _creationTime: number
} & Record<string, any>

export type Id<TableName extends string = string> = GenericId<TableName>

// For now, document IDs are strings.
export declare const anyApi: {
  clients: {
    getClients: any
    getClient: any
    createClient: any
    updateClient: any
    deleteClient: any
    markInteraction: any
    getDashboardStats: any
    markInactiveClients: any
  }
  interactions: {
    getClientInteractions: any
    getRecentInteractions: any
  }
}

// Specific types for our schema
export interface Client {
  _id: Id<"clients">
  _creationTime: number
  fullName: string
  phoneNumber: string
  email?: string
  relationshipStatus: "Activo" | "Inactivo" | "Potencial"
  lastInteraction: number
  createdAt: number
  updatedAt: number
  company?: string
  notes?: string
  priority: "Alta" | "Media" | "Baja"
  aiAnalysis?: string
  aiPriority?: string
}

export interface Interaction {
  _id: Id<"interactions">
  _creationTime: number
  clientId: Id<"clients">
  type: "Llamada" | "Email" | "Reunión" | "Mensaje" | "Otro"
  description: string
  date: number
  createdAt: number
}
