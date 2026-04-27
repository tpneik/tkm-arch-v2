import Link from "next/link";
import { getProjects } from "../actions/projects";
import DeleteProjectButton from "./components/DeleteProjectButton";
import Image from "next/image";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[var(--admin-text)] font-sans">Projects Management</h1>
        <Link
          href="/admin/projects/create"
          className="px-4 py-2 bg-[var(--admin-primary)] text-[var(--admin-bg)] font-medium rounded hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          + Add New Project
        </Link>
      </div>

      <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
                <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm">Thumbnail</th>
                <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm">Title (VI)</th>
                <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm">Category</th>
                <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm">Location</th>
                <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-[var(--admin-bg)]/50 transition-colors">
                  <td className="p-4">
                    <div className="relative w-16 h-12 rounded overflow-hidden bg-[var(--admin-bg)]">
                      {project.thumbnail ? (
                        <Image
                          src={project.thumbnail}
                          alt={project.vi?.title || "Thumbnail"}
                          fill
                          className="object-cover"
                          unoptimized // In case of external URLs
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)] text-xs">
                          No Img
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-[var(--admin-text)] truncate max-w-[200px]">
                      {project.vi?.title || "No Title"}
                    </div>
                    <div className="text-xs text-[var(--admin-text-muted)] truncate max-w-[200px]">
                      {project.en?.title || "No Title"}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[var(--admin-text)]">
                    <span className="inline-block px-2 py-1 bg-[var(--admin-primary)]/10 text-[var(--admin-primary)] rounded-full text-xs">
                      {project.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[var(--admin-text-muted)]">
                    {(project.vi?.details as Record<string, string>)?.["Địa điểm"] || (project.en?.details as Record<string, string>)?.["Location"] || "N/A"}
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="inline-block px-3 py-1 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] rounded text-sm transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteProjectButton id={project.id} title={project.vi?.title || "Project"} />
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--admin-text-muted)]">
                    No projects found. Click "Add New Project" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
