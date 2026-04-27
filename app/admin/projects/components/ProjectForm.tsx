"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Project, ProjectLang } from "@/data/projects";
import { createProject, updateProject } from "../../actions/projects";
import { Save, Plus, Trash2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

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

interface ProjectFormProps {
  initialData?: Project;
}

export default function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState(initialData?.category || "");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);

  const [enTitle, setEnTitle] = useState(initialData?.en?.title || "");
  const [enSlug, setEnSlug] = useState(initialData?.en?.slug || "");
  const [enCategoryLabel, setEnCategoryLabel] = useState(initialData?.en?.categoryLabel || "");
  const [enCategorySlug, setEnCategorySlug] = useState(initialData?.en?.categorySlug || "");
  const [enDescription, setEnDescription] = useState(initialData?.en?.description || "");
  const [enDetails, setEnDetails] = useState<DetailField[]>(
    recordToDetails(initialData?.en?.details || {})
  );

  const [viTitle, setViTitle] = useState(initialData?.vi?.title || "");
  const [viSlug, setViSlug] = useState(initialData?.vi?.slug || "");
  const [viCategoryLabel, setViCategoryLabel] = useState(initialData?.vi?.categoryLabel || "");
  const [viCategorySlug, setViCategorySlug] = useState(initialData?.vi?.categorySlug || "");
  const [viDescription, setViDescription] = useState(initialData?.vi?.description || "");
  const [viDetails, setViDetails] = useState<DetailField[]>(
    recordToDetails(initialData?.vi?.details || {})
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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

  const InputField = ({ label, value, onChange, required = false }: any) => (
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

  const TextAreaField = ({ label, value, onChange, required = false }: any) => (
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

  const DetailsEditor = ({ title, fields, setFields }: any) => (
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
        <div key={index} className="flex gap-2 mb-3 items-start">
          <input
            type="text"
            placeholder="Key (e.g. SCALE)"
            value={field.key}
            onChange={(e) => {
              const newFields = [...fields];
              newFields[index].key = e.target.value;
              setFields(newFields);
            }}
            className="w-1/3 px-3 py-2 text-sm border border-[var(--admin-border)] rounded focus:ring-1 focus:ring-[var(--admin-accent)] outline-none"
          />
          <textarea
            placeholder="Value (use newlines for lists)"
            value={field.value}
            onChange={(e) => {
              const newFields = [...fields];
              newFields[index].value = e.target.value;
              setFields(newFields);
            }}
            rows={2}
            className="w-2/3 px-3 py-2 text-sm border border-[var(--admin-border)] rounded focus:ring-1 focus:ring-[var(--admin-accent)] outline-none"
          />
          <button
            type="button"
            onClick={() => setFields(fields.filter((_: any, i: number) => i !== index))}
            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors mt-1"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSave} className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="text-[var(--admin-muted)]" />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--admin-content-text)]">
            {initialData ? "Edit Project" : "New Project"}
          </h1>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50"
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
          <div className="bg-[var(--admin-card-bg)] p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)]">
            <h2 className="text-lg font-bold mb-6 pb-2 border-b border-[var(--admin-border)] flex items-center gap-2">
              <span className="text-2xl">🇺🇸</span> English Content
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Title" value={enTitle} onChange={(e: any) => setEnTitle(e.target.value)} required />
              <InputField label="Slug" value={enSlug} onChange={(e: any) => setEnSlug(e.target.value)} required />
              <InputField label="Category Label" value={enCategoryLabel} onChange={(e: any) => setEnCategoryLabel(e.target.value)} required />
              <InputField label="Category Slug" value={enCategorySlug} onChange={(e: any) => setEnCategorySlug(e.target.value)} required />
            </div>
            <TextAreaField label="Description" value={enDescription} onChange={(e: any) => setEnDescription(e.target.value)} required />
            <DetailsEditor title="Project Details (EN)" fields={enDetails} setFields={setEnDetails} />
          </div>

          {/* Vietnamese Tab */}
          <div className="bg-[var(--admin-card-bg)] p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)]">
            <h2 className="text-lg font-bold mb-6 pb-2 border-b border-[var(--admin-border)] flex items-center gap-2">
              <span className="text-2xl">🇻🇳</span> Vietnamese Content
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Title" value={viTitle} onChange={(e: any) => setViTitle(e.target.value)} required />
              <InputField label="Slug" value={viSlug} onChange={(e: any) => setViSlug(e.target.value)} required />
              <InputField label="Category Label" value={viCategoryLabel} onChange={(e: any) => setViCategoryLabel(e.target.value)} required />
              <InputField label="Category Slug" value={viCategorySlug} onChange={(e: any) => setViCategorySlug(e.target.value)} required />
            </div>
            <TextAreaField label="Description" value={viDescription} onChange={(e: any) => setViDescription(e.target.value)} required />
            <DetailsEditor title="Project Details (VI)" fields={viDetails} setFields={setViDetails} />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <div className="bg-[var(--admin-card-bg)] p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)]">
            <h3 className="text-lg font-bold mb-6 pb-2 border-b border-[var(--admin-border)]">System Configuration</h3>
            <InputField label="Base Category" value={category} onChange={(e: any) => setCategory(e.target.value)} required />
          </div>

          <div className="bg-[var(--admin-card-bg)] p-6 rounded-xl shadow-[var(--admin-card-shadow)] border border-[var(--admin-border)]">
            <h3 className="text-lg font-bold mb-6 pb-2 border-b border-[var(--admin-border)]">Media</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[var(--admin-muted)] mb-2 uppercase tracking-wide">
                Thumbnail URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm bg-[var(--admin-content-bg)] border border-[var(--admin-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]"
                />
              </div>
              {thumbnail && (
                <div className="mt-3 aspect-video relative rounded-lg overflow-hidden border border-[var(--admin-border)]">
                  <img src={thumbnail} alt="Thumbnail preview" className="object-cover w-full h-full" />
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-[var(--admin-muted)] uppercase tracking-wide">
                  Gallery URLs
                </label>
                <button
                  type="button"
                  onClick={() => setGallery([...gallery, ""])}
                  className="text-[var(--admin-accent)] hover:text-[var(--admin-accent-hover)]"
                >
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-3">
                {gallery.map((url, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => {
                          const newG = [...gallery];
                          newG[i] = e.target.value;
                          setGallery(newG);
                        }}
                        placeholder="https://..."
                        className="w-full px-3 py-2 text-sm bg-[var(--admin-content-bg)] border border-[var(--admin-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                      />
                    </div>
                    {url && (
                      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-[var(--admin-border)]">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                      className="text-red-500 p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
