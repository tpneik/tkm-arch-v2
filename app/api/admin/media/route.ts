import { NextRequest, NextResponse } from "next/server";
import { ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/requireAdmin";
import { r2, R2_BUCKET, R2_PUBLIC_BASE, assertR2Env } from "@/lib/r2";
import { buildFolderPrefix, encodeKeyToPublicUrl } from "@/lib/r2Key";
import categoriesData from "@/data/categories.json";

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
const errMsg = (e: unknown): string => (e instanceof Error ? e.message : String(e));

function labelFromSlug(slug: string): string {
  const all = [
    ...(categoriesData.projectCategories ?? []),
    ...(categoriesData.blogCategories ?? []),
  ];
  return all.find((c) => c.slug === slug)?.vi.label ?? "";
}

/**
 * GET /api/admin/media?categoryLabel=&projectName=&basePrefix=
 * Lists image objects in a project's R2 folder.
 * Returns: { prefix, images: [{ key, url }] }
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    assertR2Env();
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }

  const sp = req.nextUrl.searchParams;
  const basePrefix = sp.get("basePrefix") || undefined;
  const projectName = sp.get("projectName") || "";
  const categoryLabel =
    sp.get("categoryLabel") ||
    (sp.get("categorySlug") ? labelFromSlug(sp.get("categorySlug")!) : "");

  // Prefer an explicit folder prefix (the project's real R2 folder, derived
  // client-side from its existing image URLs). Fall back to building one from
  // category + title (used for brand-new projects with no images yet).
  const explicit = (sp.get("prefix") || "").trim();
  const prefix =
    explicit && explicit.startsWith("TKM/") && !explicit.includes("..")
      ? explicit.replace(/\/+$/g, "") + "/"
      : buildFolderPrefix({ basePrefix, categoryLabel, projectName });
  if (!prefix) {
    // Folder not determinable yet (missing category/title) — return empty.
    return NextResponse.json({ prefix: "", images: [] });
  }

  try {
    const out = await r2.send(
      new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: prefix, MaxKeys: 1000 })
    );
    const images = (out.Contents ?? [])
      .map((o) => o.Key ?? "")
      .filter((k) => k && IMAGE_EXT.test(k))
      .map((key) => ({ key, url: encodeKeyToPublicUrl(key, R2_PUBLIC_BASE) }));

    return NextResponse.json({ prefix, images });
  } catch (err) {
    console.error("Failed to list R2 folder:", err);
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/media  body: { key }
 * Permanently removes an image object from the R2 bucket.
 * Guarded so only keys under our managed prefix (TKM/) can be deleted.
 */
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    assertR2Env();
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }

  let key = "";
  try {
    const body = await req.json();
    key = typeof body?.key === "string" ? body.key.trim() : "";
  } catch {
    return NextResponse.json({ error: "Body không hợp lệ." }, { status: 400 });
  }

  // Safety: only allow deleting objects inside the managed prefix.
  if (!key || !key.startsWith("TKM/")) {
    return NextResponse.json(
      { error: "Key không hợp lệ hoặc nằm ngoài phạm vi cho phép." },
      { status: 400 }
    );
  }

  try {
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return NextResponse.json({ success: true, key });
  } catch (err) {
    console.error("Failed to delete R2 object:", err);
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }
}
