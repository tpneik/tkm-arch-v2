import { notFound } from "next/navigation";
import { getProjectById } from "../../../actions/projects";
import { getProjectCategories } from "../../../actions/categories";
import ProjectForm from "../../components/ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, categories] = await Promise.all([
    getProjectById(id),
    getProjectCategories(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <ProjectForm initialData={project} initialCategories={categories} />
    </div>
  );
}
