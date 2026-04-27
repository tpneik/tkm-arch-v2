"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { Project } from "@/data/projects";

const PROJECTS_FILE_PATH = path.join(process.cwd(), "data", "projects.json");

export async function getProjects(): Promise<Project[]> {
  try {
    const fileContents = await fs.readFile(PROJECTS_FILE_PATH, "utf8");
    return JSON.parse(fileContents) as Project[];
  } catch (error) {
    console.error("Failed to read projects data:", error);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const projects = await getProjects();
    return projects.find(p => p.id === id) || null;
  } catch (error) {
    console.error("Failed to get project by ID:", error);
    return null;
  }
}

export async function createProject(newProject: Omit<Project, "id">): Promise<{ success: boolean; error?: string }> {
  try {
    const projects = await getProjects();
    
    // Generate new ID (simple numeric increment)
    const maxId = projects.reduce((max, p) => {
      const idNum = parseInt(p.id, 10);
      return !isNaN(idNum) && idNum > max ? idNum : max;
    }, 0);
    
    const projectWithId: Project = {
      ...newProject,
      id: (maxId + 1).toString(),
    };

    projects.push(projectWithId);

    await fs.writeFile(PROJECTS_FILE_PATH, JSON.stringify(projects, null, 2), "utf8");
    revalidatePath("/admin/projects");
    revalidatePath("/en/projects");
    revalidatePath("/vi/du-an");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create project:", error);
    return { success: false, error: error.message || "Failed to create project" };
  }
}

export async function updateProject(id: string, updatedProject: Omit<Project, "id">): Promise<{ success: boolean; error?: string }> {
  try {
    const projects = await getProjects();
    const index = projects.findIndex((p) => p.id === id);

    if (index === -1) {
      return { success: false, error: "Project not found" };
    }

    projects[index] = { ...updatedProject, id };

    await fs.writeFile(PROJECTS_FILE_PATH, JSON.stringify(projects, null, 2), "utf8");
    revalidatePath("/admin/projects");
    revalidatePath("/en/projects");
    revalidatePath("/vi/du-an");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update project:", error);
    return { success: false, error: error.message || "Failed to update project" };
  }
}

export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const projects = await getProjects();
    const filteredProjects = projects.filter((p) => p.id !== id);

    if (projects.length === filteredProjects.length) {
      return { success: false, error: "Project not found" };
    }

    await fs.writeFile(PROJECTS_FILE_PATH, JSON.stringify(filteredProjects, null, 2), "utf8");
    revalidatePath("/admin/projects");
    revalidatePath("/en/projects");
    revalidatePath("/vi/du-an");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete project:", error);
    return { success: false, error: error.message || "Failed to delete project" };
  }
}
