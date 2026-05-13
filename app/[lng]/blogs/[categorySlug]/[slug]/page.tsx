"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Calendar } from "lucide-react";
import { useT } from "next-i18next/client";
import { localizedHref } from "@/i18n/routes";
import { blogHref, formatBlogDate, blogs } from "@/data/blogs";

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop";

const BlogDetail = () => {
  const params = useParams<{ categorySlug: string; slug: string; lng: string }>();
  const { categorySlug, slug, lng } = params;
  const { t } = useT("common");
  const lang = (lng || "en") as "en" | "vi";
  const [imgLoaded, setImgLoaded] = useState(false);
  const heroImgRef = useRef<HTMLImageElement>(null);



  const currentIndex = useMemo(() => {
    // Try current language first
    let idx = blogs.findIndex(
      (b) => b[lang].categorySlug === categorySlug && b[lang].slug === slug
    );
    // Fallback: try the other language (handles cross-language slug URLs)
    if (idx < 0) {
      const otherLang = lang === "en" ? "vi" : "en";
      idx = blogs.findIndex(
        (b) => b[otherLang].categorySlug === categorySlug && b[otherLang].slug === slug
      );
    }
    return idx;
  }, [blogs, categorySlug, slug, lang]);

  const blog = currentIndex >= 0 ? blogs[currentIndex] : undefined;
  const prevBlog = currentIndex > 0 ? blogs[currentIndex - 1] : null;
  const nextBlog = currentIndex >= 0 && currentIndex < blogs.length - 1 ? blogs[currentIndex + 1] : null;

  // Related: 3 other blogs (same category first, then others)
  const related = useMemo(
    () =>
      blogs
        .filter((b) => b.id !== blog?.id)
        .sort((a, b) => {
          if (a.category === blog?.category && b.category !== blog?.category) return -1;
          if (a.category !== blog?.category && b.category === blog?.category) return 1;
          return 0;
        })
        .slice(0, 3),
    [blogs, blog]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    setImgLoaded(false);
    // After hydration / navigation, the browser may have already loaded the
    // cached image before React attached the onLoad handler. Check on next tick.
    const timer = requestAnimationFrame(() => {
      const img = heroImgRef.current;
      if (img?.complete && img.naturalWidth > 0) {
        setImgLoaded(true);
      }
    });
    return () => cancelAnimationFrame(timer);
  }, [categorySlug, slug]);

  if (!blog)
    return (
      <div className="h-screen flex items-center justify-center uppercase tracking-widest text-brand-gray text-sm">
        {t("blogs.notFound")}
      </div>
    );

  const bd = {
    title: blog[lang].title,
    excerpt: blog[lang].excerpt,
    content: blog[lang].content,
    category: blog[lang].categoryLabel,
  };

  // Simple markdown-to-HTML for ## headings and paragraphs
  const renderContent = (content: string) => {
    return content.split("\n\n").map((block, i) => {
      if (block.startsWith("## ")) {
        return (
          <h2
            key={i}
            className="text-2xl md:text-3xl font-serif mt-12 mb-6 text-brand-dark"
          >
            {block.replace("## ", "")}
          </h2>
        );
      }
      return (
        <p
          key={i}
          className="text-base md:text-lg leading-relaxed text-brand-dark/75 mb-6"
        >
          {block}
        </p>
      );
    });
  };

  return (
    <div className="bg-brand-light text-brand-dark min-h-screen">
      {/* ─── HERO ─── */}
      <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden">
        {/* Back button */}
        <Link
          href={localizedHref("blogs", lng)}
          className="absolute top-32 left-6 md:left-12 lg:left-24 z-20 inline-flex items-center justify-center p-2 gap-2 text-white/75 hover:text-white transition-colors text-[10px] tracking-[0.3em] uppercase font-bold bg-brand-dark/20 backdrop-blur-sm rounded-full px-4"
        >
          <ArrowLeft size={14} />
          {t("navbar.blogs")}
        </Link>

        {/* Hero image */}
        <img
          ref={heroImgRef}
          key={`hero-${categorySlug}-${slug}`}
          src={blog.thumbnail || DEFAULT_IMG}
          alt={bd.title}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => { e.currentTarget.src = DEFAULT_IMG; }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          referrerPolicy="no-referrer"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent" />

        {/* Hero title overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-12 lg:px-24 pb-12 md:pb-20">
          <div className="flex items-center gap-4 mb-4">
            <p className="text-[10px] md:text-[11px] font-bold tracking-[0.32em] uppercase text-white/70">
              {bd.category}
            </p>
            <span className="text-white/30">·</span>
            <p className="text-[10px] md:text-[11px] font-medium tracking-wider text-white/60 flex items-center gap-1.5">
              <Calendar size={11} />
              {formatBlogDate(blog.date, lang)}
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight leading-tight max-w-4xl text-white">
            {bd.title}
          </h1>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-16 md:py-24">
        {/* Excerpt */}
        <p className="text-xl md:text-2xl font-serif leading-relaxed text-brand-dark/80 mb-12 border-l-4 border-brand-blue pl-6">
          {bd.excerpt}
        </p>

        {/* Article content */}
        <article className="prose-custom">
          {renderContent(bd.content)}
        </article>

        {/* Prev / Next navigation */}
        <div className="border-t border-brand-dark/5 mt-16 pt-8 flex gap-8">
          {prevBlog && (
            <Link
              href={blogHref(prevBlog, lang)}
              className="flex-1 group text-left"
            >
              <p className="text-[9px] tracking-[0.35em] uppercase mb-2 text-brand-gray group-hover:text-brand-blue transition-colors">
                ← {t("blogs.previous")}
              </p>
              <p className="text-xs font-bold tracking-wider uppercase transition-colors line-clamp-2 group-hover:text-brand-blue">
                {prevBlog[lang].title}
              </p>
            </Link>
          )}
          {nextBlog && (
            <Link
              href={blogHref(nextBlog, lang)}
              className="flex-1 group text-right"
            >
              <p className="text-[9px] tracking-[0.35em] uppercase mb-2 text-brand-gray group-hover:text-brand-blue transition-colors">
                {t("blogs.next")} →
              </p>
              <p className="text-xs font-bold tracking-wider uppercase transition-colors line-clamp-2 group-hover:text-brand-blue">
                {nextBlog[lang].title}
              </p>
            </Link>
          )}
        </div>
      </div>

      {/* ─── RELATED BLOGS ─── */}
      <div className="border-t border-brand-dark/5 px-6 md:px-12 lg:px-24 py-20 md:py-32 bg-white">
        <p className="text-[10px] font-bold tracking-[0.45em] uppercase mb-12 text-brand-gray">
          {t("blogs.otherBlogs")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          {related.map((b) => {
            const rt = {
              title: b[lang].title,
              category: b[lang].categoryLabel,
            };
            return (
              <div key={b.id} className="group">
                <Link
                  href={blogHref(b, lang)}
                  className="block aspect-[4/3] overflow-hidden relative rounded-xl bg-brand-light shadow-md"
                >
                  <img
                    src={b.thumbnail || DEFAULT_IMG}
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
                  <h4 className="text-lg font-serif tracking-wide leading-snug group-hover:text-brand-blue transition-colors">
                    {rt.title}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>

        {/* View all */}
        <div className="mt-16 text-center">
          <Link
            href={localizedHref("blogs", lng)}
            className="inline-flex items-center gap-4 text-[11px] font-bold tracking-[0.3em] uppercase border-2 border-brand-dark/10 hover:border-brand-blue hover:text-brand-blue transition-all px-10 py-5 group rounded-full"
          >
            {t("blogs.viewAll")}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-2 transition-transform"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
