"use client";

import { motion, useScroll, useSpring, useMotionValueEvent, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useT } from "next-i18next/client";
import { localizedHref, buildLangSwitchHref } from "@/i18n/routes";
import { projectCategories } from "@/data/categories";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false);
  const [mobileProjectsExpanded, setMobileProjectsExpanded] = useState(false);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const { lng } = useParams<{ lng: string }>();
  const { t } = useT("common");
  const lang = (lng || "en") as "en" | "vi";

  const otherLng = lng === "en" ? "vi" : "en";
  // Strip the /lng prefix to check if we're on home
  const pathWithoutLng = pathname.replace(`/${lng}`, "") || "/";
  const isHome = pathWithoutLng === "/" || pathWithoutLng === "";

  // Build category list from static JSON using ASCII slug as filter key
  const categoryItems = projectCategories.map((cat) => ({
    slug: cat.slug,
    label: cat[lang]?.label ?? cat.vi.label,
  }));

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setProjectsDropdownOpen(true);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setProjectsDropdownOpen(false), 150);
  };

  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150 && !isOpen) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const navLinks = [
    { name: t("navbar.home"), href: isHome ? "#home" : `/${lng}` },
    { name: t("navbar.services"), href: isHome ? "#services" : `/${lng}/#services` },
    { name: t("navbar.projects"), href: localizedHref("projects", lng) },
    { name: t("navbar.about"), href: localizedHref("about", lng) },
    { name: t("navbar.blogs"), href: localizedHref("blogs", lng) },
  ];

  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkTablet = () => setIsTablet(window.innerWidth >= 768);
    checkTablet();
    window.addEventListener("resize", checkTablet);
    return () => window.removeEventListener("resize", checkTablet);
  }, []);

  const menuVariants = {
    closed: {
      clipPath: `circle(0px at calc(100% - ${isTablet ? "68px" : "44px"}) 36px)`,
      transition: { type: "spring" as const, stiffness: 400, damping: 40 }
    },
    opened: {
      clipPath: `circle(1500px at calc(100% - ${isTablet ? "68px" : "44px"}) 36px)`,
      transition: { type: "spring" as const, stiffness: 20, restDelta: 2 }
    }
  };

  const linkVariants = {
    closed: { y: 50, opacity: 0 },
    opened: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.5,
        ease: "easeOut" as const
      }
    })
  };

  // Build the lang switch URL with translated slugs
  const langSwitchHref = buildLangSwitchHref(pathWithoutLng, lng, otherLng);

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className={`fixed w-full h-[72px] z-[60] transition-all duration-500 bg-white shadow-sm border-b border-brand-dark/5 flex items-center`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href={`/${lng}`} className="flex items-center gap-2 group">
              <Image
                src="/logo-thietkemoi.svg"
                alt="ThietKeMoi Architecture"
                width={1024}
                height={360}
                className="h-16 w-auto group-hover:scale-105 transition-transform origin-left"
                priority
              />
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-8">
              {navLinks.map((link, index) => {
                const isProjectsLink = link.href === localizedHref("projects", lng);

                // Projects link with dropdown
                if (isProjectsLink) {
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="relative"
                      onMouseEnter={handleDropdownEnter}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <Link
                        href={link.href}
                        className="text-sm uppercase tracking-widest font-bold text-brand-dark/70 hover:text-brand-blue transition-colors relative flex items-center gap-1"
                      >
                        {link.name}
                        <ChevronDown
                          size={12}
                          className={`transition-transform duration-200 ${projectsDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </Link>
                      <div className={`absolute -bottom-1 left-0 h-[2px] bg-brand-blue transition-all duration-300 ${projectsDropdownOpen ? "w-full" : "w-0"}`} />

                      {/* Dropdown */}
                      <AnimatePresence>
                        {projectsDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white rounded-xl shadow-xl border border-brand-dark/5 py-2 min-w-[200px] z-50"
                          >
                            {/* Invisible bridge to prevent gap hover-out */}
                            <div className="absolute -top-4 left-0 right-0 h-4" />
                            {categoryItems.map((cat) => (
                              <Link
                                key={cat.slug}
                                href={`${localizedHref("projects", lng)}?filter=${cat.slug}`}
                                onClick={() => setProjectsDropdownOpen(false)}
                                className="block px-5 py-2.5 text-xs uppercase tracking-[0.15em] font-bold text-brand-dark/60 hover:text-brand-blue hover:bg-brand-light/60 transition-all"
                              >
                                {cat.label}
                              </Link>
                            ))}
                            <div className="border-t border-brand-dark/5 mt-1 pt-1">
                              <Link
                                href={localizedHref("projects", lng)}
                                onClick={() => setProjectsDropdownOpen(false)}
                                className="block px-5 py-2.5 text-xs uppercase tracking-[0.15em] font-bold text-brand-blue hover:bg-brand-light/60 transition-all"
                              >
                                {t("portfolio.viewAll")}
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }

                // Regular nav links
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative group"
                  >
                    {link.href.startsWith("#") || (link.href.startsWith(`/${lng}/#`) && isHome) ? (
                      <a
                        href={link.href}
                        className="text-sm uppercase tracking-widest font-bold text-brand-dark/70 hover:text-brand-blue transition-colors relative"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm uppercase tracking-widest font-bold text-brand-dark/70 hover:text-brand-blue transition-colors relative"
                      >
                        {link.name}
                      </Link>
                    )}
                    <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-blue transition-all duration-300 group-hover:w-full" />
                  </motion.div>
                );
              })}
            </div>

            {/* Language Switcher */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <Link
                href={langSwitchHref}
                className="text-sm uppercase tracking-widest font-bold text-brand-dark/50 hover:text-brand-blue transition-colors border border-brand-dark/10 px-3 py-1.5 rounded-full"
              >
                {otherLng.toUpperCase()}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <a
                href={isHome ? "#contact" : `/${lng}/#contact`}
                className="bg-brand-blue text-white px-8 py-2.5 rounded-full text-sm font-bold hover:bg-brand-dark hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {t("navbar.getInTouch")}
              </a>
            </motion.div>
          </div>

          {/* Mobile Toggle - Custom Animated Hamburger */}
          <button
            className="lg:hidden relative z-[70] w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <motion.span
              animate={isOpen ? { rotate: 45, y: 8, backgroundColor: "#ffffff" } : { rotate: 0, y: 0, backgroundColor: "#1A1A1A" }}
              className="w-6 h-0.5 block transition-all"
            />
            <motion.span
              animate={isOpen ? { opacity: 0 } : { opacity: 1, backgroundColor: "#1A1A1A" }}
              className="w-6 h-0.5 block transition-all"
            />
            <motion.span
              animate={isOpen ? { rotate: -45, y: -8, backgroundColor: "#ffffff" } : { rotate: 0, y: 0, backgroundColor: "#1A1A1A" }}
              className="w-6 h-0.5 block transition-all"
            />
          </button>
        </div>

        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-blue/30 origin-left"
          style={{ scaleX }}
        />
      </motion.nav>

      {/* Full-screen Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="opened"
            exit="closed"
            variants={menuVariants}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[65] bg-brand-dark flex flex-col items-center justify-center lg:hidden cursor-pointer"
          >
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <span className="text-[25vw] font-serif font-bold text-white/5 absolute -bottom-10 -left-10 whitespace-nowrap select-none">
                THIETKEMOI
              </span>
              <div className="absolute top-0 right-0 w-1/2 h-full border-l border-white/5 skew-x-12 transform translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-full h-1/3 border-t border-white/5 -skew-y-6 transform translate-y-1/2"></div>
            </div>

            <div className="flex flex-col items-center gap-6 sm:gap-10 z-10 cursor-default py-20 px-6 max-h-full overflow-y-auto w-full">
              <div className="flex flex-col items-center gap-6 sm:gap-10" onClick={(e) => e.stopPropagation()}>
                {navLinks.map((link, i) => {
                  const isProjectsLink = link.href === localizedHref("projects", lng);

                  return (
                    <motion.div
                      key={link.name}
                      custom={i}
                      variants={linkVariants}
                      className="overflow-hidden group flex flex-col items-center"
                    >
                      {link.href.startsWith("#") ? (
                        <a
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white hover:text-brand-blue transition-all block text-center relative"
                        >
                          <span className="relative z-10">{link.name}</span>
                          <motion.span
                            className="absolute bottom-2 left-0 w-0 h-4 bg-brand-blue/20 -z-0 group-hover:w-full transition-all duration-500"
                          />
                        </a>
                      ) : isProjectsLink ? (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setMobileProjectsExpanded(!mobileProjectsExpanded); }}
                            className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white hover:text-brand-blue transition-all text-center relative flex items-center gap-3"
                          >
                            <span className="relative z-10">{link.name}</span>
                            <ChevronDown
                              size={24}
                              className={`transition-transform duration-300 ${mobileProjectsExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                          <AnimatePresence>
                            {mobileProjectsExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden flex flex-col items-center gap-3 mt-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {categoryItems.map((cat) => (
                                  <Link
                                    key={cat.slug}
                                    href={`${localizedHref("projects", lng)}?filter=${cat.slug}`}
                                    onClick={() => { setIsOpen(false); setMobileProjectsExpanded(false); }}
                                    className="text-lg sm:text-xl font-bold text-white/50 hover:text-brand-blue transition-colors uppercase tracking-widest"
                                  >
                                    {cat.label}
                                  </Link>
                                ))}
                                <Link
                                  href={localizedHref("projects", lng)}
                                  onClick={() => { setIsOpen(false); setMobileProjectsExpanded(false); }}
                                  className="text-lg sm:text-xl font-bold text-brand-blue hover:text-white transition-colors uppercase tracking-widest"
                                >
                                  {t("portfolio.viewAll")}
                                </Link>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white hover:text-brand-blue transition-all block text-center relative"
                        >
                          <span className="relative z-10">{link.name}</span>
                          <motion.span
                            className="absolute bottom-2 left-0 w-0 h-4 bg-brand-blue/20 -z-0 group-hover:w-full transition-all duration-500"
                          />
                        </Link>
                      )}
                    </motion.div>
                  );
                })}

                <motion.div
                  custom={navLinks.length + 1}
                  variants={linkVariants}
                  className="mt-6 sm:mt-12"
                >
                  <a
                    href={isHome ? "#contact" : `/${lng}/#contact`}
                    onClick={() => setIsOpen(false)}
                    className="bg-brand-blue text-white px-10 py-4 sm:px-16 sm:py-5 rounded-full font-bold text-lg sm:text-xl hover:bg-white hover:text-brand-blue transition-all shadow-2xl shadow-brand-blue/20 inline-block"
                  >
                    {t("navbar.getInTouch")}
                  </a>
                </motion.div>
              </div>

              {/* Social Links & Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-20 w-full flex flex-col md:flex-row justify-between items-center gap-8 text-white/30 text-[10px] uppercase tracking-[0.4em] font-bold cursor-default pb-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-8">
                  <a href="#" className="hover:text-white transition-colors">Instagram</a>
                  <a href="#" className="hover:text-white transition-colors">Facebook</a>
                  <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                </div>
                <div className="text-center md:text-right">
                  <p>{t("footer.location")}</p>
                  <p className="mt-1">© 2024 ThietKeMoi</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Fixed floating language switcher — mobile/tablet only */}
      <Link
        href={langSwitchHref}
        className={`lg:hidden fixed bottom-6 right-6 z-[70] w-11 h-11 rounded-full bg-white shadow-lg border border-brand-dark/10 flex items-center justify-center text-xs font-bold uppercase tracking-wider text-brand-dark/70 hover:text-brand-blue hover:shadow-xl hover:scale-110 active:scale-95 transition-all ${isOpen ? "hidden" : ""}`}
        aria-label="Switch language"
      >
        {otherLng.toUpperCase()}
      </Link>
    </>
  );
}
