"use server";

/**
 * PUBLIC read-only data queries.
 *
 * These server actions fetch data from MongoDB for public pages.
 * They are READ-ONLY — no create/update/delete operations.
 * All write operations remain gated behind admin auth in app/admin/actions/.
 */

import { connectToDatabase } from "@/lib/mongoose";
import mongoose from "mongoose";
import ProjectModel from "@/models/Project";
import BlogModel from "@/models/Blog";
import type { Project } from "./projects";
import type { Blog } from "./blogs";
import type { Category } from "./categories";

/* ──── Helpers ──── */

/** Strip Mongoose/BSON types so data is safe to pass to Client Components */
function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc));
}

/* ──────────── Projects ──────────── */

/** Fetch all projects (public, read-only) */
export async function fetchProjects(): Promise<Project[]> {
  try {
    await connectToDatabase();
    const docs = await ProjectModel.aggregate([
      { $addFields: { _numId: { $toInt: "$id" } } },
      { $sort: { _numId: 1 } },
      { $project: { _numId: 0 } },
    ]);
    return docs.map((d: any) =>
      serialize<Project>({
        id: d.id,
        category: d.category,
        thumbnail: d.thumbnail,
        gallery: d.gallery,
        en: d.en,
        vi: d.vi,
      })
    );
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

/** Fetch a single project by its human-readable id (public, read-only) */
export async function fetchProjectById(id: string): Promise<Project | null> {
  try {
    await connectToDatabase();
    const doc: any = await ProjectModel.findOne({ id }).lean();
    if (!doc) return null;
    return serialize<Project>({
      id: doc.id,
      category: doc.category,
      thumbnail: doc.thumbnail,
      gallery: doc.gallery,
      en: doc.en,
      vi: doc.vi,
    });
  } catch (error) {
    console.error("Failed to fetch project by ID:", error);
    return null;
  }
}

/* ──────────── Blogs ──────────── */

/** Fetch all blogs (public, read-only) */
export async function fetchBlogs(): Promise<Blog[]> {
  try {
    await connectToDatabase();
    const docs = await BlogModel.find({}).sort({ date: -1 }).lean();
    return docs.map((d: any) =>
      serialize<Blog>({
        id: d.id,
        category: d.category,
        thumbnail: d.thumbnail,
        date: d.date,
        en: d.en,
        vi: d.vi,
      })
    );
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return [];
  }
}

/** Fetch a single blog by its human-readable id (public, read-only) */
export async function fetchBlogById(id: string): Promise<Blog | null> {
  try {
    await connectToDatabase();
    const doc: any = await BlogModel.findOne({ id }).lean();
    if (!doc) return null;
    return serialize<Blog>({
      id: doc.id,
      category: doc.category,
      thumbnail: doc.thumbnail,
      date: doc.date,
      en: doc.en,
      vi: doc.vi,
    });
  } catch (error) {
    console.error("Failed to fetch blog by ID:", error);
    return null;
  }
}

/* ──────────── Categories ──────────── */

/** Fetch all project categories (public, read-only) */
export async function fetchProjectCategories(): Promise<Category[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return [];
    const docs = await db
      .collection("projectCategories")
      .find({})
      .sort({ id: 1 })
      .toArray();
    return docs.map((d: any) =>
      serialize<Category>({
        id: d._id?.toString() || d.id,
        slug: d.slug,
        en: d.en,
        vi: d.vi,
      })
    );
  } catch (error) {
    console.error("Failed to fetch project categories:", error);
    return [];
  }
}

/** Fetch all blog categories (public, read-only) */
export async function fetchBlogCategories(): Promise<Category[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return [];
    const docs = await db
      .collection("blogCategories")
      .find({})
      .sort({ id: 1 })
      .toArray();
    return docs.map((d: any) =>
      serialize<Category>({
        id: d._id?.toString() || d.id,
        slug: d.slug,
        en: d.en,
        vi: d.vi,
      })
    );
  } catch (error) {
    console.error("Failed to fetch blog categories:", error);
    return [];
  }
}
