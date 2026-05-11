"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "next-i18next/client";
import { localizedHref } from "@/i18n/routes";
import { projectHref } from "@/data/projects";
import type { Project } from "@/data/projects";
import { useProjects } from "@/hooks/useDbData";

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";

export default function Portfolio() {
  const { t } = useT("common");
  const { lng } = useParams<{ lng: string }>();
  const lang = (lng || "en") as "en" | "vi";

  const { projects, loading } = useProjects();

  // Show only first 6 projects on home page
  const featuredProjects = projects.slice(0, 6);

  if (loading) {
    return (
      <section id="portfolio" className="section-padding bg-brand-light">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-brand-blue uppercase tracking-[0.3em] text-xs font-bold mb-4 block">
              {t("portfolio.label")}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif">{t("portfolio.title")}</h2>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-sm uppercase tracking-[0.3em] text-brand-gray">
              Loading...
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="section-padding bg-brand-light">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-brand-blue uppercase tracking-[0.3em] text-xs font-bold mb-4 block">
            {t("portfolio.label")}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif">{t("portfolio.title")}</h2>
        </div>

        {/* ── Desktop Grid (lg+) ── */}
        <div className="hidden lg:grid grid-cols-3 gap-1">
          {featuredProjects.map((project, index) => (
            <Link
              href={projectHref(project, lang)}
              key={project.id}
              className="relative group overflow-hidden aspect-[4/5]"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="w-full h-full"
              >
                <img
                  src={project.thumbnail || DEFAULT_IMG}
                  alt={project[lang].title}
                  onError={(e) => { e.currentTarget.src = DEFAULT_IMG; }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                {/* Always-visible text overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 z-10">
                  {/* Gradient that always shows at bottom, intensifies on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-brand-dark/30 to-transparent transition-opacity duration-500 group-hover:from-brand-dark/85 group-hover:via-brand-dark/50" />
                  <div className="relative p-6 md:p-8">
                    <span className="text-brand-blue text-[10px] uppercase tracking-[0.25em] mb-2 font-bold block transition-transform duration-500 group-hover:translate-y-0 translate-y-0">
                      {project[lang].categoryLabel}
                    </span>
                    <h3 className="text-xl text-white font-serif leading-snug transition-transform duration-500 group-hover:-translate-y-0.5">
                      {project[lang].title}
                    </h3>
                    {/* Animated underline on hover */}
                    <div className="w-10 h-[2px] bg-brand-blue mt-3 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 delay-100" />
                    {/* Arrow that appears on hover */}
                    <div className="flex items-center gap-2 mt-3 text-white/0 group-hover:text-white/70 transition-all duration-500 translate-y-3 group-hover:translate-y-0">
                      <span className="text-[9px] uppercase tracking-[0.3em] font-bold">
                        {t("portfolio.viewProject") ?? "View Project"}
                      </span>
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* ── Mobile / Tablet Slider (< lg) ── */}
        <div className="lg:hidden">
          <MobileSlider
            projects={featuredProjects}
            lang={lang}
            lng={lng}
            viewLabel={t("portfolio.viewProject") ?? "View Project"}
          />
        </div>

        <div className="mt-16 text-center">
          <Link
            href={localizedHref("projects", lng)}
            className="border-b border-brand-dark pb-2 text-sm uppercase tracking-widest font-bold hover:text-brand-blue hover:border-brand-blue transition-all"
          >
            {t("portfolio.viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   Mobile / Tablet Hero Slider
   ================================================================ */

interface SliderProps {
  projects: Project[];
  lang: "en" | "vi";
  lng: string;
  viewLabel: string;
}

function MobileSlider({ projects: items, lang, lng, viewLabel }: SliderProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = items.length;

  const goTo = useCallback(
    (idx: number) => {
      setCurrent((idx + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-play every 5 seconds
  useEffect(() => {
    autoPlayRef.current = setInterval(next, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [next]);

  // Pause auto-play on interaction, resume after 8s
  const resetAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(next, 8000);
  }, [next]);

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
      resetAutoPlay();
    }
  };

  if (items.length === 0) return null;

  const project = items[current];
  const pd = project[lang];

  return (
    <div
      className="relative w-full aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/10] overflow-hidden rounded-2xl shadow-xl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide images */}
      <AnimatePresence mode="wait">
        <motion.img
          key={`slide-${current}`}
          src={project.thumbnail || DEFAULT_IMG}
          alt={pd.title}
          onError={(e) => { e.currentTarget.src = DEFAULT_IMG; }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent z-10" />

      {/* Text content — always visible */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 sm:p-8 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <span className="text-brand-blue text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-bold block mb-2">
              {pd.categoryLabel}
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl text-white font-serif leading-snug mb-4">
              {pd.title}
            </h3>
            <Link
              href={projectHref(project, lang)}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold transition-colors"
            >
              {viewLabel}
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => { prev(); resetAutoPlay(); }}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all"
        aria-label="Previous project"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => { next(); resetAutoPlay(); }}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 active:scale-95 transition-all"
        aria-label="Next project"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-2 pb-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); resetAutoPlay(); }}
            className={`h-1 rounded-full transition-all duration-400 ${
              i === current
                ? "w-6 bg-brand-blue"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
