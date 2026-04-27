"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import type { Category } from "@/data/categories";

const CATEGORIES_FILE_PATH = path.join(
  process.cwd(),
  "data",
  "categories.json"
);

interface CategoriesData {
  projectCategories: Category[];
  blogCategories: Category[];
}

async function readCategories(): Promise<CategoriesData> {
  try {
    const fileContents = await fs.readFile(CATEGORIES_FILE_PATH, "utf8");
    return JSON.parse(fileContents) as CategoriesData;
  } catch (error) {
    console.error("Failed to read categories data:", error);
    return { projectCategories: [], blogCategories: [] };
  }
}

async function writeCategories(data: CategoriesData): Promise<void> {
  await fs.writeFile(
    CATEGORIES_FILE_PATH,
    JSON.stringify(data, null, 2),
    "utf8"
  );
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

/* ──────────── Project Categories ──────────── */

export async function getProjectCategories(): Promise<Category[]> {
  const data = await readCategories();
  return data.projectCategories;
}

export async function createProjectCategory(
  category: Omit<Category, "id">
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await readCategories();

    // Check duplicate slug
    if (data.projectCategories.some((c) => c.slug === category.slug)) {
      return { success: false, error: "Category slug already exists" };
    }

    const maxId = data.projectCategories.reduce((max, c) => {
      const n = parseInt(c.id, 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0);

    data.projectCategories.push({ ...category, id: (maxId + 1).toString() });
    await writeCategories(data);
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
    const data = await readCategories();
    const index = data.projectCategories.findIndex((c) => c.id === id);

    if (index === -1) {
      return { success: false, error: "Category not found" };
    }

    // Check duplicate slug (exclude self)
    if (
      data.projectCategories.some(
        (c) => c.slug === category.slug && c.id !== id
      )
    ) {
      return { success: false, error: "Category slug already exists" };
    }

    data.projectCategories[index] = { ...category, id };
    await writeCategories(data);
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
    const data = await readCategories();
    const filtered = data.projectCategories.filter((c) => c.id !== id);

    if (filtered.length === data.projectCategories.length) {
      return { success: false, error: "Category not found" };
    }

    data.projectCategories = filtered;
    await writeCategories(data);
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category" };
  }
}

/* ──────────── Blog Categories ──────────── */

export async function getBlogCategories(): Promise<Category[]> {
  const data = await readCategories();
  return data.blogCategories;
}

export async function createBlogCategory(
  category: Omit<Category, "id">
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await readCategories();

    if (data.blogCategories.some((c) => c.slug === category.slug)) {
      return { success: false, error: "Category slug already exists" };
    }

    const maxId = data.blogCategories.reduce((max, c) => {
      const n = parseInt(c.id, 10);
      return !isNaN(n) && n > max ? n : max;
    }, 0);

    data.blogCategories.push({ ...category, id: (maxId + 1).toString() });
    await writeCategories(data);
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
    const data = await readCategories();
    const index = data.blogCategories.findIndex((c) => c.id === id);

    if (index === -1) {
      return { success: false, error: "Category not found" };
    }

    if (
      data.blogCategories.some(
        (c) => c.slug === category.slug && c.id !== id
      )
    ) {
      return { success: false, error: "Category slug already exists" };
    }

    data.blogCategories[index] = { ...category, id };
    await writeCategories(data);
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
    const data = await readCategories();
    const filtered = data.blogCategories.filter((c) => c.id !== id);

    if (filtered.length === data.blogCategories.length) {
      return { success: false, error: "Category not found" };
    }

    data.blogCategories = filtered;
    await writeCategories(data);
    revalidateAll();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category" };
  }
}
