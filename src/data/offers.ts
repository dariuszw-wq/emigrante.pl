import { supabase } from "@/lib/supabase";
import type { Job, NowaOferta, Oferta, Profil, StatusOferty } from "./types";

/**
 * Warstwa danych dla ofert pracodawców.
 *
 * Gdy Supabase jest skonfigurowany (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY),
 * wszystko idzie do bazy. Gdy nie jest — pracujemy na atrapie w pamięci
 * przeglądarki, żeby cały przepływ dało się wyklikać i ocenić przed
 * podłączeniem zaplecza. Atrapa NIE jest trwała i nie jest widoczna dla nikogo
 * poza tą jedną przeglądarką; przy wdrożeniu znika sama.
 */

export const bazaPodlaczona = supabase !== null;

const KLUCZ = "emigrante.oferty.atrapa";

function czytajAtrape(): Oferta[] {
  try {
    const raw = localStorage.getItem(KLUCZ);
    return raw ? (JSON.parse(raw) as Oferta[]) : [];
  } catch {
    return [];
  }
}

function zapiszAtrape(lista: Oferta[]) {
  try {
    localStorage.setItem(KLUCZ, JSON.stringify(lista));
  } catch {
    /* tryb prywatny albo zablokowane dane witryny — trudno, atrapa i tak jest tymczasowa */
  }
}

function idAtrapy() {
  return "atrapa-" + Math.random().toString(36).slice(2, 10);
}

// ---------- zapis oferty ----------------------------------------------

export async function zlozOferte(
  dane: NowaOferta,
  pracodawcaId: string,
): Promise<{ ok: true; oferta: Oferta } | { ok: false; blad: string }> {
  const teraz = new Date().toISOString();

  if (!supabase) {
    const oferta: Oferta = {
      ...dane,
      id: idAtrapy(),
      pracodawca_id: pracodawcaId,
      status: "oczekuje",
      utworzono: teraz,
      zmieniono: teraz,
    };
    zapiszAtrape([oferta, ...czytajAtrape()]);
    return { ok: true, oferta };
  }

  const { data, error } = await supabase
    .from("oferta")
    .insert({ ...dane, pracodawca_id: pracodawcaId, status: "oczekuje" as StatusOferty })
    .select()
    .single();

  if (error) return { ok: false, blad: error.message };
  return { ok: true, oferta: data as Oferta };
}

// ---------- ogłoszenia jednego pracodawcy ------------------------------

export async function mojeOferty(pracodawcaId: string): Promise<Oferta[]> {
  if (!supabase) return czytajAtrape().filter((o) => o.pracodawca_id === pracodawcaId);

  const { data, error } = await supabase
    .from("oferta")
    .select("*")
    .eq("pracodawca_id", pracodawcaId)
    .order("utworzono", { ascending: false });

  return error || !data ? [] : (data as Oferta[]);
}

export async function wycofajOferte(id: string): Promise<boolean> {
  if (!supabase) {
    const lista = czytajAtrape().map((o) => (o.id === id ? { ...o, status: "wycofana" as StatusOferty } : o));
    zapiszAtrape(lista);
    return true;
  }
  const { error } = await supabase.from("oferta").update({ status: "wycofana" }).eq("id", id);
  return !error;
}

// ---------- poczekalnia moderatora -------------------------------------

export async function ofertyDoSprawdzenia(): Promise<Oferta[]> {
  if (!supabase) return czytajAtrape().filter((o) => o.status === "oczekuje");

  const { data, error } = await supabase
    .from("oferta")
    .select("*")
    .eq("status", "oczekuje")
    .order("utworzono", { ascending: true });

  return error || !data ? [] : (data as Oferta[]);
}

export async function rozstrzygnij(
  id: string,
  decyzja: "opublikowana" | "odrzucona",
  uwaga?: string,
): Promise<{ ok: boolean; blad?: string }> {
  if (!supabase) {
    const lista = czytajAtrape().map((o) =>
      o.id === id
        ? {
            ...o,
            status: decyzja,
            uwaga_moderacji: uwaga ?? null,
            opublikowano: decyzja === "opublikowana" ? new Date().toISOString() : o.opublikowano,
          }
        : o,
    );
    zapiszAtrape(lista);
    return { ok: true };
  }
  const { error } = await supabase
    .from("oferta")
    .update({ status: decyzja, uwaga_moderacji: uwaga ?? null })
    .eq("id", id);
  return error ? { ok: false, blad: error.message } : { ok: true };
}

// ---------- oferty na stronę -------------------------------------------

/** Mapuje ofertę z bazy na kartę, której używa sekcja „Oferty pracy". */
export function ofertaNaKarte(o: Oferta): Job {
  const jednostka = o.stawka_jednostka === "zl_h" ? "zł/h" : "zł/mies";
  const stawka =
    o.stawka_od && o.stawka_do && o.stawka_do !== o.stawka_od
      ? `${o.stawka_od}–${o.stawka_do} ${jednostka}`
      : o.stawka_od
        ? `${o.stawka_od} ${jednostka}`
        : "do uzgodnienia";

  const umowy: Record<string, string> = {
    umowa_o_prace: "Umowa o pracę",
    zlecenie: "Zlecenie",
    b2b: "B2B",
  };

  return {
    id: o.id,
    title: o.stanowisko,
    industry: (["produkcja", "logistyka", "budownictwo", "gastronomia"].includes(o.branza)
      ? o.branza
      : "produkcja") as Job["industry"],
    city: o.miasto,
    shifts: o.zmiany || (o.godzin_min_mies ? `min. ${o.godzin_min_mies} godz./mies.` : "do uzgodnienia"),
    contract: umowy[o.umowa] ?? o.umowa,
    rate: stawka,
    published_at: o.opublikowano ?? o.utworzono,
  };
}

export async function opublikowaneOferty(): Promise<Oferta[]> {
  if (!supabase) return czytajAtrape().filter((o) => o.status === "opublikowana");

  const { data, error } = await supabase
    .from("oferta")
    .select("*")
    .eq("status", "opublikowana")
    .order("opublikowano", { ascending: false })
    .limit(24);

  return error || !data ? [] : (data as Oferta[]);
}

// ---------- zdjęcie oferty ----------------------------------------------

export async function wyslijZdjecie(plik: File, uid: string): Promise<string | null> {
  if (!supabase) return URL.createObjectURL(plik); // podgląd w atrapie
  const sciezka = `${uid}/${Date.now()}-${plik.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const { error } = await supabase.storage.from("oferty").upload(sciezka, plik, { upsert: false });
  if (error) return null;
  return supabase.storage.from("oferty").getPublicUrl(sciezka).data.publicUrl;
}

// ---------- profil ------------------------------------------------------

export async function pobierzProfil(uid: string): Promise<Profil | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("profile").select("*").eq("id", uid).single();
  return error || !data ? null : (data as Profil);
}

export async function zapiszProfil(uid: string, zmiany: Partial<Profil>): Promise<boolean> {
  if (!supabase) return true;
  const { error } = await supabase.from("profile").update(zmiany).eq("id", uid);
  return !error;
}
