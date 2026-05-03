import Link from "next/link";
import ProjectForm from "../components/ProjectForm";
import { getProjectCategories } from "../../actions/categories";
import { ArrowLeft } from "lucide-react";

export default async function CreateProjectPage() {
  const categories = await getProjectCategories();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/projects"
          className="p-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--admin-text)] font-sans">Add New Project</h1>
      </div>

      <ProjectForm initialCategories={categories} />
    </div>
  );
}
