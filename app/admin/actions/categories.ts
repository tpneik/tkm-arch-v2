"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongoose";
import CategoryModel from "@/models/Category";
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
    const docs = await CategoryModel.find({ type: "project" }).sort({ id: 1 }).lean();
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

    // Check duplicate slug
    const existing = await CategoryModel.findOne({ type: "project", slug: category.slug });
    if (existing) {
      return { success: false, error: "Category slug already exists" };
    }

    const count = await CategoryModel.countDocuments({ type: "project" });
    await CategoryModel.create({
      ...category,
      id: String(count + 1),
      type: "project",
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

    // Check duplicate slug (exclude self)
    const duplicate = await CategoryModel.findOne({
      type: "project",
      slug: category.slug,
      _id: { $ne: id },
    });
    if (duplicate) {
      return { success: false, error: "Category slug already exists" };
    }

    const result = await CategoryModel.findByIdAndUpdate(
      id,
      { slug: category.slug, en: category.en, vi: category.vi },
      { returnDocument: 'after', runValidators: true }
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
    const result = await CategoryModel.findByIdAndDelete(id);

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
    const docs = await CategoryModel.find({ type: "blog" }).sort({ id: 1 }).lean();
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

    const existing = await CategoryModel.findOne({ type: "blog", slug: category.slug });
    if (existing) {
      return { success: false, error: "Category slug already exists" };
    }

    const count = await CategoryModel.countDocuments({ type: "blog" });
    await CategoryModel.create({
      ...category,
      id: String(count + 1),
      type: "blog",
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

    const duplicate = await CategoryModel.findOne({
      type: "blog",
      slug: category.slug,
      _id: { $ne: id },
    });
    if (duplicate) {
      return { success: false, error: "Category slug already exists" };
    }

    const result = await CategoryModel.findByIdAndUpdate(
      id,
      { slug: category.slug, en: category.en, vi: category.vi },
      { returnDocument: 'after', runValidators: true }
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
    const result = await CategoryModel.findByIdAndDelete(id);

    if (!result) {
      return { success: false, error: "Category not found" };
    }

    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category" };
  }
}
