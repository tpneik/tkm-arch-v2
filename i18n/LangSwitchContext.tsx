"use client";

/**
 * Lets a page override the Navbar's language-switch URL.
 *
 * The Navbar is global and only knows the current path, so by default it
 * translates the route base (e.g. blogs ↔ du-an) but keeps the rest of the path
 * verbatim. On detail pages the category/post slug differs per language
 * (e.g. /vi/blogs/thiet-ke/… vs /en/blogs/design/…), so those pages register
 * the correct translated href here and the Navbar uses it instead.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Ctx = {
  href: string | null;
  setHref: (href: string | null) => void;
};

const LangSwitchContext = createContext<Ctx | null>(null);

export function LangSwitchProvider({ children }: { children: ReactNode }) {
  const [href, setHref] = useState<string | null>(null);
  return (
    <LangSwitchContext.Provider value={{ href, setHref }}>
      {children}
    </LangSwitchContext.Provider>
  );
}

/** Read the current language-switch override (used by the Navbar). */
export function useLangSwitchOverride(): string | null {
  return useContext(LangSwitchContext)?.href ?? null;
}

/**
 * Register a language-switch href for the lifetime of the calling component.
 * Pass null/undefined to fall back to the Navbar's default behavior.
 */
export function useRegisterLangSwitch(href: string | null | undefined): void {
  const setHref = useContext(LangSwitchContext)?.setHref;
  useEffect(() => {
    if (!setHref) return;
    setHref(href ?? null);
    return () => setHref(null);
  }, [setHref, href]);
}
