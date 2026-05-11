"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongoose";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import type { Category } from "@/data/categories";

/** Strip Mongoose/BSON types so data is safe to pass to Client Components */
function serialize<T>(doc: any): T {
  return JSON.parse(JSON.stringify(doc));
}

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/blogs");
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

    revalidateAll();
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

    revalidateAll();
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
    const result = await db.collection("projectCategories").findOneAndDelete({ _id: new ObjectId(id) });

    if (!result) {
      return { success: false, error: "Category not found" };
    }

    revalidateAll();
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

    revalidateAll();
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

    revalidateAll();
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
    const result = await db.collection("blogCategories").findOneAndDelete({ _id: new ObjectId(id) });

    if (!result) {
      return { success: false, error: "Category not found" };
    }

    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category" };
  }
}
