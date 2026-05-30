/**
 * Pure helpers for building Cloudflare R2 object keys + public URLs.
 *
 * The bucket follows a human-readable structure that we must preserve exactly:
 *   <basePrefix>/<CATEGORY FOLDER>/<PROJECT NAME>/<filename>
 *   e.g. TKM/CONGTRINH/VAN PHONG/HH3 BA SON/6 (1).jpg
 *
 * Category / project folders are the Vietnamese label UPPERCASED, de-accented,
 * with spaces preserved. Filenames keep spaces and parentheses (matching the
 * existing bucket) and are only stripped of characters that are unsafe in keys.
 *
 * No AWS SDK imports here — kept pure so it can be unit-tested and reused.
 */

/** Default prefix for project images. Blogs pass "TKM/BLOG". */
export const DEFAULT_BASE_PREFIX = "TKM/CONGTRINH";

/**
 * Convert a (Vietnamese) label into the folder-name convention used by the
 * bucket: de-accented, UPPERCASE, alphanumerics + single spaces only.
 *   "Văn phòng"       → "VAN PHONG"
 *   "Công trình khác" → "CONG TRINH KHAC"
 */
export function toFolderName(label: string): string {
  return (label || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // strip combining diacritics after NFD decomposition
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ") // anything not alnum → space
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Sanitize an uploaded filename while preserving the bucket convention
 * (spaces and parentheses are allowed). Strips characters that are unsafe in
 * object keys / would break URL round-tripping, lowercases the extension,
 * and caps the base length.
 */
export function sanitizeFilename(name: string): string {
  const raw = (name || "").trim();
  const dot = raw.lastIndexOf(".");
  let base = dot > 0 ? raw.slice(0, dot) : raw;
  let ext = dot > 0 ? raw.slice(dot + 1).toLowerCase() : "";

  // Strip only unsafe chars (path separators, URL-significant, control chars);
  // keep spaces, parentheses, dashes, etc. to match the existing bucket naming.
  const clean = (s: string) =>
    s
      .replace(/\p{Cc}/gu, " ") // control chars
      .replace(/[\\/?#%&]+/g, " ") // path-sep & URL-significant chars
      .replace(/\s+/g, " ")
      .replace(/^[.\s]+|[.\s]+$/g, "")
      .trim();

  base = clean(base).slice(0, 120) || "image";
  ext = ext.replace(/[^a-z0-9]/g, "");

  return ext ? `${base}.${ext}` : base;
}

/**
 * Build the R2 object key (raw, with literal spaces — NOT URL-encoded).
 * Throws if the category or project folder resolves to empty so callers can
 * surface a 400.
 */
export function buildObjectKey(opts: {
  basePrefix?: string;
  categoryLabel: string;
  projectName: string;
  filename: string;
}): string {
  const basePrefix = (opts.basePrefix || DEFAULT_BASE_PREFIX).replace(/^\/+|\/+$/g, "");
  const folder = toFolderName(opts.categoryLabel);
  const project = toFolderName(opts.projectName);
  const file = sanitizeFilename(opts.filename);

  if (!folder) throw new Error("Thiếu danh mục (category) để tạo đường dẫn ảnh.");
  if (!project) throw new Error("Thiếu tiêu đề để tạo đường dẫn ảnh.");

  return `${basePrefix}/${folder}/${project}/${file}`;
}

/**
 * Build the folder prefix (no filename) for a project's images:
 *   <basePrefix>/<CATEGORY FOLDER>/<PROJECT NAME>/
 * Returns "" if category or project is empty (folder not determinable yet).
 */
export function buildFolderPrefix(opts: {
  basePrefix?: string;
  categoryLabel: string;
  projectName: string;
}): string {
  const basePrefix = (opts.basePrefix || DEFAULT_BASE_PREFIX).replace(/^\/+|\/+$/g, "");
  const folder = toFolderName(opts.categoryLabel);
  const project = toFolderName(opts.projectName);
  if (!folder || !project) return "";
  return `${basePrefix}/${folder}/${project}/`;
}

/**
 * Turn a raw key into a public URL by percent-encoding EACH path segment.
 * Per-segment encodeURIComponent yields the "%20"/"%28"/"%29" form that
 * matches the existing stored URLs (encodeURI alone would not encode parens).
 */
export function encodeKeyToPublicUrl(key: string, base: string): string {
  const encoded = key
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${base.replace(/\/+$/g, "")}/${encoded}`;
}
