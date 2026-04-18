import type { NextConfig } from "next";
import { routeMap } from "./i18n/routes";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    // Auto-generate rewrites from the route map
    const rewrites: { source: string; destination: string }[] = [];

    for (const [internalRoute, translations] of Object.entries(routeMap)) {
      for (const [lang, slug] of Object.entries(translations)) {
        // Only create a rewrite if the slug differs from the internal route
        if (slug !== internalRoute) {
          rewrites.push({
            source: `/${lang}/${slug}`,
            destination: `/${lang}/${internalRoute}`,
          });
          // Also handle sub-paths (e.g., /vi/du-an/123 → /vi/projects/123)
          rewrites.push({
            source: `/${lang}/${slug}/:path*`,
            destination: `/${lang}/${internalRoute}/:path*`,
          });
        }
      }
    }

    return rewrites;
  },
};

export default nextConfig;
