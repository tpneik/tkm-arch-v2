import { routeMap } from "@/i18n/routes";
import {
  blogCategories as blogCategoryList,
  getBlogCategorySlugs,
  getBlogCategoryLabels,
  findBlogCategory,
  slugify,
} from "./categories";

/* ──────────────────── Types ──────────────────── */

export interface BlogLang {
  title: string;
  slug: string;
  categoryLabel: string;
  categorySlug: string;
  excerpt: string;
  content: string;
}

export interface Blog {
  id: string;
  category: string;
  thumbnail: string;
  date: string;
  en: BlogLang;
  vi: BlogLang;
}

/* ──────────────────── Re-exports ──────────────────── */

export { blogCategoryList, getBlogCategorySlugs, getBlogCategoryLabels };

/* ──────────────────── Data ──────────────────── */

// NOTE: Blog data is no longer statically imported here. The public site loads
// it at runtime via the cached server loader `@/lib/getBlogs` (reads MongoDB,
// cached + tagged "blogs"). This module now only holds pure types/helpers so it
// stays safe to import from Client Components without bundling any dataset.

/** Unique category list for filter UI (slugs) */
export const blogCategories: string[] = getBlogCategorySlugs();

/* ──────────────────── Helpers ──────────────────── */

/**
 * Resolve a blog's CANONICAL category slug (the key used by filter buttons and
 * Navbar links, e.g. "design").
 *
 * Properly-saved blogs store the canonical slug in `category`. This also rescues
 * older data where `category` might be a localized label, or where only the
 * per-locale `categorySlug` (e.g. "thiet-ke") is reliable — by matching it back
 * to a known category.
 */
export function blogCategorySlug(
  b: Pick<Blog, "category" | "vi" | "en">
): string {
  const raw = b?.category || "";
  // Already a canonical slug.
  if (raw && findBlogCategory(raw)) return raw;
  // Match a category by either locale's derived slug.
  const byLocaleSlug = blogCategoryList.find(
    (c) =>
      slugify(c.vi.label) === b?.vi?.categorySlug ||
      slugify(c.en.label) === b?.en?.categorySlug
  );
  if (byLocaleSlug) return byLocaleSlug.slug;
  // Match a category by a stored localized label.
  const byLabel = blogCategoryList.find(
    (c) => c.vi.label === raw || c.en.label === raw
  );
  return byLabel?.slug || b?.vi?.categorySlug || raw || "";
}

/**
 * Build a full SEO-friendly blog URL (without numeric ID).
 *
 * Uses the pre-baked `slug` and `categorySlug` from the JSON data
 * so no runtime slug computation is needed.
 *
 * @example
 *   blogHref(blog, "en") → "/en/blogs/design/5-trends-shaping-modern-architecture-2025"
 *   blogHref(blog, "vi") → "/vi/blogs/thiet-ke/5-xu-huong-dinh-hinh-kien-truc-hien-dai-2025"
 */
export function blogHref(blog: Blog, lng: string): string {
  const lang = (lng || "en") as "en" | "vi";
  const baseSlug =
    (routeMap.blogs as Record<string, string>)[lang] ?? "blogs";
  // Defensive: a malformed record (missing en/vi) must not crash rendering.
  const b = blog?.[lang];
  if (!b?.categorySlug || !b?.slug) return `/${lang}/${baseSlug}`;
  return `/${lang}/${baseSlug}/${b.categorySlug}/${b.slug}`;
}

/**
 * Format a date string for display.
 */
export function formatBlogDate(dateStr: string, lng: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(lng === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
