"use client";

import { useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

/* ── dnd-kit ── */
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

import DeleteProjectButton from "./DeleteProjectButton";
import { reorderProjects } from "../../actions/projects";
import type { Project } from "@/data/projects";

/* ── Types ── */
interface Props {
  initialProjects: Project[];
}

/* ═══════════════════════════════════════════
   Drag Handle Icon — shared SVG
   ═══════════════════════════════════════════ */
function DragHandleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="4" cy="2" r="1.5" />
      <circle cx="10" cy="2" r="1.5" />
      <circle cx="4" cy="7" r="1.5" />
      <circle cx="10" cy="7" r="1.5" />
      <circle cx="4" cy="12" r="1.5" />
      <circle cx="10" cy="12" r="1.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Project Card — shared rendering logic
   Used by both SortableProjectRow and DragOverlay
   ═══════════════════════════════════════════ */
function ProjectCard({
  project,
  index,
  handleListeners,
  handleAttributes,
  showActions = true,
  isOverlay = false,
}: {
  project: Project;
  index: number;
  handleListeners?: SyntheticListenerMap;
  handleAttributes?: DraggableAttributes;
  showActions?: boolean;
  isOverlay?: boolean;
}) {
  return (
    <div className={`dnd-item${isOverlay ? " dnd-item--overlay" : ""}`}>
      {/* Drag handle — only this triggers drag */}
      <div
        className={`dnd-handle${isOverlay ? " dnd-handle--active" : ""}`}
        title="Drag to reorder"
        {...handleListeners}
        {...handleAttributes}
      >
        <DragHandleIcon />
      </div>

      {/* Index badge */}
      <div className="dnd-index">{index + 1}</div>

      {/* Thumbnail */}
      <div className="dnd-thumb">
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt={project.vi?.title || "Thumbnail"}
            fill
            className="object-cover dnd-thumb-img"
            sizes="64px"
            quality={60}
            loading="lazy"
            onLoad={(e) => {
              const img = e.currentTarget;
              img.style.opacity = "1";
            }}
          />
        ) : (
          <span className="dnd-thumb-empty">—</span>
        )}
      </div>

      {/* Info */}
      <div className="dnd-info">
        <div className="dnd-title">{project.vi?.title || "No Title"}</div>
        <div className="dnd-subtitle">{project.en?.title || "No Title"}</div>
      </div>

      {/* Category */}
      <div className="dnd-category">
        <span className="dnd-badge">{project.category}</span>
      </div>

      {/* Actions — hidden in overlay to avoid interaction during drag */}
      {showActions && (
        <div className="dnd-actions">
          <Link
            href={`/admin/projects/${project.id}/edit`}
            className="dnd-btn dnd-btn-edit"
          >
            Edit
          </Link>
          <DeleteProjectButton
            id={project.id}
            title={project.vi?.title || "Project"}
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SortableProjectRow — memoized for perf
   Only re-renders when its own transform/transition
   changes, not when other items move.
   ═══════════════════════════════════════════ */
const SortableProjectRow = memo(function SortableProjectRow({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
    zIndex: isDragging ? 50 : ("auto" as const),
    borderStyle: isDragging ? "dashed" : ("solid" as const),
    borderColor: isDragging ? "rgba(59, 130, 246, 0.3)" : undefined,
    background: isDragging ? "rgba(59, 130, 246, 0.03)" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ProjectCard
        project={project}
        index={index}
        handleListeners={listeners}
        handleAttributes={attributes}
      />
    </div>
  );
});

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */
export default function ProjectListDnD({ initialProjects }: Props) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  /* ── Sensors ──
     PointerSensor: distance: 5 prevents accidental drag on click
     KeyboardSensor: arrow key support for accessibility */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /* ── Drag event handlers ── */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) return;

      setProjects((prev) => {
        const oldIndex = prev.findIndex((p) => p.id === String(active.id));
        const newIndex = prev.findIndex((p) => p.id === String(over.id));
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
      setHasChanges(true);
    },
    []
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  /* ── Save / Reset ── */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const mapping = projects.map((p, i) => ({
        oldId: p.id,
        newId: String(i + 1),
      }));
      const result = await reorderProjects(mapping);
      if (result.success) {
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

  /* ── Active item for DragOverlay ── */
  const activeProject = activeId
    ? projects.find((p) => p.id === activeId)
    : null;
  const activeIndex = activeId
    ? projects.findIndex((p) => p.id === activeId)
    : -1;

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--admin-text)",
          }}
        >
          Projects Management
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {hasChanges && (
            <>
              <button onClick={handleReset} className="dnd-btn dnd-btn-ghost">
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="dnd-btn dnd-btn-save"
              >
                {isSaving ? (
                  <>
                    <span className="dnd-spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                    Save Order
                  </>
                )}
              </button>
            </>
          )}
          <Link href="/admin/projects/create" className="dnd-btn dnd-btn-primary">
            + Add New Project
          </Link>
        </div>
      </div>

      {/* ── Change indicator ── */}
      {hasChanges && (
        <div className="dnd-change-banner">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          You have unsaved changes. Drag rows to reorder, then click &quot;Save Order&quot;.
        </div>
      )}

      {/* ── Sortable DnD List ── */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={projects.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="dnd-container">
            {projects.map((project, idx) => (
              <SortableProjectRow
                key={project.id}
                project={project}
                index={idx}
              />
            ))}

            {projects.length === 0 && (
              <div className="dnd-empty">
                No projects found. Click &quot;Add New Project&quot; to create one.
              </div>
            )}
          </div>
        </SortableContext>

        {/* ── DragOverlay: floating ghost that follows pointer ──
            Rendered in a portal, completely outside the list flow.
            This is what makes dnd-kit buttery smooth — the list items
            animate via CSS transforms while this overlay follows the pointer. */}
        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: "cubic-bezier(0.2, 0, 0, 1)",
          }}
        >
          {activeProject ? (
            <ProjectCard
              project={activeProject}
              index={activeIndex}
              showActions={false}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
