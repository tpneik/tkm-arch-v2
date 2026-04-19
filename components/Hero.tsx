"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useT } from "next-i18next/client";

export default function Hero() {
  const { t } = useT("common");

  return (
    <section id="home" className="relative h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
          alt="Modern Architecture"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl pt-24 md:pt-0"
        >
          <span className="text-brand-blue uppercase tracking-[0.4em] text-sm font-bold mb-4 block">
            {t("hero.tagline")}
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-serif leading-[0.9] mb-8">
            {t("hero.titlePart1")} <br />
            <span className="italic text-brand-gray">{t("hero.titleHighlight")}</span> {t("hero.titlePart2")}
          </h1>
          <p className="text-white/80 text-lg md:text-xl mb-10 font-light leading-relaxed">
            {t("hero.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#portfolio"
              className="bg-brand-blue text-white px-8 py-4 rounded-full flex items-center justify-center gap-2 font-medium hover:bg-opacity-90 transition-all group"
            >
              {t("hero.viewProjects")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#services"
              className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full flex items-center justify-center font-medium hover:bg-white/20 transition-all"
            >
              {t("hero.ourServices")}
            </a>
          </div>
        </motion.div>
      </div>

      {/* Decorative Element */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 right-12 hidden lg:block"
      >
        <div className="flex items-center gap-4 text-white/40">
          <div className="w-24 h-[1px] bg-white/40"></div>
          <span className="text-xs uppercase tracking-[0.5em]">{t("hero.established")}</span>
        </div>
      </motion.div>
    </section>
  );
}
