import { useEffect, useState } from "react";
import { fetchFees, fetchStats, fetchTestimonials } from "@/data/api";
import { ofertaNaKarte, opublikowaneOferty } from "@/data/offers";
import { seedFees, seedJobs, seedStats, seedTestimonials } from "@/data/seed";
import type { FeeConfig, Job, Stats, Testimonial } from "@/data/types";
import { AuthProvider } from "@/lib/auth";
import { PanelsProvider } from "@/lib/panels";
import { TopBar } from "@/components/sections/TopBar";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { Logos } from "@/components/sections/Logos";
import { Jobs } from "@/components/sections/Jobs";
import { Services } from "@/components/sections/Services";
import { Legal } from "@/components/sections/Legal";
import { StatsBand } from "@/components/sections/StatsBand";
import { Calculator } from "@/components/sections/Calculator";
import { Cases } from "@/components/sections/Cases";
import { Testimonials } from "@/components/sections/Testimonials";
import { Blog } from "@/components/sections/Blog";
import { ContactChat } from "@/components/sections/ContactChat";
import { Footer } from "@/components/sections/Footer";

function Strona() {
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [stats, setStats] = useState<Stats>(seedStats);
  const [fees, setFees] = useState<FeeConfig>(seedFees);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(seedTestimonials);

  useEffect(() => {
    // Na liście ofert pokazujemy wyłącznie ogłoszenia po akceptacji moderatora.
    opublikowaneOferty().then((o) => setJobs(o.map(ofertaNaKarte)));
    fetchStats().then(setStats);
    fetchFees().then(setFees);
    fetchTestimonials().then(setTestimonials);
  }, []);

  return (
    <div className="bg-ground text-ink">
      <TopBar />
      <Nav />
      <main>
        <Hero stats={stats} />
        <Logos />
        <Jobs jobs={jobs} />
        <Services />
        <Legal />
        <StatsBand stats={stats} />
        <Calculator fees={fees} />
        <Cases />
        <Testimonials items={testimonials} />
        <Blog />
        <ContactChat />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PanelsProvider>
        <Strona />
      </PanelsProvider>
    </AuthProvider>
  );
}
