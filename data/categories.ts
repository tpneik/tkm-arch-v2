import categoryData from "./categories.json";

/* ──────────────────── Types ──────────────────── */

export interface CategoryLang {
  label: string;
}

export interface Category {
  id: string;
  slug: string;
  en: CategoryLang;
  vi: CategoryLang;
}

/* ──────────────────── Data ──────────────────── */

/** Project categories — imported from categories.json */
export const projectCategories: Category[] =
  categoryData.projectCategories as Category[];

/** Blog categories — imported from categories.json */
export const blogCategories: Category[] =
  categoryData.blogCategories as Category[];

/* ──────────────────── Helpers ──────────────────── */

/**
 * Get all project category slugs (useful for filter UI).
 * Returns ["All", "cong-trinh-khac", "nha-pho", ...]
 */
export function getProjectCategorySlugs(): string[] {
  return ["All", ...projectCategories.map((c) => c.slug)];
}

/**
 * Get all blog category slugs (useful for filter UI).
 * Returns ["All", "design", "construction", ...]
 */
export function getBlogCategorySlugs(): string[] {
  return ["All", ...blogCategories.map((c) => c.slug)];
}

/**
 * Get project category labels for a given language.
 * Returns [{ slug, label }] — ready for dropdown / filter chips.
 */
export function getProjectCategoryLabels(
  lang: "en" | "vi"
): { slug: string; label: string }[] {
  return projectCategories.map((c) => ({
    slug: c.slug,
    label: c[lang].label,
  }));
}

/**
 * Get blog category labels for a given language.
 * Returns [{ slug, label }] — ready for dropdown / filter chips.
 */
export function getBlogCategoryLabels(
  lang: "en" | "vi"
): { slug: string; label: string }[] {
  return blogCategories.map((c) => ({
    slug: c.slug,
    label: c[lang].label,
  }));
}

/**
 * Find a project category by slug.
 */
export function findProjectCategory(slug: string): Category | undefined {
  return projectCategories.find((c) => c.slug === slug);
}

/**
 * Find a blog category by slug.
 */
export function findBlogCategory(slug: string): Category | undefined {
  return blogCategories.find((c) => c.slug === slug);
}

/**
 * Get the localized label for a project category slug.
 * Falls back to the slug itself if not found.
 */
export function getProjectCategoryLabel(
  slug: string,
  lang: "en" | "vi"
): string {
  const cat = findProjectCategory(slug);
  return cat ? cat[lang].label : slug;
}

/**
 * Get the localized label for a blog category slug.
 * Falls back to the slug itself if not found.
 */
export function getBlogCategoryLabel(
  slug: string,
  lang: "en" | "vi"
): string {
  const cat = findBlogCategory(slug);
  return cat ? cat[lang].label : slug;
}
