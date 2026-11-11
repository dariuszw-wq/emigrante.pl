import { useTranslation } from "react-i18next";
import { useCountUp } from "@/hooks/useCountUp";
import type { Stats } from "@/data/types";

function BigCounter({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const { ref, current } = useCountUp(value);
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      <div className="font-display font-extrabold text-[clamp(40px,4.4vw,60px)] tracking-[-0.03em] leading-none text-lime tabular-nums">
        {current.toLocaleString("pl-PL")}
        {suffix}
      </div>
      <div className="mt-[10px] text-[15px] opacity-80">{label}</div>
    </div>
  );
}

/**
 * Pas z liczbami pokazuje wyłącznie wartości potwierdzone (src/data/seed.ts).
 * Gdy żadnej nie znamy, cała sekcja znika — wolimy brak liczby niż liczbę
 * przykładową, bo to twierdzenie o firmie, nie ozdobnik.
 */
export function StatsBand({ stats }: { stats: Stats }) {
  const { t } = useTranslation();
  const items = [
    { value: stats.hired, suffix: "", label: t("stats.hired") },
    { value: stats.cases, suffix: "", label: t("stats.cases") },
    { value: stats.days, suffix: "", label: t("stats.days") },
    { value: stats.recommend, suffix: "%", label: t("stats.recommend") },
  ].filter((i): i is { value: number; suffix: string; label: string } => i.value !== null);

  if (items.length === 0) return null;

  return (
    <section className="bg-navy text-ground">
      <div className="container-site py-16 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8">
        {items.map((i) => (
          <BigCounter key={i.label} value={i.value} suffix={i.suffix} label={i.label} />
        ))}
      </div>
    </section>
  );
}
