import Link from "next/link";
import { getProjects } from "../actions/projects";
import DeleteProjectButton from "./components/DeleteProjectButton";
import Image from "next/image";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[var(--admin-text)] font-sans">Projects Management</h1>
        <Link
          href="/admin/projects/create"
          className="px-4 py-2 bg-[var(--admin-primary)] text-[var(--admin-bg)] font-medium rounded hover:opacity-90 transition-opacity whitespace-nowrap text-sm sm:text-base"
        >
          + Add New Project
        </Link>
      </div>

      {/* ── Desktop Table (hidden on mobile) ── */}
      <div className="hidden md:block bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
                <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm w-16 text-center">ID</th>
                <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm">Thumbnail</th>
                <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm">Title (VI)</th>
                <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm">Category</th>
                <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-[var(--admin-bg)]/50 transition-colors">
                  <td className="p-4 text-center text-sm font-mono text-[var(--admin-text-muted)]">{project.id}</td>
                  <td className="p-4">
                    <div className="relative w-16 h-12 rounded overflow-hidden bg-[var(--admin-bg)]">
                      {project.thumbnail ? (
                        <Image
                          src={project.thumbnail}
                          alt={project.vi?.title || "Thumbnail"}
                          fill
                          className="object-cover"
                          unoptimized
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
                    No projects found. Click &quot;Add New Project&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>

      {/* ── Mobile Card Layout (hidden on desktop) ── */}
      <div className="md:hidden space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg p-3 overflow-hidden"
          >
            <div className="flex gap-3 items-start min-w-0">
              {/* Thumbnail */}
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[var(--admin-bg)] flex-shrink-0">
                {project.thumbnail ? (
                  <Image
                    src={project.thumbnail}
                    alt={project.vi?.title || "Thumbnail"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--admin-text-muted)] text-xs">
                    No Img
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <span className="inline-block px-1.5 py-0.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded text-xs font-mono text-[var(--admin-text-muted)] mb-1">#{project.id}</span>
                <div className="overflow-x-auto pb-1 scrollbar-thin">
                  <div className="font-medium text-[var(--admin-text)] text-sm leading-tight whitespace-nowrap">
                    {project.vi?.title || "No Title"}
                  </div>
                </div>
                <div className="overflow-x-auto pb-0.5 scrollbar-thin">
                  <div className="text-xs text-[var(--admin-text-muted)] mt-0.5 whitespace-nowrap">
                    {project.en?.title || "No Title"}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-block px-2 py-0.5 bg-[var(--admin-primary)]/10 text-[var(--admin-primary)] rounded-full text-xs">
                    {project.category}
                  </span>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--admin-border)]">
              <Link
                href={`/admin/projects/${project.id}/edit`}
                className="flex-1 text-center py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] rounded text-sm transition-colors truncate"
              >
                Edit
              </Link>
              <div className="flex-1 min-w-0">
                <DeleteProjectButton id={project.id} title={project.vi?.title || "Project"} />
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="p-8 text-center text-[var(--admin-text-muted)] bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg">
            No projects found. Click &quot;Add New Project&quot; to create one.
          </div>
        )}
      </div>
    </div>
  );
}
