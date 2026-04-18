"use client";

import { motion, AnimatePresence } from "motion/react";
import React, { useState, useRef } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  GraduationCap,
  ChevronDown,
  Upload,
  Send,
  CheckCircle2,
  Award,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useT } from "next-i18next/client";
import { jobs } from "@/data/jobs";

export default function Careers() {
  const [expandedJob, setExpandedJob] = useState<string | null>(
    jobs[0]?.id ?? null
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { lng } = useParams<{ lng: string }>();
  const { t } = useT("common");
  const lang = (lng || "en") as "en" | "vi";

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative py-24 bg-brand-light overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-brand-blue uppercase tracking-[0.4em] text-xs font-bold mb-6 block italic">
              {t("careers.hero.tagline")}
            </span>
            <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight text-brand-dark">
              {t("careers.hero.titlePart1")}{" "}
              <span className="italic text-brand-gray">
                {t("careers.hero.titleHighlight")}
              </span>
            </h1>
            <div className="max-w-3xl mx-auto space-y-6 text-gray-500 font-light leading-relaxed">
              <p>{t("careers.hero.p1")}</p>
              <p>{t("careers.hero.p2")}</p>
            </div>
          </motion.div>
        </div>

        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)`,
              backgroundSize: `80px 80px`,
            }}
          />
        </div>
      </section>

      {/* ─── JOB OPENINGS ─── */}
      <section className="py-24 max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-brand-dark mb-4">
            {t("careers.jobs.title")}
          </h2>
          <div className="h-1 w-20 bg-brand-blue" />
        </div>

        <div className="space-y-6">
          {jobs.map((job) => {
            const jl = job[lang];
            return (
              <motion.div
                key={job.id}
                layout
                className={`border border-gray-100 rounded-2xl overflow-hidden transition-all duration-500 ${
                  expandedJob === job.id
                    ? "shadow-2xl shadow-brand-dark/5 ring-1 ring-brand-blue/20"
                    : "hover:border-brand-blue/30"
                }`}
              >
                {/* Job header (clickable) */}
                <div
                  onClick={() =>
                    setExpandedJob(expandedJob === job.id ? null : job.id)
                  }
                  className="p-8 md:p-10 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <span className="text-gray-400 text-xs tracking-widest uppercase">
                      {job.date}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-serif text-brand-dark">
                      {jl.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Briefcase className="w-4 h-4 text-brand-blue/60" />
                      <span>{jl.experience}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 text-brand-blue/60" />
                      <span>{jl.location}</span>
                    </div>
                    <motion.div
                      animate={{
                        rotate: expandedJob === job.id ? 180 : 0,
                      }}
                      className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand-blue"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </div>
                </div>

                {/* Expandable detail */}
                <AnimatePresence>
                  {expandedJob === job.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.5,
                        ease: [0.04, 0.62, 0.23, 0.98],
                      }}
                    >
                      <div className="p-8 md:p-10 pt-0 border-t border-gray-50 bg-gray-50/30">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                          {/* Highlights sidebar */}
                          <div className="lg:col-span-1 space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-start gap-4">
                              <Clock className="w-5 h-5 text-brand-blue mt-1" />
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">
                                  {t("careers.jobs.workingTime")}
                                </p>
                                <p className="text-brand-dark text-sm">
                                  {jl.workingTime}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <GraduationCap className="w-5 h-5 text-brand-blue mt-1" />
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">
                                  {t("careers.jobs.education")}
                                </p>
                                <p className="text-brand-dark text-sm">
                                  {jl.education}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <Award className="w-5 h-5 text-brand-blue mt-1" />
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">
                                  {t("careers.jobs.experienceLabel")}
                                </p>
                                <p className="text-brand-dark text-sm">
                                  {jl.experience}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={scrollToForm}
                              className="w-full py-4 bg-brand-dark text-white rounded-lg text-sm font-bold tracking-widest uppercase hover:bg-brand-blue transition-colors"
                            >
                              {t("careers.jobs.applyNow")}
                            </button>
                          </div>

                          {/* Description */}
                          <div className="lg:col-span-2 space-y-6">
                            <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-brand-blue">
                              {t("careers.jobs.description")}
                            </h4>
                            <ul className="space-y-4">
                              {jl.description.map(
                                (item: string, idx: number) => (
                                  <li key={idx} className="flex gap-4 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue/30 group-hover:bg-brand-blue transition-colors mt-2 flex-shrink-0" />
                                    <span className="text-gray-600 font-light leading-relaxed text-sm">
                                      {item}
                                    </span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── APPLICATION FORM ─── */}
      <section ref={formRef} className="py-24 bg-brand-light relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-5xl font-serif text-brand-dark mb-4 uppercase tracking-tighter">
              {t("careers.form.title")}
            </h2>
            <p className="text-gray-400 text-sm italic font-light">
              {t("careers.form.subtitle")}
            </p>
          </div>

          {!isSubmitted ? (
            <form
              onSubmit={handleSubmit}
              className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-brand-dark/5 space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Position */}
                <div className="relative group">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-brand-blue block mb-2">
                    {t("careers.form.position")} *
                  </label>
                  <select
                    required
                    className="w-full bg-transparent border-b border-gray-200 py-3 focus:border-brand-blue outline-none transition-colors appearance-none text-brand-dark"
                  >
                    <option value="">
                      {t("careers.form.positionPlaceholder")}
                    </option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job[lang].title}>
                        {job[lang].title}
                      </option>
                    ))}
                    <option value="Other">
                      {t("careers.form.positionOther")}
                    </option>
                  </select>
                  <ChevronDown className="absolute right-0 bottom-4 w-4 h-4 text-gray-300 pointer-events-none" />
                </div>

                {/* Address */}
                <div className="relative group">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-brand-blue block mb-2">
                    {t("careers.form.address")} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("careers.form.addressPlaceholder")}
                    className="w-full bg-transparent border-b border-gray-200 py-3 focus:border-brand-blue outline-none transition-colors placeholder:text-gray-300 text-brand-dark"
                  />
                </div>

                {/* Full Name */}
                <div className="relative group">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-brand-blue block mb-2">
                    {t("careers.form.fullName")} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("careers.form.fullNamePlaceholder")}
                    className="w-full bg-transparent border-b border-gray-200 py-3 focus:border-brand-blue outline-none transition-colors placeholder:text-gray-300 text-brand-dark"
                  />
                </div>

                {/* Email */}
                <div className="relative group">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-brand-blue block mb-2">
                    {t("careers.form.email")} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={t("careers.form.emailPlaceholder")}
                    className="w-full bg-transparent border-b border-gray-200 py-3 focus:border-brand-blue outline-none transition-colors placeholder:text-gray-300 text-brand-dark"
                  />
                </div>

                {/* Phone */}
                <div className="relative group">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-brand-blue block mb-2">
                    {t("careers.form.phone")} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={t("careers.form.phonePlaceholder")}
                    className="w-full bg-transparent border-b border-gray-200 py-3 focus:border-brand-blue outline-none transition-colors placeholder:text-gray-300 text-brand-dark"
                  />
                </div>

                {/* Message */}
                <div className="relative group md:col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-brand-blue block mb-2">
                    {t("careers.form.message")} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={t("careers.form.messagePlaceholder")}
                    className="w-full bg-transparent border-b border-gray-200 py-3 focus:border-brand-blue outline-none transition-colors placeholder:text-gray-300 text-brand-dark resize-none"
                  />
                </div>
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">
                    {t("careers.form.file1Label")}
                  </p>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl p-6 hover:border-brand-blue/40 transition-all cursor-pointer bg-gray-50/50 group">
                    <Upload className="w-8 h-8 text-gray-300 group-hover:text-brand-blue mb-2 transition-colors" />
                    <span className="text-xs text-gray-500 font-medium">
                      {t("careers.form.selectFile")}
                    </span>
                    <span className="text-[10px] text-gray-300 mt-1 uppercase">
                      {t("careers.form.fileHint")}
                    </span>
                    <input type="file" className="hidden" />
                  </label>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">
                    {t("careers.form.file2Label")}
                  </p>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl p-6 hover:border-brand-blue/40 transition-all cursor-pointer bg-gray-50/50 group">
                    <Upload className="w-8 h-8 text-gray-300 group-hover:text-brand-blue mb-2 transition-colors" />
                    <span className="text-xs text-gray-500 font-medium">
                      {t("careers.form.selectFile")}
                    </span>
                    <span className="text-[10px] text-gray-300 mt-1 uppercase">
                      {t("careers.form.fileHint")}
                    </span>
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>

              <div className="pt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full md:w-auto px-16 py-6 bg-brand-dark text-white rounded-full font-bold flex items-center justify-center gap-3 hover:bg-brand-blue transition-all shadow-xl shadow-brand-dark/10"
                >
                  <Send className="w-5 h-5" />
                  <span>{t("careers.form.submit")}</span>
                </motion.button>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 md:p-20 rounded-3xl text-center space-y-6"
            >
              <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-10 h-10 text-brand-blue" />
              </div>
              <h3 className="text-3xl font-serif text-brand-dark italic">
                {t("careers.success.title")}
              </h3>
              <p className="text-gray-500 font-light max-w-sm mx-auto">
                {t("careers.success.message")}
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-brand-blue font-bold tracking-widest text-xs uppercase pt-8 hover:underline"
              >
                {t("careers.success.submitAnother")}
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
