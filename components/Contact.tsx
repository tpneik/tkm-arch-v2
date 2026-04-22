"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, Mail, MapPin, Send, ArrowLeft } from "lucide-react";
import { useT } from "next-i18next/client";
import Image from "next/image";

export default function Contact() {
  const { t } = useT("common");
  const [showForm, setShowForm] = useState(false);

  return (
    <section id="contact" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 lg:gap-20">
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

          {/* Right column: Image card ↔ Google Form toggle */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl md:rounded-3xl overflow-hidden relative min-h-[320px] sm:min-h-[400px] md:min-h-[500px]"
          >
            <AnimatePresence mode="wait">
              {!showForm ? (
                /* ── Image Card with CTA button ────────────── */
                <motion.div
                  key="image-card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35 }}
                  className="relative w-full h-full min-h-[320px] sm:min-h-[400px] md:min-h-[500px]"
                >
                  <Image
                    src="/service1.jpg"
                    alt="Contact TKM Architecture"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Content over image */}
                  <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 md:p-12">
                    <p className="hidden sm:block text-white/80 font-light text-sm mb-6 max-w-sm leading-relaxed">
                      {t("contact.description")}
                    </p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="group flex items-center gap-2 sm:gap-3 bg-brand-blue text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-brand-blue/90 active:scale-95 transition-all w-fit"
                    >
                      {t("contact.sendMessage")}
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* ── Google Form ────────────────────────────── */
                <motion.div
                  key="google-form"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="bg-brand-light w-full"
                >
                  {/* Back button */}
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-brand-blue hover:text-brand-blue/70 active:scale-95 transition-all px-4 sm:px-6 pt-4 sm:pt-5 pb-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t("projectDetail.previous")}
                  </button>

                  <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLScjqkeoVgkbaGcO8LLJ20phx2amdLZZupxFCQ--sc_XbA8s0g/viewform?embedded=true"
                    width="100%"
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    className="w-full border-0 h-[1300px] sm:h-[1200px] md:h-[1100px]"
                    title="Contact Form"
                    loading="lazy"
                  >
                    Đang tải…
                  </iframe>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
