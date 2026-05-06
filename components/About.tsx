"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
  AnimatePresence,
} from "motion/react";
import React, { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useT } from "next-i18next/client";
import { useIsMobile, useIsTablet } from "@/hooks/useMediaQuery";
import { localizedHref } from "@/i18n/routes";


/* ─── 3D Tilt Card ─── */
function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const isMobile = useIsMobile();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const springConfig = { damping: 20, stiffness: 200 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (isMobile) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        rotateX: springRotateX,
        rotateY: springRotateY,
      }}
      className={`relative transform-gpu ${className}`}
    >
      {children}
    </motion.div>
  );
}



/* ─── Service slider images (shared, not translated) ─── */
const SERVICE_IMAGES = [
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
  "https://pub-3ab4be4721d74fc9b1b1e7de44e65381.r2.dev/TKM/CONGTRINH/VILLA/VILLA%20KOSH%20RONG/11_7%20-%20Photo.jpg",
  "https://pub-3ab4be4721d74fc9b1b1e7de44e65381.r2.dev/TKM/CONGTRINH/NHA%20PHO/KHACH%20SAN%20CAM/02.jpg",
  "https://pub-3ab4be4721d74fc9b1b1e7de44e65381.r2.dev/TKM/CONGTRINH/NOI%20THAT/VCB%20QUAN%201/1.jpg",
];

