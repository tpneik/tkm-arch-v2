/**
 * Cached blog loader for the PUBLIC site (server-only).
 *
 * Reads blogs straight from MongoDB (source of truth), wrapped in
 * `unstable_cache` tagged "blogs":
 *   - Visitors get the cached result (static-fast) — no DB hit per request.
 *   - The DB is queried at most once per revalidation.
 *   - Admin mutations call `revalidateTag("blogs")` (see app/admin/actions/
 *     blogs.ts) so the next request rebuilds from fresh data, NO rebuild needed.
 *
 * Mirrors the shape/order produced by `syncBlogs()` in data/sync.ts
 * (sorted by date, newest first).
 */
import "server-only";
import { unstable_cache } from "next/cache";
import { connectToDatabase } from "@/lib/mongoose";
import BlogModel from "@/models/Blog";
import type { Blog } from "@/data/blogs";

async function queryBlogs(): Promise<Blog[]> {
  await connectToDatabase();
  const docs = await BlogModel.find({}).sort({ date: -1 }).lean();

  const blogs = docs.map((d) =>
    // JSON round-trip strips ObjectId / Mongoose internals → plain serializable.
    JSON.parse(
      JSON.stringify({
        id: d.id,
        category: d.category,
        thumbnail: d.thumbnail,
        date: d.date,
        en: d.en,
        vi: d.vi,
      })
    )
  ) as Blog[];

  // Drop malformed docs (missing en/vi) — `.lean()` does NOT apply schema
  // defaults, so a document lacking these fields would crash rendering.
  return blogs.filter((b) => {
    const ok = b && b.en && b.vi;
    if (!ok) console.warn(`[getBlogs] skipping malformed blog id=${b?.id}`);
    return ok;
  });
}

/** Cached + tagged. Bust via `revalidateTag("blogs")` after any mutation. */
export const getBlogs = unstable_cache(queryBlogs, ["public-blogs"], {
  tags: ["blogs"],
});
