"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { Blog } from "@/data/blogs";

const BLOGS_FILE_PATH = path.join(process.cwd(), "data", "blogs.json");

export async function getBlogs(): Promise<Blog[]> {
  try {
    const fileContents = await fs.readFile(BLOGS_FILE_PATH, "utf8");
    return JSON.parse(fileContents) as Blog[];
  } catch (error) {
    console.error("Failed to read blogs data:", error);
    return [];
  }
}

export async function getBlogById(id: string): Promise<Blog | null> {
  try {
    const blogs = await getBlogs();
    return blogs.find((b) => b.id === id) || null;
  } catch (error) {
    console.error("Failed to get blog by ID:", error);
    return null;
  }
}

export async function createBlog(
  newBlog: Omit<Blog, "id">
): Promise<{ success: boolean; error?: string }> {
  try {
    const blogs = await getBlogs();

    const maxId = blogs.reduce((max, b) => {
      const idNum = parseInt(b.id, 10);
      return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 0);

    const blogWithId: Blog = {
      ...newBlog,
      id: (maxId + 1).toString(),
    };

    blogs.push(blogWithId);

    await fs.writeFile(BLOGS_FILE_PATH, JSON.stringify(blogs, null, 2), "utf8");
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
    const blogs = await getBlogs();
    const index = blogs.findIndex((b) => b.id === id);

    if (index === -1) {
      return { success: false, error: "Blog not found" };
    }

    blogs[index] = { ...updatedBlog, id };

    await fs.writeFile(BLOGS_FILE_PATH, JSON.stringify(blogs, null, 2), "utf8");
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
    const blogs = await getBlogs();
    const filteredBlogs = blogs.filter((b) => b.id !== id);

    if (blogs.length === filteredBlogs.length) {
      return { success: false, error: "Blog not found" };
    }

    await fs.writeFile(
      BLOGS_FILE_PATH,
      JSON.stringify(filteredBlogs, null, 2),
      "utf8"
    );
    revalidatePath("/admin/blogs");
    revalidatePath("/en/blogs");
    revalidatePath("/vi/bai-viet");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete blog:", error);
    return { success: false, error: error.message || "Failed to delete blog" };
  }
}
