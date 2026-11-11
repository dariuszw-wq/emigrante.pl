import { useTranslation } from "react-i18next";
import { logos } from "@/data/seed";

/**
 * Pasek "Zaufali nam pracodawcy" wymienia z nazwy tylko firmy, które realnie
 * obsługujemy i które zgodziły się na wymienienie. Pusta lista = sekcja znika.
 */
export function Logos() {
  const { t } = useTranslation();
  if (logos.length === 0) return null;
  return (
    <section className="container-site pt-2 pb-14">
      <p className="text-center text-[13px] font-bold tracking-[0.08em] uppercase text-faint mb-5">{t("logos.title")}</p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 opacity-55">
        {logos.map((name) => (
          <div key={name} className="h-12 grid place-items-center font-display font-extrabold text-[20px] tracking-[-0.02em]">
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}
