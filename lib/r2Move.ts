/**
 * Relocate a project's images on R2 when its folder changes (server-only).
 *
 * The bucket layout is TKM/CONGTRINH/<CATEGORY>/<PROJECT>/<file>. When an admin
 * edits a project's category (or title) the computed folder prefix changes, so
 * the already-uploaded images must move to the new folder.
 *
 * R2/S3 has no native "move": we COPY each object to the new key, then the
 * caller DELETEs the originals only after the DB update succeeds (so a failure
 * never leaves the project pointing at deleted files).
 */
import "server-only";
import { CopyObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET, R2_PUBLIC_BASE } from "./r2";
import { encodeKeyToPublicUrl } from "./r2Key";

const PUBLIC_BASE = R2_PUBLIC_BASE.replace(/\/+$/g, "");

/** Decode the R2 object key from a public URL, or undefined if external. */
function keyFromUrl(url: string): string | undefined {
  if (!PUBLIC_BASE || !url.startsWith(PUBLIC_BASE + "/")) return undefined;
  const path = url.slice(PUBLIC_BASE.length + 1);
  try {
    return path.split("/").map(decodeURIComponent).join("/");
  } catch {
    return undefined;
  }
}

/** Per-segment encode a key for use as an S3 CopySource (`bucket/key`). */
function encodeCopySource(bucket: string, key: string): string {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${bucket}/${encodedKey}`;
}

export interface RelocateResult {
  /** old public URL → new public URL (only for images that actually moved) */
  map: Record<string, string>;
  /** old keys to delete AFTER the DB update succeeds */
  oldKeys: string[];
}

/**
 * Copy any of `urls` that live under our bucket but outside `newPrefix` into
 * `newPrefix` (keeping the filename). Returns a URL remap + the old keys to
 * delete later. Copies are best-effort per item — a single failure is logged
 * and skipped, never throwing, so a save is never blocked by one bad object.
 */
export async function relocateImagesToFolder(
  urls: string[],
  newPrefix: string
): Promise<RelocateResult> {
  const map: Record<string, string> = {};
  const oldKeys: string[] = [];
  if (!newPrefix || !R2_BUCKET || !PUBLIC_BASE) return { map, oldKeys };

  const seen = new Set<string>();
  for (const url of urls) {
    if (!url || seen.has(url)) continue;
    seen.add(url);

    const key = keyFromUrl(url);
    if (!key) continue; // external link (e.g. Unsplash) — leave untouched
    if (key.startsWith(newPrefix)) continue; // already in the right folder

    const filename = key.slice(key.lastIndexOf("/") + 1);
    const newKey = newPrefix + filename;
    if (newKey === key) continue;

    try {
      await r2.send(
        new CopyObjectCommand({
          Bucket: R2_BUCKET,
          CopySource: encodeCopySource(R2_BUCKET, key),
          Key: newKey,
        })
      );
      map[url] = encodeKeyToPublicUrl(newKey, R2_PUBLIC_BASE);
      oldKeys.push(key);
    } catch (err) {
      console.warn(`[r2Move] failed to copy ${key} → ${newKey}:`, err);
    }
  }

  return { map, oldKeys };
}
