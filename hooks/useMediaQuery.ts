"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect media query matches.
 * @param query - The media query string (e.g., "(max-width: 768px)")
 * @returns boolean - Whether the media query matches.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Initial check
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);

    // Modern support
    media.addEventListener("change", listener);

    return () => {
      media.removeEventListener("change", listener);
    };
  }, [matches, query]);

  return matches;
}

/**
 * Predefined hook for mobile detection (up to 768px)
 */
export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)");
}
