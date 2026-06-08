import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import { getProjects } from "@/lib/getProjects";
import { getHomepage } from "@/lib/getHomepage";

export default async function Home() {
  const [projects, homepage] = await Promise.all([getProjects(), getHomepage()]);
  return (
    <>
      <Hero heroImage={homepage.heroImage} />
      <Services images={homepage.serviceImages} />
      <Portfolio projects={projects} />
      <Contact />
    </>
  );
}
