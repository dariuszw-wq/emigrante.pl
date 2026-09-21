import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/ImageSlot";
import { useCountUp } from "@/hooks/useCountUp";
import type { Stats } from "@/data/types";

function Counter({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const { ref, current } = useCountUp(value);
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      <div className="font-display font-extrabold text-[34px] tracking-[-0.02em] leading-none tabular-nums">
        {current.toLocaleString("pl-PL")}
        {suffix}
      </div>
      <div className="text-[13px] text-muted mt-[6px] font-semibold">{label}</div>
    </div>
  );
}

function MarqueeColumn({ dir, delay }: { dir: "up" | "down"; delay: string }) {
  const tiles = [0, 1, 2, 3];
  const list = [...tiles, ...tiles]; // ×2 dla płynnej pętli translateY(-50%)
  return (
    <div
      className={`flex flex-col gap-4 min-w-0 w-full will-change-transform ${dir === "up" ? "animate-marquee-up" : "animate-marquee-down"}`}
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      {list.map((i, idx) => (
        <div key={idx} className="h-[260px] w-full rounded-[20px] overflow-hidden bg-photo flex-none">
          <ImageSlot label={idx < 4 ? `Zdjęcie ${i + 1}` : ""} />
        </div>
      ))}
    </div>
  );
}

export function Hero({ stats }: { stats: Stats }) {
  const { t } = useTranslation();
  return (
    <section className="container-site pt-[clamp(48px,7vw,96px)] pb-10 grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-x-[clamp(24px,4vw,64px)] gap-y-12 items-center">
      <div>
        <span className="inline-flex items-center gap-2 px-[14px] py-2 rounded-full bg-lime-tint text-lime-text font-bold text-[13px]">
          <span className="size-2 rounded-full bg-dot" />
          {t("hero.badge")}
        </span>
        <h1 className="font-display font-extrabold text-[clamp(42px,5.6vw,76px)] leading-[1.02] tracking-[-0.03em] mt-[22px] max-w-[14ch]">
          {t("hero.title_before")}
          <span className="text-olive">{t("hero.title_accent")}</span>
          {t("hero.title_after")}
        </h1>
        <p className="text-[18px] leading-[1.6] mt-[22px] max-w-[50ch] text-ink-2">{t("hero.lead")}</p>
        <div className="flex gap-3 flex-wrap mt-[30px]">
          <Button asChild variant="navy" size="lg">
            <a href="#oferty">{t("hero.cta_jobs")}</a>
          </Button>
          <Button asChild variant="lime" size="lg">
            <a href="#kalkulator">{t("hero.cta_employer")}</a>
          </Button>
        </div>

        <div className="flex items-center gap-4 flex-wrap mt-[34px]">
          <div className="flex">
            {["#d8dce3", "#c3c9d3", "#aeb6c3"].map((bg, i) => (
              <div
                key={i}
                className="size-11 rounded-full border-[3px] border-ground overflow-hidden"
                style={{ background: bg, marginLeft: i ? -12 : 0 }}
              >
                <ImageSlot label="" />
              </div>
            ))}
            <div className="size-11 rounded-full border-[3px] border-ground bg-navy text-lime grid place-items-center font-extrabold text-[12px] -ml-3">
              +1k
            </div>
          </div>
          <div>
            <div className="flex items-center gap-[6px] font-extrabold text-[15px]">
              <span className="text-star tracking-[1px]" aria-hidden="true">★★★★★</span> {t("hero.rating")}
            </div>
            <div className="text-[13px] text-muted">{t("hero.rating_note")}</div>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(3,auto)] gap-9 mt-10 pt-7 border-t border-navy/10 justify-start">
          <Counter value={stats.hired} label={t("hero.stat_hired")} />
          <Counter value={stats.employers} suffix="+" label={t("hero.stat_employers")} />
          <Counter value={stats.years} label={t("hero.stat_years")} />
        </div>
      </div>

      {/* Sygnatura: podwójna karuzela pionowa */}
      <div className="relative h-[clamp(420px,44vw,620px)] grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 overflow-hidden rounded-[28px] hero-mask">
        <MarqueeColumn dir="up" delay="0s" />
        <MarqueeColumn dir="down" delay="-6s" />
        <div className="absolute left-5 bottom-6 bg-ground rounded-2xl px-4 py-3 flex items-center gap-3 shadow-float pointer-events-none">
          <span className="size-[38px] rounded-xl bg-lime grid place-items-center font-extrabold text-navy">
            <Check size={18} strokeWidth={3} />
          </span>
          <div>
            <div className="font-extrabold text-[14px]">{t("hero.float_title")}</div>
            <div className="text-[12px] text-muted">{t("hero.float_sub")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
