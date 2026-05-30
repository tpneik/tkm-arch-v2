import { routeMap } from "@/i18n/routes";
import {
  blogCategories as blogCategoryList,
  getBlogCategorySlugs,
  getBlogCategoryLabels,
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
  const b = blog[lang];
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
