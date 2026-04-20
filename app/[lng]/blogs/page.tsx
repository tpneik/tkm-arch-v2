"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useT } from "next-i18next/client";
import { localizedHref } from "@/i18n/routes";
import { blogs, blogCategories, blogHref, formatBlogDate } from "@/data/blogs";

const ITEMS_PER_PAGE = 6;
const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";

const BlogsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lng } = useParams<{ lng: string }>();
  const { t } = useT("common");
  const lang = (lng || "en") as "en" | "vi";

  const filter = searchParams.get("filter") || "all";
  const [currentPage, setCurrentPage] = useState(1);

  const filteredBlogs = useMemo(
    () =>
      filter === "all"
        ? blogs
        : blogs.filter(
            (b) =>
              b.category.toLowerCase().replace(/\s+/g, "-") ===
              filter.toLowerCase()
          ),
    [filter]
  );

  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
  const paginatedBlogs = useMemo(
    () =>
      filteredBlogs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredBlogs, currentPage]
  );

  const handleFilter = (cat: string) => {
    setCurrentPage(1);
    const base = localizedHref("blogs", lng);
    if (cat === "All") router.push(base);
    else
      router.push(
        `${base}?filter=${cat.toLowerCase().replace(/\s+/g, "-")}`
      );
  };

  // Build localized category list
  const localizedCategories = useMemo(() => {
    const map = new Map<string, string>();
    blogs.forEach((b) => {
      if (!map.has(b.category)) {
        map.set(b.category, b[lang].categoryLabel);
      }
    });
    return [
      { key: "All", label: t("blogs.allFilter") ?? "All" },
      ...Array.from(map, ([key, label]) => ({ key, label })),
    ];
  }, [lang, t]);

  return (
    <div className="pt-32 pb-20 min-h-screen bg-brand-light text-brand-dark">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <h1 className="text-4xl md:text-5xl font-serif mb-8 md:mb-14 uppercase tracking-wider">
          {t("blogs.pageTitle")}
        </h1>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-x-6 md:gap-x-10 gap-y-4 mb-8 md:mb-14 pb-7 md:pb-9 border-b border-brand-dark/10">
          {localizedCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleFilter(cat.key)}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer ${
                filter === cat.key.toLowerCase().replace(/\s+/g, "-") ||
                (filter === "all" && cat.key === "All")
                  ? "text-brand-blue border-b-2 border-brand-blue pb-2"
                  : "text-brand-gray hover:text-brand-dark"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedBlogs.map((blog) => (
            <Link
              href={blogHref(blog, lang)}
              key={blog.id}
              className="group flex flex-col"
            >
              <div className="overflow-hidden aspect-[3/2] relative mb-6 rounded-lg bg-white shadow-sm border border-brand-dark/5">
                <motion.img
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                  src={blog.thumbnail || DEFAULT_IMG}
                  alt={blog[lang].title}
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
                <div className="flex items-center gap-3">
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-blue">
                    {blog[lang].categoryLabel}
                  </p>
                  <span className="text-brand-dark/20">·</span>
                  <p className="text-[10px] font-medium tracking-wider text-brand-gray flex items-center gap-1.5">
                    <Calendar size={10} />
                    {formatBlogDate(blog.date, lang)}
                  </p>
                </div>
                <h3 className="text-xl font-serif tracking-wide leading-tight group-hover:text-brand-blue transition-colors">
                  {blog[lang].title}
                </h3>
                <p className="text-sm text-brand-dark/60 leading-relaxed line-clamp-2">
                  {blog[lang].excerpt}
                </p>
              </div>
            </Link>
          ))}
          {filteredBlogs.length === 0 && (
            <div className="col-span-full py-20 text-center tracking-[0.3em] uppercase text-xs text-brand-gray">
              {t("blogs.noEntries")}
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

export default BlogsPage;
