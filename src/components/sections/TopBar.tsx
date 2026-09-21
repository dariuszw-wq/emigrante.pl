import { useTranslation } from "react-i18next";
import { LANGS } from "@/i18n";
import { cn } from "@/lib/utils";
import { CONTACT } from "@/data/contact";

export function TopBar() {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage ?? "pl";
  return (
    <div className="bg-navy text-ground text-[13px] font-medium">
      <div className="container-site py-[10px] flex justify-between gap-4 flex-wrap">
        <div className="flex gap-6 flex-wrap">
          <span>{t("topbar.hours")}</span>
          <a href={`tel:${CONTACT.phoneRaw}`} className="hover:text-lime">{CONTACT.phone}</a>
          <a href={`mailto:${CONTACT.email}`} className="hover:text-lime">{CONTACT.email}</a>
        </div>
        <div className="flex gap-[14px]" role="group" aria-label="Language">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              lang={l}
              onClick={() => i18n.changeLanguage(l)}
              aria-current={current === l ? "true" : undefined}
              className={cn(
                "uppercase cursor-pointer transition-opacity hover:opacity-100",
                current === l ? "opacity-100 text-lime font-bold" : "opacity-85",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
