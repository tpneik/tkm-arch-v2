"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/data/projects";
import { Category } from "@/data/categories";
import { createProject, updateProject } from "../../actions/projects";
import { createProjectCategory } from "../../actions/categories";
import { Save, Plus, Trash2, ArrowLeft, X, Check } from "lucide-react";
import Link from "next/link";
import MediaManager from "@/app/admin/components/MediaManager";

interface DetailField {
  key: string;
  value: string;
}

// Helper to convert Record to DetailField array
const recordToDetails = (record: Record<string, string | string[]>): DetailField[] => {
  if (!record) return [];
  return Object.entries(record).map(([key, val]) => ({
    key,
    value: Array.isArray(val) ? val.join("\n") : val,
  }));
};

// Helper to convert DetailField array back to Record
const detailsToRecord = (fields: DetailField[]): Record<string, string | string[]> => {
  const record: Record<string, string | string[]> = {};
  fields.forEach(({ key, value }) => {
    if (!key.trim()) return;
    const lines = value.split("\n").map(v => v.trim()).filter(v => v);
    record[key.trim()] = lines.length > 1 ? lines : (lines[0] || "");
  });
  return record;
};

// Auto-generate slug from title
const generateSlug = (title: string): string => {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics (Vietnamese)
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric (except space/dash)
    .replace(/[\s_]+/g, "-")       // spaces & underscores → dash
    .replace(/-+/g, "-")           // collapse multiple dashes
    .replace(/^-|-$/g, "");        // trim leading/trailing dashes
};

interface ProjectFormProps {
  initialData?: Project;
  initialCategories?: Category[];
}

/* ── Form field components (module scope — must NOT be defined inside the
   form component, or every render remounts the inputs and steals focus). ── */

interface FieldProps {
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  required?: boolean;
}

function InputField({ label, value, onChange, required = false }: FieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-[var(--admin-muted)] mb-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 bg-[var(--admin-content-bg)] border border-[var(--admin-border)] rounded-md text-[var(--admin-content-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] transition-all"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, required = false }: FieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-[var(--admin-muted)] mb-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        required={required}
        rows={4}
        className="w-full px-4 py-2 bg-[var(--admin-content-bg)] border border-[var(--admin-border)] rounded-md text-[var(--admin-content-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] transition-all"
      />
    </div>
  );
}

interface DetailsEditorProps {
  title: string;
  fields: DetailField[];
  setFields: (fields: DetailField[]) => void;
}

