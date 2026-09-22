import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ImageSlot } from "@/components/ImageSlot";

/**
 * Pula 12 grafik bloga: public/blog/blog-01.jpg … blog-12.jpg (1200×800, JPG).
 * Wpis dostaje grafikę wg indeksu (docelowo: wg id z bazy), więc obrazy
 * rotują bez przypisywania ich ręcznie do artykułów.
 */
const BLOG_IMAGES = Array.from({ length: 12 }, (_, i) => `/blog/blog-${String(i + 1).padStart(2, "0")}.jpg`);

function pickImage(seed: number) {
  return BLOG_IMAGES[seed % BLOG_IMAGES.length];
}

export function Blog() {
  const { t } = useTranslation();
  const items = t("blog.items", { returnObjects: true }) as { category: string; date: string; title: string; excerpt: string }[];
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
        {items.map((w, i) => (
          <article key={w.title} className="flex flex-col gap-3 rounded-[22px] border border-navy/8 bg-white p-5 transition-shadow hover:shadow-card">
            <div className="flex items-center gap-4">
              <div className="flex-none size-[72px] rounded-[14px] overflow-hidden bg-photo">
                <ImageSlot src={pickImage(i)} alt="" label="" />
              </div>
              <span className="text-[12px] font-bold text-olive">
                {w.category} · {w.date}
              </span>
            </div>
            <h3 className="font-display font-bold text-[21px] tracking-[-0.02em] leading-[1.2]">{w.title}</h3>
            <p className="text-[14px] leading-[1.55] text-muted">{w.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
