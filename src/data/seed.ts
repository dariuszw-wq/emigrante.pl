import type { Job, Testimonial, Stats, FeeConfig } from "./types";

const d = (daysAgo: number) => {
  const x = new Date();
  x.setDate(x.getDate() - daysAgo);
  return x.toISOString().slice(0, 10);
};

export const seedJobs: Job[] = [
  { id: "1", title: "Operator linii pakującej", industry: "produkcja", city: "Poznań", shifts: "3 zmiany", contract: "Umowa o pracę", rate: "32 zł/h", published_at: d(0) },
  { id: "2", title: "Magazynier z UDT", industry: "logistyka", city: "Wrocław", shifts: "2 zmiany", contract: "Umowa o pracę", rate: "35 zł/h", published_at: d(1) },
  { id: "3", title: "Zbrojarz / cieśla", industry: "budownictwo", city: "Warszawa", shifts: "1 zmiana", contract: "Umowa o pracę", rate: "42 zł/h", published_at: d(2) },
  { id: "4", title: "Pomoc kuchenna", industry: "gastronomia", city: "Kraków", shifts: "grafik", contract: "Umowa o pracę", rate: "31 zł/h", published_at: d(3) },
  { id: "5", title: "Pracownik montażu AGD", industry: "produkcja", city: "Łódź", shifts: "2 zmiany", contract: "Zlecenie", rate: "30 zł/h", published_at: d(3) },
  { id: "6", title: "Kierowca kat. C+E", industry: "logistyka", city: "Gdańsk", shifts: "krajowe", contract: "Umowa o pracę", rate: "8 200 zł", published_at: d(7) },
];

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
