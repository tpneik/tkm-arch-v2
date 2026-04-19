"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "next-i18next/client";
import { localizedHref } from "@/i18n/routes";
import { projects, categories, projectHref } from "@/data/projects";

const ITEMS_PER_PAGE = 6;
const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";

const ProjectsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lng } = useParams<{ lng: string }>();
  const { t } = useT("common");
  const lang = (lng || "en") as "en" | "vi";

  const filter = searchParams.get("filter") || "all";
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProjects = useMemo(
    () =>
      filter === "all"
        ? projects
        : projects.filter(
            (p) =>
              p.category.toLowerCase().replace(/\s+/g, "-") ===
              filter.toLowerCase()
          ),
    [filter]
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

  const handleFilter = (cat: string) => {
    setCurrentPage(1);
    const base = localizedHref("projects", lng);
    if (cat === "All") router.push(base);
    else
      router.push(
        `${base}?filter=${cat.toLowerCase().replace(/\s+/g, "-")}`
      );
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-brand-light text-brand-dark">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <h1 className="text-4xl md:text-5xl font-serif mb-8 md:mb-14 uppercase tracking-wider">
          {t("projects.pageTitle")}
        </h1>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-x-6 md:gap-x-10 gap-y-4 mb-8 md:mb-14 pb-7 md:pb-9 border-b border-brand-dark/10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilter(cat)}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer ${
                filter === cat.toLowerCase().replace(/\s+/g, "-") ||
                (filter === "all" && cat === "All")
                  ? "text-brand-blue border-b-2 border-brand-blue pb-2"
                  : "text-brand-gray hover:text-brand-dark"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedProjects.map((project) => (
            <Link
              href={projectHref(project, lang)}
              key={project.id}
              className="group flex flex-col"
            >
              <div className="overflow-hidden aspect-[3/2] relative mb-6 rounded-lg bg-white shadow-sm border border-brand-dark/5">
                <motion.img
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                  src={project.thumbnail || DEFAULT_IMG}
                  alt={project[lang].title}
                  onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand-dark/35 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
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
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-20 text-center tracking-[0.3em] uppercase text-xs text-brand-gray">
              {t("projects.noEntries")}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-20">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-3 border border-brand-dark/10 hover:border-brand-blue hover:text-brand-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-full"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 text-[11px] font-bold tracking-[0.16em] transition-all rounded-full ${
                    currentPage === page
                      ? "bg-brand-blue text-white"
                      : "border border-brand-dark/10 hover:border-brand-blue text-brand-gray hover:text-brand-dark"
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
              className="p-3 border border-brand-dark/10 hover:border-brand-blue hover:text-brand-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-full"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
