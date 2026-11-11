import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { pobierzProfil } from "@/data/offers";
import type { Profil, RolaKonta } from "@/data/types";

/**
 * Logowanie i rejestracja.
 *
 * Z podłączonym Supabase działa na prawdziwych kontach (e-mail + hasło,
 * potwierdzenie adresu zgodnie z ustawieniami projektu). Bez Supabase
 * uruchamia się tryb atrapy: „konto" istnieje tylko w tej przeglądarce,
 * nie ma żadnego hasła ani danych na serwerze. Służy wyłącznie do tego,
 * żeby przejść cały przepływ i ocenić go przed wdrożeniem.
 */

interface DaneRejestracji {
  email: string;
  haslo: string;
  rola: RolaKonta;
  firma?: string;
  osoba_kontakt?: string;
  telefon?: string;
  miasto?: string;
  zgoda_regulamin: boolean;
  zgoda_dane: boolean;
}

interface Kontekst {
  uid: string | null;
  email: string | null;
  profil: Profil | null;
  laduje: boolean;
  trybAtrapy: boolean;
  zalogowany: boolean;
  moderator: boolean;
  zarejestruj: (d: DaneRejestracji) => Promise<{ ok: boolean; blad?: string; potwierdzEmail?: boolean }>;
  zaloguj: (email: string, haslo: string) => Promise<{ ok: boolean; blad?: string }>;
  wyloguj: () => Promise<void>;
  odswiezProfil: () => Promise<void>;
}

const KLUCZ_ATRAPY = "emigrante.konto.atrapa";
const Ctx = createContext<Kontekst | null>(null);

function czytajAtrape(): { uid: string; email: string; profil: Profil } | null {
  try {
    const raw = localStorage.getItem(KLUCZ_ATRAPY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const trybAtrapy = supabase === null;
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [laduje, setLaduje] = useState(true);

  useEffect(() => {
    if (trybAtrapy) {
      const zapis = czytajAtrape();
      if (zapis) {
        setUid(zapis.uid);
        setEmail(zapis.email);
        setProfil(zapis.profil);
      }
      setLaduje(false);
      return;
    }

    supabase!.auth.getSession().then(async ({ data }) => {
      const s = data.session;
      if (s) {
        setUid(s.user.id);
        setEmail(s.user.email ?? null);
        setProfil(await pobierzProfil(s.user.id));
      }
      setLaduje(false);
    });

    const { data: sub } = supabase!.auth.onAuthStateChange(async (_zdarzenie, s) => {
      if (s) {
        setUid(s.user.id);
        setEmail(s.user.email ?? null);
        setProfil(await pobierzProfil(s.user.id));
      } else {
        setUid(null);
        setEmail(null);
        setProfil(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [trybAtrapy]);

  const wartosc = useMemo<Kontekst>(
    () => ({
      uid,
      email,
      profil,
      laduje,
      trybAtrapy,
      zalogowany: uid !== null,
      moderator: profil?.rola === "moderator",

      async zarejestruj(d) {
        if (trybAtrapy) {
          const nowy = {
            uid: "atrapa-" + Math.random().toString(36).slice(2, 10),
            email: d.email,
            profil: {
              id: "atrapa",
              rola: d.rola,
              firma: d.firma ?? null,
              osoba_kontakt: d.osoba_kontakt ?? null,
              telefon: d.telefon ?? null,
              miasto: d.miasto ?? null,
              zgoda_regulamin: d.zgoda_regulamin,
              zgoda_dane: d.zgoda_dane,
              zgoda_data: new Date().toISOString(),
              utworzono: new Date().toISOString(),
            } as Profil,
          };
          nowy.profil.id = nowy.uid;
          try {
            localStorage.setItem(KLUCZ_ATRAPY, JSON.stringify(nowy));
          } catch {
            /* brak dostępu do pamięci przeglądarki — konto atrapy zniknie po odświeżeniu */
          }
          setUid(nowy.uid);
          setEmail(nowy.email);
          setProfil(nowy.profil);
          return { ok: true };
        }

        const { data, error } = await supabase!.auth.signUp({
          email: d.email,
          password: d.haslo,
          options: {
            data: {
              rola: d.rola,
              firma: d.firma,
              osoba_kontakt: d.osoba_kontakt,
              telefon: d.telefon,
              miasto: d.miasto,
              zgoda_regulamin: d.zgoda_regulamin,
              zgoda_dane: d.zgoda_dane,
            },
          },
        });
        if (error) return { ok: false, blad: error.message };
        return { ok: true, potwierdzEmail: data.session === null };
      },

      async zaloguj(mail, haslo) {
        if (trybAtrapy) {
          const zapis = czytajAtrape();
          if (zapis && zapis.email === mail) {
            setUid(zapis.uid);
            setEmail(zapis.email);
            setProfil(zapis.profil);
            return { ok: true };
          }
          return { ok: false, blad: "W trybie roboczym istnieje tylko konto założone w tej przeglądarce." };
        }
        const { error } = await supabase!.auth.signInWithPassword({ email: mail, password: haslo });
        return error ? { ok: false, blad: error.message } : { ok: true };
      },

      async wyloguj() {
        if (trybAtrapy) {
          try {
            localStorage.removeItem(KLUCZ_ATRAPY);
          } catch {
            /* nic nie szkodzi */
          }
          setUid(null);
          setEmail(null);
          setProfil(null);
          return;
        }
        await supabase!.auth.signOut();
      },

      async odswiezProfil() {
        if (uid && !trybAtrapy) setProfil(await pobierzProfil(uid));
      },
    }),
    [uid, email, profil, laduje, trybAtrapy],
  );

  return <Ctx.Provider value={wartosc}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth musi być użyte wewnątrz <AuthProvider>");
  return c;
}
