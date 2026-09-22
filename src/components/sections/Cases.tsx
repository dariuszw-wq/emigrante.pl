import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/ImageSlot";

export function Cases() {
  const { t } = useTranslation();
  const items = t("cases.items", { returnObjects: true }) as { label: string; title: string; text: string; photo: string }[];
  return (
    <section id="realizacje" className="bg-white border-y border-navy/6">
      <div className="container-site py-20">
        <div className="flex justify-between items-end gap-6 flex-wrap">
          <div>
            <span className="kicker">{t("cases.kicker")}</span>
            <h2 className="h2-section">{t("cases.title")}</h2>
          </div>
          <Button asChild variant="outline" size="md">
            <a href="#realizacje">{t("cases.all")}</a>
          </Button>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 mt-9">
          {items.map((c, i) => (
            <article key={c.title} className="rounded-[22px] overflow-hidden border border-navy/8 bg-ground">
              <div className="h-[220px]">
                <ImageSlot src={`/img/case-${String(i + 1).padStart(2, "0")}.jpg`} alt={c.photo} label={c.photo} />
              </div>
              <div className="p-[22px]">
                <span className="text-[12px] font-bold text-olive">{c.label}</span>
                <h3 className="font-display font-bold text-[20px] tracking-[-0.02em] mt-2">{c.title}</h3>
                <p className="mt-[10px] text-[14px] leading-[1.55] text-muted">{c.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
