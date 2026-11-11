import type { Job, Testimonial, Stats, FeeConfig } from "./types";

// ZASADA: w tym pliku nie trzymamy danych przykładowych widocznych dla
// odwiedzającego. Liczba opinii, ocena, statystyki, nazwy klientów i treść
// referencji to twierdzenia o firmie, a nie wypełniacz układu graficznego.
// Czego nie da się potwierdzić, tego nie pokazujemy — sekcja znika sama.

// Brak otwartych ofert pracy. Sekcja "Oferty pracy" pokazuje wtedy komunikat
// o oczekiwaniu na zgłoszenia pracodawców (src/components/sections/Jobs.tsx).
// Dodając ofertę, uzupełnij published_at w formacie ISO "RRRR-MM-DD".
export const seedJobs: Job[] = [];

// Tylko prawdziwe wypowiedzi, za zgodą osoby, choćby podpisane inicjałami.
// Pusta lista = sekcja "Opinie" nie jest renderowana.
export const seedTestimonials: Testimonial[] = [];

// null = liczby nie znamy albo nie da się jej potwierdzić; taki wskaźnik
// nie pojawia się na stronie. Po ustaleniu prawdziwej wartości wystarczy
// wpisać liczbę — kafelek wróci sam.
export const seedStats: Stats = {
  hired: null,
  employers: null,
  years: null,
  cases: null,
  days: null,
  recommend: null,
};

export const seedFees: FeeConfig = {
  fees: { oswiadczenie: 100, zezwolenie: 100, karta: 440 },
  employerContribRate: 0.205,
  hoursPerMonth: 168,
};

// Tylko firmy, które realnie obsługujemy i zgodziły się na wymienienie z nazwy.
// Pusta lista = pasek "Zaufali nam pracodawcy" nie jest renderowany.
export const logos: string[] = [];
