import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { FeeConfig, LegalPath } from "@/data/types";

const PATHS: LegalPath[] = ["oswiadczenie", "zezwolenie", "karta"];

export function Calculator({ fees }: { fees: FeeConfig }) {
  const { t } = useTranslation();
  const [workers, setWorkers] = useState(12);
  const [rate, setRate] = useState(32);
  const [path, setPath] = useState<LegalPath>("oswiadczenie");

  const hours = fees.hoursPerMonth;
  const wages = workers * rate * hours;
  const contrib = wages * fees.employerContribRate;
  const legal = fees.fees[path] * workers;
  const zl = (n: number) => `${Math.round(n).toLocaleString("pl-PL")} ${t("calc.currency")}`;

  return (
    <section id="kalkulator" className="container-site pt-[88px] pb-14">
      <div
        id="pracodawcy"
        className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-x-[clamp(24px,4vw,72px)] gap-y-10 items-start"
      >
        <div>
          <span className="kicker">{t("calc.kicker")}</span>
          <h2 className="h2-section">{t("calc.title")}</h2>
          <p className="text-[17px] leading-[1.6] text-ink-2 mt-[18px] max-w-[46ch]">{t("calc.lead")}</p>

          <div className="grid gap-6 mt-8">
            <label className="grid gap-2">
              <span className="flex justify-between font-bold text-[14px]">
                <span>{t("calc.workers")}</span>
                <span>{workers}</span>
              </span>
              <Slider min={1} max={60} step={1} value={[workers]} onValueChange={([v]) => setWorkers(v)} aria-label={t("calc.workers")} />
            </label>
            <label className="grid gap-2">
              <span className="flex justify-between font-bold text-[14px]">
                <span>{t("calc.rate")}</span>
                <span>
                  {rate} {t("calc.rate_unit")}
                </span>
              </span>
              <Slider min={28} max={60} step={1} value={[rate]} onValueChange={([v]) => setRate(v)} aria-label={t("calc.rate")} />
            </label>
            <div className="grid gap-2">
              <span className="font-bold text-[14px]">{t("calc.path")}</span>
              <div className="flex gap-2 flex-wrap" role="group" aria-label={t("calc.path")}>
                {PATHS.map((p) => (
                  <Button key={p} size="sm" variant={path === p ? "chipActive" : "chip"} onClick={() => setPath(p)} aria-pressed={path === p}>
                    {t(`calc.path_${p}`)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-navy text-ground rounded-[28px] p-[clamp(24px,3vw,40px)]">
          <div className="text-[13px] font-bold tracking-[0.08em] uppercase opacity-70">{t("calc.result_label")}</div>
          <div className="font-display font-extrabold text-[clamp(40px,4.6vw,64px)] tracking-[-0.03em] leading-none mt-3 text-lime tabular-nums" aria-live="polite">
            {zl(wages + contrib)}
          </div>
          <dl className="grid gap-3 mt-7 pt-6 border-t border-ground/15 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="opacity-80">{t("calc.wages", { hours, workers })}</dt>
              <dd className="font-bold">{zl(wages)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="opacity-80">{t("calc.contrib")}</dt>
              <dd className="font-bold">{zl(contrib)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="opacity-80">{t("calc.fees")}</dt>
              <dd className="font-bold">{zl(legal)}</dd>
            </div>
          </dl>
          <Button asChild variant="lime" size="lg" className="w-full mt-7">
            <a href="#zgloszenie">{t("calc.cta")}</a>
          </Button>
          <p className="text-[12px] opacity-60 mt-[14px] leading-[1.5]">{t("calc.disclaimer")}</p>
        </div>
      </div>
    </section>
  );
}
