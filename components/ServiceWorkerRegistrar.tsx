"use client";

import { useEffect } from "react";

/**
 * Registers the image-caching Service Worker.
 * Must be rendered inside a client boundary (e.g. layout).
 * Does nothing during SSR or if SW is unsupported.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // Auto-update check every 60 minutes
        setInterval(() => reg.update(), 60 * 60 * 1000);
      })
      .catch((err) => {
        console.warn("[SW] Registration failed:", err);
      });
  }, []);

  return null; // Renders nothing — side-effect only
}
