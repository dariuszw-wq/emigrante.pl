import { supabase } from "@/lib/supabase";
import { seedFees, seedJobs, seedStats, seedTestimonials } from "./seed";
import type { FeeConfig, Job, LeadRole, LegalPath, Stats, Testimonial } from "./types";

export async function fetchJobs(): Promise<Job[]> {
  if (!supabase) return seedJobs;
  const { data, error } = await supabase
    .from("jobs")
    .select("id,title,industry,city,shifts,contract,rate,published_at")
    .eq("is_active", true)
    .order("sort_order")
    .limit(6);
  if (error || !data?.length) return seedJobs;
  return data as Job[];
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  if (!supabase) return seedTestimonials;
  const { data, error } = await supabase
    .from("testimonials")
    .select("id,quote,author,role,initials")
    .eq("is_active", true)
    .order("sort_order")
    .limit(3);
  if (error || !data?.length) return seedTestimonials;
  return data as Testimonial[];
}

export async function fetchStats(): Promise<Stats> {
  if (!supabase) return seedStats;
  const { data, error } = await supabase.from("stats").select("key,value");
  if (error || !data?.length) return seedStats;
  const out = { ...seedStats };
  for (const row of data as { key: keyof Stats; value: number }[]) {
    if (row.key in out) out[row.key] = Number(row.value);
  }
  return out;
}

export async function fetchFees(): Promise<FeeConfig> {
  if (!supabase) return seedFees;
  const { data, error } = await supabase
    .from("fee_rates")
    .select("path,amount_pln,employer_contrib_rate,hours_per_month");
  if (error || !data?.length) return seedFees;
  const fees = { ...seedFees.fees };
  let rate = seedFees.employerContribRate;
  let hours = seedFees.hoursPerMonth;
  for (const r of data as { path: LegalPath; amount_pln: number; employer_contrib_rate: number; hours_per_month: number }[]) {
    fees[r.path] = Number(r.amount_pln);
    rate = Number(r.employer_contrib_rate);
    hours = Number(r.hours_per_month);
  }
  return { fees, employerContribRate: rate, hoursPerMonth: hours };
}

export interface LeadInput {
  name: string;
  contact: string;
  role: LeadRole;
  lang: string;
}

export async function submitLead(input: LeadInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!supabase) {
    // Tryb bez backendu: symulujemy zapis, żeby UI dało się przetestować.
    await new Promise((r) => setTimeout(r, 600));
    console.info("[leads] brak konfiguracji Supabase — lead nie został zapisany:", input);
    return { ok: true };
  }
  const { error } = await supabase.from("leads").insert({
    ...input,
    source: "homepage",
    user_agent: navigator.userAgent,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
