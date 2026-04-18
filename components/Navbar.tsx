"use client";

import { motion, useScroll, useSpring, useMotionValueEvent, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { useT } from "next-i18next/client";
import { localizedHref, buildLangSwitchHref } from "@/i18n/routes";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const { lng } = useParams<{ lng: string }>();
  const { t } = useT("common");

  const otherLng = lng === "en" ? "vi" : "en";
  // Strip the /lng prefix to check if we're on home
  const pathWithoutLng = pathname.replace(`/${lng}`, "") || "/";
  const isHome = pathWithoutLng === "/" || pathWithoutLng === "";

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
    { name: t("navbar.contact"), href: isHome ? "#contact" : `/${lng}/#contact` },
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
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-bold tracking-tighter text-brand-blue leading-none group-hover:scale-105 transition-transform origin-left">
                  THIETKEMOI
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gray font-medium">
                  Architecture
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-8">
              {navLinks.map((link, index) => (
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
                  <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand-blue transition-all duration-300 group-hover:w-full"></div>
                </motion.div>
              ))}
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
                href="#contact"
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
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    custom={i}
                    variants={linkVariants}
                    className="overflow-hidden group"
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
                ))}

                {/* Mobile Language Switcher */}
                <motion.div
                  custom={navLinks.length}
                  variants={linkVariants}
                  className="overflow-hidden"
                >
                  <Link
                    href={langSwitchHref}
                    onClick={() => setIsOpen(false)}
                    className="text-2xl sm:text-3xl font-serif font-bold text-white/50 hover:text-brand-blue transition-all block text-center"
                  >
                    {otherLng === "vi" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}
                  </Link>
                </motion.div>

                <motion.div
                  custom={navLinks.length + 1}
                  variants={linkVariants}
                  className="mt-6 sm:mt-12"
                >
                  <a
                    href="#contact"
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
    </>
  );
}
