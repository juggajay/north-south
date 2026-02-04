import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new version snapshot
 */
export const create = mutation({
    args: {
        designId: v.id("designs"),
        config: v.any(),
        label: v.optional(v.string()),
    },
    handler: async (ctx, { designId, config, label }) => {
        // Verify design exists
        const design = await ctx.db.get(designId);
        if (!design) {
            throw new Error("Design not found");
        }

        // Get current max version number for this design
        const existingVersions = await ctx.db
            .query("designVersions")
            .withIndex("by_designId", (q) => q.eq("designId", designId))
            .order("desc")
            .collect();

        const maxVersion = existingVersions.length > 0
            ? Math.max(...existingVersions.map(v => v.version))
            : 0;

        const nextVersion = maxVersion + 1;

        // Insert new version record
        const versionId = await ctx.db.insert("designVersions", {
            designId,
            version: nextVersion,
            config,
            label,
            createdAt: Date.now(),
        });

        return versionId;
    },
});

/**
 * Restore design to a specific version
 */
export const restore = mutation({
    args: {
        designId: v.id("designs"),
        versionId: v.id("designVersions"),
    },
    handler: async (ctx, { designId, versionId }) => {
        // Get the version to restore
        const version = await ctx.db.get(versionId);
        if (!version) {
            throw new Error("Version not found");
        }

        // Verify it belongs to the specified design
        if (version.designId !== designId) {
            throw new Error("Version does not belong to this design");
        }

        // Get the design
        const design = await ctx.db.get(designId);
        if (!design) {
            throw new Error("Design not found");
        }

        // Create a version snapshot of current state before restoring
        const existingVersions = await ctx.db
            .query("designVersions")
            .withIndex("by_designId", (q) => q.eq("designId", designId))
            .order("desc")
            .collect();

        const maxVersion = existingVersions.length > 0
            ? Math.max(...existingVersions.map(v => v.version))
            : 0;

        await ctx.db.insert("designVersions", {
            designId,
            version: maxVersion + 1,
            config: design.config,
            label: `Before restoring to version ${version.version}`,
            createdAt: Date.now(),
        });

        // Update design with the restored config
        await ctx.db.patch(designId, {
            config: version.config,
            updatedAt: Date.now(),
        });

        return await ctx.db.get(designId);
    },
});

/**
 * List all versions for a design
 */
export const list = query({
    args: {
        designId: v.id("designs"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, { designId, limit = 20 }) => {
        const versions = await ctx.db
            .query("designVersions")
            .withIndex("by_designId", (q) => q.eq("designId", designId))
            .order("desc")
            .take(limit);

        // Return with config summary (dimensions only for list view)
        return versions.map(version => ({
            _id: version._id,
            _creationTime: version._creationTime,
            designId: version.designId,
            version: version.version,
            label: version.label,
            createdAt: version.createdAt,
            thumbnail: version.thumbnail,
            // Extract just dimensions for list view to reduce payload
            dimensions: version.config?.dimensions || null,
        }));
    },
});

/**
 * Get specific version details
 */
export const get = query({
    args: { versionId: v.id("designVersions") },
    handler: async (ctx, { versionId }) => {
        const version = await ctx.db.get(versionId);
        if (!version) {
            throw new Error("Version not found");
        }
        return version;
    },
});

/**
 * Get a specific version by design and version number
 */
export const getByVersionNumber = query({
    args: {
        designId: v.id("designs"),
        version: v.number(),
    },
    handler: async (ctx, { designId, version }) => {
        const versionRecord = await ctx.db
            .query("designVersions")
            .withIndex("by_designId_version", (q) =>
                q.eq("designId", designId).eq("version", version)
            )
            .first();

        return versionRecord;
    },
});

/**
 * Delete old versions (keep last N versions per design)
 */
export const pruneOldVersions = mutation({
    args: {
        designId: v.id("designs"),
        keepCount: v.number(), // Number of versions to keep
    },
    handler: async (ctx, { designId, keepCount }) => {
        const versions = await ctx.db
            .query("designVersions")
            .withIndex("by_designId", (q) => q.eq("designId", designId))
            .order("desc")
            .collect();

        // Delete all versions beyond keepCount
        const versionsToDelete = versions.slice(keepCount);

        for (const version of versionsToDelete) {
            await ctx.db.delete(version._id);
        }

        return { deleted: versionsToDelete.length };
    },
});
