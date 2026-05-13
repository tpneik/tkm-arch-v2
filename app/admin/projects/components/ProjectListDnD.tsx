"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DeleteProjectButton from "./DeleteProjectButton";
import { reorderProjects } from "../../actions/projects";
import type { Project } from "@/data/projects";

interface Props {
  initialProjects: Project[];
}

export default function ProjectListDnD({ initialProjects }: Props) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /* ── Drag state ── */
  const dragIdx = useRef<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  /* ── Handlers ── */
  const onDragStart = useCallback((idx: number) => {
    dragIdx.current = idx;
  }, []);

  const onDragOver = useCallback(
    (e: React.DragEvent, idx: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (overIdx !== idx) setOverIdx(idx);
    },
    [overIdx]
  );

  const onDrop = useCallback(
    (e: React.DragEvent, dropIdx: number) => {
      e.preventDefault();
      setOverIdx(null);
      const fromIdx = dragIdx.current;
      if (fromIdx === null || fromIdx === dropIdx) return;

      setProjects((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(dropIdx, 0, moved);
        return next;
      });
      setHasChanges(true);
      dragIdx.current = null;
    },
    []
  );

  const onDragEnd = useCallback(() => {
    dragIdx.current = null;
    setOverIdx(null);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Build mapping: current project id → new id (1-based position)
      const mapping = projects.map((p, i) => ({
        oldId: p.id,
        newId: String(i + 1),
      }));

      const result = await reorderProjects(mapping);
      if (result.success) {
        // Update local state with new IDs
        setProjects((prev) =>
          prev.map((p, i) => ({ ...p, id: String(i + 1) }))
        );
        setHasChanges(false);
        router.refresh();
      } else {
        alert(`Failed to save order: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while saving the order.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setProjects(initialProjects);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-[var(--admin-text)] font-sans">
          Projects Management
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {hasChanges && (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text-muted)] font-medium rounded hover:border-[var(--admin-text-muted)] transition-colors text-sm"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 text-white font-medium rounded hover:bg-emerald-700 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    Save Order
                  </>
                )}
              </button>
            </>
          )}
          <Link
            href="/admin/projects/create"
            className="px-4 py-2 bg-[var(--admin-primary)] text-[var(--admin-bg)] font-medium rounded hover:opacity-90 transition-opacity whitespace-nowrap text-sm sm:text-base"
          >
            + Add New Project
          </Link>
        </div>
      </div>

      {/* ── Change indicator ── */}
      {hasChanges && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          You have unsaved changes. Drag rows to reorder, then click &quot;Save
          Order&quot;.
        </div>
      )}

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
              <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm w-12 text-center">
                ⠿
              </th>
              <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm w-16 text-center">
                #
              </th>
              <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm">
                Thumbnail
              </th>
              <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm">
                Title (VI)
              </th>
              <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm">
                Category
              </th>
              <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--admin-border)]">
            {projects.map((project, idx) => (
              <tr
                key={project.id}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={(e) => onDragOver(e, idx)}
                onDrop={(e) => onDrop(e, idx)}
                onDragEnd={onDragEnd}
                className={`transition-all cursor-grab active:cursor-grabbing
                  ${
                    overIdx === idx
                      ? "bg-[var(--admin-primary)]/10 border-t-2 border-t-[var(--admin-primary)]"
                      : "hover:bg-[var(--admin-bg)]/50"
                  }`}
              >
                <td className="p-4 text-center text-[var(--admin-text-muted)]">
                  <span className="text-lg select-none opacity-40 hover:opacity-100 transition-opacity">
                    ⠿
                  </span>
                </td>
                <td className="p-4 text-center text-sm font-mono text-[var(--admin-text-muted)]">
                  {idx + 1}
                </td>
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
                  <DeleteProjectButton
                    id={project.id}
                    title={project.vi?.title || "Project"}
                  />
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-[var(--admin-text-muted)]"
                >
                  No projects found. Click &quot;Add New Project&quot; to create
                  one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Card Layout ── */}
      <div className="md:hidden space-y-1">
        {projects.map((project, idx) => (
          <div
            key={project.id}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={(e) => onDragOver(e, idx)}
            onDrop={(e) => onDrop(e, idx)}
            onDragEnd={onDragEnd}
            className={`bg-[var(--admin-card)] border rounded-lg p-3 overflow-hidden transition-all cursor-grab active:cursor-grabbing
              ${
                overIdx === idx
                  ? "border-[var(--admin-primary)] bg-[var(--admin-primary)]/5 scale-[1.02]"
                  : "border-[var(--admin-border)]"
              }`}
          >
            <div className="flex gap-3 items-start min-w-0">
              {/* Drag handle */}
              <div className="flex flex-col items-center justify-center gap-1 pt-1 flex-shrink-0 select-none opacity-40">
                <span className="text-lg text-[var(--admin-text-muted)]">
                  ⠿
                </span>
              </div>
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
                <span className="inline-block px-1.5 py-0.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded text-xs font-mono text-[var(--admin-text-muted)] mb-1">
                  #{idx + 1}
                </span>
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
                <DeleteProjectButton
                  id={project.id}
                  title={project.vi?.title || "Project"}
                />
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
