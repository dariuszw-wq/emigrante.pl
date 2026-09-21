import { useTranslation } from "react-i18next";
import { Users, FileCheck, IdCard, Handshake, BedDouble, ShieldCheck } from "lucide-react";

const ICONS = [Users, FileCheck, IdCard, Handshake, BedDouble, ShieldCheck];

export function Services() {
  const { t } = useTranslation();
  const items = t("services.items", { returnObjects: true }) as { title: string; text: string }[];
  return (
    <section id="uslugi" className="container-site pt-[88px] pb-14">
      <div className="max-w-[640px]">
        <span className="kicker">{t("services.kicker")}</span>
        <h2 className="h2-section">{t("services.title")}</h2>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[18px] mt-10">
        {items.map((u, i) => {
          const Icon = ICONS[i] ?? Users;
          return (
            <article
              key={u.title}
              className="rounded-[22px] p-7 bg-white border border-navy/8 flex flex-col gap-4 transition-shadow hover:shadow-service"
            >
              <span className="size-12 rounded-[14px] bg-navy text-lime grid place-items-center" aria-hidden="true">
                <Icon size={22} strokeWidth={2.2} />
              </span>
              <h3 className="h3-card">{u.title}</h3>
              <p className="text-[15px] leading-[1.6] text-muted">{u.text}</p>
              <a href="#zgloszenie" className="font-bold text-[14px] text-lime-text mt-auto hover:text-navy">
                {t("services.more")}
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
