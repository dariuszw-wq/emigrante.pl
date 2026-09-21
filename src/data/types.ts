export type Industry = "produkcja" | "logistyka" | "budownictwo" | "gastronomia";
export type LegalPath = "oswiadczenie" | "zezwolenie" | "karta";
export type LeadRole = "kandydat" | "pracodawca";

export interface Job {
  id: string;
  title: string;
  industry: Industry;
  city: string;
  shifts: string;
  contract: string;
  rate: string;
  published_at: string; // ISO date
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  initials: string;
}

export interface Stats {
  hired: number;
  employers: number;
  years: number;
  cases: number;
  days: number;
  recommend: number;
}

export interface FeeConfig {
  fees: Record<LegalPath, number>;
  employerContribRate: number;
  hoursPerMonth: number;
}
