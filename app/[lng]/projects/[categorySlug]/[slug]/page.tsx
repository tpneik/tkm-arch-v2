import { getProjects } from "@/lib/getProjects";
import ProjectDetailClient from "./ProjectDetailClient";

// Server entry: loads projects from the cached MongoDB loader. The client
// component resolves the current project (and prev/next/related) from this list
// using the URL params. Cached + tagged "projects" → fast and auto-fresh.
export default async function ProjectDetailPage() {
  const projects = await getProjects();
  return <ProjectDetailClient projects={projects} />;
}
