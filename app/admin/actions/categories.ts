"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongoose";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import type { Category } from "@/data/categories";
import { slugify } from "@/data/categories";
import { syncCategories } from "@/data/sync";
import ProjectModel from "@/models/Project";
import BlogModel from "@/models/Blog";

/**
 * Build the MongoDB $or conditions that match any content item using a given
 * category. Covers: the canonical slug (in `categories[]` and `category`), the
 * per-locale derived slugs, and legacy data that stored a localized label in
 * `category`.
 */
function categoryUsageConditions(cat: {
  slug: string;
  en?: { label?: string };
  vi?: { label?: string };
}): Record<string, unknown>[] {
  const viSlug = cat.vi?.label ? slugify(cat.vi.label) : cat.slug;
  const enSlug = cat.en?.label ? slugify(cat.en.label) : cat.slug;
  const or: Record<string, unknown>[] = [
    { categories: cat.slug },
    { category: cat.slug },
    { "vi.categorySlug": viSlug },
    { "en.categorySlug": enSlug },
  ];
  if (cat.vi?.label) or.push({ category: cat.vi.label });
  if (cat.en?.label) or.push({ category: cat.en.label });
  return or;
}

/** Strip Mongoose/BSON types so data is safe to pass to Client Components */
function serialize<T>(doc: any): T {
  return JSON.parse(JSON.stringify(doc));
}

async function revalidateAll() {
  await syncCategories();
  // "layout" scope busts every route nested under the admin layout — including
  // the dynamic form pages (/admin/projects/[id]/edit, /admin/projects/create,
  // and the blog equivalents) so a newly added category shows up everywhere.
  revalidatePath("/admin", "layout");
  revalidatePath("/en/projects");
  revalidatePath("/vi/du-an");
  revalidatePath("/en/blogs");
  revalidatePath("/vi/bai-viet");
}

/** Map a Mongoose doc to the Category type expected by the UI */
function toCategory(doc: any): Category {
  return serialize<Category>({
    id: doc._id?.toString() || doc.id,
    slug: doc.slug,
    en: doc.en,
    vi: doc.vi,
  });
}

/* ──────────── Project Categories ──────────── */

export async function getProjectCategories(): Promise<Category[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return [];
    const docs = await db.collection("projectCategories").find({}).sort({ id: 1 }).toArray();
    return docs.map(toCategory);
  } catch (error) {
    console.error("Failed to fetch project categories:", error);
    return [];
  }
}

export async function createProjectCategory(
  category: Omit<Category, "id">
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return { success: false, error: "DB not connected" };
    const col = db.collection("projectCategories");

    // Check duplicate slug
    const existing = await col.findOne({ slug: category.slug });
    if (existing) {
      return { success: false, error: "Category slug already exists" };
    }

    const count = await col.countDocuments();
    await col.insertOne({
      ...category,
      id: String(count + 1),
    });

    await revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function updateProjectCategory(
  id: string,
  category: Omit<Category, "id">
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return { success: false, error: "DB not connected" };
    const col = db.collection("projectCategories");

    // Check duplicate slug (exclude self)
    const duplicate = await col.findOne({
      slug: category.slug,
      _id: { $ne: new ObjectId(id) },
    });
    if (duplicate) {
      return { success: false, error: "Category slug already exists" };
    }

    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { slug: category.slug, en: category.en, vi: category.vi } },
      { returnDocument: "after" }
    );

    if (!result) {
      return { success: false, error: "Category not found" };
    }

    await revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteProjectCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return { success: false, error: "DB not connected" };
    const col = db.collection("projectCategories");

    const cat = await col.findOne({ _id: new ObjectId(id) });
    if (!cat) {
      return { success: false, error: "Category not found" };
    }

    // Block deletion while any project still uses this category.
    const inUse = await ProjectModel.countDocuments({
      $or: categoryUsageConditions(cat as any),
    });
    if (inUse > 0) {
      return {
        success: false,
        error: `Không thể xóa: có ${inUse} dự án đang dùng danh mục "${cat.vi?.label || cat.slug}". Hãy gỡ danh mục khỏi các dự án đó trước.`,
      };
    }

    await col.deleteOne({ _id: new ObjectId(id) });

    await revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category" };
  }
}

/* ──────────── Blog Categories ──────────── */

export async function getBlogCategories(): Promise<Category[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return [];
    const docs = await db.collection("blogCategories").find({}).sort({ id: 1 }).toArray();
    return docs.map(toCategory);
  } catch (error) {
    console.error("Failed to fetch blog categories:", error);
    return [];
  }
}

export async function createBlogCategory(
  category: Omit<Category, "id">
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return { success: false, error: "DB not connected" };
    const col = db.collection("blogCategories");

    const existing = await col.findOne({ slug: category.slug });
    if (existing) {
      return { success: false, error: "Category slug already exists" };
    }

    const count = await col.countDocuments();
    await col.insertOne({
      ...category,
      id: String(count + 1),
    });

    await revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function updateBlogCategory(
  id: string,
  category: Omit<Category, "id">
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return { success: false, error: "DB not connected" };
    const col = db.collection("blogCategories");

    const duplicate = await col.findOne({
      slug: category.slug,
      _id: { $ne: new ObjectId(id) },
    });
    if (duplicate) {
      return { success: false, error: "Category slug already exists" };
    }

    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { slug: category.slug, en: category.en, vi: category.vi } },
      { returnDocument: "after" }
    );

    if (!result) {
      return { success: false, error: "Category not found" };
    }

    await revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteBlogCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) return { success: false, error: "DB not connected" };
    const col = db.collection("blogCategories");

    const cat = await col.findOne({ _id: new ObjectId(id) });
    if (!cat) {
      return { success: false, error: "Category not found" };
    }

    // Block deletion while any blog post still uses this category.
    const inUse = await BlogModel.countDocuments({
      $or: categoryUsageConditions(cat as any),
    });
    if (inUse > 0) {
      return {
        success: false,
        error: `Không thể xóa: có ${inUse} bài viết đang dùng danh mục "${cat.vi?.label || cat.slug}". Hãy gỡ danh mục khỏi các bài viết đó trước.`,
      };
    }

    await col.deleteOne({ _id: new ObjectId(id) });

    await revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category" };
  }
}
