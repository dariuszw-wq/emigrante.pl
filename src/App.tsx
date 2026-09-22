import { useEffect, useState } from "react";
import { fetchFees, fetchJobs, fetchStats, fetchTestimonials } from "@/data/api";
import { seedFees, seedJobs, seedStats, seedTestimonials } from "@/data/seed";
import type { FeeConfig, Job, Stats, Testimonial } from "@/data/types";
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

export default function App() {
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const [stats, setStats] = useState<Stats>(seedStats);
  const [fees, setFees] = useState<FeeConfig>(seedFees);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(seedTestimonials);

  useEffect(() => {
    // Seed renderuje się natychmiast; dane z Supabase podmieniają je po załadowaniu.
    fetchJobs().then(setJobs);
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
