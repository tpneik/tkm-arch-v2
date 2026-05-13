import { dir } from "i18next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import { initServerI18next, getT, getResources, generateI18nStaticParams } from "next-i18next/server";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import { I18nProvider } from "next-i18next/client";
import i18nConfig from "../../i18n.config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

initServerI18next(i18nConfig);

export async function generateStaticParams() {
  return generateI18nStaticParams();
}

export async function generateMetadata() {
  const { t } = await getT();
  return {
    title: "ThietKeMoi Architecture",
    description: t("hero.description"),
  };
}

export default async function RootLayout(props: LayoutProps<"/[lng]">) {
  const { lng } = await props.params;
  const { i18n } = await getT();
  const resources = getResources(i18n);
  const children = props.children;

  return (
    <html lang={lng} dir={dir(lng)} className={`h-full ${inter.variable} ${playfair.variable}`}>
      <body className="min-h-full flex flex-col">
        <I18nProvider language={lng} resources={resources}>
          <ServiceWorkerRegistrar />
          <LoadingScreen />
          <Navbar />
          {children}
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
