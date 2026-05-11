"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongoose";
import ProjectModel from "@/models/Project";
import type { Project } from "@/data/projects";

/** Strip Mongoose/BSON types so data is safe to pass to Client Components */
function serialize<T>(doc: any): T {
  return JSON.parse(JSON.stringify(doc));
}

export async function getProjects(): Promise<Project[]> {
  try {
    await connectToDatabase();
    const docs = await ProjectModel.aggregate([
      { $addFields: { _numId: { $toInt: "$id" } } },
      { $sort: { _numId: 1 } },
      { $project: { _numId: 0 } },
    ]);
    return docs.map((d: any) => serialize<Project>({
      id: d.id,
      category: d.category,
      thumbnail: d.thumbnail,
      gallery: d.gallery,
      en: d.en,
      vi: d.vi,
    }));
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
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
    console.error("Failed to get project by ID:", error);
    return null;
  }
}

export async function createProject(
  newProject: Omit<Project, "id">
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    // Auto-generate id
    const count = await ProjectModel.countDocuments();
    const projectData = { ...newProject, id: String(count + 1) };

    await ProjectModel.create(projectData);
    revalidatePath("/admin/projects");
    revalidatePath("/en/projects");
    revalidatePath("/vi/du-an");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create project:", error);
    return { success: false, error: error.message || "Failed to create project" };
  }
}

export async function updateProject(
  id: string,
  updatedProject: Omit<Project, "id">
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    const result = await ProjectModel.findOneAndUpdate(
      { id },
      updatedProject,
      { returnDocument: 'after', runValidators: true }
    );

    if (!result) {
      return { success: false, error: "Project not found" };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/en/projects");
    revalidatePath("/vi/du-an");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update project:", error);
    return { success: false, error: error.message || "Failed to update project" };
  }
}

export async function deleteProject(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();
    const result = await ProjectModel.findOneAndDelete({ id });

    if (!result) {
      return { success: false, error: "Project not found" };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/en/projects");
    revalidatePath("/vi/du-an");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete project:", error);
    return { success: false, error: error.message || "Failed to delete project" };
  }
}
