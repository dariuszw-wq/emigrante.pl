import type { Job, Testimonial, Stats, FeeConfig } from "./types";

// Brak otwartych ofert pracy. Sekcja "Oferty pracy" pokazuje wtedy komunikat
// o oczekiwaniu na zgłoszenia pracodawców (src/components/sections/Jobs.tsx).
// Dodając ofertę, uzupełnij published_at w formacie ISO "RRRR-MM-DD".
export const seedJobs: Job[] = [];

export const seedTestimonials: Testimonial[] = [
  { id: "1", quote: "Umowę dostałam przed pierwszą zmianą, a kartę pobytu odebrałam po siedmiu miesiącach — bez jednej wizyty w urzędzie.", author: "Oksana H.", role: "operator produkcji, Poznań", initials: "OH" },
  { id: "2", quote: "Trzydziestu magazynierów przeszło z oświadczeń na zezwolenia jednolite bez jednego dnia przestoju. Tak to powinno wyglądać.", author: "Marek W.", role: "kierownik HR, Logistyka24", initials: "MW" },
  { id: "3", quote: "Rozmawialiśmy po hiszpańsku. Pierwszy raz w Polsce rozumiałem wszystko, co podpisuję.", author: "Luis R.", role: "monter, Łódź", initials: "LR" },
];

export const seedStats: Stats = { hired: 1240, employers: 160, years: 12, cases: 870, days: 5, recommend: 96 };

export const seedFees: FeeConfig = {
  fees: { oswiadczenie: 100, zezwolenie: 100, karta: 440 },
  employerContribRate: 0.205,
  hoursPerMonth: 168,
};

export const logos = ["NORDPAK", "Logistyka24", "BUD-REM", "FreshFood", "HotelGrupa", "AGD Polska"];
