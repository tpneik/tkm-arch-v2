import { NextRequest, NextResponse } from "next/server";
import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAdmin } from "@/lib/requireAdmin";
import { r2, R2_BUCKET, R2_PUBLIC_BASE, assertR2Env } from "@/lib/r2";
import { buildObjectKey, encodeKeyToPublicUrl } from "@/lib/r2Key";
import categoriesData from "@/data/categories.json";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

interface UploadBody {
  basePrefix?: string;
  categoryLabel?: string;
  categorySlug?: string;
  projectName?: string;
  filename?: string;
  contentType?: string;
}

const errMsg = (e: unknown): string => (e instanceof Error ? e.message : String(e));

/** Resolve a category's Vietnamese label from its slug (fallback path). */
function labelFromSlug(slug: string): string {
  const all = [
    ...(categoriesData.projectCategories ?? []),
    ...(categoriesData.blogCategories ?? []),
  ];
  return all.find((c) => c.slug === slug)?.vi.label ?? "";
}

/** Does an object already exist at this key? */
async function keyExists(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch {
    // 404 NotFound (or any error) → treat as "does not exist"; don't block upload.
    return false;
  }
}

/**
 * POST /api/admin/upload
 * Body: { basePrefix?, categoryLabel?, categorySlug?, projectName, filename, contentType }
 * Returns:
 *   - { alreadyExists: true,  publicUrl, key }            → object already on R2, reuse it
 *   - { alreadyExists: false, uploadUrl, publicUrl, key } → client should PUT to uploadUrl
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    assertR2Env();
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 500 });
  }

  let body: UploadBody;
  try {
    body = (await req.json()) as UploadBody;
  } catch {
    return NextResponse.json({ error: "Body không hợp lệ." }, { status: 400 });
  }

  const { basePrefix, projectName, filename, contentType } = body ?? {};
  const categoryLabel: string =
    body?.categoryLabel || (body?.categorySlug ? labelFromSlug(body.categorySlug) : "");

  if (!contentType || !ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: "Chỉ chấp nhận ảnh (JPEG, PNG, WebP, AVIF, GIF)." },
      { status: 400 }
    );
  }
  if (!projectName || !filename) {
    return NextResponse.json(
      { error: "Chọn danh mục và nhập tiêu đề trước khi tải ảnh." },
      { status: 400 }
    );
  }

  let key: string;
  try {
    key = buildObjectKey({ basePrefix, categoryLabel, projectName, filename });
  } catch (err) {
    return NextResponse.json({ error: errMsg(err) }, { status: 400 });
  }

  const publicUrl = encodeKeyToPublicUrl(key, R2_PUBLIC_BASE);

  // Dedup: if an object already exists at this key, reuse it instead of
  // re-uploading. Client skips the PUT and just keeps the public URL.
  if (await keyExists(key)) {
    return NextResponse.json({ alreadyExists: true, publicUrl, key });
  }

  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
    return NextResponse.json({ alreadyExists: false, uploadUrl, publicUrl, key });
  } catch (err) {
    console.error("Failed to presign R2 upload:", err);
    return NextResponse.json(
      { error: errMsg(err) || "Không tạo được link tải lên." },
      { status: 500 }
    );
  }
}
