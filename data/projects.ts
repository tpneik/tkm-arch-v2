import { routeMap } from "@/i18n/routes";
import {
  projectCategories,
  getProjectCategorySlugs,
  getProjectCategoryLabels,
  categoryLocaleSlug,
} from "./categories";

/* ──────────────────── Types ──────────────────── */

export interface ProjectLang {
  title: string;
  slug: string;
  categoryLabel: string;
  categorySlug: string;
  description: string;
  details: Record<string, string | string[]>;
}

export interface Project {
  id: string;
  /** Primary category slug (canonical). Mirrors `categories[0]`. */
  category: string;
  /**
   * Canonical category slugs this project belongs to (e.g. ["noi-that","nha-pho"]).
   * `categories[0]` is the primary category. Optional for backward compatibility
   * with older data — use `normalizeProjectCategories()` to read it safely.
   */
  categories?: string[];
  thumbnail: string;
  gallery: string[];
  en: ProjectLang;
  vi: ProjectLang;
}

/* ──────────────────── Re-exports ──────────────────── */

export { projectCategories, getProjectCategorySlugs, getProjectCategoryLabels };

/* ──────────────────── Data ──────────────────── */

// NOTE: Project data is no longer statically imported here. The public site
// loads it at runtime via the cached server loader `@/lib/getProjects`
// (reads MongoDB, cached + tagged "projects"). This module now only holds
// pure types/helpers so it stays safe to import from Client Components
// without bundling any dataset.

/** Unique category list for filter UI (slugs) */
export const categories: string[] = getProjectCategorySlugs();

/* ──────────────────── Helpers ──────────────────── */

/**
 * Read a project's category slugs safely.
 *
 * Returns the explicit `categories` array when present, otherwise falls back to
 * the legacy single-category slug (`vi.categorySlug`, then `category`). This lets
 * older documents that predate the `categories` field keep working without a DB
 * migration.
 */
export function normalizeProjectCategories(
  p: Pick<Project, "categories" | "category" | "vi">
): string[] {
  if (p?.categories?.length) return p.categories;
  const fallback = p?.vi?.categorySlug || p?.category || "";
  return fallback ? [fallback] : [];
}

/**
 * Build a full SEO-friendly project URL (without numeric ID).
 *
 * Uses the pre-baked `slug` and `categorySlug` from the JSON data
 * so no runtime slug computation is needed.
 *
 * Pass `inCategory` (a canonical category slug) to build the URL under that
 * specific category — used so a project rendered inside a category filter links
 * to that category, not its primary one. Falls back to the primary category
 * when `inCategory` is omitted or the project doesn't belong to it.
 *
 * @example
 *   projectHref(project, "en") → "/en/projects/cong-trinh-khac/1994-coffee-an-giang"
 *   projectHref(project, "vi") → "/vi/du-an/cong-trinh-khac/quan-ca-phe-1994-an-giang"
 *   projectHref(project, "vi", "nha-pho") → "/vi/du-an/nha-pho/quan-ca-phe-1994-an-giang"
 */
export function projectHref(
  project: Project,
  lng: string,
  inCategory?: string
): string {
  const lang = (lng || "en") as "en" | "vi";
  const baseSlug =
    (routeMap.projects as Record<string, string>)[lang] ?? "projects";
  // Defensive: a malformed record (missing en/vi) must not crash rendering.
  const p = project?.[lang];
  if (!p?.slug) return `/${lang}/${baseSlug}`;
  // Render under the requested category when the project belongs to it.
  const catSlug =
    inCategory && normalizeProjectCategories(project).includes(inCategory)
      ? categoryLocaleSlug(inCategory, lang)
      : p.categorySlug;
  if (!catSlug) return `/${lang}/${baseSlug}`;
  return `/${lang}/${baseSlug}/${catSlug}/${p.slug}`;
}

