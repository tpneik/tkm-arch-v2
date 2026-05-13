"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useT } from "next-i18next/client";
import { localizedHref } from "@/i18n/routes";
import { projectHref, projects } from "@/data/projects";

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";

/* ── Animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

const ProjectDetail = () => {
  const params = useParams<{ categorySlug: string; slug: string; lng: string }>();
  const { categorySlug, slug, lng } = params;
  const router = useRouter();
  const { t } = useT("common");
  const lang = (lng || "en") as "en" | "vi";
  const [imgLoaded, setImgLoaded] = useState(false);


  const currentIndex = useMemo(() => {
    // Try current language first
    let idx = projects.findIndex(
      (p) => p[lang].categorySlug === categorySlug && p[lang].slug === slug
    );
    // Fallback: try the other language (handles cross-language slug URLs)
    if (idx < 0) {
      const otherLang = lang === "en" ? "vi" : "en";
      idx = projects.findIndex(
        (p) => p[otherLang].categorySlug === categorySlug && p[otherLang].slug === slug
      );
    }
    return idx;
  }, [projects, categorySlug, slug, lang]);

  const project = currentIndex >= 0 ? projects[currentIndex] : undefined;
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex >= 0 && currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  // Related: 3 other projects (same category first, then others)
  const related = useMemo(
    () =>
      projects
        .filter((p) => p.id !== project?.id)
        .sort((a, b) => {
          if (a.category === project?.category && b.category !== project?.category) return -1;
          if (a.category !== project?.category && b.category === project?.category) return 1;
          return 0;
        })
        .slice(0, 3),
    [projects, project]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    setImgLoaded(false);
    // Fallback: if onLoad doesn't fire within 1s, force the image visible
    const timer = setTimeout(() => setImgLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, [categorySlug, slug]);

  if (!project)
    return (
      <div className="h-screen flex items-center justify-center uppercase tracking-widest text-brand-gray text-sm">
        {t("projectDetail.notFound")}
      </div>
    );

  const pd = {
    title: project[lang].title,
    description: project[lang].description,
    details: project[lang].details,
    category: project[lang].categoryLabel,
  };

  return (
    <div className="bg-brand-light text-brand-dark min-h-screen">
      {/* ─── HERO ─── */}
      <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
        {/* Back button */}
        <motion.div {...fadeIn(0.3)} className="absolute top-32 left-6 md:left-12 lg:left-24 z-20">
          <Link
            href={localizedHref("projects", lng)}
            className="inline-flex items-center justify-center p-2 gap-2 text-white/75 hover:text-white transition-colors text-[10px] tracking-[0.3em] uppercase font-bold bg-brand-dark/20 backdrop-blur-sm rounded-full px-4"
          >
            <ArrowLeft size={14} />
            {t("navbar.projects")}
          </Link>
        </motion.div>

        {/* Hero image — zoom-in entrance */}
        <motion.img
          key={`hero-${categorySlug}-${slug}`}
          src={project.thumbnail || DEFAULT_IMG}
          alt={pd.title}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => { e.currentTarget.src = DEFAULT_IMG; }}
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{
            scale: imgLoaded ? 1 : 1.15,
            opacity: imgLoaded ? 1 : 0,
          }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent" />

        {/* Hero title overlay — slide up */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-12 lg:px-24 pb-12 md:pb-20">
          <motion.p
            {...fadeUp(0.4)}
            className="text-[10px] md:text-[11px] font-bold tracking-[0.32em] uppercase mb-4 text-white/70"
          >
            {pd.category}
          </motion.p>
          <motion.h1
            {...fadeUp(0.55)}
            className="text-3xl sm:text-4xl md:text-6xl font-serif tracking-tight uppercase leading-tight max-w-4xl text-white"
          >
            {pd.title}
          </motion.h1>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto">
        {/* LEFT: Specs panel */}
        <div className="lg:w-[40%] border-r border-brand-dark/5 bg-white/50">
          <div className="lg:sticky lg:top-24 px-6 md:px-12 lg:px-16 py-12 md:py-20">
            {/* Details grid — staggered entrance */}
            <div className="space-y-0">
              {Object.entries(pd.details).map(([key, value], i) => (
                <motion.div
                  key={key}
                  {...fadeUp(0.5 + i * 0.08)}
                  className={`py-6 ${i !== 0 ? "border-t border-brand-dark/5" : ""}`}
                >
                  <h6 className="text-[9px] font-bold tracking-[0.35em] uppercase mb-3 text-brand-gray">
                    {key}
                  </h6>
                  <p className="text-base font-medium tracking-wide text-brand-dark">
                    {Array.isArray(value) ? value.join(" · ") : value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Description */}
            <motion.div
              {...fadeUp(0.8)}
              className="border-t border-brand-dark/5 pt-8 mt-4"
            >
              <h6 className="text-[9px] font-bold tracking-[0.35em] uppercase mb-5 text-brand-gray">
                {t("projectDetail.description")}
              </h6>
              <p className="text-base leading-relaxed font-light text-brand-dark/80">
                {pd.description}
              </p>
            </motion.div>

            {/* Prev / Next navigation */}
            <motion.div
              {...fadeIn(1)}
              className="border-t border-brand-dark/5 mt-12 pt-8 flex gap-8"
            >
              {prevProject && (
                <Link
                  href={projectHref(prevProject, lang)}
                  className="flex-1 group text-left"
                >
                  <p className="text-[9px] tracking-[0.35em] uppercase mb-2 text-brand-gray group-hover:text-brand-blue transition-colors">
                    ← {t("projectDetail.previous")}
                  </p>
                  <p className="text-xs font-bold tracking-wider uppercase transition-colors line-clamp-2 group-hover:text-brand-blue">
                    {prevProject[lang].title}
                  </p>
                </Link>
              )}
              {nextProject && (
                <Link
                  href={projectHref(nextProject, lang)}
                  className="flex-1 group text-right"
                >
                  <p className="text-[9px] tracking-[0.35em] uppercase mb-2 text-brand-gray group-hover:text-brand-blue transition-colors">
                    {t("projectDetail.next")} →
                  </p>
                  <p className="text-xs font-bold tracking-wider uppercase transition-colors line-clamp-2 group-hover:text-brand-blue">
                    {nextProject[lang].title}
                  </p>
                </Link>
              )}
            </motion.div>
          </div>
        </div>

        {/* RIGHT: Image gallery — staggered reveal */}
        <div className="lg:w-[60%] p-6 md:p-12 lg:p-16 space-y-8 md:space-y-12">
          {project.gallery.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: i < 3 ? i * 0.12 : 0,
                ease: [0.25, 0.46, 0.45, 0.94] as const,
              }}
              className="overflow-hidden rounded-xl shadow-lg"
            >
              <img
                src={img || DEFAULT_IMG}
                alt={`${pd.title} ${i + 1}`}
                onError={(e) => { e.currentTarget.src = DEFAULT_IMG; }}
                className="w-full h-auto hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── RELATED PROJECTS ─── */}
      <div className="border-t border-brand-dark/5 px-6 md:px-12 lg:px-24 py-20 md:py-32 bg-white">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[10px] font-bold tracking-[0.45em] uppercase mb-12 text-brand-gray"
        >
          {t("projectDetail.otherProjects")}
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {related.map((p, i) => {
            const rt = {
              title: p[lang].title,
              category: p[lang].categoryLabel,
            };
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94] as const,
                }}
                className="group"
              >
                <Link
                  href={projectHref(p, lang)}
                  className="block aspect-[4/3] overflow-hidden relative rounded-xl bg-brand-light shadow-md"
                >
                  <img
                    src={p.thumbnail || DEFAULT_IMG}
                    alt={rt.title}
                    onError={(e) => { e.currentTarget.src = DEFAULT_IMG; }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/40 transition-colors duration-500" />
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <ArrowUpRight size={18} className="text-brand-dark" />
                  </div>
                </Link>
                <div className="pt-6">
                  <p className="text-[9px] tracking-[0.35em] uppercase mb-2 text-brand-blue font-bold">
                    {rt.category}
                  </p>
                  <h4 className="text-lg font-serif tracking-wide uppercase group-hover:text-brand-blue transition-colors leading-snug">
                    {rt.title}
                  </h4>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View all */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Link
            href={localizedHref("projects", lng)}
            className="inline-flex items-center gap-4 text-[11px] font-bold tracking-[0.3em] uppercase border-2 border-brand-dark/10 hover:border-brand-blue hover:text-brand-blue transition-all px-10 py-5 group rounded-full"
          >
            {t("projectDetail.viewAll")}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-2 transition-transform"
            />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetail;
