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

// ===== Konta i oferty pracodawców =====================================

export type RolaKonta = "pracodawca" | "kandydat" | "moderator";

export type StatusOferty = "szkic" | "oczekuje" | "opublikowana" | "odrzucona" | "wycofana";

export type Branza = "produkcja" | "logistyka" | "budownictwo" | "gastronomia" | "opieka" | "rolnictwo" | "inne";

export type Umowa = "umowa_o_prace" | "zlecenie" | "b2b";

export type Udogodnienie =
  | "nocleg"
  | "transport"
  | "posilki"
  | "legalizacja"
  | "kurs_jezyka"
  | "odziez"
  | "premia_polecenie"
  | "zaliczka";

export interface Profil {
  id: string;
  rola: RolaKonta;
  firma?: string | null;
  nip?: string | null;
  osoba_kontakt?: string | null;
  telefon?: string | null;
  miasto?: string | null;
  www?: string | null;
  zgoda_regulamin: boolean;
  zgoda_dane: boolean;
  zgoda_data?: string | null;
  utworzono: string;
}

export interface Oferta {
  id: string;
  pracodawca_id: string;
  status: StatusOferty;

  stanowisko: string;
  branza: Branza;
  liczba_osob?: number | null;

  miasto: string;
  wojewodztwo?: string | null;

  stawka_od?: number | null;
  stawka_do?: number | null;
  stawka_jednostka: "zl_h" | "zl_mies";
  stawka_brutto: boolean;
  premie?: string | null;

  godzin_min_mies?: number | null;
  zmiany?: string | null;
  umowa: Umowa;

  udogodnienia: Udogodnienie[];

  opis?: string | null;
  wymagania?: string | null;
  jezyki: string[];

  zdjecie?: string | null;

  zgoda_publikacja: boolean;
  zgoda_prawdziwosc: boolean;
  zgoda_data?: string | null;

  uwaga_moderacji?: string | null;
  opublikowano?: string | null;
  wygasa?: string | null;

  utworzono: string;
  zmieniono: string;
}

/** Dane z formularza — bez pól nadawanych przez bazę. */
export type NowaOferta = Omit<
  Oferta,
  "id" | "pracodawca_id" | "status" | "uwaga_moderacji" | "opublikowano" | "wygasa" | "utworzono" | "zmieniono"
>;
