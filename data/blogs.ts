import { routeMap } from "@/i18n/routes";
import blogData from "./blogs.json";

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

/* ──────────────────── Data ──────────────────── */

/** All blogs — imported from blogs.json (single source of truth) */
export const blogs: Blog[] = blogData as Blog[];

/** Unique category list for filter UI */
export const blogCategories: string[] = [
  "All",
  ...Array.from(new Set(blogs.map((b) => b.category))),
];

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
 * Find a blog index by categorySlug + slug combo for a given language.
 * Returns -1 if not found.
 */
export function findBlogBySlugs(
  categorySlug: string,
  slug: string,
  lang: "en" | "vi"
): number {
  return blogs.findIndex(
    (b) => b[lang].categorySlug === categorySlug && b[lang].slug === slug
  );
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
