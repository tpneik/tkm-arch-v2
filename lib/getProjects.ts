/**
 * Cached project loader for the PUBLIC site (server-only).
 *
 * Reads projects straight from MongoDB (the source of truth) but wraps the
 * query in `unstable_cache` tagged "projects". This means:
 *   - Visitors are served the cached result (static-fast) — no DB hit per request.
 *   - The DB is queried at most once per revalidation.
 *   - Admin mutations call `revalidateTag("projects")` (see app/admin/actions/
 *     projects.ts) so the very next request rebuilds the cache from fresh data,
 *     with NO redeploy/rebuild required.
 *
 * Mirrors the shape/order produced by `syncProjects()` in data/sync.ts.
 */
import "server-only";
import { unstable_cache } from "next/cache";
import { connectToDatabase } from "@/lib/mongoose";
import ProjectModel from "@/models/Project";
import type { Project } from "@/data/projects";

async function queryProjects(): Promise<Project[]> {
  await connectToDatabase();
  // Sort by numeric id (ids are stored as strings) — same as syncProjects().
  const docs = await ProjectModel.aggregate([
    { $addFields: { _numId: { $toInt: "$id" } } },
    { $sort: { _numId: 1 } },
    { $project: { _numId: 0 } },
  ]);

  return docs.map((d) =>
    // JSON round-trip strips ObjectId / Mongoose internals → plain serializable.
    JSON.parse(
      JSON.stringify({
        id: d.id,
        category: d.category,
        thumbnail: d.thumbnail,
        gallery: d.gallery,
        en: d.en,
        vi: d.vi,
      })
    )
  ) as Project[];
}

/** Cached + tagged. Bust via `revalidateTag("projects")` after any mutation. */
export const getProjects = unstable_cache(queryProjects, ["public-projects"], {
  tags: ["projects"],
});
