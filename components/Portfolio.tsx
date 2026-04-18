"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useT } from "next-i18next/client";
import { localizedHref } from "@/i18n/routes";
import { projects, projectHref } from "@/data/projects";

export default function Portfolio() {
  const { t } = useT("common");
  const { lng } = useParams<{ lng: string }>();
  const lang = (lng || "en") as "en" | "vi";

  // Show only first 6 projects on home page
  const featuredProjects = projects.slice(0, 6);

  return (
    <section id="portfolio" className="section-padding bg-brand-light">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-brand-blue uppercase tracking-[0.3em] text-xs font-bold mb-4 block">
            {t("portfolio.label")}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif">{t("portfolio.title")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {featuredProjects.map((project, index) => (
            <Link
              href={projectHref(project, lang)}
              key={project.id}
              className="relative group overflow-hidden aspect-[4/5]"
            >
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="w-full h-full"
              >
                <img
                  src={project.thumbnail}
                  alt={project[lang].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/60 transition-all duration-500 flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100">
                  <span className="text-brand-blue text-xs uppercase tracking-widest mb-2 font-bold">
                    {project[lang].categoryLabel}
                  </span>
                  <h3 className="text-2xl text-white font-serif">{project[lang].title}</h3>
                  <div className="w-12 h-[1px] bg-brand-blue mt-4 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                </div>
              </motion.div>
            </Link>
          ))}
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
