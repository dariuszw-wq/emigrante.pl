import { useTranslation } from "react-i18next";
import type { Testimonial } from "@/data/types";

export function Testimonials({ items }: { items: Testimonial[] }) {
  const { t } = useTranslation();
  return (
    <section className="container-site pt-[88px] pb-14">
      <div className="max-w-[640px]">
        <span className="kicker">{t("testimonials.kicker")}</span>
        <h2 className="h2-section">{t("testimonials.title")}</h2>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[18px] mt-9">
        {items.map((op) => (
          <figure key={op.id} className="rounded-[22px] bg-white border border-navy/8 p-7 flex flex-col gap-[18px]">
            <span className="text-star tracking-[2px] text-[14px]" aria-label="5/5">★★★★★</span>
            <blockquote className="text-[17px] leading-[1.55] font-medium">„{op.quote}”</blockquote>
            <figcaption className="flex items-center gap-3 mt-auto">
              <span className="size-[42px] rounded-full bg-navy text-lime grid place-items-center font-extrabold text-[14px]">{op.initials}</span>
              <div>
                <strong className="block text-[14px]">{op.author}</strong>
                <span className="text-[13px] text-muted">{op.role}</span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
