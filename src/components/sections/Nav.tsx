import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { key: "jobs", href: "#oferty" },
  { key: "services", href: "#uslugi" },
  { key: "legal", href: "#legalizacja" },
  { key: "employers", href: "#pracodawcy" },
  { key: "cases", href: "#realizacje" },
  { key: "blog", href: "#blog" },
] as const;

export function Logo({ className }: { className?: string }) {
  return (
    <a
      href="#"
      className={cn("flex items-center gap-[10px] font-display font-extrabold text-[22px] tracking-[-0.02em]", className)}
      aria-label="emigrante.pl"
    >
      <span className="size-[34px] rounded-[10px] bg-navy grid place-items-center text-lime text-[18px]">e</span>
      <span>
        emigrante<span className="text-olive">.pl</span>
      </span>
    </a>
  );
}

export function Nav() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-20 bg-ground/92 backdrop-blur-[10px] border-b border-navy/8">
      <div className="container-site py-[14px] flex items-center justify-between gap-x-6 gap-y-4 flex-wrap">
        <Logo />

        {/* Linki — zawijają się poniżej ~1100px, na mobile schowane pod hamburgerem */}
        <div className="hidden md:flex gap-x-7 gap-y-4 text-[15px] font-semibold flex-wrap min-w-0">
          {LINKS.map((l) => (
            <a key={l.key} href={l.href} className="hover:text-navy-link transition-colors">
              {t(`nav.${l.key}`)}
            </a>
          ))}
        </div>

        <div className="hidden md:flex gap-[10px]">
          <Button asChild variant="outline" size="md">
            <button type="button" data-prc-otworz-czat="nav">{t("nav.contact")}</button>
          </Button>
          <Button asChild variant="lime" size="md" className="px-[22px]">
            <a href="#zgloszenie">{t("nav.apply")}</a>
          </Button>
        </div>

        <button
          type="button"
          className="md:hidden size-11 grid place-items-center rounded-full border-[1.5px] border-navy/18 cursor-pointer"
          aria-label={t("nav.menu")}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-navy/8 bg-ground">
          <div className="container-site py-4 grid gap-3 text-[15px] font-semibold">
            {LINKS.map((l) => (
              <a key={l.key} href={l.href} onClick={() => setOpen(false)} className="py-2">
                {t(`nav.${l.key}`)}
              </a>
            ))}
            <div className="flex gap-[10px] pt-2 flex-wrap">
              <Button asChild variant="outline" size="md">
                <button type="button" data-prc-otworz-czat="nav-mobile" onClick={() => setOpen(false)}>{t("nav.contact")}</button>
              </Button>
              <Button asChild variant="lime" size="md">
                <a href="#zgloszenie" onClick={() => setOpen(false)}>{t("nav.apply")}</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
