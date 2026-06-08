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
 * Turn arbitrary text (incl. Vietnamese) into an ASCII kebab-case slug.
 * Shared by the admin form and the public pages so slug generation stays
 * consistent everywhere.
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics (Vietnamese)
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric (except space/dash)
    .replace(/[\s_]+/g, "-") // spaces & underscores → dash
    .replace(/-+/g, "-") // collapse multiple dashes
    .replace(/^-|-$/g, ""); // trim leading/trailing dashes
}

/**
 * Locale-specific URL slug for a canonical project-category slug.
 * e.g. categoryLocaleSlug("noi-that", "en") → "interior" (from the EN label).
 * Falls back to the canonical slug itself when the category is unknown.
 */
export function categoryLocaleSlug(
  canonicalSlug: string,
  lang: "en" | "vi"
): string {
  const cat = findProjectCategory(canonicalSlug);
  return cat ? slugify(cat[lang].label) : canonicalSlug;
}

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
