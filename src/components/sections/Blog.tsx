import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/ImageSlot";

export function Blog() {
  const { t } = useTranslation();
  const items = t("blog.items", { returnObjects: true }) as { category: string; date: string; title: string }[];
  return (
    <section id="blog" className="container-site pt-10 pb-20">
      <div className="flex justify-between items-end gap-6 flex-wrap">
        <div>
          <span className="kicker">{t("blog.kicker")}</span>
          <h2 className="h2-section">{t("blog.title")}</h2>
        </div>
        <Button asChild variant="outline" size="md">
          <a href="#blog">{t("blog.all")}</a>
        </Button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 mt-9">
        {items.map((w) => (
          <article key={w.title} className="flex flex-col gap-3">
            <div className="h-[200px] rounded-[20px] overflow-hidden">
              <ImageSlot label={t("blog.photo")} />
            </div>
            <span className="text-[12px] font-bold text-olive">
              {w.category} · {w.date}
            </span>
            <h3 className="font-display font-bold text-[21px] tracking-[-0.02em] leading-[1.2]">{w.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
