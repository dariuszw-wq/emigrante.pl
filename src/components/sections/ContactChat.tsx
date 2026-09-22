import { useTranslation } from "react-i18next";
import { MessageCircle, Mic, Clock, Phone } from "lucide-react";
import { CONTACT } from "@/data/contact";

/**
 * Sekcja kontaktu — ta sama zasada co na ekartapobytu.pl: czat wstępnego
 * rozpoznania sprawy (widget /czat-widget.js). Przycisk z atrybutem
 * data-prc-otworz-czat otwiera widget; teksty czatu w /czat-jezyki.js.
 */
export function ContactChat() {
  const { t } = useTranslation();
  const steps = t("chat.steps", { returnObjects: true }) as string[];
  return (
    <section id="zgloszenie" className="container-site pb-20">
      <div className="bg-lime rounded-[32px] p-[clamp(32px,5vw,64px)] grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-x-[clamp(24px,4vw,64px)] gap-y-8 items-center">
        <div>
          <h2 className="font-display font-extrabold text-[clamp(32px,4.2vw,56px)] tracking-[-0.03em] leading-[1.02]">{t("chat.title")}</h2>
          <p className="text-[17px] leading-[1.6] mt-[18px] text-lime-deep max-w-[44ch]">{t("chat.lead")}</p>
          <ul className="grid gap-[10px] mt-6 text-[15px] text-lime-deep">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-3 items-start">
                <span className="flex-none size-6 rounded-full bg-navy text-lime grid place-items-center font-extrabold text-[12px]">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-ground rounded-[20px] p-7 grid gap-4 shadow-float">
          <div className="flex items-center gap-3">
            <span className="size-12 rounded-[14px] bg-navy text-lime grid place-items-center" aria-hidden="true">
              <MessageCircle size={22} strokeWidth={2.2} />
            </span>
            <div>
              <strong className="block font-display text-[20px] tracking-[-0.02em] leading-tight">{t("chat.card_title")}</strong>
              <span className="text-[13px] text-muted">{t("chat.card_sub")}</span>
            </div>
          </div>
          <div className="grid gap-2 text-[14px] text-muted">
            <span className="flex items-center gap-2"><Mic size={16} /> {t("chat.f_voice")}</span>
            <span className="flex items-center gap-2"><Clock size={16} /> {t("chat.f_time")}</span>
          </div>
          <button
            type="button"
            data-prc-otworz-czat="sekcja-kontakt"
            className="p-[18px] rounded-[14px] bg-navy text-ground font-bold text-[15px] cursor-pointer transition-colors hover:bg-navy-hover"
          >
            {t("chat.start")}
          </button>
          <div className="flex items-center justify-between gap-3 flex-wrap text-[14px]">
            <a
              href={`https://wa.me/${CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener"
              className="font-bold text-lime-text hover:text-navy"
            >
              {t("chat.whatsapp")}
            </a>
            <a href={`tel:${CONTACT.phoneRaw}`} className="flex items-center gap-1 font-semibold text-muted hover:text-navy">
              <Phone size={14} /> {CONTACT.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
