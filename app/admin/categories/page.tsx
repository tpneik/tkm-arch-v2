"use client";

import { useState, useEffect, useCallback } from "react";
import type { Category } from "@/data/categories";
import {
  getProjectCategories,
  createProjectCategory,
  updateProjectCategory,
  deleteProjectCategory,
  getBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from "../actions/categories";

/* ──────────────────── Modal Component ──────────────────── */

function CategoryModal({
  isOpen,
  onClose,
  onSave,
  initial,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Category, "id">) => Promise<void>;
  initial?: Category | null;
  title: string;
}) {
  const [slug, setSlug] = useState("");
  const [enLabel, setEnLabel] = useState("");
  const [viLabel, setViLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initial) {
      setSlug(initial.slug);
      setEnLabel(initial.en.label);
      setViLabel(initial.vi.label);
    } else {
      setSlug("");
      setEnLabel("");
      setViLabel("");
    }
    setError("");
  }, [initial, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim() || !enLabel.trim() || !viLabel.trim()) {
      setError("All fields are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ slug: slug.trim(), en: { label: enLabel.trim() }, vi: { label: viLabel.trim() } });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-semibold text-[var(--admin-text)] mb-4">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. nha-pho"
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text)] text-sm focus:outline-none focus:border-[var(--admin-primary)] transition-colors"
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1">English Label</label>
            <input
              type="text"
              value={enLabel}
              onChange={(e) => setEnLabel(e.target.value)}
              placeholder="e.g. Townhouse"
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text)] text-sm focus:outline-none focus:border-[var(--admin-primary)] transition-colors"
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--admin-text-muted)] mb-1">Vietnamese Label</label>
            <input
              type="text"
              value={viLabel}
              onChange={(e) => setViLabel(e.target.value)}
              placeholder="e.g. Nhà phố"
              className="w-full px-3 py-2 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text)] text-sm focus:outline-none focus:border-[var(--admin-primary)] transition-colors"
              disabled={saving}
            />
          </div>
          {error && <p className="text-sm text-[var(--admin-danger)]">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-bg)] transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-[var(--admin-primary)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : initial ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ──────────────────── Category Table ──────────────────── */

function CategoryTable({
  title,
  categories,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string;
  categories: Category[];
  onAdd: () => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h2>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-[var(--admin-primary)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          + Add Category
        </button>
      </div>
      <div className="bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
              <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm w-12">ID</th>
              <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm">Slug</th>
              <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm">English</th>
              <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm">Tiếng Việt</th>
              <th className="p-4 font-semibold text-[var(--admin-text-muted)] text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--admin-border)]">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-[var(--admin-bg)]/50 transition-colors">
                <td className="p-4 text-sm text-[var(--admin-text-muted)]">{cat.id}</td>
                <td className="p-4">
                  <span className="inline-block px-2 py-1 bg-[var(--admin-primary)]/10 text-[var(--admin-primary)] rounded-full text-xs font-mono">
                    {cat.slug}
                  </span>
                </td>
                <td className="p-4 text-sm text-[var(--admin-text)]">{cat.en.label}</td>
                <td className="p-4 text-sm text-[var(--admin-text)]">{cat.vi.label}</td>
                <td className="p-4 text-right space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => onEdit(cat)}
                    className="inline-block px-3 py-1 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-text)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] rounded text-sm transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(cat)}
                    className="inline-block px-3 py-1 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 hover:border-[var(--admin-danger)] rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--admin-text-muted)]">
                  No categories found. Click &quot;+ Add Category&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────────────── Main Page ──────────────────── */

export default function CategoriesPage() {
  const [projectCats, setProjectCats] = useState<Category[]>([]);
  const [blogCats, setBlogCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"project" | "blog">("project");
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [pCats, bCats] = await Promise.all([
      getProjectCategories(),
      getBlogCategories(),
    ]);
    setProjectCats(pCats);
    setBlogCats(bCats);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAddModal = (type: "project" | "blog") => {
    setModalType(type);
    setEditingCat(null);
    setModalOpen(true);
  };

  const openEditModal = (type: "project" | "blog", cat: Category) => {
    setModalType(type);
    setEditingCat(cat);
    setModalOpen(true);
  };

  const handleSave = async (data: Omit<Category, "id">) => {
    let result;
    if (editingCat) {
      result =
        modalType === "project"
          ? await updateProjectCategory(editingCat.id, data)
          : await updateBlogCategory(editingCat.id, data);
    } else {
      result =
        modalType === "project"
          ? await createProjectCategory(data)
          : await createBlogCategory(data);
    }

    if (!result.success) {
      throw new Error(result.error || "Operation failed");
    }

    await loadData();
  };

  const handleDelete = async (type: "project" | "blog", cat: Category) => {
    const confirmed = window.confirm(
      `Delete category "${cat.en.label}" (${cat.slug})? This cannot be undone.`
    );
    if (!confirmed) return;

    const result =
      type === "project"
        ? await deleteProjectCategory(cat.id)
        : await deleteBlogCategory(cat.id);

    if (!result.success) {
      alert(result.error || "Failed to delete category");
      return;
    }

    await loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[var(--admin-text-muted)]">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-[var(--admin-text)]">
        Categories Management
      </h1>

      {/* Project Categories */}
      <CategoryTable
        title="🏗️ Project Categories"
        categories={projectCats}
        onAdd={() => openAddModal("project")}
        onEdit={(cat) => openEditModal("project", cat)}
        onDelete={(cat) => handleDelete("project", cat)}
      />

      {/* Blog Categories */}
      <CategoryTable
        title="📝 Blog Categories"
        categories={blogCats}
        onAdd={() => openAddModal("blog")}
        onEdit={(cat) => openEditModal("blog", cat)}
        onDelete={(cat) => handleDelete("blog", cat)}
      />

      {/* Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editingCat}
        title={
          editingCat
            ? `Edit ${modalType === "project" ? "Project" : "Blog"} Category`
            : `Add ${modalType === "project" ? "Project" : "Blog"} Category`
        }
      />
    </div>
  );
}
