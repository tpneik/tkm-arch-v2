"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, RefreshCw, Star, Trash2 } from "lucide-react";
import { buildFolderPrefix } from "@/lib/r2Key";
import ImageUploader from "./ImageUploader";

interface MediaManagerProps {
  basePrefix?: string;
  categoryLabel: string;
  projectName: string;
  thumbnail: string;
  gallery: string[];
  onChangeThumbnail: (url: string) => void;
  onChangeGallery: (urls: string[]) => void;
  disabled?: boolean;
}

interface FolderImage {
  key: string;
  url: string;
}

const PUBLIC_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "").replace(/\/+$/g, "");

/**
 * Derive the R2 object key from a public URL, if the URL points at our bucket.
 * Returns undefined for truly external links (e.g. Unsplash) so they can't be
 * deleted from R2.
 */
function keyFromUrl(url: string): string | undefined {
  if (!PUBLIC_BASE || !url.startsWith(PUBLIC_BASE + "/")) return undefined;
  const path = url.slice(PUBLIC_BASE.length + 1);
  try {
    return path.split("/").map(decodeURIComponent).join("/");
  } catch {
    return undefined;
  }
}

export default function MediaManager({
  basePrefix,
  categoryLabel,
  projectName,
  thumbnail,
  gallery,
  onChangeThumbnail,
  onChangeGallery,
  disabled = false,
}: MediaManagerProps) {
  const [folderImages, setFolderImages] = useState<FolderImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  // Images already selected when the form mounted (edit mode). Kept visible so
  // un-ticking only deselects — it does NOT remove the image from the grid.
  // Only an explicit delete removes them.
  const [persistedUrls, setPersistedUrls] = useState<string[]>(() =>
    Array.from(new Set([...gallery, thumbnail].filter(Boolean)))
  );

  const prefix = buildFolderPrefix({ basePrefix, categoryLabel, projectName });

  const fetchFolder = useCallback(async () => {
    if (!prefix) {
      setFolderImages([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ categoryLabel, projectName });
      if (basePrefix) params.set("basePrefix", basePrefix);
      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không tải được danh sách ảnh.");
      setFolderImages(data.images ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không tải được danh sách ảnh.");
    } finally {
      setLoading(false);
    }
  }, [prefix, basePrefix, categoryLabel, projectName]);

  // Debounce fetch so typing the title doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(fetchFolder, 500);
    return () => clearTimeout(t);
  }, [fetchFolder]);

  // Merge folder images with persisted selections that aren't in the folder
  // listing (e.g. legacy links or images stored under a different folder), so
  // they stay visible even after the user un-ticks them.
  const folderUrls = new Set(folderImages.map((i) => i.url));
  const extras = persistedUrls.filter((u) => u && !folderUrls.has(u));
  const allImages: { url: string; inFolder: boolean; key?: string }[] = [
    ...folderImages.map((i) => ({ url: i.url, inFolder: true, key: i.key })),
    ...extras.map((url) => ({ url, inFolder: false, key: keyFromUrl(url) })),
  ];

  const toggleGallery = (url: string) => {
    if (gallery.includes(url)) {
      onChangeGallery(gallery.filter((u) => u !== url));
      // Un-ticking the cover image clears the cover (a note then shows below).
      if (thumbnail === url) onChangeThumbnail("");
    } else {
      onChangeGallery([...gallery, url]);
    }
  };

  const setThumb = (url: string) => {
    onChangeThumbnail(thumbnail === url ? "" : url);
  };

  const handleUploaded = (urls: string[]) => {
    // Optimistically show + auto-select uploaded images, then reconcile.
    setFolderImages((prev) => {
      const have = new Set(prev.map((i) => i.url));
      const added = urls.filter((u) => !have.has(u)).map((u) => ({ key: u, url: u }));
      return [...prev, ...added];
    });
    const merged = [...gallery];
    for (const u of urls) if (!merged.includes(u)) merged.push(u);
    onChangeGallery(merged);
    if (!thumbnail && urls[0]) onChangeThumbnail(urls[0]);
    fetchFolder();
  };

  const handleDelete = async (url: string, key?: string) => {
    if (!key) return; // external/legacy images aren't stored under our key
    if (!confirm("Xóa hẳn ảnh này khỏi kho lưu trữ? Hành động không thể hoàn tác.")) return;

    setDeletingUrl(url);
    setError(null);
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xóa ảnh thất bại.");

      // Remove from grid (folder + persisted) + drop any selection/cover ref.
      setFolderImages((prev) => prev.filter((i) => i.url !== url));
      setPersistedUrls((prev) => prev.filter((u) => u !== url));
      if (gallery.includes(url)) onChangeGallery(gallery.filter((u) => u !== url));
      if (thumbnail === url) onChangeThumbnail("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xóa ảnh thất bại.");
    } finally {
      setDeletingUrl(null);
    }
  };

  return (
    <div>
      <ImageUploader
        basePrefix={basePrefix}
        categoryLabel={categoryLabel}
        projectName={projectName}
        multiple
        disabled={disabled}
        onUploaded={handleUploaded}
      />

      {/* Header: count + refresh */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--admin-muted)]">
          Đã chọn {gallery.length} ảnh (cần tối thiểu 2)
          {thumbnail ? " · đã đặt ảnh bìa" : ""}
        </span>
        <button
          type="button"
          onClick={fetchFolder}
          disabled={disabled || loading || !prefix}
          className="flex items-center gap-1 text-xs text-[var(--admin-accent)] hover:text-[var(--admin-accent-hover)] disabled:opacity-40"
          title="Tải lại danh sách ảnh trong thư mục"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Làm mới
        </button>
      </div>

      {/* Constraint notes */}
      {!thumbnail && (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded p-2">
          <AlertCircle size={14} /> Chưa có ảnh bìa — bấm ngôi sao trên một ảnh để đặt làm ảnh bìa.
        </div>
      )}
      {gallery.length < 2 && (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded p-2">
          <AlertCircle size={14} /> Cần chọn ít nhất 2 ảnh cho dự án.
        </div>
      )}

      {error && (
        <div className="mb-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2">
          {error}
        </div>
      )}

      {/* Grid */}
      {loading && allImages.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-[var(--admin-muted)] text-sm">
          <Loader2 size={18} className="animate-spin mr-2" /> Đang tải ảnh...
        </div>
      ) : allImages.length === 0 ? (
        <div className="py-10 text-center text-sm text-[var(--admin-muted)] border border-dashed border-[var(--admin-border)] rounded-lg">
          {disabled
            ? "Chọn danh mục và nhập tiêu đề để xem/tải ảnh."
            : "Chưa có ảnh nào. Tải ảnh lên để bắt đầu."}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {allImages.map(({ url, key }) => {
            const order = gallery.indexOf(url); // -1 if not selected
            const selected = order >= 0;
            const isThumb = thumbnail === url;
            const isDeleting = deletingUrl === url;
            return (
              <div
                key={url}
                className={[
                  "relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer group transition-all",
                  selected
                    ? "border-[var(--admin-accent)]"
                    : "border-[var(--admin-border)] hover:border-[var(--admin-muted)]",
                ].join(" ")}
                onClick={() => !isDeleting && toggleGallery(url)}
                title={selected ? "Bỏ chọn khỏi project" : "Chọn vào project"}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" loading="lazy" className="w-full h-full object-cover" />

                {/* Selection order number */}
                {selected && (
                  <div className="absolute top-1 left-1 bg-[var(--admin-accent)] text-white rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-bold shadow">
                    {order + 1}
                  </div>
                )}

                {/* Set-as-thumbnail star */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThumb(url);
                  }}
                  className={[
                    "absolute top-1 right-1 rounded-full p-1 shadow transition-colors",
                    isThumb
                      ? "bg-yellow-400 text-white"
                      : "bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70",
                  ].join(" ")}
                  title={isThumb ? "Đang là ảnh bìa (bấm để bỏ)" : "Đặt làm ảnh bìa"}
                >
                  <Star size={12} fill={isThumb ? "currentColor" : "none"} />
                </button>

                {/* Delete (R2) — for any image stored under our bucket key */}
                {key && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(url, key);
                    }}
                    disabled={isDeleting}
                    className="absolute bottom-1 right-1 rounded-full p-1 shadow bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-colors disabled:opacity-100"
                    title="Xóa ảnh khỏi kho lưu trữ"
                  >
                    {isDeleting ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                  </button>
                )}

                {/* Cover badge */}
                {isThumb && (
                  <span className="absolute bottom-1 left-1 text-[10px] bg-yellow-400 text-white px-1.5 py-0.5 rounded">
                    Bìa
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
