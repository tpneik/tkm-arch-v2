import { routeMap } from "@/i18n/routes";
import projectData from "./projects.json";
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

/** All projects — imported from projects.json, sorted by numeric ID */
export const projects: Project[] = (projectData as Project[]).sort(
  (a, b) => Number(a.id) - Number(b.id)
);

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
  const p = project[lang];
  return `/${lang}/${baseSlug}/${p.categorySlug}/${p.slug}`;
}

/**
 * Find a project index by categorySlug + slug combo for a given language.
 * Returns -1 if not found.
 */
export function findProjectBySlugs(
  categorySlug: string,
  slug: string,
  lang: "en" | "vi"
): number {
  // Try current language first
  let idx = projects.findIndex(
    (p) => p[lang].categorySlug === categorySlug && p[lang].slug === slug
  );
  // Fallback: try the other language
  if (idx < 0) {
    const otherLang = lang === "en" ? "vi" : "en";
    idx = projects.findIndex(
      (p) => p[otherLang].categorySlug === categorySlug && p[otherLang].slug === slug
    );
  }
  return idx;
}
