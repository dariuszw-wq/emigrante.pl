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

/**
 * null = liczby nie znamy albo nie da się jej potwierdzić. Taki wskaznik
 * nie jest renderowany wcale — na stronie nie pokazujemy liczb szacunkowych
 * ani przykladowych, bo to twierdzenie o firmie, nie element dekoracyjny.
 */
export interface Stats {
  hired: number | null;
  employers: number | null;
  years: number | null;
  cases: number | null;
  days: number | null;
  recommend: number | null;
}

export interface FeeConfig {
  fees: Record<LegalPath, number>;
  employerContribRate: number;
  hoursPerMonth: number;
}
