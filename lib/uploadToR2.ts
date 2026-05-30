/**
 * Client-side helper: upload a single File directly to Cloudflare R2 via a
 * presigned PUT URL minted by /api/admin/upload.
 *
 * Flow:
 *   1. POST file metadata → get { uploadUrl, publicUrl }.
 *   2. PUT the raw file bytes straight to R2 (never through our server).
 *
 * IMPORTANT: the PUT must send exactly the same Content-Type that the server
 * signed, and NO other headers, or R2 returns SignatureDoesNotMatch.
 */

export interface UploadOpts {
  basePrefix?: string; // e.g. "TKM/BLOG"; defaults server-side to TKM/CONGTRINH
  categoryLabel: string;
  projectName: string;
}

/** Allowed image MIME types (kept in sync with the server allowlist). */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

/** Best-effort content type when the browser doesn't provide one. */
function resolveContentType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

export async function uploadFileToR2(file: File, opts: UploadOpts): Promise<string> {
  const contentType = resolveContentType(file);

  // 1. Ask our server for a presigned PUT URL.
  const presignRes = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      basePrefix: opts.basePrefix,
      categoryLabel: opts.categoryLabel,
      projectName: opts.projectName,
      filename: file.name,
      contentType,
    }),
  });

  if (!presignRes.ok) {
    const { error } = await presignRes.json().catch(() => ({ error: "" }));
    throw new Error(error || `Không lấy được link tải lên (HTTP ${presignRes.status}).`);
  }

  const { uploadUrl, publicUrl, alreadyExists } = (await presignRes.json()) as {
    uploadUrl?: string;
    publicUrl: string;
    alreadyExists: boolean;
  };

  // Dedup: the object already exists on R2 — reuse its URL, skip the upload.
  if (alreadyExists || !uploadUrl) return publicUrl;

  // 2. Upload the file bytes directly to R2. Content-Type MUST match what was
  //    signed; do not add any other headers.
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });

  if (!putRes.ok) {
    throw new Error(`Tải ảnh lên R2 thất bại (HTTP ${putRes.status}).`);
  }

  return publicUrl;
}
