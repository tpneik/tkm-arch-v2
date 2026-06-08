/**
 * Cached homepage settings loader for the PUBLIC site (server-only).
 *
 * Mirrors @/lib/getProjects: reads the "homepage" singleton from MongoDB wrapped
 * in `unstable_cache` tagged "homepage". Admin mutations call
 * `revalidateTag("homepage")` (see app/admin/actions/settings.ts) so the next
 * request rebuilds from fresh data — no redeploy needed.
 *
 * Falls back to the original hardcoded defaults so the site looks unchanged
 * until an admin sets custom images.
 */
import "server-only";
import { unstable_cache } from "next/cache";
import { connectToDatabase } from "@/lib/mongoose";
import SettingsModel from "@/models/Settings";

/** Default hero/cover image (the original Unsplash placeholder). */
export const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";

/** Default expertise-slider images (the original /public assets). */
export const DEFAULT_SERVICE_IMAGES = [
  "/service1.jpg",
  "/service2.jpg",
  "/service3.jpg",
  "/service4.png",
];

export interface Homepage {
  heroImage: string;
  serviceImages: string[];
}

async function queryHomepage(): Promise<Homepage> {
  await connectToDatabase();
  const doc: any = await SettingsModel.findOne({ key: "homepage" }).lean();
  const heroImage = doc?.heroImage || DEFAULT_HERO_IMAGE;
  const serviceImages =
    Array.isArray(doc?.serviceImages) && doc.serviceImages.length
      ? doc.serviceImages
      : DEFAULT_SERVICE_IMAGES;
  return JSON.parse(JSON.stringify({ heroImage, serviceImages }));
}

/** Cached + tagged. Bust via `revalidateTag("homepage")` after any mutation. */
export const getHomepage = unstable_cache(queryHomepage, ["public-homepage"], {
  tags: ["homepage"],
});
