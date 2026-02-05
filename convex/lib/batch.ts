// convex/lib/batch.ts
import { Doc, Id, TableNames } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

/**
 * Batch load multiple documents by ID
 *
 * NOTE: Convex doesn't have native batch reads. This runs queries
 * in parallel which is faster than sequential but still N queries.
 * For true batch optimization, consider denormalizing data.
 */
export async function batchGet<T extends TableNames>(
  ctx: QueryCtx,
  ids: Id<T>[]
): Promise<Map<string, Doc<T>>> {
  const results = new Map<string, Doc<T>>();

  // Deduplicate IDs
  const uniqueIds = Array.from(new Set(ids.map(id => id.toString())));

  await Promise.all(
    uniqueIds.map(async (idStr) => {
      const doc = await ctx.db.get(idStr as Id<T>);
      if (doc) {
        results.set(idStr, doc as Doc<T>);
      }
    })
  );

  return results;
}

/**
 * Batch load with a simpler return type for common use cases
 */
export async function batchGetArray<T extends TableNames>(
  ctx: QueryCtx,
  ids: Id<T>[]
): Promise<(Doc<T> | null)[]> {
  const map = await batchGet(ctx, ids);
  return ids.map(id => map.get(id.toString()) ?? null);
}
