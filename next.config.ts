import type { NextConfig } from "next";
import { routeMap } from "./i18n/routes";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "pub-3ab4be4721d74fc9b1b1e7de44e65381.r2.dev",
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
          // Also handle sub-paths (e.g., /vi/du-an/cong-trinh-khac/slug → /vi/projects/cong-trinh-khac/slug)
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
