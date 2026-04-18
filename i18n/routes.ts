/**
 * Centralized route map for localized URL slugs.
 * 
 * Add new routes here — rewrites (next.config.ts) and links
 * (localizedHref) will pick them up automatically.
 */
export const routeMap = {
  projects: {
    en: "projects",
    vi: "du-an",
  },
  // Future routes — just add entries here:
  // about:   { en: "about-us",  vi: "ve-chung-toi" },
  // contact: { en: "contact",   vi: "lien-he" },
} as const;

type RouteKey = keyof typeof routeMap;
type Lang = "en" | "vi";

/**
 * Generate a localized href for use in Link/a components.
 *
 * @example
 *   localizedHref("projects", "vi")        → "/vi/du-an"
 *   localizedHref("projects", "en")        → "/en/projects"
 *   localizedHref("projects", "vi", "123") → "/vi/du-an/123"
 */
export function localizedHref(
  routeKey: RouteKey,
  lng: string,
  ...segments: string[]
): string {
  const lang = lng as Lang;
  const slug = routeMap[routeKey]?.[lang] ?? routeMap[routeKey]?.en ?? routeKey;
  const extra = segments.length > 0 ? "/" + segments.join("/") : "";
  return `/${lang}/${slug}${extra}`;
}

/**
 * Build a language-switch URL that translates the slug.
 * e.g. on /en/projects, switching to vi → /vi/du-an
 *
 * @param currentPath - path without the /lng prefix (e.g. "/projects" or "/projects/123")
 * @param currentLng - current language code
 * @param targetLng  - target language code
 */
export function buildLangSwitchHref(
  currentPath: string,
  currentLng: string,
  targetLng: string
): string {
  if (currentPath === "/" || currentPath === "") return `/${targetLng}`;

  const pathParts = currentPath.split("/").filter(Boolean);
  const firstSegment = pathParts[0];
  const rest = pathParts.slice(1);

  // Find the slug in the route map and get the target language version
  for (const [, translations] of Object.entries(routeMap)) {
    const record = translations as Record<string, string>;
    if (record[currentLng] === firstSegment) {
      const targetSlug = record[targetLng] ?? firstSegment;
      const extra = rest.length > 0 ? "/" + rest.join("/") : "";
      return `/${targetLng}/${targetSlug}${extra}`;
    }
  }

  // Fallback: keep the same path segment
  return `/${targetLng}${currentPath}`;
}
