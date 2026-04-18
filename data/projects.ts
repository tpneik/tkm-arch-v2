import { routeMap } from "@/i18n/routes";
import projectData from "./projects.json";

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

/* ──────────────────── Data ──────────────────── */

/** All projects — imported from projects.json (single source of truth) */
export const projects: Project[] = projectData as Project[];

/** Unique category list for filter UI */
export const categories: string[] = [
  "All",
  ...Array.from(new Set(projects.map((p) => p.category))),
];

/* ──────────────────── Helpers ──────────────────── */

/**
 * Build a full SEO-friendly project URL.
 *
 * Uses the pre-baked `slug` and `categorySlug` from the JSON data
 * so no runtime slug computation is needed.
 *
 * @example
 *   projectHref(project, "en") → "/en/projects/1/commercial/1994-coffee-an-giang"
 *   projectHref(project, "vi") → "/vi/du-an/1/thuong-mai/quan-ca-phe-1994-an-giang"
 */
export function projectHref(project: Project, lng: string): string {
  const lang = (lng || "en") as "en" | "vi";
  const baseSlug =
    (routeMap.projects as Record<string, string>)[lang] ?? "projects";
  const p = project[lang];
  return `/${lang}/${baseSlug}/${project.id}/${p.categorySlug}/${p.slug}`;
}
