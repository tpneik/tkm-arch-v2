"use client";

import { useParams } from "next/navigation";
import { useT } from "next-i18next/client";

export default function Footer() {
  const { t } = useT("common");
  const { lng } = useParams<{ lng: string }>();

  return (
    <footer className="bg-brand-dark text-white pt-20 pb-10 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="lg:col-span-1">
            <div className="flex flex-col mb-6">
              <span className="text-2xl font-serif font-bold tracking-tighter text-brand-blue leading-none">
                THIETKEMOI
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gray font-medium">
                Architecture
              </span>
            </div>
            <p className="text-white/40 font-light leading-relaxed">
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
            <ul className="space-y-4 text-white/60 font-light">
              <li><a href="#" className="hover:text-brand-blue transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-brand-blue transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-brand-blue transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-brand-blue transition-colors">Twitter</a></li>
            </ul>
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
