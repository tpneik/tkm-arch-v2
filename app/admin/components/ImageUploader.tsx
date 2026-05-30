"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { uploadFileToR2, ALLOWED_IMAGE_TYPES } from "@/lib/uploadToR2";

interface ImageUploaderProps {
  /** R2 key prefix — defaults server-side to TKM/CONGTRINH; blogs pass TKM/BLOG. */
  basePrefix?: string;
  /** Vietnamese category label (used to build the bucket folder). */
  categoryLabel: string;
  /** Project/blog title (used to build the bucket folder). */
  projectName: string;
  /** Explicit target folder (project's real R2 folder); overrides category/title. */
  folderPrefix?: string;
  /** Allow selecting multiple files (gallery). */
  multiple?: boolean;
  /** Called with the public URL(s) of successfully uploaded image(s). */
  onUploaded: (urls: string[]) => void;
  /** Disable the uploader (e.g. category/title not yet filled). */
  disabled?: boolean;
}

const MAX_SIZE_MB = 10;

export default function ImageUploader({
  basePrefix,
  categoryLabel,
  projectName,
  folderPrefix,
  multiple = false,
  onUploaded,
  disabled = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList);
    const errors: string[] = [];

    // Validate first; only upload the files that pass.
    const valid: File[] = [];
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: không phải ảnh hợp lệ.`);
      } else if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        errors.push(`${file.name}: vượt quá ${MAX_SIZE_MB}MB.`);
      } else {
        valid.push(file);
      }
    }

    setUploading(true);
    let done = 0;
    setProgress({ done: 0, total: valid.length });

    // Upload all valid files in parallel ("nhiều tấm một lúc"). The browser
    // caps concurrent connections per host, so this self-throttles.
    const results = await Promise.all(
      valid.map(async (file) => {
        try {
          const url = await uploadFileToR2(file, { basePrefix, categoryLabel, projectName, folderPrefix });
          return { url };
        } catch (err) {
          const msg = err instanceof Error ? err.message : "tải lên thất bại.";
          return { error: `${file.name}: ${msg}` };
        } finally {
          done += 1;
          setProgress({ done, total: valid.length });
        }
      })
    );

    const uploaded = results.flatMap((r) => (r.url ? [r.url] : []));
    results.forEach((r) => r.error && errors.push(r.error));

    setUploading(false);
    setProgress(null);
    if (uploaded.length) onUploaded(uploaded);
    if (errors.length) setError(errors.join(" "));
    if (inputRef.current) inputRef.current.value = ""; // allow re-selecting same file
  };

  const openPicker = () => {
    if (!disabled && !uploading) inputRef.current?.click();
  };

  return (
    <div className="mb-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        type="button"
        onClick={openPicker}
        onDragOver={(e) => {
          if (disabled || uploading) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled && !uploading) handleFiles(e.dataTransfer.files);
        }}
        disabled={disabled || uploading}
        className={[
          "w-full flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-lg border border-dashed transition-colors text-sm",
          disabled
            ? "border-[var(--admin-border)] text-[var(--admin-muted)] opacity-50 cursor-not-allowed"
            : dragOver
              ? "border-[var(--admin-accent)] bg-[var(--admin-content-bg)] text-[var(--admin-accent)] cursor-pointer"
              : "border-[var(--admin-border)] text-[var(--admin-muted)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)] cursor-pointer",
        ].join(" ")}
      >
        {uploading ? (
          <>
            <Loader2 size={22} className="animate-spin" />
            <span>
              Đang tải lên{progress ? ` ${progress.done}/${progress.total}` : ""}...
            </span>
          </>
        ) : (
          <>
            {multiple ? <Upload size={22} /> : <ImagePlus size={22} />}
            <span>
              {disabled
                ? "Chọn danh mục và nhập tiêu đề trước khi tải ảnh"
                : multiple
                  ? "Tải ảnh lên (chọn nhiều ảnh hoặc kéo-thả)"
                  : "Tải ảnh lên (nhấn để chọn hoặc kéo-thả)"}
            </span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
}
