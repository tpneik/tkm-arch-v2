import { notFound } from "next/navigation";
import { getProjectById } from "../../../actions/projects";
import ProjectForm from "../../components/ProjectForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/projects"
          className="p-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--admin-text)] font-sans">
          Edit Project: {project.vi?.title || project.en?.title || "Untitled"}
        </h1>
      </div>

      <ProjectForm initialData={project} />
    </div>
  );
}
