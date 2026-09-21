import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/ImageSlot";

export function Legal() {
  const { t } = useTranslation();
  const points = t("legal.points", { returnObjects: true }) as { title: string; text: string }[];
  return (
    <section
      id="legalizacja"
      className="container-site pt-10 pb-20 grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-x-[clamp(24px,4vw,72px)] gap-y-10 items-center"
    >
      <div className="rounded-[28px] overflow-hidden h-[clamp(340px,40vw,520px)]">
        <ImageSlot label={t("legal.photo")} />
      </div>
      <div>
        <span className="kicker">{t("legal.kicker")}</span>
        <h2 className="h2-section">{t("legal.title")}</h2>
        <div className="grid gap-[18px] mt-[30px]">
          {points.map((p) => (
            <div key={p.title} className="flex gap-[14px]">
              <span className="flex-none size-7 rounded-full bg-lime grid place-items-center text-navy" aria-hidden="true">
                <Check size={14} strokeWidth={3} />
              </span>
              <div>
                <strong className="block text-[16px]">{p.title}</strong>
                <span className="text-[15px] text-muted leading-[1.5]">{p.text}</span>
              </div>
            </div>
          ))}
        </div>
        <Button asChild variant="navy" size="lg" className="mt-[30px]">
          <a href="#zgloszenie">{t("legal.cta")}</a>
        </Button>
      </div>
    </section>
  );
}
