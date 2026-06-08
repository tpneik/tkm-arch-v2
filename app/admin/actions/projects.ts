"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { connectToDatabase } from "@/lib/mongoose";
import ProjectModel from "@/models/Project";
import type { Project } from "@/data/projects";
import { normalizeProjectCategories } from "@/data/projects";
import { syncProjects } from "@/data/sync";
import { DEFAULT_BASE_PREFIX } from "@/lib/r2Key";
import { relocateImagesByCategory, deleteFolderByUrls } from "@/lib/r2Move";
import { r2, R2_BUCKET } from "@/lib/r2";

/** Strip Mongoose/BSON types so data is safe to pass to Client Components */
function serialize<T>(doc: any): T {
  return JSON.parse(JSON.stringify(doc));
}

/**
 * Move a project's images into the folder implied by its (category, title),
 * returning the project data with remapped URLs + the old R2 keys to delete
 * once the DB write succeeds. Best-effort: on any R2 error it returns the data
 * unchanged so the save still proceeds.
 */
async function relocateProjectImages(
  data: Omit<Project, "id">
): Promise<{ data: Omit<Project, "id">; oldKeys: string[] }> {
  const urls = [data.thumbnail, ...(data.gallery ?? [])].filter(Boolean);
  const { map, oldKeys } = await relocateImagesByCategory({
    urls,
    basePrefix: DEFAULT_BASE_PREFIX,
    newCategoryLabel: data.vi?.categoryLabel || data.en?.categoryLabel,
  });
  if (oldKeys.length === 0) return { data, oldKeys: [] };

  return {
    data: {
      ...data,
      thumbnail: map[data.thumbnail] || data.thumbnail,
      gallery: (data.gallery ?? []).map((u) => map[u] || u),
    },
    oldKeys,
  };
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
      categories: normalizeProjectCategories(d),
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
      categories: normalizeProjectCategories(doc),
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

    // Move images into the folder matching the chosen category/title.
    const { data: relocated, oldKeys } = await relocateProjectImages(newProject);

    // Auto-generate id
    const count = await ProjectModel.countDocuments();
    const projectData = { ...relocated, id: String(count + 1) };

    await ProjectModel.create(projectData);
    await deleteOldKeys(oldKeys);
    await syncProjects();
    revalidateTag("projects", "max"); // bust the cached public loader (@/lib/getProjects)
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

    // Move images into the folder matching the (possibly changed) category/title.
    const { data: relocated, oldKeys } = await relocateProjectImages(updatedProject);

    const result = await ProjectModel.findOneAndUpdate(
      { id },
      relocated,
      { returnDocument: 'after', runValidators: true }
    );

    if (!result) {
      return { success: false, error: "Project not found" };
    }

    await deleteOldKeys(oldKeys);
    await syncProjects();
    revalidateTag("projects", "max"); // bust the cached public loader (@/lib/getProjects)
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

    // Remove the project's entire R2 image folder (no orphaned images left).
    const urls = [result.thumbnail, ...(result.gallery ?? [])].filter(Boolean);
    await deleteFolderByUrls({ urls, basePrefix: DEFAULT_BASE_PREFIX });

    await syncProjects();
    revalidateTag("projects", "max"); // bust the cached public loader (@/lib/getProjects)
    revalidatePath("/admin/projects");
    revalidatePath("/en/projects");
    revalidatePath("/vi/du-an");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete project:", error);
    return { success: false, error: error.message || "Failed to delete project" };
  }
}

/**
 * Reorder projects by reassigning their IDs.
 *
 * Strategy: rename old IDs → temp IDs (prefixed with `__tmp_`) first,
 * then rename temp IDs → final IDs. This avoids unique-constraint
 * collisions when two projects need to swap IDs.
 */
export async function reorderProjects(
  mapping: { oldId: string; newId: string }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    // Phase 1: old → temp (avoid collisions)
    for (const { oldId } of mapping) {
      await ProjectModel.updateOne(
        { id: oldId },
        { $set: { id: `__tmp_${oldId}` } }
      );
    }

    // Phase 2: temp → final
    for (const { oldId, newId } of mapping) {
      await ProjectModel.updateOne(
        { id: `__tmp_${oldId}` },
        { $set: { id: newId } }
      );
    }

    await syncProjects();
    revalidateTag("projects", "max"); // bust the cached public loader (@/lib/getProjects)
    revalidatePath("/admin/projects");
    revalidatePath("/en/projects");
    revalidatePath("/vi/du-an");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to reorder projects:", error);
    return {
      success: false,
      error: error.message || "Failed to reorder projects",
    };
  }
}
