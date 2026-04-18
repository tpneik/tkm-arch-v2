"use client";
import { motion } from "motion/react";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { useT } from "next-i18next/client";

export default function Contact() {
  const { t } = useT("common");

  return (
    <section id="contact" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <span className="text-brand-blue uppercase tracking-[0.3em] text-xs font-bold mb-4 block">
              {t("contact.label")}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif mb-8">
              {t("contact.titlePart1")} <br />
              <span className="italic text-brand-gray">{t("contact.titleHighlight")}</span> {t("contact.titlePart2")}
            </h2>
            <p className="text-gray-500 text-lg font-light mb-12 leading-relaxed">
              {t("contact.description")}
            </p>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-brand-light flex items-center justify-center rounded-full shrink-0">
                  <MapPin className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest mb-1">{t("contact.ourStudio")}</h4>
                  <p className="text-gray-500 font-light whitespace-pre-line">{t("contact.studioAddress")}</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-brand-light flex items-center justify-center rounded-full shrink-0">
                  <Phone className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest mb-1">{t("contact.callUs")}</h4>
                  <p className="text-gray-500 font-light">{t("contact.phone")}</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-brand-light flex items-center justify-center rounded-full shrink-0">
                  <Mail className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-widest mb-1">{t("contact.emailUs")}</h4>
                  <p className="text-gray-500 font-light">{t("contact.email")}</p>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-brand-light p-8 md:p-12 rounded-3xl"
          >
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold">{t("contact.fullName")}</label>
                  <input
                    type="text"
                    placeholder={t("contact.namePlaceholder")}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold">{t("contact.emailAddress")}</label>
                  <input
                    type="email"
                    placeholder={t("contact.emailPlaceholder")}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold">{t("contact.subject")}</label>
                <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors">
                  <option>{t("contact.subjectResidential")}</option>
                  <option>{t("contact.subjectCommercial")}</option>
                  <option>{t("contact.subjectInterior")}</option>
                  <option>{t("contact.subjectOther")}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold">{t("contact.message")}</label>
                <textarea
                  rows={5}
                  placeholder={t("contact.messagePlaceholder")}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-blue transition-colors resize-none"
                ></textarea>
              </div>
              <button className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all">
                {t("contact.sendMessage")}
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
