import { useEffect, useState } from "react";
import { Clock, Eye, EyeOff, Pencil, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Obszar } from "@/components/ui/form";
import { useAuth } from "@/lib/auth";
import { mojeOferty, ofertyDoSprawdzenia, rozstrzygnij, wycofajOferte } from "@/data/offers";
import type { Oferta, StatusOferty } from "@/data/types";
import { NAZWY_BRANZ, NAZWY_UMOW, stawkaTekst } from "./OfferPreview";

const OPIS_STATUSU: Record<StatusOferty, { tekst: string; klasa: string }> = {
  szkic: { tekst: "Szkic", klasa: "bg-navy/8 text-ink-2" },
  oczekuje: { tekst: "Czeka na sprawdzenie", klasa: "bg-amber-100 text-amber-900" },
  opublikowana: { tekst: "Opublikowane", klasa: "bg-lime-tint text-lime-text" },
  odrzucona: { tekst: "Odrzucone", klasa: "bg-red-100 text-red-800" },
  wycofana: { tekst: "Wycofane", klasa: "bg-navy/8 text-muted" },
};

function Znacznik({ status }: { status: StatusOferty }) {
  const s = OPIS_STATUSU[status];
  return <span className={`rounded-full px-3 py-[5px] text-[12px] font-bold ${s.klasa}`}>{s.tekst}</span>;
}

function WierszOferty({ o, akcja }: { o: Oferta; akcja?: React.ReactNode }) {
  return (
    <article className="rounded-[18px] border border-navy/10 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-display text-[18px] font-bold leading-[1.25] tracking-[-0.02em]">{o.stanowisko}</h4>
          <p className="mt-1 text-[13px] text-muted">
            {[NAZWY_BRANZ[o.branza], o.miasto, NAZWY_UMOW[o.umowa], stawkaTekst(o)].filter(Boolean).join(" · ")}
          </p>
        </div>
        <Znacznik status={o.status} />
      </div>

      {o.opis && <p className="mt-3 text-[13px] leading-[1.5] text-ink-2">{o.opis}</p>}

      {o.uwaga_moderacji && (
        <p className="mt-3 rounded-[12px] bg-navy/5 p-3 text-[13px] leading-[1.5] text-ink-2">
          <strong className="font-bold">Uwaga od redakcji: </strong>
          {o.uwaga_moderacji}
        </p>
      )}

      {akcja && <div className="mt-4 flex flex-wrap gap-2">{akcja}</div>}
    </article>
  );
}

