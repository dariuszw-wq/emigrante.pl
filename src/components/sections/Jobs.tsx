import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { Industry, Job } from "@/data/types";

const FILTERS: Array<"all" | Industry> = ["all", "produkcja", "logistyka", "budownictwo", "gastronomia"];

function useRelativeDate() {
  const { t } = useTranslation();
  return (iso: string) => {
    const days = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
    if (days === 0) return t("jobs.today");
    if (days === 1) return t("jobs.yesterday");
    if (days < 7) return t("jobs.days_ago", { count: days });
    return t("jobs.week_ago");
  };
}

export function Jobs({ jobs }: { jobs: Job[] }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"all" | Industry>("all");
  const rel = useRelativeDate();
  const visible = jobs.filter((j) => filter === "all" || j.industry === filter);

  return (
    <section id="oferty" className="bg-white border-y border-navy/6">
      <div className="container-site py-[72px]">
        <div className="flex justify-between items-end gap-6 flex-wrap">
          <div>
            <span className="kicker">{t("jobs.kicker")}</span>
            <h2 className="h2-section">{t("jobs.title")}</h2>
          </div>
          <div className="flex gap-2 flex-wrap" role="group" aria-label={t("jobs.kicker")}>
            {FILTERS.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "chipActive" : "chip"}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
              >
                {t(`jobs.${f}`)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[18px] mt-9">
          {visible.map((o) => (
            <article
              key={o.id}
              className="border border-navy/10 rounded-[20px] p-6 bg-ground flex flex-col gap-[14px] transition-[border-color,box-shadow] hover:border-navy/30 hover:shadow-card"
            >
              <div className="flex justify-between items-start gap-3">
                <span className="px-3 py-[6px] rounded-full bg-lime-tint text-lime-text font-bold text-[12px]">
                  {t(`jobs.${o.industry}`)}
                </span>
                <span className="text-[12px] text-faint font-semibold">{rel(o.published_at)}</span>
              </div>
              <h3 className="h3-card">{o.title}</h3>
              <p className="text-[14px] text-muted leading-[1.5]">
                {o.city} · {o.shifts} · {o.contract}
              </p>
              <div className="flex justify-between items-center mt-auto pt-3 border-t border-navy/8">
                <span className="font-display font-extrabold text-[22px] tracking-[-0.02em]">{o.rate}</span>
                <Button asChild variant="navy" size="sm">
                  <a href="#zgloszenie">{t("jobs.apply")}</a>
                </Button>
              </div>
            </article>
          ))}
          {visible.length === 0 && (
            <p className="text-muted text-[15px] col-span-full">{t("jobs.empty")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
