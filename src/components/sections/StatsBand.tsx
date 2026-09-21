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

export function StatsBand({ stats }: { stats: Stats }) {
  const { t } = useTranslation();
  return (
    <section className="bg-navy text-ground">
      <div className="container-site py-16 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8">
        <BigCounter value={stats.hired} label={t("stats.hired")} />
        <BigCounter value={stats.cases} label={t("stats.cases")} />
        <BigCounter value={stats.days} label={t("stats.days")} />
        <BigCounter value={stats.recommend} suffix="%" label={t("stats.recommend")} />
      </div>
    </section>
  );
}
