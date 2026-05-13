import { getProjects } from "../actions/projects";
import ProjectListDnD from "./components/ProjectListDnD";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return <ProjectListDnD initialProjects={projects} />;
}
