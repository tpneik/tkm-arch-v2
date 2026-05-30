import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Contact from "@/components/Contact";
import { getProjects } from "@/lib/getProjects";

export default async function Home() {
  const projects = await getProjects();
  return (
    <>
      <Hero />
      <Services />
      <Portfolio projects={projects} />
      <Contact />
    </>
  );
}