export default function About() {
  const storyRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { lng } = useParams<{ lng: string }>();
  const { t } = useT("common");

  /* ── Read services from locale ── */
  const servicesRaw = t("about.services.items", { returnObjects: true });
  const services: { id: string; title: string; brief: string; scopes: string[] }[] =
    Array.isArray(servicesRaw) ? servicesRaw : [];

  /* ── Read team from locale ── */
  const teamRaw = t("about.team.members", { returnObjects: true });
  const team: { name: string; role: string; image: string }[] =
    Array.isArray(teamRaw) ? teamRaw : [];


  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % services.length);
  };
  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
  };

  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start end", "end start"],
  });

  const storyImgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const storyImgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.1, 1]);

  return (
    <div className="bg-white overflow-hidden">
      {/* ─── HERO ─── */}
      <section className="relative py-24 md:py-32 bg-brand-light overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="text-brand-blue uppercase tracking-[0.3em] text-xs font-bold mb-6 block italic">
              {t("about.hero.tagline")}
            </span>
            <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">
              {t("about.hero.titleLine1")} <br />
              <span className="italic text-brand-gray">
                {t("about.hero.titleLine2")}
              </span>
            </h1>
          </motion.div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-20 right-[10%] w-64 h-64 border border-brand-blue/10 rounded-full rotate-45 animate-[spin_20s_linear_infinite] pointer-events-none" />
        <div className="absolute bottom-10 left-[5%] w-32 h-32 border border-brand-blue/20 rotate-[15deg] animate-[bounce_10s_ease-in-out_infinite] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `linear-gradient(to right, #1A1A1A 1px, transparent 1px), linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)`,
              backgroundSize: `100px 100px`,
            }}
          />
        </div>
      </section>

      {/* ─── STORY & STATS ─── */}
      <section
        ref={storyRef}
        className="section-padding grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-8 text-lg font-light leading-relaxed text-gray-600">
            <p>{t("about.story.p1")}</p>
            <p>{t("about.story.p2")}</p>
            <p>{t("about.story.p3")}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-16">
            <div className="border-l-2 border-brand-blue pl-6">
              <span className="block text-4xl font-serif font-bold text-brand-dark mb-2">
                {t("about.stats.years")}
              </span>
              <span className="text-xs uppercase tracking-widest text-brand-gray font-bold">
                {t("about.stats.yearsLabel")}
              </span>
            </div>
            <div className="border-l-2 border-brand-blue pl-6">
              <span className="block text-4xl font-serif font-bold text-brand-dark mb-2">
                {t("about.stats.projectsDone")}
              </span>
              <span className="text-xs uppercase tracking-widest text-brand-gray font-bold">
                {t("about.stats.projectsLabel")}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ y: storyImgY, scale: storyImgScale }}
          className="relative aspect-square md:aspect-video lg:aspect-square overflow-hidden rounded-2xl"
        >
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
            alt="Studio Environment"
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/20 to-transparent pointer-events-none" />
        </motion.div>
      </section>

      {/* ─── SERVICE SLIDER ─── */}
      {services.length > 0 && (
        <section className="relative h-screen min-h-[700px] bg-brand-dark overflow-hidden flex flex-col">
          {/* Background image */}
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.4, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-0"
            >
              <img
                src={SERVICE_IMAGES[currentSlide % SERVICE_IMAGES.length]}
                alt=""
                className="w-full h-full object-cover filter grayscale brightness-50"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>

          {/* Blueprint grid */}
          <div className="absolute inset-0 z-10 opacity-[0.05] pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                backgroundSize: "100px 100px",
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex-1 flex flex-col justify-center relative z-20">
            <div className="mb-12">
              <motion.span
                key={`id-${currentSlide}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 0.4 }}
                className="text-white uppercase tracking-[0.5em] text-xs font-bold block"
              >
                {t("about.services.sectionLabel")} / {services[currentSlide].id}
              </motion.span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
              <div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 30, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "circOut" }}
                  >
                    <h2 className="text-5xl md:text-8xl font-serif text-white tracking-tighter leading-[0.9] mb-8 uppercase">
                      {services[currentSlide].title
                        .split(" ")
                        .map((word: string, i: number) => (
                          <span
                            key={i}
                            className="block last:italic last:text-brand-blue"
                          >
                            {word}
                          </span>
                        ))}
                    </h2>
                    <p className="text-white/60 text-lg md:text-xl font-light max-w-md leading-relaxed mb-12">
                      {services[currentSlide].brief}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex flex-col gap-6 items-start lg:items-end">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="space-y-4 text-right hidden md:block"
                  >
                    {services[currentSlide].scopes.map(
                      (item: string, i: number) => (
                        <div key={i} className="flex items-center gap-4 justify-end">
                          <span className="text-white/30 text-[10px] uppercase tracking-widest font-bold">
                            Scope_{i + 1}
                          </span>
                          <span className="text-white/80 text-sm md:text-md font-light uppercase tracking-widest">
                            {item}
                          </span>
                        </div>
                      )
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Mobile items */}
                <div className="md:hidden space-y-3">
                  {services[currentSlide].scopes.map(
                    (item: string, i: number) => (
                      <span
                        key={i}
                        className="text-white/50 text-xs block uppercase tracking-widest"
                      >
                        • {item}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="border-t border-white/10 py-10 relative z-30">
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={prevSlide}
                  className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                >
                  <div className="w-12 h-[1px] bg-white/10 group-hover:bg-brand-blue group-hover:w-16 transition-all" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">
                    {t("about.services.prev")}
                  </span>
                </button>
                <button
                  onClick={nextSlide}
                  className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                >
                  <span className="text-[10px] uppercase font-bold tracking-widest">
                    {t("about.services.next")}
                  </span>
                  <div className="w-12 h-[1px] bg-white/10 group-hover:bg-brand-blue group-hover:w-16 transition-all" />
                </button>
              </div>

              {/* Pagination dials */}
              <div className="hidden sm:flex items-center gap-4">
                {services.map((_: unknown, i: number) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDirection(i > currentSlide ? 1 : -1);
                      setCurrentSlide(i);
                    }}
                    className="relative h-12 w-8 group focus:outline-none"
                  >
                    <motion.span
                      animate={{
                        height: currentSlide === i ? "100%" : "20%",
                        backgroundColor:
                          currentSlide === i
                            ? "#2F7FB3"
                            : "rgba(255,255,255,0.2)",
                      }}
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] transition-all"
                    />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/20 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      0{i + 1}
                    </span>
                  </button>
                ))}
              </div>

              <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em]">
                {t("about.services.catalogLabel")}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── TEAM MARQUEE ─── */}
      <section className="section-padding bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <span className="text-brand-blue uppercase tracking-[0.3em] text-xs font-bold mb-4 block">
              {t("about.team.label")}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif">
              {t("about.team.title")}
            </h2>
          </div>
        </div>

        {/* Infinite marquee viewport — responsive edge masking */}
        <div
          className={`relative w-full mx-auto group/marquee ${
            isMobile ? "max-w-[88vw]" : isTablet ? "max-w-[85vw]" : "max-w-[60vw]"
          }`}
          style={{
            maskImage: isMobile
              ? "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)"
              : "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 3%, rgba(0,0,0,0.4) 8%, black 14%, black 86%, rgba(0,0,0,0.4) 92%, rgba(0,0,0,0.05) 97%, transparent 100%)",
            WebkitMaskImage: isMobile
              ? "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)"
              : "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 3%, rgba(0,0,0,0.4) 8%, black 14%, black 86%, rgba(0,0,0,0.4) 92%, rgba(0,0,0,0.05) 97%, transparent 100%)",
          }}
        >
          <div
            className={`flex w-max group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none ${
              isMobile
                ? "gap-5 animate-[teamMarquee_20s_linear_infinite]"
                : isTablet
                  ? "gap-6 animate-[teamMarquee_22s_linear_infinite]"
                  : "gap-8 animate-[teamMarquee_25s_linear_infinite]"
            }`}
          >
            {/* Render team twice for seamless loop */}
            {[...team, ...team].map((member, i) => (
              <div
                key={`${member.name}-${i}`}
                className="flex-shrink-0"
                style={{
                  width: isMobile
                    ? "70vw"
                    : isTablet
                      ? "calc((85vw - 1 * 1.5rem) / 2)"
                      : "calc((60vw - 3 * 2rem) / 4)",
                }}
              >
                <div className="group cursor-pointer">
                  <div className={`relative overflow-hidden aspect-[3/4] bg-gray-100 shadow-lg shadow-brand-dark/5 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-brand-dark/10 ${
                    isMobile ? "mb-4 rounded-xl" : "mb-6 rounded-2xl"
                  }`}>
                    <img
                      src={member.image}
                      alt={member.name}
                      className={`w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105 ${
                        isMobile
                          ? "grayscale-0"
                          : "grayscale group-hover:grayscale-0"
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-brand-dark/50 via-brand-dark/5 to-transparent transition-opacity duration-500 ${
                        isMobile
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    />
                    {/* Name overlay on hover */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 p-5 transition-all duration-500 ${
                        isMobile
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                      }`}
                    >
                      <h3 className={`font-serif text-white mb-1 drop-shadow-lg ${isMobile ? "text-lg" : "text-xl"}`}>
                        {member.name}
                      </h3>
                      <p className="text-white/80 uppercase tracking-widest text-[10px] font-bold drop-shadow-lg">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  {/* Name below card (always visible) */}
                  <div className="text-center px-1">
                    <h3 className={`font-serif mb-1 transition-colors duration-300 group-hover:text-brand-blue/80 ${isMobile ? "text-base" : "text-lg md:text-xl"}`}>{member.name}</h3>
                    <p className={`text-brand-blue uppercase tracking-widest font-bold ${isMobile ? "text-[9px]" : "text-[10px]"}`}>
                      {member.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 bg-brand-light relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-serif mb-12">
            {t("about.cta.titlePart1")}{" "}
            <span className="italic">{t("about.cta.titleHighlight")}</span>{" "}
            {t("about.cta.titlePart2")}
          </h2>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <a
              href={`/${lng}/#contact`}
              className="bg-brand-blue text-white px-16 py-6 rounded-full font-bold text-lg inline-block hover:shadow-2xl hover:shadow-brand-blue/40 transition-all border border-brand-blue"
            >
              {t("about.cta.button")}
            </a>
          </motion.div>
        </div>
        {/* Decorative corner elements */}
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <div className="w-64 h-64 border-r border-t border-brand-dark" />
        </div>
        <div className="absolute bottom-0 left-0 p-10 opacity-5">
          <div className="w-64 h-64 border-l border-b border-brand-dark" />
        </div>
      </section>
    </div>
  );
}
