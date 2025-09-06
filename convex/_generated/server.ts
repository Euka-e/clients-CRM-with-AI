/* eslint-disable */
/**
 * Generated utilities for implementing server-side Convex query and mutation functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { ActionBuilder, MutationBuilder, QueryBuilder } from "convex/server"

/**
 * Define a query in this Convex app's public API.
 *
 * This function will be allowed to read your Convex database and will be accessible from the client.
 *
 * @param func - The query function. It receives a `DatabaseReader` as the first argument.
 * @returns The wrapped query function.
 */
export declare const query: QueryBuilder<any, "public">

/**
 * Define a mutation in this Convex app's public API.
 *
 * This function will be allowed to modify your Convex database and will be accessible from the client.
 *
 * @param func - The mutation function. It receives a `DatabaseWriter` as the first argument.
 * @returns The wrapped mutation function.
 */
export declare const mutation: MutationBuilder<any, "public">

/**
 * Define an action in this Convex app's public API.
 *
 * An action can run any JavaScript code, including non-deterministic code and code with side-effects.
 * Actions are often used to call into third-party services.
 * Actions execute in a Node.js environment and can interact with the database indirectly by calling queries and mutations using the provided `runQuery` and `runMutation` functions.
 *
 * @param func - The action function.
 * @returns The wrapped action function.
 */
export declare const action: ActionBuilder<any, "public">

/**
 * Define an internal query function.
 *
 * An internal query function cannot be called from the client. It can be called from other Convex functions.
 *
 * @param func - The internal query function.
 * @returns The wrapped internal query function.
 */
export declare const internalQuery: QueryBuilder<any, "internal">

/**
 * Define an internal mutation function.
 *
 * An internal mutation function cannot be called from the client. It can be called from other Convex functions.
 *
 * @param func - The internal mutation function.
 * @returns The wrapped internal mutation function.
 */
export declare const internalMutation: MutationBuilder<any, "internal">

/**
 * Define an internal action function.
 *
 * An internal action function cannot be called from the client. It can be called from other Convex functions.
 *
 * @param func - The internal action function.
 * @returns The wrapped internal action function.
 */
export declare const internalAction: ActionBuilder<any, "internal">
