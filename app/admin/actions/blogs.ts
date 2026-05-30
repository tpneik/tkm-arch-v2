"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { connectToDatabase } from "@/lib/mongoose";
import BlogModel from "@/models/Blog";
import type { Blog } from "@/data/blogs";
import { syncBlogs } from "@/data/sync";
import { buildFolderPrefix } from "@/lib/r2Key";
import { relocateImagesToFolder } from "@/lib/r2Move";
import { r2, R2_BUCKET } from "@/lib/r2";

/** Strip Mongoose/BSON types so data is safe to pass to Client Components */
function serialize<T>(doc: any): T {
  return JSON.parse(JSON.stringify(doc));
}

/**
 * Move a blog's cover image into the folder implied by its (category, title)
 * under TKM/BLOG, returning the blog data with remapped URL + old R2 keys to
 * delete once the DB write succeeds. Best-effort: on any error it returns the
 * data unchanged so the save still proceeds.
 */
async function relocateBlogImages(
  data: Omit<Blog, "id">
): Promise<{ data: Omit<Blog, "id">; oldKeys: string[] }> {
  try {
    const newPrefix = buildFolderPrefix({
      basePrefix: "TKM/BLOG",
      categoryLabel: data.vi?.categoryLabel || data.en?.categoryLabel,
      projectName: data.vi?.title || data.en?.title,
    });
    if (!newPrefix) return { data, oldKeys: [] };

    const urls = [data.thumbnail].filter(Boolean);
    const { map, oldKeys } = await relocateImagesToFolder(urls, newPrefix);
    if (oldKeys.length === 0) return { data, oldKeys: [] };

    return {
      data: { ...data, thumbnail: map[data.thumbnail] || data.thumbnail },
      oldKeys,
    };
  } catch (err) {
    console.warn("[relocateBlogImages] skipped:", err);
    return { data, oldKeys: [] };
  }
}

/** Delete old R2 objects after a successful save (best-effort). */
async function deleteOldKeys(oldKeys: string[]): Promise<void> {
  await Promise.all(
    oldKeys.map((Key) =>
      r2
        .send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key }))
        .catch((err) => console.warn(`[deleteOldKeys] ${Key}:`, err))
    )
  );
}

export async function getBlogs(): Promise<Blog[]> {
  try {
    await connectToDatabase();
    const docs = await BlogModel.find({}).sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => serialize<Blog>({
      id: d.id,
      category: d.category,
      thumbnail: d.thumbnail,
      date: d.date,
      en: d.en,
      vi: d.vi,
    }));
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return [];
  }
}

export async function getBlogById(id: string): Promise<Blog | null> {
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
    console.error("Failed to get blog by ID:", error);
    return null;
  }
}

export async function createBlog(
  newBlog: Omit<Blog, "id">
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    // Move cover image into the folder matching the chosen category/title.
    const { data: relocated, oldKeys } = await relocateBlogImages(newBlog);

    const count = await BlogModel.countDocuments();
    const blogData = { ...relocated, id: String(count + 1) };

    await BlogModel.create(blogData);
    await deleteOldKeys(oldKeys);
    await syncBlogs();
    revalidateTag("blogs", "max"); // bust the cached public loader (@/lib/getBlogs)
    revalidatePath("/admin/blogs");
    revalidatePath("/en/blogs");
    revalidatePath("/vi/bai-viet");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create blog:", error);
    return { success: false, error: error.message || "Failed to create blog" };
  }
}

export async function updateBlog(
  id: string,
  updatedBlog: Omit<Blog, "id">
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    // Move cover image into the folder matching the (possibly changed) category/title.
    const { data: relocated, oldKeys } = await relocateBlogImages(updatedBlog);

    const result = await BlogModel.findOneAndUpdate(
      { id },
      relocated,
      { returnDocument: 'after', runValidators: true }
    );

    if (!result) {
      return { success: false, error: "Blog not found" };
    }

    await deleteOldKeys(oldKeys);
    await syncBlogs();
    revalidateTag("blogs", "max"); // bust the cached public loader (@/lib/getBlogs)
    revalidatePath("/admin/blogs");
    revalidatePath("/en/blogs");
    revalidatePath("/vi/bai-viet");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update blog:", error);
    return { success: false, error: error.message || "Failed to update blog" };
  }
}

export async function deleteBlog(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    const result = await BlogModel.findOneAndDelete({ id });

    if (!result) {
      return { success: false, error: "Blog not found" };
    }

    await syncBlogs();
    revalidateTag("blogs", "max"); // bust the cached public loader (@/lib/getBlogs)
    revalidatePath("/admin/blogs");
    revalidatePath("/en/blogs");
    revalidatePath("/vi/bai-viet");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete blog:", error);
    return { success: false, error: error.message || "Failed to delete blog" };
  }
}
