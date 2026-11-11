import { useState } from "react";
import { Lista, Obszar, Pigulki, Pole, Tekst } from "@/components/ui/form";
import { NAZWY_BRANZ, NAZWY_UDOGODNIEN, NAZWY_UMOW } from "./OfferPreview";
import type { Branza, NowaOferta, Udogodnienie, Umowa } from "@/data/types";

export const PUSTA_OFERTA: NowaOferta = {
  stanowisko: "",
  branza: "produkcja",
  liczba_osob: null,
  miasto: "",
  wojewodztwo: null,
  stawka_od: null,
  stawka_do: null,
  stawka_jednostka: "zl_h",
  stawka_brutto: true,
  premie: null,
  godzin_min_mies: null,
  zmiany: null,
  umowa: "umowa_o_prace",
  udogodnienia: [],
  opis: null,
  wymagania: null,
  jezyki: [],
  zdjecie: null,
  zgoda_publikacja: false,
  zgoda_prawdziwosc: false,
  zgoda_data: null,
};

const JEZYKI = ["polski", "angielski", "ukraiński", "rosyjski", "hiszpański", "niemiecki"];

export type Bledy = Partial<Record<keyof NowaOferta, string>>;

/** Puste pole = brak danych, a nie zero. Dlatego liczby trzymamy jako null. */
function liczba(v: string): number | null {
  const n = Number(v.replace(",", "."));
  return v.trim() === "" || Number.isNaN(n) ? null : n;
}

export function sprawdzOferte(o: NowaOferta): Bledy {
  const b: Bledy = {};
  if (o.stanowisko.trim().length < 3) b.stanowisko = "Podaj nazwę stanowiska.";
  if (o.miasto.trim().length < 2) b.miasto = "Podaj miejsce pracy.";
  const od = o.stawka_od ?? null;
  const doKwoty = o.stawka_do ?? null;
  const godziny = o.godzin_min_mies ?? null;
  const osoby = o.liczba_osob ?? null;

  if (od !== null && od <= 0) b.stawka_od = "Stawka musi być większa od zera.";
  if (od !== null && doKwoty !== null && doKwoty < od)
    b.stawka_do = "Górna stawka nie może być niższa od dolnej.";
  if (godziny !== null && (godziny < 1 || godziny > 400))
    b.godzin_min_mies = "Podaj liczbę godzin od 1 do 400.";
  if (osoby !== null && (osoby < 1 || osoby > 999)) b.liczba_osob = "Podaj liczbę od 1 do 999.";
  return b;
}

