/**
 * Relocate a project's/blog's images on R2 when its CATEGORY changes (server-only).
 *
 * Bucket layout: <basePrefix>/<CATEGORY>/<PROJECT>/<...files>. Folders were often
 * named by hand, so we never rename the <PROJECT> segment — we only swap the
 * <CATEGORY> segment when the admin picks a different category, and we move the
 * ENTIRE folder (every object under it) so no sibling image is left orphaned.
 *
 * R2/S3 has no native "move": we COPY each object to the new key; the caller
 * DELETEs the originals only after the DB update succeeds.
 */
import "server-only";
import { CopyObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET, R2_PUBLIC_BASE } from "./r2";
import { encodeKeyToPublicUrl, toFolderName } from "./r2Key";

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

/** First `depth` segments of a key as a folder prefix (basePrefix+category+project). */
function folderAtDepth(key: string, depth: number): string {
  const segs = key.split("/");
  if (segs.length <= depth) {
    const dir = segs.slice(0, -1);
    return dir.length ? dir.join("/") + "/" : "";
  }
  return segs.slice(0, depth).join("/") + "/";
}

export interface RelocateResult {
  /** old public URL → new public URL (for images that moved) */
  map: Record<string, string>;
  /** old keys to delete AFTER the DB update succeeds */
  oldKeys: string[];
}

/**
 * If `urls` live under a project folder whose CATEGORY segment differs from
 * `newCategoryLabel`, move the whole folder into the new category (keeping the
 * project-folder name) and return a URL remap + the old keys to delete.
 *
 * No-op (empty result) when: no bucket images, category unchanged, or any error.
 */
export async function relocateImagesByCategory(opts: {
  urls: string[];
  basePrefix: string;
  newCategoryLabel?: string;
}): Promise<RelocateResult> {
  const empty: RelocateResult = { map: {}, oldKeys: [] };
  try {
    const base = (opts.basePrefix || "").replace(/^\/+|\/+$/g, "");
    const newCat = toFolderName(opts.newCategoryLabel || "");
    if (!base || !newCat || !R2_BUCKET || !PUBLIC_BASE) return empty;

    const baseSegs = base.split("/").length;
    const categoryIdx = baseSegs; // 0-based index of the <CATEGORY> segment
    const depth = baseSegs + 2; // base + category + project

    // Find the project folder from the first bucket image.
    let realFolder = "";
    for (const u of opts.urls) {
      const k = keyFromUrl(u);
      if (k && k.startsWith(base + "/")) {
        realFolder = folderAtDepth(k, depth);
        break;
      }
    }
    if (!realFolder) return empty;

    const segs = realFolder.replace(/\/+$/g, "").split("/");
    if (segs.length <= categoryIdx || segs[categoryIdx] === newCat) return empty; // unchanged

    const newSegs = [...segs];
    newSegs[categoryIdx] = newCat;
    const newFolder = newSegs.join("/") + "/";
    if (newFolder === realFolder) return empty;

    // List EVERY object under the project folder and copy it into the new folder.
    const out = await r2.send(
      new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: realFolder, MaxKeys: 1000 })
    );
    const oldKeys: string[] = [];
    for (const obj of out.Contents ?? []) {
      const key = obj.Key;
      if (!key || !key.startsWith(realFolder)) continue;
      const newKey = newFolder + key.slice(realFolder.length);
      try {
        await r2.send(
          new CopyObjectCommand({
            Bucket: R2_BUCKET,
            CopySource: encodeCopySource(R2_BUCKET, key),
            Key: newKey,
          })
        );
        oldKeys.push(key);
      } catch (err) {
        console.warn(`[r2Move] failed to copy ${key} → ${newKey}:`, err);
      }
    }
    if (oldKeys.length === 0) return empty;

    // Remap the referenced URLs (thumbnail/gallery) to their new keys.
    const map: Record<string, string> = {};
    for (const u of opts.urls) {
      const k = keyFromUrl(u);
      if (k && k.startsWith(realFolder)) {
        map[u] = encodeKeyToPublicUrl(newFolder + k.slice(realFolder.length), R2_PUBLIC_BASE);
      }
    }
    return { map, oldKeys };
  } catch (err) {
    console.warn("[relocateImagesByCategory] skipped:", err);
    return empty;
  }
}
