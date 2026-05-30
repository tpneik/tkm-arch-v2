import { getProjects } from "@/lib/getProjects";
import ProjectsClient from "./ProjectsClient";

// Server entry: loads projects from the cached MongoDB loader and hands them
// to the interactive client UI. Data is cached + tagged "projects", so this is
// static-fast and refreshes on admin save (revalidateTag) without a rebuild.
export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsClient projects={projects} />;
}