export function OfferForm({
  oferta,
  zmien,
  bledy,
  naZdjecie,
}: {
  oferta: NowaOferta;
  zmien: (o: NowaOferta) => void;
  bledy: Bledy;
  naZdjecie: (plik: File) => void;
}) {
  const [nazwaPliku, setNazwaPliku] = useState<string | null>(null);
  const ustaw = <K extends keyof NowaOferta>(k: K, v: NowaOferta[K]) => zmien({ ...oferta, [k]: v });

  return (
    <div className="space-y-7">
      {/* --- kogo szukasz --- */}
      <section className="space-y-4">
        <h3 className="font-display text-[17px] font-extrabold tracking-[-0.01em]">Kogo szukasz</h3>

        <Pole etykieta="Stanowisko" wymagane blad={bledy.stanowisko} podpowiedz="Np. „Operator wózka widłowego”.">
          <Tekst
            value={oferta.stanowisko}
            onChange={(e) => ustaw("stanowisko", e.target.value)}
            aria-invalid={!!bledy.stanowisko}
            placeholder="Operator wózka widłowego"
          />
        </Pole>

        <div className="grid gap-4 sm:grid-cols-2">
          <Pole etykieta="Branża">
            <Lista value={oferta.branza} onChange={(e) => ustaw("branza", e.target.value as Branza)}>
              {Object.entries(NAZWY_BRANZ).map(([w, e]) => (
                <option key={w} value={w}>
                  {e}
                </option>
              ))}
            </Lista>
          </Pole>

          <Pole etykieta="Ile osób" blad={bledy.liczba_osob} podpowiedz="Zostaw puste, jeśli nie wiesz.">
            <Tekst
              inputMode="numeric"
              value={oferta.liczba_osob ?? ""}
              onChange={(e) => ustaw("liczba_osob", liczba(e.target.value))}
              aria-invalid={!!bledy.liczba_osob}
              placeholder="5"
            />
          </Pole>
        </div>
      </section>

      {/* --- gdzie i na jakich zasadach --- */}
      <section className="space-y-4 border-t border-navy/8 pt-7">
        <h3 className="font-display text-[17px] font-extrabold tracking-[-0.01em]">Gdzie i na jakich zasadach</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Pole etykieta="Miejsce pracy" wymagane blad={bledy.miasto} podpowiedz="Miasto albo okolica.">
            <Tekst
              value={oferta.miasto}
              onChange={(e) => ustaw("miasto", e.target.value)}
              aria-invalid={!!bledy.miasto}
              placeholder="Poznań"
            />
          </Pole>

          <Pole etykieta="Rodzaj umowy">
            <Lista value={oferta.umowa} onChange={(e) => ustaw("umowa", e.target.value as Umowa)}>
              {Object.entries(NAZWY_UMOW).map(([w, e]) => (
                <option key={w} value={w}>
                  {e}
                </option>
              ))}
            </Lista>
          </Pole>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Pole
            etykieta="Minimum godzin w miesiącu"
            blad={bledy.godzin_min_mies}
            podpowiedz="Ile godzin gwarantujesz. To pytanie pada najczęściej."
          >
            <Tekst
              inputMode="numeric"
              value={oferta.godzin_min_mies ?? ""}
              onChange={(e) => ustaw("godzin_min_mies", liczba(e.target.value))}
              aria-invalid={!!bledy.godzin_min_mies}
              placeholder="160"
            />
          </Pole>

          <Pole etykieta="System zmianowy" podpowiedz="Np. „2 zmiany”, „tylko dzienna”, „grafik”.">
            <Tekst
              value={oferta.zmiany ?? ""}
              onChange={(e) => ustaw("zmiany", e.target.value || null)}
              placeholder="2 zmiany"
            />
          </Pole>
        </div>
      </section>

      {/* --- pieniądze --- */}
      <section className="space-y-4 border-t border-navy/8 pt-7">
        <h3 className="font-display text-[17px] font-extrabold tracking-[-0.01em]">Wynagrodzenie</h3>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <Pole etykieta="Stawka od" blad={bledy.stawka_od}>
            <Tekst
              inputMode="decimal"
              value={oferta.stawka_od ?? ""}
              onChange={(e) => ustaw("stawka_od", liczba(e.target.value))}
              aria-invalid={!!bledy.stawka_od}
              placeholder="32"
            />
          </Pole>

          <Pole etykieta="Stawka do" blad={bledy.stawka_do} podpowiedz="Zostaw puste, jeśli jedna stawka.">
            <Tekst
              inputMode="decimal"
              value={oferta.stawka_do ?? ""}
              onChange={(e) => ustaw("stawka_do", liczba(e.target.value))}
              aria-invalid={!!bledy.stawka_do}
              placeholder="38"
            />
          </Pole>

          <Pole etykieta="Za">
            <Lista
              value={oferta.stawka_jednostka}
              onChange={(e) => ustaw("stawka_jednostka", e.target.value as "zl_h" | "zl_mies")}
            >
              <option value="zl_h">zł za godzinę</option>
              <option value="zl_mies">zł miesięcznie</option>
            </Lista>
          </Pole>
        </div>

        <Pole etykieta="Brutto czy netto">
          <Lista
            value={oferta.stawka_brutto ? "brutto" : "netto"}
            onChange={(e) => ustaw("stawka_brutto", e.target.value === "brutto")}
          >
            <option value="brutto">brutto (kwota z umowy)</option>
            <option value="netto">netto („na rękę”)</option>
          </Lista>
        </Pole>

        <Pole etykieta="Premie i dodatki" podpowiedz="Np. premia frekwencyjna, dodatek za nocki, nadgodziny.">
          <Obszar
            rows={2}
            value={oferta.premie ?? ""}
            onChange={(e) => ustaw("premie", e.target.value || null)}
            placeholder="Premia frekwencyjna 300 zł, dodatek 20% za zmianę nocną"
          />
        </Pole>
      </section>

      {/* --- co zapewniasz --- */}
      <section className="space-y-4 border-t border-navy/8 pt-7">
        <h3 className="font-display text-[17px] font-extrabold tracking-[-0.01em]">Co zapewniasz</h3>
        <p className="-mt-2 text-[13px] text-muted">Zaznacz wszystko, co oferujesz. To najczęściej decyduje o wyborze.</p>
        <Pigulki
          opcje={(Object.keys(NAZWY_UDOGODNIEN) as Udogodnienie[]).map((u) => ({
            wartosc: u,
            etykieta: NAZWY_UDOGODNIEN[u],
          }))}
          wybrane={oferta.udogodnienia}
          zmien={(v) => ustaw("udogodnienia", v)}
        />

        <Pole etykieta="Języki, w których można się dogadać">
          <Pigulki
            opcje={JEZYKI.map((j) => ({ wartosc: j, etykieta: j }))}
            wybrane={oferta.jezyki}
            zmien={(v) => ustaw("jezyki", v)}
          />
        </Pole>
      </section>

      {/* --- opis --- */}
      <section className="space-y-4 border-t border-navy/8 pt-7">
        <h3 className="font-display text-[17px] font-extrabold tracking-[-0.01em]">Opis</h3>

        <Pole etykieta="Na czym polega praca" podpowiedz="Dwa, trzy zdania zwykłym językiem.">
          <Obszar
            value={oferta.opis ?? ""}
            onChange={(e) => ustaw("opis", e.target.value || null)}
            placeholder="Pakowanie i paletyzacja gotowych wyrobów, praca w hali o stałej temperaturze."
          />
        </Pole>

        <Pole etykieta="Wymagania" podpowiedz="Tylko to, co naprawdę konieczne do wykonywania pracy.">
          <Obszar
            rows={3}
            value={oferta.wymagania ?? ""}
            onChange={(e) => ustaw("wymagania", e.target.value || null)}
            placeholder="Uprawnienia UDT na wózki widłowe, podstawowy język polski."
          />
        </Pole>

        <Pole
          etykieta="Zdjęcie (nieobowiązkowe)"
          podpowiedz="Hala, magazyn albo miejsce pracy. Nie wgrywaj zdjęć osób bez ich zgody."
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const p = e.target.files?.[0];
              if (p) {
                setNazwaPliku(p.name);
                naZdjecie(p);
              }
            }}
            className="block w-full cursor-pointer text-[14px] text-muted file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-navy file:px-5 file:py-[10px] file:text-[13px] file:font-bold file:text-ground hover:file:bg-navy-hover"
          />
          {nazwaPliku && <span className="mt-2 block text-[13px] font-semibold text-olive">Wybrano: {nazwaPliku}</span>}
        </Pole>
      </section>
    </div>
  );
}
