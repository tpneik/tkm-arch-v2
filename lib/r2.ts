/**
 * Cloudflare R2 S3-compatible client (server-only).
 *
 * R2 exposes an S3 API at https://<account-id>.r2.cloudflarestorage.com.
 * Credentials are R2 API tokens (access key id + secret). These env vars must
 * NEVER be exposed to the browser — only short-lived presigned URLs are.
 *
 * Import-safe: missing env does not throw at import time. Use `assertR2Env()`
 * inside route handlers to fail with a clear message.
 */
import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

export const R2_BUCKET = process.env.R2_BUCKET ?? "";
export const R2_PUBLIC_BASE = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "";

const accountId = process.env.R2_ACCOUNT_ID ?? "";

/**
 * Throws a clear error if any required R2 env var is missing.
 * Call this at the top of any route that touches R2.
 */
export function assertR2Env(): void {
  const missing = [
    ["R2_ACCOUNT_ID", accountId],
    ["R2_ACCESS_KEY_ID", process.env.R2_ACCESS_KEY_ID],
    ["R2_SECRET_ACCESS_KEY", process.env.R2_SECRET_ACCESS_KEY],
    ["R2_BUCKET", R2_BUCKET],
    ["NEXT_PUBLIC_R2_PUBLIC_BASE_URL", R2_PUBLIC_BASE],
  ]
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    throw new Error(`Thiếu biến môi trường R2: ${missing.join(", ")}`);
  }
}

// Singleton client (reused across hot reloads in dev, like lib/mongoose.ts).
const globalForR2 = globalThis as unknown as { _r2Client?: S3Client };

export const r2 =
  globalForR2._r2Client ??
  new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    },
    forcePathStyle: true,
  });

if (process.env.NODE_ENV !== "production") globalForR2._r2Client = r2;
