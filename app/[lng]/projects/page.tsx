"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "next-i18next/client";
import { localizedHref } from "@/i18n/routes";
import { projectHref, projects as allProjects } from "@/data/projects";

const ITEMS_PER_PAGE = 6;
const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";

/* ── Stagger animation variants ── */
const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.97,
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
};

/* ── ProjectCard with image loading state ── */
function ProjectCard({
  project,
  lang,
  priority = false,
}: {
  project: (typeof allProjects)[number];
  lang: "en" | "vi";
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const src = error ? DEFAULT_IMG : project.thumbnail || DEFAULT_IMG;

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => {
    setError(true);
    setLoaded(true);
  }, []);

  return (
    <Link href={projectHref(project, lang)} className="group flex flex-col">
      <div className="overflow-hidden aspect-[3/2] relative mb-6 rounded-lg bg-white shadow-sm border border-brand-dark/5">
        {/* Shimmer skeleton — visible until image loads */}
        <div
          className={`absolute inset-0 z-[1] transition-opacity duration-500 ${
            loaded ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="w-full h-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-[length:200%_100%]" />
        </div>

        {/* Actual image — fades in when loaded */}
        <Image
          src={src}
          alt={project[lang].title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-all duration-700 ease-out group-hover:scale-108 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          referrerPolicy="no-referrer"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 z-[2] bg-brand-dark/35 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <div className="w-12 h-12 border border-white flex items-center justify-center rounded-full">
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-blue">
          {project[lang].categoryLabel}
        </p>
        <h3 className="text-xl font-serif tracking-wide uppercase leading-tight group-hover:text-brand-blue transition-colors">
          {project[lang].title}
        </h3>
      </div>
    </Link>
  );
}

const ProjectsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lng } = useParams<{ lng: string }>();
  const { t } = useT("common");
  const lang = (lng || "en") as "en" | "vi";

  const projects = allProjects;

  const filter = searchParams.get("filter") || "all";
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProjects = useMemo(
    () =>
      filter === "all"
        ? projects
        : projects.filter((p) => p.vi.categorySlug === filter),
    [filter, projects]
  );

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = useMemo(
    () =>
      filteredProjects.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredProjects, currentPage]
  );

  // key = p.category which is already an ASCII slug (e.g. 'nha-pho')
  const handleFilter = (slug: string) => {
    setCurrentPage(1);
    const base = localizedHref("projects", lng);
    if (slug === "all") router.push(base);
    else router.push(`${base}?filter=${slug}`);
  };

  // key = p.vi.categorySlug (ASCII slug, e.g. 'nha-pho') — used in ?filter= URL param
  const localizedCategories = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p) => {
      const slug = p.vi.categorySlug;
      if (!map.has(slug)) {
        map.set(slug, p[lang].categoryLabel);
      }
    });
    return [
      { key: "all", label: t("projects.allFilter") ?? "All" },
      ...Array.from(map, ([key, label]) => ({ key, label })),
    ];
  }, [lang, t, projects]);

  /* Unique key for AnimatePresence — changes trigger exit/enter */
  const gridKey = `${filter}-${currentPage}`;

  return (
    <div className="pt-32 pb-20 min-h-screen bg-brand-light text-brand-dark">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-serif mb-8 md:mb-14 uppercase tracking-wider"
        >
          {t("projects.pageTitle")}
        </motion.h1>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="flex flex-wrap gap-x-6 md:gap-x-10 gap-y-4 mb-8 md:mb-14 pb-7 md:pb-9 border-b border-brand-dark/10"
        >
          {localizedCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleFilter(cat.key)}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer ${
                filter === cat.key
                  ? "text-brand-blue border-b-2 border-brand-blue pb-2"
                  : "text-brand-gray hover:text-brand-dark"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Project Grid — animated on page/filter change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={gridKey}
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {paginatedProjects.map((project, index) => (
              <motion.div key={project.id} variants={cardVariants}>
                <ProjectCard
                  project={project}
                  lang={lang}
                  priority={index < 3}
                />
              </motion.div>
            ))}
            {filteredProjects.length === 0 && (
              <motion.div
                variants={cardVariants}
                className="col-span-full py-20 text-center tracking-[0.3em] uppercase text-xs text-brand-gray"
              >
                {t("projects.noEntries")}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center justify-center gap-4 mt-20"
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 md:p-3 border border-brand-dark/10 hover:border-brand-blue hover:text-brand-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-full"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`text-[11px] font-bold tracking-[0.16em] transition-all
                    w-auto px-1 py-1
                    md:w-10 md:h-10 md:px-0 md:py-0 md:rounded-full
                    ${
                      currentPage === page
                        ? "text-brand-blue md:bg-brand-blue md:text-white"
                        : "text-brand-gray hover:text-brand-dark md:border md:border-brand-dark/10 md:hover:border-brand-blue"
                    }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 md:p-3 border border-brand-dark/10 hover:border-brand-blue hover:text-brand-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-full"
            >
              <ChevronRight size={16} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
