"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongoose";
import BlogModel from "@/models/Blog";
import type { Blog } from "@/data/blogs";
import { syncBlogs } from "@/data/sync";

/** Strip Mongoose/BSON types so data is safe to pass to Client Components */
function serialize<T>(doc: any): T {
  return JSON.parse(JSON.stringify(doc));
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

    const count = await BlogModel.countDocuments();
    const blogData = { ...newBlog, id: String(count + 1) };

    await BlogModel.create(blogData);
    await syncBlogs();
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
    const result = await BlogModel.findOneAndUpdate(
      { id },
      updatedBlog,
      { returnDocument: 'after', runValidators: true }
    );

    if (!result) {
      return { success: false, error: "Blog not found" };
    }

    await syncBlogs();
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
    revalidatePath("/admin/blogs");
    revalidatePath("/en/blogs");
    revalidatePath("/vi/bai-viet");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete blog:", error);
    return { success: false, error: error.message || "Failed to delete blog" };
  }
}