function DetailsEditor({ title, fields, setFields }: DetailsEditorProps) {
  return (
    <div className="mb-6 p-4 border border-[var(--admin-border)] rounded-lg bg-[var(--admin-content-bg)]">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-sm uppercase text-[var(--admin-muted)]">{title}</h4>
        <button
          type="button"
          onClick={() => setFields([...fields, { key: "", value: "" }])}
          className="flex items-center gap-1 text-sm text-[var(--admin-accent)] hover:text-[var(--admin-accent-hover)] font-medium"
        >
          <Plus size={16} /> Add Field
        </button>
      </div>
      {fields.map((field: DetailField, index: number) => (
        <div key={index} className="flex flex-col sm:flex-row gap-2 mb-3 items-start">
          <input
            type="text"
            placeholder="Key (e.g. SCALE)"
            value={field.key}
            onChange={(e) => {
              const newFields = [...fields];
              newFields[index] = { ...newFields[index], key: e.target.value };
              setFields(newFields);
            }}
            className="w-full sm:w-1/3 px-3 py-2 text-sm border border-[var(--admin-border)] rounded focus:ring-1 focus:ring-[var(--admin-accent)] outline-none"
          />
          <textarea
            placeholder="Value (use newlines for lists)"
            value={field.value}
            onChange={(e) => {
              const newFields = [...fields];
              newFields[index] = { ...newFields[index], value: e.target.value };
              setFields(newFields);
            }}
            rows={2}
            className="w-full sm:w-2/3 px-3 py-2 text-sm border border-[var(--admin-border)] rounded focus:ring-1 focus:ring-[var(--admin-accent)] outline-none"
          />
          <button
            type="button"
            onClick={() => setFields(fields.filter((_, i) => i !== index))}
            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors mt-1"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function ProjectForm({ initialData, initialCategories = [] }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Category state ──
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  // initialData.category may be a Vietnamese label (legacy) or a slug — resolve to slug
  const [category, setCategory] = useState(() => {
    const raw = initialData?.category || "";
    // If it already matches a slug, use it directly
    if (initialCategories.find((c) => c.slug === raw)) return raw;
    // Otherwise try to match by label (legacy data stores the Vietnamese label)
    const match = initialCategories.find(
      (c) => c.vi.label === raw || c.en.label === raw
    );
    return match?.slug || (initialCategories[0]?.slug ?? "");
  });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatEN, setNewCatEN] = useState("");
  const [newCatVI, setNewCatVI] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [addCatError, setAddCatError] = useState<string | null>(null);

  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);

  const [enTitle, setEnTitle] = useState(initialData?.en?.title || "");
  const [enDescription, setEnDescription] = useState(initialData?.en?.description || "");
  const [enDetails, setEnDetails] = useState<DetailField[]>(
    recordToDetails(initialData?.en?.details || {})
  );

  const [viTitle, setViTitle] = useState(initialData?.vi?.title || "");
  const [viDescription, setViDescription] = useState(initialData?.vi?.description || "");
  const [viDetails, setViDetails] = useState<DetailField[]>(
    recordToDetails(initialData?.vi?.details || {})
  );

  // Slugs derived from titles
  const enSlug = generateSlug(enTitle);
  const viSlug = generateSlug(viTitle);

  // Category labels & slugs derived from selected category — NOT manual input
  const selectedCat = categories.find((c) => c.slug === category);
  const enCategoryLabel = selectedCat?.en.label ?? "";
  const viCategoryLabel = selectedCat?.vi.label ?? "";
  const enCategorySlug = generateSlug(enCategoryLabel);
  const viCategorySlug = generateSlug(viCategoryLabel);

  // For R2 upload folders: prefer VI, fall back to EN so the uploader unlocks
  // as soon as a category + either title is filled.
  const uploadCategory = viCategoryLabel || enCategoryLabel;
  const uploadTitle = viTitle || enTitle;
  const uploadDisabled = !uploadCategory || !uploadTitle;

  // ── Dirty tracking: only enable Save when something changed ──
  const isDirty = (() => {
    if (!initialData) return true; // create mode — always saveable
    // Compare slug-to-slug (initialData.category may be a label)
    const initCatSlug = (() => {
      const raw = initialData.category || "";
      if (categories.find((c) => c.slug === raw)) return raw;
      const m = categories.find((c) => c.vi.label === raw || c.en.label === raw);
      return m?.slug || "";
    })();
    if (category !== initCatSlug) return true;
    if (thumbnail !== (initialData.thumbnail || "")) return true;
    if (enTitle !== (initialData.en?.title || "")) return true;
    if (enDescription !== (initialData.en?.description || "")) return true;
    if (viTitle !== (initialData.vi?.title || "")) return true;
    if (viDescription !== (initialData.vi?.description || "")) return true;
    if (gallery.join("|") !== (initialData.gallery || []).join("|")) return true;
    const initEnDetails = JSON.stringify(recordToDetails(initialData.en?.details || {}));
    const initViDetails = JSON.stringify(recordToDetails(initialData.vi?.details || {}));
    if (JSON.stringify(enDetails) !== initEnDetails) return true;
    if (JSON.stringify(viDetails) !== initViDetails) return true;
    return false;
  })();

  // ── When a category is selected from dropdown ──
  const handleCategorySelect = (slug: string) => {
    setCategory(slug);
  };

  // ── Add new category inline ──
  const handleAddCategory = async () => {
    if (!newCatEN.trim() || !newCatVI.trim()) {
      setAddCatError("Cần nhập cả tiếng Anh và tiếng Việt.");
      return;
    }
    setAddingCat(true);
    setAddCatError(null);
    const slug = generateSlug(newCatEN);
    const res = await createProjectCategory({ slug, en: { label: newCatEN.trim() }, vi: { label: newCatVI.trim() } });
    if (!res.success) {
      setAddCatError(res.error || "Thêm thất bại.");
      setAddingCat(false);
      return;
    }
    const newCat: Category = {
      id: Date.now().toString(), // temporary; real ID assigned by server
      slug,
      en: { label: newCatEN.trim() },
      vi: { label: newCatVI.trim() },
    };
    setCategories((prev) => [...prev, newCat]);
    handleCategorySelect(slug);
    setNewCatEN("");
    setNewCatVI("");
    setShowAddCategory(false);
    setAddingCat(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Media constraints: at least 2 images selected + a cover image.
    const selectedImages = gallery.filter((url) => url.trim() !== "");
    if (selectedImages.length < 2) {
      setError("Cần chọn ít nhất 2 ảnh cho dự án.");
      return;
    }
    if (!thumbnail.trim()) {
      setError("Cần chọn 1 ảnh bìa (bấm ngôi sao trên ảnh).");
      return;
    }

    setLoading(true);

    const projectData: Omit<Project, "id"> = {
      category,
      thumbnail,
      gallery: gallery.filter(url => url.trim() !== ""),
      en: {
        title: enTitle,
        slug: enSlug,
        categoryLabel: enCategoryLabel,
        categorySlug: enCategorySlug,
        description: enDescription,
        details: detailsToRecord(enDetails),
      },
      vi: {
        title: viTitle,
        slug: viSlug,
        categoryLabel: viCategoryLabel,
        categorySlug: viCategorySlug,
        description: viDescription,
        details: detailsToRecord(viDetails),
      },
    };

    try {
      if (initialData?.id) {
        const res = await updateProject(initialData.id, projectData);
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createProject(projectData);
        if (!res.success) throw new Error(res.error);
      }
      router.push("/admin/projects");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  // InputField / TextAreaField / DetailsEditor are defined at MODULE scope
  // (below the component). Defining them inside the component recreated the
  // component type on every render, remounting the <input> and dropping focus
  // after one keystroke.

  return (
    <form onSubmit={handleSave} className="max-w-5xl mx-auto pb-20 px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/admin/projects" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="text-[var(--admin-muted)]" size={20} />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--admin-content-text)]">
            {initialData ? "Edit Project" : "New Project"}
          </h1>
        </div>
        <button
          type="submit"
          disabled={loading || !isDirty}
          className={[
            "flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm text-sm sm:text-base",
            isDirty && !loading
              ? "bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)] text-white cursor-pointer"
              : "bg-[var(--admin-accent)] text-white opacity-30 cursor-not-allowed pointer-events-none",
          ].join(" ")}
        >
          <Save size={18} />
          {loading ? "Saving..." : "Save Project"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* English Tab */}
          <div className="bg-[var(--admin-card-bg)] p-4 sm:p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)]">
            <h2 className="text-lg font-bold mb-6 pb-2 border-b border-[var(--admin-border)] flex items-center gap-2">
              <span className="text-2xl">🇺🇸</span> English Content
            </h2>
            <InputField label="Title" value={enTitle} onChange={(e: any) => setEnTitle(e.target.value)} required />
            <TextAreaField label="Description" value={enDescription} onChange={(e: any) => setEnDescription(e.target.value)} required />
            <DetailsEditor title="Project Details (EN)" fields={enDetails} setFields={setEnDetails} />
          </div>

          {/* Vietnamese Tab */}
          <div className="bg-[var(--admin-card-bg)] p-4 sm:p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)]">
            <h2 className="text-lg font-bold mb-6 pb-2 border-b border-[var(--admin-border)] flex items-center gap-2">
              <span className="text-2xl">🇻🇳</span> Vietnamese Content
            </h2>
            <InputField label="Title" value={viTitle} onChange={(e: any) => setViTitle(e.target.value)} required />
            <TextAreaField label="Description" value={viDescription} onChange={(e: any) => setViDescription(e.target.value)} required />
            <DetailsEditor title="Project Details (VI)" fields={viDetails} setFields={setViDetails} />
          </div>

          {/* Media */}
          <div className="bg-[var(--admin-card-bg)] p-4 sm:p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)]">
            <h2 className="text-lg font-bold mb-6 pb-2 border-b border-[var(--admin-border)] flex items-center gap-2">
              <span className="text-2xl">🖼️</span> Media
            </h2>

            {/* Current cover preview */}
            {thumbnail && (
              <div className="mb-4">
                <p className="text-xs text-[var(--admin-muted)] mb-1 uppercase tracking-wide">Ảnh bìa</p>
                <div className="aspect-video relative rounded-lg overflow-hidden border border-[var(--admin-border)] max-w-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbnail} alt="Cover" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <MediaManager
              categoryLabel={uploadCategory}
              projectName={uploadTitle}
              thumbnail={thumbnail}
              gallery={gallery}
              onChangeThumbnail={setThumbnail}
              onChangeGallery={setGallery}
              disabled={uploadDisabled}
            />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <div className="bg-[var(--admin-card-bg)] p-4 sm:p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)] overflow-hidden">
            <h3 className="text-lg font-bold mb-4 pb-2 border-b border-[var(--admin-border)]">Category</h3>

            {/* Category dropdown + add button */}
            <div className="flex gap-2 items-center mb-3">
              <select
                value={category}
                onChange={(e) => handleCategorySelect(e.target.value)}
                required
                className="flex-1 min-w-0 pl-3 pr-8 py-2 bg-[var(--admin-content-bg)] border border-[var(--admin-border)] rounded-md text-[var(--admin-content-text)] text-sm truncate focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.vi.label} / {cat.en.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => { setShowAddCategory((v) => !v); setAddCatError(null); }}
                className="p-2 rounded-md bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)] text-white transition-colors flex-shrink-0"
                title="Thêm danh mục mới"
              >
                {showAddCategory ? <X size={16} /> : <Plus size={16} />}
              </button>
            </div>

            {/* Selected category preview */}
            {category && (
              <div className="text-xs text-[var(--admin-muted)] mb-3 font-mono space-y-1">
                <div>🇺🇸 EN slug: <span className="text-[var(--admin-accent)]">{enCategorySlug}</span></div>
                <div>🇻🇳 VI slug: <span className="text-[var(--admin-accent)]">{viCategorySlug}</span></div>
              </div>
            )}

            {/* Inline add-category mini-form */}
            {showAddCategory && (
              <div className="mt-3 p-4 border border-dashed border-[var(--admin-accent)] rounded-lg space-y-3">
                <p className="text-xs font-semibold uppercase text-[var(--admin-muted)] mb-2">Thêm danh mục mới</p>
                <div>
                  <label className="block text-xs text-[var(--admin-muted)] mb-1">🇺🇸 English label</label>
                  <input
                    type="text"
                    value={newCatEN}
                    onChange={(e) => setNewCatEN(e.target.value)}
                    placeholder="e.g. Townhouse"
                    className="w-full px-3 py-1.5 text-sm border border-[var(--admin-border)] bg-[var(--admin-content-bg)] text-[var(--admin-content-text)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--admin-muted)] mb-1">🇻🇳 Vietnamese label</label>
                  <input
                    type="text"
                    value={newCatVI}
                    onChange={(e) => setNewCatVI(e.target.value)}
                    placeholder="ví dụ: Nhà phố"
                    className="w-full px-3 py-1.5 text-sm border border-[var(--admin-border)] bg-[var(--admin-content-bg)] text-[var(--admin-content-text)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                  />
                </div>
                {newCatEN && (
                  <p className="text-xs text-[var(--admin-muted)] font-mono">slug: {generateSlug(newCatEN)}</p>
                )}
                {addCatError && <p className="text-xs text-red-500">{addCatError}</p>}
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={addingCat}
                  className="w-full flex items-center justify-center gap-2 py-1.5 bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)] text-white text-sm rounded transition-colors disabled:opacity-50"
                >
                  <Check size={14} />
                  {addingCat ? "Đang lưu..." : "Lưu danh mục"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
