import { useTranslation } from "react-i18next";
import { LANGS } from "@/i18n";
import { CONTACT } from "@/data/contact";

const CANDIDATE_HREFS = ["#oferty", "#legalizacja", "#blog", "#zgloszenie"];
const EMPLOYER_HREFS = ["#uslugi", "#kalkulator", "#realizacje", "#zgloszenie"];

export function Footer() {
  const { t, i18n } = useTranslation();
  const candidate = t("footer.candidate_links", { returnObjects: true }) as string[];
  const employer = t("footer.employer_links", { returnObjects: true }) as string[];

  return (
    <footer id="kontakt" className="bg-navy text-ground">
      <div className="container-site pt-16 pb-8 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-10">
        <div>
          <div className="font-display font-extrabold text-[24px] tracking-[-0.02em]">
            emigrante<span className="text-lime">.pl</span>
          </div>
          <p className="text-[14px] leading-[1.6] opacity-75 mt-[14px] max-w-[32ch]">{t("footer.about")}</p>
        </div>
        <div>
          <div className="font-bold text-[13px] tracking-[0.08em] uppercase opacity-60">{t("footer.candidate")}</div>
          <div className="grid gap-[10px] mt-4 text-[15px]">
            {candidate.map((l, i) => (
              <a key={l} href={CANDIDATE_HREFS[i]} className="hover:text-lime">{l}</a>
            ))}
          </div>
        </div>
        <div>
          <div className="font-bold text-[13px] tracking-[0.08em] uppercase opacity-60">{t("footer.employer")}</div>
          <div className="grid gap-[10px] mt-4 text-[15px]">
            {employer.map((l, i) => (
              <a key={l} href={EMPLOYER_HREFS[i]} className="hover:text-lime">{l}</a>
            ))}
          </div>
        </div>
        <div>
          <div className="font-bold text-[13px] tracking-[0.08em] uppercase opacity-60">{t("footer.contact")}</div>
          <div className="grid gap-[10px] mt-4 text-[15px] opacity-90">
            <a href={`tel:${CONTACT.phoneRaw}`} className="hover:text-lime">{CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}`} className="hover:text-lime">{CONTACT.email}</a>
            <span>{t("footer.address")}</span>
          </div>
        </div>
      </div>
      <div className="container-site pt-5 pb-8 border-t border-ground/12 flex justify-between gap-4 flex-wrap text-[13px] opacity-60">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
        <span className="flex gap-2 flex-wrap">
          <a href="#" className="hover:text-lime">{t("footer.privacy")}</a>
          <span>·</span>
          <a href="#" className="hover:text-lime">{t("footer.terms")}</a>
          <span>·</span>
          {LANGS.map((l) => (
            <button key={l} type="button" lang={l} onClick={() => i18n.changeLanguage(l)} className="uppercase cursor-pointer hover:text-lime">
              {l}
            </button>
          ))}
        </span>
      </div>
    </footer>
  );
}
