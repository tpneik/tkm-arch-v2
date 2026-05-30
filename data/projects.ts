import { routeMap } from "@/i18n/routes";
import {
  projectCategories,
  getProjectCategorySlugs,
  getProjectCategoryLabels,
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
  category: string;
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
 * Build a full SEO-friendly project URL (without numeric ID).
 *
 * Uses the pre-baked `slug` and `categorySlug` from the JSON data
 * so no runtime slug computation is needed.
 *
 * @example
 *   projectHref(project, "en") → "/en/projects/cong-trinh-khac/1994-coffee-an-giang"
 *   projectHref(project, "vi") → "/vi/du-an/cong-trinh-khac/quan-ca-phe-1994-an-giang"
 */
export function projectHref(project: Project, lng: string): string {
  const lang = (lng || "en") as "en" | "vi";
  const baseSlug =
    (routeMap.projects as Record<string, string>)[lang] ?? "projects";
  // Defensive: a malformed record (missing en/vi) must not crash rendering.
  const p = project?.[lang];
  if (!p?.categorySlug || !p?.slug) return `/${lang}/${baseSlug}`;
  return `/${lang}/${baseSlug}/${p.categorySlug}/${p.slug}`;
}

