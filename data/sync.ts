"use server";

/**
 * Sync MongoDB data → static JSON files.
 *
 * Call this after any admin CRUD operation to keep the JSON files
 * (which public pages read at build/runtime) in sync with the database.
 *
 * The JSON files live in data/ and are imported by:
 *   - data/projects.ts → projects.json
 *   - data/blogs.ts    → blogs.json
 *   - data/categories.ts → categories.json
 */

import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/mongoose";
import mongoose from "mongoose";
import ProjectModel from "@/models/Project";
import BlogModel from "@/models/Blog";

/* ──── Helpers ──── */

function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc));
}

/** Write JSON to the data/ directory (with pretty formatting) */
function writeJsonFile(filename: string, data: unknown): void {
  // Vercel serverless = read-only filesystem, skip file writes
  // if (process.env.VERCEL) {
  //   console.log(`[sync] ⏭️  Skipped writing ${filename} (Vercel read-only fs)`);
  //   return;
  // }
  const filePath = path.join(process.cwd(), "data", filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`[sync] ✅ Wrote ${filePath}`);
}

/* ──── Sync Functions ──── */

/** Sync all projects from MongoDB → data/projects.json */
export async function syncProjects(): Promise<void> {
  await connectToDatabase();
  const docs = await ProjectModel.aggregate([
    { $addFields: { _numId: { $toInt: "$id" } } },
    { $sort: { _numId: 1 } },
    { $project: { _numId: 0 } },
  ]);

  const projects = docs.map((d: any) =>
    serialize({
      id: d.id,
      category: d.category,
      thumbnail: d.thumbnail,
      gallery: d.gallery,
      en: d.en,
      vi: d.vi,
    })
  );

  writeJsonFile("projects.json", projects);
}

/** Sync all blogs from MongoDB → data/blogs.json */
export async function syncBlogs(): Promise<void> {
  await connectToDatabase();
  const docs = await BlogModel.find({}).sort({ date: -1 }).lean();

  const blogs = docs.map((d: any) =>
    serialize({
      id: d.id,
      category: d.category,
      thumbnail: d.thumbnail,
      date: d.date,
      en: d.en,
      vi: d.vi,
    })
  );

  writeJsonFile("blogs.json", blogs);
}

/** Sync all categories from MongoDB → data/categories.json */
export async function syncCategories(): Promise<void> {
  await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) {
    console.error("[sync] ❌ Database connection not available");
    return;
  }

  const projectCatDocs = await db
    .collection("projectCategories")
    .find({})
    .sort({ id: 1 })
    .toArray();

  const blogCatDocs = await db
    .collection("blogCategories")
    .find({})
    .sort({ id: 1 })
    .toArray();

  const categories = {
    projectCategories: projectCatDocs.map((d: any) =>
      serialize({
        id: d._id?.toString() || d.id,
        slug: d.slug,
        en: d.en,
        vi: d.vi,
      })
    ),
    blogCategories: blogCatDocs.map((d: any) =>
      serialize({
        id: d._id?.toString() || d.id,
        slug: d.slug,
        en: d.en,
        vi: d.vi,
      })
    ),
  };

  writeJsonFile("categories.json", categories);
}

/** Sync ALL data: projects, blogs, and categories */
export async function syncAll(): Promise<void> {
  console.log("[sync] 🔄 Syncing all data from MongoDB → JSON...");
  await Promise.all([syncProjects(), syncBlogs(), syncCategories()]);
  console.log("[sync] ✅ All data synced successfully.");
}
