"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { useT } from "next-i18next/client";
import { socialLinks } from "@/data/socials";

export default function Footer() {
  const { t } = useT("common");
  const { lng } = useParams<{ lng: string }>();

  return (
    <footer className="bg-brand-dark text-white pt-20 pb-10 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Image
                src="/logo-thietkemoi.svg"
                alt="ThietKeMoi Architecture"
                width={1024}
                height={360}
                className="h-20 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-lg font-serif italic text-white/50 leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest font-bold mb-6">{t("footer.explore")}</h4>
            <ul className="space-y-4 text-white/60 font-light">
              <li><a href={`/${lng}/#home`} className="hover:text-brand-blue transition-colors">{t("navbar.home")}</a></li>
              <li><a href={`/${lng}/#services`} className="hover:text-brand-blue transition-colors">{t("navbar.services")}</a></li>
              <li><a href={`/${lng}/#portfolio`} className="hover:text-brand-blue transition-colors">{t("portfolio.label")}</a></li>
              <li><a href={`/${lng}/#contact`} className="hover:text-brand-blue transition-colors">{t("navbar.contact")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest font-bold mb-6">{t("footer.servicesTitle")}</h4>
            <ul className="space-y-4 text-white/60 font-light">
              <li>{t("footer.architecturalDesign")}</li>
              <li>{t("footer.interiorArchitecture")}</li>
              <li>{t("footer.constructionManagement")}</li>
              <li>{t("footer.landscapeDesign")}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest font-bold mb-6">{t("footer.connect")}</h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-brand-blue hover:border-brand-blue transition-all hover:scale-110"
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
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/20 text-xs uppercase tracking-widest">
            {t("footer.copyright")}
          </p>
          <div className="flex gap-8 text-white/20 text-xs uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">{t("footer.privacyPolicy")}</a>
            <a href="#" className="hover:text-white transition-colors">{t("footer.termsOfService")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
