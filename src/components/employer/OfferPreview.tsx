import { Check } from "lucide-react";
import type { NowaOferta, Udogodnienie } from "@/data/types";

export const NAZWY_UDOGODNIEN: Record<Udogodnienie, string> = {
  nocleg: "Nocleg",
  transport: "Transport do pracy",
  posilki: "Posiłki",
  legalizacja: "Pomoc w legalizacji pobytu",
  kurs_jezyka: "Kurs języka polskiego",
  odziez: "Odzież robocza",
  premia_polecenie: "Premia za polecenie",
  zaliczka: "Zaliczka przed pierwszą wypłatą",
};

export const NAZWY_UMOW = {
  umowa_o_prace: "Umowa o pracę",
  zlecenie: "Umowa zlecenia",
  b2b: "B2B",
} as const;

export const NAZWY_BRANZ = {
  produkcja: "Produkcja",
  logistyka: "Logistyka",
  budownictwo: "Budownictwo",
  gastronomia: "Gastronomia i hotele",
  opieka: "Opieka",
  rolnictwo: "Rolnictwo",
  inne: "Inne",
} as const;

export function stawkaTekst(o: Pick<NowaOferta, "stawka_od" | "stawka_do" | "stawka_jednostka" | "stawka_brutto">) {
  const j = o.stawka_jednostka === "zl_h" ? "zł/h" : "zł/mies.";
  const kwota =
    o.stawka_od && o.stawka_do && o.stawka_do !== o.stawka_od
      ? `${o.stawka_od}–${o.stawka_do} ${j}`
      : o.stawka_od
        ? `${o.stawka_od} ${j}`
        : "do uzgodnienia";
  return o.stawka_od ? `${kwota} ${o.stawka_brutto ? "brutto" : "netto"}` : kwota;
}

/** Tak ogłoszenie zobaczy kandydat. Pokazujemy to pracodawcy przed wysłaniem. */
export function OfferPreview({ oferta, firma }: { oferta: NowaOferta; firma?: string | null }) {
  return (
    <article className="overflow-hidden rounded-[22px] border border-navy/10 bg-white">
      {oferta.zdjecie && (
        <img src={oferta.zdjecie} alt="" className="h-[180px] w-full object-cover" />
      )}
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className="rounded-full bg-lime-tint px-3 py-[6px] text-[12px] font-bold text-lime-text">
            {NAZWY_BRANZ[oferta.branza]}
          </span>
          <span className="text-[12px] font-semibold text-faint">dziś</span>
        </div>

        <h3 className="mt-3 font-display text-[21px] font-bold leading-[1.2] tracking-[-0.02em]">
          {oferta.stanowisko || "Stanowisko"}
          {oferta.liczba_osob ? <span className="text-muted"> · {oferta.liczba_osob} os.</span> : null}
        </h3>

        {firma && <p className="mt-1 text-[14px] font-semibold text-olive">{firma}</p>}

        <p className="mt-[10px] text-[14px] leading-[1.5] text-muted">
          {[
            oferta.miasto,
            NAZWY_UMOW[oferta.umowa],
            oferta.zmiany,
            oferta.godzin_min_mies ? `min. ${oferta.godzin_min_mies} godz./mies.` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>

        {oferta.opis && <p className="mt-4 text-[14px] leading-[1.55] text-ink-2">{oferta.opis}</p>}

        {oferta.wymagania && (
          <p className="mt-3 text-[14px] leading-[1.55] text-ink-2">
            <strong className="font-bold">Wymagania: </strong>
            {oferta.wymagania}
          </p>
        )}

        {oferta.udogodnienia.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {oferta.udogodnienia.map((u) => (
              <li key={u} className="flex items-center gap-[6px] text-[13px] font-semibold text-ink-2">
                <Check size={15} strokeWidth={3} className="text-lime-text" />
                {NAZWY_UDOGODNIEN[u]}
              </li>
            ))}
          </ul>
        )}

        {oferta.premie && (
          <p className="mt-3 text-[13px] leading-[1.5] text-muted">
            <strong className="font-bold text-ink-2">Premie: </strong>
            {oferta.premie}
          </p>
        )}

        {oferta.jezyki.length > 0 && (
          <p className="mt-3 text-[13px] text-muted">Języki: {oferta.jezyki.join(", ")}</p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-navy/8 pt-4">
          <span className="font-display text-[20px] font-extrabold tracking-[-0.02em]">{stawkaTekst(oferta)}</span>
          <span className="rounded-full border-[1.5px] border-navy/18 px-4 py-2 text-[13px] font-bold text-navy">
            Aplikuj
          </span>
        </div>
      </div>
    </article>
  );
}
