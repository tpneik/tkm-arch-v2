"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useT } from "next-i18next/client";
import { socialLinks } from "@/data/socials";
import { motion, useAnimationFrame, useMotionValue } from "motion/react";
import { useRef } from "react";

/* ── Marquee Services Slider ────────────────────────────────── */

function MarqueeServices() {
  const { t } = useT("common");

  const serviceKeys = [
    "footer.architecturalDesign",
    "footer.interiorArchitecture",
    "footer.constructionManagement",
    "footer.landscapeDesign",
  ] as const;

  const x = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);

  useAnimationFrame(() => {
    if (!ref.current) return;
    const halfWidth = ref.current.scrollWidth / 2;
    const next = x.get() - 0.6; // speed
    x.set(next <= -halfWidth ? 0 : next);
  });

  const items = serviceKeys.map((key) => t(key));
  const doubled = [...items, ...items];

  return (
    <div className="w-full border-b border-white/5 py-4 overflow-hidden bg-brand-blue/5 mb-16">
      <motion.div
        ref={ref}
        style={{ x }}
        className="flex whitespace-nowrap gap-20 items-center"
      >
        {doubled.map((service, idx) => (
          <div key={idx} className="flex items-center gap-8 shrink-0">
            <span className="text-[10px] uppercase tracking-[0.4em] font-mono text-brand-blue/80 font-medium">
              {t("footer.servicesTitle")}
            </span>
            <span className="text-sm font-serif italic text-white/70 tracking-wide">
              {service}
            </span>
            <div className="w-1 h-1 bg-brand-blue/40 rounded-full" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Section heading helper ─────────────────────────────────── */

function FooterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold mb-8 text-white/50">
        {title}
      </h4>
      {children}
    </div>
  );
}

/* ── Footer ─────────────────────────────────────────────────── */

export default function Footer() {
  const { t } = useT("common");
  const { lng } = useParams<{ lng: string }>();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-brand-dark text-white pt-24 pb-12 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      {/* Architectural Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white" />
        <div className="absolute top-0 left-0 w-[1px] h-full bg-white" />
        <div className="absolute bottom-0 right-1/4 w-[1px] h-full bg-white" />
        <div className="absolute top-1/3 left-0 w-full h-[1px] bg-white" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Service Marquee Slider */}
        <MarqueeServices />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mb-20">
          {/* Logo & Tagline */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <Image
                src="/logo-thietkemoi.svg"
                alt="ThietKeMoi Architecture"
                width={1024}
                height={360}
                className="h-20 w-auto brightness-0 invert"
              />
            </motion.div>

            <p className="text-white/40 font-light leading-relaxed max-w-xs text-sm">
              {t("footer.tagline")}
            </p>

            {/* Back to Top – desktop only */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-10 hidden md:flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/40 hover:text-brand-blue transition-colors"
            >
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                {/* Arrow Up icon */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5" />
                  <path d="m5 12 7-7 7 7" />
                </svg>
              </div>
              Back to Top
            </motion.button>
          </div>

          {/* Navigation */}
          <FooterSection title={t("footer.explore")}>
            <ul className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm text-white/60 font-light">
              <li>
                <a
                  href={`/${lng}/#home`}
                  className="hover:text-brand-blue transition-colors block py-1"
                >
                  {t("navbar.home")}
                </a>
              </li>
              <li>
                <a
                  href={`/${lng}/about`}
                  className="hover:text-brand-blue transition-colors block py-1"
                >
                  {t("navbar.about")}
                </a>
              </li>
              <li>
                <a
                  href={`/${lng}/#services`}
                  className="hover:text-brand-blue transition-colors block py-1"
                >
                  {t("navbar.services")}
                </a>
              </li>
              <li>
                <a
                  href={`/${lng}/#portfolio`}
                  className="hover:text-brand-blue transition-colors block py-1"
                >
                  {t("portfolio.label")}
                </a>
              </li>
              <li>
                <a
                  href={`/${lng}/careers`}
                  className="hover:text-brand-blue transition-colors block py-1"
                >
                  {t("careers.hero.tagline")}
                </a>
              </li>
              <li>
                <a
                  href={`/${lng}/#contact`}
                  className="hover:text-brand-blue transition-colors block py-1"
                >
                  {t("navbar.contact")}
                </a>
              </li>
            </ul>
          </FooterSection>

          {/* Connect */}
          <FooterSection title={t("footer.connect")}>
            <div className="flex flex-col gap-6 md:gap-8">
              <ul className="space-y-4 text-sm text-white/60 font-light">
                <li>
                  <a
                    href={`mailto:${t("contact.email")}`}
                    className="hover:text-brand-blue transition-colors lowercase tracking-wider"
                  >
                    {t("contact.email")}
                  </a>
                </li>
                <li className="text-xs uppercase tracking-widest font-mono">
                  {t("contact.phone")}
                </li>
              </ul>

              <div className="flex gap-5">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    whileHover={{ y: -3 }}
                    className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/30 hover:text-brand-blue hover:border-brand-blue/30 transition-colors"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox={social.viewBox || "0 0 24 24"}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      dangerouslySetInnerHTML={{ __html: social.icon }}
                    />
                  </motion.a>
                ))}
              </div>
            </div>
          </FooterSection>
        </div>

        {/* Gradient Blueprint Line */}
        <div className="w-full h-[1px] bg-gradient-to-r from-white/5 via-white/20 to-white/5 mb-10" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] font-medium">
              {t("footer.copyright")}
            </p>
            <p className="text-white/10 text-[8px] uppercase tracking-[0.4em] md:hidden">
              {t("footer.location")}
            </p>
          </div>

          <div className="flex gap-10 text-white/20 text-[10px] uppercase tracking-widest font-bold">
            <a
              href="#"
              className="hover:text-white transition-colors relative group"
            >
              {t("footer.privacyPolicy")}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-blue transition-all group-hover:w-full" />
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors relative group"
            >
              {t("footer.termsOfService")}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-blue transition-all group-hover:w-full" />
            </a>

            {/* Back to Top – mobile only */}
            <motion.button
              onClick={scrollToTop}
              className="md:hidden text-brand-blue flex items-center gap-2"
            >
              UP
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Floating Decorative Glow */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
    </footer>
  );
}
