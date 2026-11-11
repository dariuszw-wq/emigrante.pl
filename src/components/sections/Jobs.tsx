import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { usePanels } from "@/lib/panels";
import type { Industry, Job } from "@/data/types";

const FILTERS: Array<"all" | Industry> = ["all", "produkcja", "logistyka", "budownictwo", "gastronomia"];

function useRelativeDate() {
  const { t } = useTranslation();
  return (iso: string) => {
    // Liczymy różnicę dni kalendarzowych, nie godzin: oferta dodana wieczorem
    // nie może rano pokazywać "wczoraj", a sama data bez godziny parsuje się jako UTC.
    const doPolnocy = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const days = Math.max(0, Math.round((doPolnocy(new Date()) - doPolnocy(new Date(iso))) / 86400000));
    if (days === 0) return t("jobs.today");
    if (days === 1) return t("jobs.yesterday");
    if (days < 7) return t("jobs.days_ago", { count: days });
    return t("jobs.week_ago");
  };
}

/**
 * Gdy nie ma żadnej otwartej oferty, sekcja nie obiecuje „aktualnych ofert”:
 * zmienia nagłówek, ukrywa filtry branżowe i pokazuje zaproszenie do kontaktu
 * — osobne dla kandydata i dla pracodawcy. Oba przyciski otwierają czat.
 */
function NoJobs() {
  const { t } = useTranslation();
  const { otworzKreator } = usePanels();
  return (
    <div className="mt-9 rounded-[20px] border border-dashed border-navy/20 bg-ground px-6 py-12 text-center">
      <p className="mx-auto max-w-[56ch] text-[16px] leading-[1.6] text-muted">{t("jobs.none_text")}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="navy" size="md" data-prc-otworz-czat="oferty-brak-kandydat">
          {t("jobs.none_cta_worker")}
        </Button>
        <Button type="button" variant="outline" size="md" onClick={otworzKreator}>
          {t("jobs.none_cta_employer")}
        </Button>
      </div>
    </div>
  );
}

export function Jobs({ jobs }: { jobs: Job[] }) {
  const { t } = useTranslation();
  const { otworzKreator } = usePanels();
  const [filter, setFilter] = useState<"all" | Industry>("all");
  const rel = useRelativeDate();
  const empty = jobs.length === 0;
  const visible = jobs.filter((j) => filter === "all" || j.industry === filter);

  return (
    <section id="oferty" className="bg-white border-y border-navy/6">
      <div className="container-site py-[72px]">
        <div className="flex justify-between items-end gap-6 flex-wrap">
          <div>
            <span className="kicker">{t(empty ? "jobs.none_kicker" : "jobs.kicker")}</span>
            <h2 className="h2-section">{t(empty ? "jobs.none_title" : "jobs.title")}</h2>
          </div>
          {!empty && (
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
          )}
        </div>

        {empty ? (
          <NoJobs />
        ) : (
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
        )}
        {!empty && (
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4 rounded-[18px] border border-dashed border-navy/20 px-6 py-5 text-center">
            <p className="text-[14px] text-muted">{t("jobs.employer_invite")}</p>
            <Button type="button" variant="navy" size="md" onClick={otworzKreator}>
              {t("jobs.employer_cta")}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
