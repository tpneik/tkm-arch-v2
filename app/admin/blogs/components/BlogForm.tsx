"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Blog } from "@/data/blogs";
import { Category } from "@/data/categories";
import { createBlog, updateBlog } from "../../actions/blogs";
import { createBlogCategory } from "../../actions/categories";
import { Save, Plus, ArrowLeft, X, Check } from "lucide-react";
import Link from "next/link";

// Auto-generate slug from title
const generateSlug = (title: string): string => {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

interface BlogFormProps {
  initialData?: Blog;
  initialCategories?: Category[];
}

export default function BlogForm({ initialData, initialCategories = [] }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Category state ──
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [category, setCategory] = useState(() => {
    const raw = initialData?.category || "";
    if (initialCategories.find((c) => c.slug === raw)) return raw;
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
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split("T")[0]);

  // EN fields
  const [enTitle, setEnTitle] = useState(initialData?.en?.title || "");
  const [enExcerpt, setEnExcerpt] = useState(initialData?.en?.excerpt || "");
  const [enContent, setEnContent] = useState(initialData?.en?.content || "");

  // VI fields
  const [viTitle, setViTitle] = useState(initialData?.vi?.title || "");
  const [viExcerpt, setViExcerpt] = useState(initialData?.vi?.excerpt || "");
  const [viContent, setViContent] = useState(initialData?.vi?.content || "");

  // Slugs derived from titles
  const enSlug = generateSlug(enTitle);
  const viSlug = generateSlug(viTitle);

  // Category labels & slugs derived from selected category
  const selectedCat = categories.find((c) => c.slug === category);
  const enCategoryLabel = selectedCat?.en.label ?? "";
  const viCategoryLabel = selectedCat?.vi.label ?? "";
  const enCategorySlug = generateSlug(enCategoryLabel);
  const viCategorySlug = generateSlug(viCategoryLabel);

  // ── Dirty tracking ──
  const isDirty = (() => {
    if (!initialData) return true;
    const initCatSlug = (() => {
      const raw = initialData.category || "";
      if (categories.find((c) => c.slug === raw)) return raw;
      const m = categories.find((c) => c.vi.label === raw || c.en.label === raw);
      return m?.slug || "";
    })();
    if (category !== initCatSlug) return true;
    if (thumbnail !== (initialData.thumbnail || "")) return true;
    if (date !== (initialData.date || "")) return true;
    if (enTitle !== (initialData.en?.title || "")) return true;
    if (enExcerpt !== (initialData.en?.excerpt || "")) return true;
    if (enContent !== (initialData.en?.content || "")) return true;
    if (viTitle !== (initialData.vi?.title || "")) return true;
    if (viExcerpt !== (initialData.vi?.excerpt || "")) return true;
    if (viContent !== (initialData.vi?.content || "")) return true;
    return false;
  })();

  const handleCategorySelect = (slug: string) => {
    setCategory(slug);
  };

  const handleAddCategory = async () => {
    if (!newCatEN.trim() || !newCatVI.trim()) {
      setAddCatError("Cần nhập cả tiếng Anh và tiếng Việt.");
      return;
    }
    setAddingCat(true);
    setAddCatError(null);
    const slug = generateSlug(newCatEN);
    const res = await createBlogCategory({
      slug,
      en: { label: newCatEN.trim() },
      vi: { label: newCatVI.trim() },
    });
    if (!res.success) {
      setAddCatError(res.error || "Thêm thất bại.");
      setAddingCat(false);
      return;
    }
    const newCat: Category = {
      id: Date.now().toString(),
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
    setLoading(true);
    setError(null);

    const blogData: Omit<Blog, "id"> = {
      category,
      thumbnail,
      date,
      en: {
        title: enTitle,
        slug: enSlug,
        categoryLabel: enCategoryLabel,
        categorySlug: enCategorySlug,
        excerpt: enExcerpt,
        content: enContent,
      },
      vi: {
        title: viTitle,
        slug: viSlug,
        categoryLabel: viCategoryLabel,
        categorySlug: viCategorySlug,
        excerpt: viExcerpt,
        content: viContent,
      },
    };

    try {
      if (initialData?.id) {
        const res = await updateBlog(initialData.id, blogData);
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await createBlog(blogData);
        if (!res.success) throw new Error(res.error);
      }
      router.push("/admin/blogs");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  const InputField = ({ label, value, onChange, required = false, type = "text" }: any) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-[var(--admin-muted)] mb-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 bg-[var(--admin-content-bg)] border border-[var(--admin-border)] rounded-md text-[var(--admin-content-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] transition-all"
      />
    </div>
  );

  const TextAreaField = ({ label, value, onChange, required = false, rows = 4 }: any) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-[var(--admin-muted)] mb-1 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        className="w-full px-4 py-2 bg-[var(--admin-content-bg)] border border-[var(--admin-border)] rounded-md text-[var(--admin-content-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)] transition-all"
      />
    </div>
  );

  return (
    <form onSubmit={handleSave} className="max-w-5xl mx-auto pb-20 px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/admin/blogs" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="text-[var(--admin-muted)]" size={20} />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--admin-content-text)]">
            {initialData ? "Edit Blog" : "New Blog"}
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
          {loading ? "Saving..." : "Save Blog"}
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
          {/* English Content */}
          <div className="bg-[var(--admin-card-bg)] p-4 sm:p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)]">
            <h2 className="text-lg font-bold mb-6 pb-2 border-b border-[var(--admin-border)] flex items-center gap-2">
              <span className="text-2xl">🇺🇸</span> English Content
            </h2>
            <InputField label="Title" value={enTitle} onChange={(e: any) => setEnTitle(e.target.value)} required />
            <TextAreaField label="Excerpt" value={enExcerpt} onChange={(e: any) => setEnExcerpt(e.target.value)} required rows={3} />
            <TextAreaField label="Content (Markdown)" value={enContent} onChange={(e: any) => setEnContent(e.target.value)} required rows={12} />
          </div>

          {/* Vietnamese Content */}
          <div className="bg-[var(--admin-card-bg)] p-4 sm:p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)]">
            <h2 className="text-lg font-bold mb-6 pb-2 border-b border-[var(--admin-border)] flex items-center gap-2">
              <span className="text-2xl">🇻🇳</span> Vietnamese Content
            </h2>
            <InputField label="Title" value={viTitle} onChange={(e: any) => setViTitle(e.target.value)} required />
            <TextAreaField label="Excerpt" value={viExcerpt} onChange={(e: any) => setViExcerpt(e.target.value)} required rows={3} />
            <TextAreaField label="Content (Markdown)" value={viContent} onChange={(e: any) => setViContent(e.target.value)} required rows={12} />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Category */}
          <div className="bg-[var(--admin-card-bg)] p-4 sm:p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)] overflow-hidden">
            <h3 className="text-lg font-bold mb-4 pb-2 border-b border-[var(--admin-border)]">Category</h3>

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

            {category && (
              <div className="text-xs text-[var(--admin-muted)] mb-3 font-mono space-y-1">
                <div>🇺🇸 EN slug: <span className="text-[var(--admin-accent)]">{enCategorySlug}</span></div>
                <div>🇻🇳 VI slug: <span className="text-[var(--admin-accent)]">{viCategorySlug}</span></div>
              </div>
            )}

            {showAddCategory && (
              <div className="mt-3 p-4 border border-dashed border-[var(--admin-accent)] rounded-lg space-y-3">
                <p className="text-xs font-semibold uppercase text-[var(--admin-muted)] mb-2">Thêm danh mục mới</p>
                <div>
                  <label className="block text-xs text-[var(--admin-muted)] mb-1">🇺🇸 English label</label>
                  <input
                    type="text"
                    value={newCatEN}
                    onChange={(e) => setNewCatEN(e.target.value)}
                    placeholder="e.g. Technology"
                    className="w-full px-3 py-1.5 text-sm border border-[var(--admin-border)] bg-[var(--admin-content-bg)] text-[var(--admin-content-text)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--admin-muted)] mb-1">🇻🇳 Vietnamese label</label>
                  <input
                    type="text"
                    value={newCatVI}
                    onChange={(e) => setNewCatVI(e.target.value)}
                    placeholder="ví dụ: Công nghệ"
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

          {/* Date */}
          <div className="bg-[var(--admin-card-bg)] p-4 sm:p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)]">
            <h3 className="text-lg font-bold mb-4 pb-2 border-b border-[var(--admin-border)]">Date</h3>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[var(--admin-content-bg)] border border-[var(--admin-border)] rounded-md text-[var(--admin-content-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
            />
          </div>

          {/* Thumbnail */}
          <div className="bg-[var(--admin-card-bg)] p-4 sm:p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)]">
            <h3 className="text-lg font-bold mb-4 pb-2 border-b border-[var(--admin-border)]">Thumbnail</h3>
            <input
              type="text"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm bg-[var(--admin-content-bg)] border border-[var(--admin-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
            />
            {thumbnail && (
              <div className="mt-3 aspect-video relative rounded-lg overflow-hidden border border-[var(--admin-border)]">
                <img src={thumbnail} alt="Thumbnail preview" className="object-cover w-full h-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