/** Profil pracodawcy: dane konta i wszystkie jego ogłoszenia ze statusami. */
export function EmployerPanel({ otwarte, zamknij }: { otwarte: boolean; zamknij: () => void }) {
  const auth = useAuth();
  const [oferty, setOferty] = useState<Oferta[]>([]);
  const [laduje, setLaduje] = useState(true);

  useEffect(() => {
    if (!otwarte || !auth.uid) return;
    setLaduje(true);
    mojeOferty(auth.uid).then((l) => {
      setOferty(l);
      setLaduje(false);
    });
  }, [otwarte, auth.uid]);

  async function wycofaj(id: string) {
    await wycofajOferte(id);
    if (auth.uid) setOferty(await mojeOferty(auth.uid));
  }

  return (
    <Dialog otwarte={otwarte} zamknij={zamknij} tytul="Twój profil" szerokosc="lg">
      <div className="rounded-[18px] border border-navy/10 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-[20px] font-extrabold tracking-[-0.02em]">
              {auth.profil?.firma || "Firma bez nazwy"}
            </p>
            <p className="mt-1 text-[14px] text-muted">{auth.email}</p>
            {auth.profil?.osoba_kontakt && (
              <p className="mt-[2px] text-[13px] text-muted">
                {auth.profil.osoba_kontakt}
                {auth.profil.telefon ? ` · ${auth.profil.telefon}` : ""}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={auth.wyloguj}>
            Wyloguj się
          </Button>
        </div>
      </div>

      <h3 className="mb-4 mt-8 font-display text-[18px] font-extrabold tracking-[-0.01em]">
        Twoje ogłoszenia {oferty.length > 0 && <span className="text-muted">({oferty.length})</span>}
      </h3>

      {laduje ? (
        <p className="text-[14px] text-muted">Wczytuję…</p>
      ) : oferty.length === 0 ? (
        <p className="rounded-[18px] border border-dashed border-navy/20 p-6 text-center text-[14px] text-muted">
          Nie masz jeszcze żadnego ogłoszenia.
        </p>
      ) : (
        <div className="space-y-3">
          {oferty.map((o) => (
            <WierszOferty
              key={o.id}
              o={o}
              akcja={
                o.status !== "wycofana" && (
                  <Button variant="outline" size="sm" onClick={() => wycofaj(o.id)}>
                    <EyeOff size={15} /> Wycofaj
                  </Button>
                )
              }
            />
          ))}
        </div>
      )}
    </Dialog>
  );
}

/** Poczekalnia moderatora: ogłoszenia czekające na decyzję. */
export function ModerationPanel({ otwarte, zamknij }: { otwarte: boolean; zamknij: () => void }) {
  const [oferty, setOferty] = useState<Oferta[]>([]);
  const [laduje, setLaduje] = useState(true);
  const [uwaga, setUwaga] = useState<Record<string, string>>({});
  const [blad, setBlad] = useState<string | null>(null);

  async function odswiez() {
    setLaduje(true);
    setOferty(await ofertyDoSprawdzenia());
    setLaduje(false);
  }

  useEffect(() => {
    if (otwarte) void odswiez();
  }, [otwarte]);

  async function decyzja(id: string, co: "opublikowana" | "odrzucona") {
    const w = await rozstrzygnij(id, co, uwaga[id]);
    if (!w.ok) {
      setBlad(w.blad ?? "Nie udało się zapisać decyzji.");
      return;
    }
    setBlad(null);
    await odswiez();
  }

  return (
    <Dialog
      otwarte={otwarte}
      zamknij={zamknij}
      tytul="Ogłoszenia do sprawdzenia"
      opis="Ogłoszenie pojawi się na stronie dopiero po kliknięciu „Opublikuj”."
      szerokosc="lg"
    >
      {blad && <p className="mb-4 rounded-[14px] bg-red-50 p-4 text-[13px] font-semibold text-red-700">{blad}</p>}

      {laduje ? (
        <p className="text-[14px] text-muted">Wczytuję…</p>
      ) : oferty.length === 0 ? (
        <p className="flex items-center justify-center gap-2 rounded-[18px] border border-dashed border-navy/20 p-8 text-[14px] text-muted">
          <ShieldCheck size={18} className="text-lime-text" /> Nic nie czeka w kolejce.
        </p>
      ) : (
        <div className="space-y-4">
          {oferty.map((o) => (
            <WierszOferty
              key={o.id}
              o={o}
              akcja={
                <div className="w-full space-y-3">
                  <Obszar
                    rows={2}
                    placeholder="Uwaga dla pracodawcy (widoczna w jego profilu, nieobowiązkowa)"
                    value={uwaga[o.id] ?? ""}
                    onChange={(e) => setUwaga({ ...uwaga, [o.id]: e.target.value })}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button variant="lime" size="sm" onClick={() => decyzja(o.id, "opublikowana")}>
                      <Eye size={15} /> Opublikuj
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => decyzja(o.id, "odrzucona")}>
                      <X size={15} /> Odrzuć
                    </Button>
                    <span className="flex items-center gap-[6px] text-[12px] text-faint">
                      <Clock size={14} /> wpłynęło {new Date(o.utworzono).toLocaleString("pl-PL")}
                    </span>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}

      <p className="mt-6 flex items-start gap-2 text-[13px] leading-[1.5] text-muted">
        <Pencil size={15} className="mt-[2px] flex-none" />
        Sprawdź przede wszystkim: czy stawka nie jest niższa od minimalnej, czy nie ma żądania opłat od kandydata, czy
        wymagania nie różnicują kandydatów ze względu na narodowość, płeć ani wiek.
      </p>
    </Dialog>
  );
}
