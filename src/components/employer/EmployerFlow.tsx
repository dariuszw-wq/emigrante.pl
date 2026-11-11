import { useState } from "react";
import { ArrowLeft, ArrowRight, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Kroki, Pole, Tekst, Zgoda } from "@/components/ui/form";
import { useAuth } from "@/lib/auth";
import { wyslijZdjecie, zlozOferte } from "@/data/offers";
import type { NowaOferta } from "@/data/types";
import { OfferForm, PUSTA_OFERTA, sprawdzOferte, type Bledy } from "./OfferForm";
import { OfferPreview } from "./OfferPreview";

type Krok = "pytanie" | "zasady" | "konto" | "formularz" | "podglad" | "gotowe" | "rezygnacja";

const NAZWY_KROKOW = ["Zasady", "Konto", "Ogłoszenie", "Podgląd"];
const INDEKS: Partial<Record<Krok, number>> = { zasady: 0, konto: 1, formularz: 2, podglad: 3 };

/**
 * Przepływ „chcę wstawić ogłoszenie".
 * Pytanie → zasady i zgody → konto → formularz → podgląd → wysyłka do sprawdzenia.
 * Ogłoszenie NIE trafia na stronę samo: po wysłaniu czeka na akceptację.
 */
export function EmployerFlow({ otwarte, zamknij }: { otwarte: boolean; zamknij: () => void }) {
  const auth = useAuth();
  const [krok, setKrok] = useState<Krok>("pytanie");

  // zgody z ekranu zasad
  const [zgodaRegulamin, setZgodaRegulamin] = useState(false);
  const [zgodaDane, setZgodaDane] = useState(false);

  // rejestracja / logowanie
  const [tryb, setTryb] = useState<"rejestracja" | "logowanie">("rejestracja");
  const [email, setEmail] = useState("");
  const [haslo, setHaslo] = useState("");
  const [firma, setFirma] = useState("");
  const [osoba, setOsoba] = useState("");
  const [telefon, setTelefon] = useState("");
  const [bladKonta, setBladKonta] = useState<string | null>(null);
  const [czekaNaMail, setCzekaNaMail] = useState(false);

  // oferta
  const [oferta, setOferta] = useState<NowaOferta>(PUSTA_OFERTA);
  const [bledy, setBledy] = useState<Bledy>({});
  const [zgodaPublikacja, setZgodaPublikacja] = useState(false);
  const [zgodaPrawda, setZgodaPrawda] = useState(false);
  const [wysylam, setWysylam] = useState(false);
  const [bladWysylki, setBladWysylki] = useState<string | null>(null);

  function zamknijIWyzeruj() {
    zamknij();
    setTimeout(() => {
      setKrok("pytanie");
      setOferta(PUSTA_OFERTA);
      setBledy({});
      setZgodaPublikacja(false);
      setZgodaPrawda(false);
      setBladWysylki(null);
      setBladKonta(null);
      setCzekaNaMail(false);
    }, 200);
  }

  async function zalozKonto() {
    setBladKonta(null);
    if (!email.includes("@") || haslo.length < 8) {
      setBladKonta("Podaj poprawny adres e-mail i hasło o długości co najmniej 8 znaków.");
      return;
    }
    const w =
      tryb === "rejestracja"
        ? await auth.zarejestruj({
            email,
            haslo,
            rola: "pracodawca",
            firma,
            osoba_kontakt: osoba,
            telefon,
            zgoda_regulamin: zgodaRegulamin,
            zgoda_dane: zgodaDane,
          })
        : await auth.zaloguj(email, haslo);

    if (!w.ok) {
      setBladKonta(w.blad ?? "Nie udało się. Spróbuj jeszcze raz.");
      return;
    }
    if ("potwierdzEmail" in w && w.potwierdzEmail) {
      setCzekaNaMail(true);
      return;
    }
    setKrok("formularz");
  }

  async function wyslij() {
    const b = sprawdzOferte(oferta);
    setBledy(b);
    if (Object.keys(b).length > 0) {
      setKrok("formularz");
      return;
    }
    setWysylam(true);
    setBladWysylki(null);
    const w = await zlozOferte(
      {
        ...oferta,
        zgoda_publikacja: zgodaPublikacja,
        zgoda_prawdziwosc: zgodaPrawda,
        zgoda_data: new Date().toISOString(),
      },
      auth.uid!,
    );
    setWysylam(false);
    if (w.ok) setKrok("gotowe");
    else setBladWysylki(w.blad);
  }

  const tytuly: Record<Krok, string> = {
    pytanie: "Chcesz wstawić ogłoszenie o pracy?",
    zasady: "Zasady, na które musisz się zgodzić",
    konto: tryb === "rejestracja" ? "Załóż konto pracodawcy" : "Zaloguj się",
    formularz: "Twoje ogłoszenie",
    podglad: "Tak zobaczy je kandydat",
    gotowe: "Ogłoszenie czeka na sprawdzenie",
    rezygnacja: "Nic nie szkodzi",
  };

  return (
    <Dialog
      otwarte={otwarte}
      zamknij={zamknijIWyzeruj}
      tytul={tytuly[krok]}
      szerokosc={krok === "formularz" || krok === "podglad" ? "lg" : "md"}
    >
      {auth.trybAtrapy && krok !== "gotowe" && (
        <p className="mb-6 flex items-start gap-[10px] rounded-[14px] border-[1.5px] border-dashed border-navy/25 bg-white/70 p-4 text-[13px] leading-[1.5] text-ink-2">
          <Info size={17} className="mt-[1px] flex-none text-olive" />
          <span>
            <strong className="font-bold">Wersja robocza.</strong> Baza danych nie jest jeszcze podłączona, więc konto
            i ogłoszenie zapisują się tylko w tej przeglądarce. Nikt poza Tobą ich nie zobaczy, a po wdrożeniu znikną.
          </span>
        </p>
      )}

      {INDEKS[krok] !== undefined && <Kroki ile={4} aktualny={INDEKS[krok]!} nazwy={NAZWY_KROKOW} />}

      {/* ---------- 0. Pytanie ---------- */}
      {krok === "pytanie" && (
        <div>
          <p className="text-[16px] leading-[1.65] text-ink-2">
            Publikacja ogłoszenia na emigrante.pl jest <strong className="font-bold text-ink">całkowicie bezpłatna</strong>
            . Nie pobieramy opłat za wystawienie, wyróżnienie ani przedłużenie oferty.
          </p>
          <p className="mt-3 text-[15px] leading-[1.6] text-muted">
            Zajmie to kilka minut. Zanim ogłoszenie trafi na stronę, sprawdzimy je — zwykle tego samego dnia roboczego.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="navy" size="lg" onClick={() => setKrok("zasady")}>
              Tak, chcę wstawić ogłoszenie
            </Button>
            <Button variant="outline" size="lg" onClick={() => setKrok("rezygnacja")}>
              Nie teraz
            </Button>
          </div>
        </div>
      )}

      {/* ---------- rezygnacja ---------- */}
      {krok === "rezygnacja" && (
        <div>
          <p className="text-[15px] leading-[1.65] text-ink-2">
            Jeśli wolisz porozmawiać, zanim cokolwiek wypełnisz — odezwij się na czacie. Odpowiadamy po polsku,
            angielsku, ukraińsku, rosyjsku i hiszpańsku.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="navy" size="lg" data-prc-otworz-czat="pracodawca-rezygnacja" onClick={zamknijIWyzeruj}>
              Napisz na czacie
            </Button>
            <Button variant="outline" size="lg" onClick={() => setKrok("pytanie")}>
              Wróć
            </Button>
          </div>
        </div>
      )}

      {/* ---------- 1. Zasady ---------- */}
      {krok === "zasady" && (
        <div>
          <div className="space-y-4 text-[14px] leading-[1.6] text-ink-2">
            <p className="flex items-start gap-[10px] rounded-[14px] bg-lime-tint/50 p-4">
              <TriangleAlert size={18} className="mt-[1px] flex-none text-lime-text" />
              <span>
                Ogłoszenie będzie <strong className="font-bold text-ink">publicznie dostępne w internecie</strong>.
                Wszystko, co w nim napiszesz — nazwa firmy, miasto, dane kontaktowe — zobaczy każdy odwiedzający i
                wyszukiwarki. Nie wpisuj niczego, czego nie chcesz upubliczniać.
              </span>
            </p>

            <ol className="space-y-[10px] pl-5 [counter-reset:z] marker:font-bold marker:text-olive">
              <li className="list-decimal">Publikacja jest bezpłatna. Nie pobieramy opłat od pracodawców ani od kandydatów.</li>
              <li className="list-decimal">
                Każde ogłoszenie sprawdzamy przed publikacją. Możemy odmówić publikacji albo usunąć ogłoszenie, jeśli
                budzi wątpliwości.
              </li>
              <li className="list-decimal">
                <strong className="font-bold text-ink">Nie wolno</strong> żądać od kandydatów jakichkolwiek opłat za
                pracę, pośrednictwo, zakwaterowanie przed podjęciem pracy ani za dokumenty legalizacyjne.
              </li>
              <li className="list-decimal">
                Ogłoszenie nie może zawierać wymagań różnicujących kandydatów ze względu na narodowość, płeć, wiek,
                religię, wyznanie, orientację seksualną ani inną cechę niezwiązaną z pracą (art. 18<sup>3a</sup>{" "}
                Kodeksu pracy).
              </li>
              <li className="list-decimal">
                Warunki, które podajesz, muszą być prawdziwe i zgodne z prawem pracy — w tym z minimalną stawką
                godzinową i przepisami o czasie pracy.
              </li>
              <li className="list-decimal">
                Odpowiadasz za treść ogłoszenia i za to, że masz prawo podać zamieszczone w nim dane. Jeśli wgrywasz
                zdjęcie, musisz mieć do niego prawa, a osoby na nim widoczne — wyrazić zgodę.
              </li>
              <li className="list-decimal">
                Ogłoszenie możesz w każdej chwili wycofać ze swojego profilu. Publikujemy je na 60 dni, potem wygasa.
              </li>
            </ol>

            <p className="rounded-[14px] border-[1.5px] border-dashed border-navy/25 p-4 text-[13px]">
              <strong className="font-bold text-ink">Do uzupełnienia przed uruchomieniem:</strong> administrator danych
              osobowych, pełna treść regulaminu i polityki prywatności oraz informacja o przetwarzaniu danych (art. 13
              RODO). Dopóki ich nie ma, przepływ działa tylko jako wersja robocza.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Zgoda zaznaczone={zgodaRegulamin} zmien={setZgodaRegulamin}>
              Przeczytałem i akceptuję powyższe zasady oraz regulamin serwisu.
            </Zgoda>
            <Zgoda zaznaczone={zgodaDane} zmien={setZgodaDane}>
              Wiem, że dane podane w ogłoszeniu będą publicznie dostępne w internecie, i zgadzam się na ich publikację.
            </Zgoda>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              variant="navy"
              size="lg"
              disabled={!zgodaRegulamin || !zgodaDane}
              onClick={() => setKrok(auth.zalogowany ? "formularz" : "konto")}
            >
              Dalej <ArrowRight size={16} />
            </Button>
            <Button variant="outline" size="md" onClick={() => setKrok("pytanie")}>
              <ArrowLeft size={16} /> Wstecz
            </Button>
          </div>
        </div>
      )}

      {/* ---------- 2. Konto ---------- */}
      {krok === "konto" && (
        <div>
          {czekaNaMail ? (
            <div>
              <p className="text-[15px] leading-[1.65] text-ink-2">
                Wysłaliśmy wiadomość na adres <strong className="font-bold text-ink">{email}</strong>. Kliknij link w
                mailu, żeby potwierdzić konto, a potem wróć tutaj i zaloguj się.
              </p>
              <Button
                className="mt-6"
                variant="outline"
                size="md"
                onClick={() => {
                  setCzekaNaMail(false);
                  setTryb("logowanie");
                }}
              >
                Mam już potwierdzone konto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[14px] leading-[1.6] text-muted">
                Konto pozwala Ci wrócić do ogłoszenia, poprawić je i zobaczyć wszystkie swoje oferty w jednym miejscu.
              </p>

              {tryb === "rejestracja" && (
                <>
                  <Pole etykieta="Nazwa firmy" podpowiedz="Tak, jak ma się wyświetlać przy ogłoszeniu.">
                    <Tekst value={firma} onChange={(e) => setFirma(e.target.value)} placeholder="NORDPAK sp. z o.o." />
                  </Pole>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Pole etykieta="Osoba do kontaktu">
                      <Tekst value={osoba} onChange={(e) => setOsoba(e.target.value)} placeholder="Anna Kowalska" />
                    </Pole>
                    <Pole etykieta="Telefon">
                      <Tekst
                        value={telefon}
                        onChange={(e) => setTelefon(e.target.value)}
                        placeholder="+48 600 000 000"
                      />
                    </Pole>
                  </div>
                </>
              )}

              <Pole etykieta="Adres e-mail" wymagane>
                <Tekst
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="biuro@firma.pl"
                />
              </Pole>

              <Pole etykieta="Hasło" wymagane podpowiedz="Co najmniej 8 znaków.">
                <Tekst
                  type="password"
                  autoComplete={tryb === "rejestracja" ? "new-password" : "current-password"}
                  value={haslo}
                  onChange={(e) => setHaslo(e.target.value)}
                />
              </Pole>

              {bladKonta && (
                <p className="rounded-[14px] bg-red-50 p-4 text-[13px] font-semibold text-red-700">{bladKonta}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button variant="navy" size="lg" onClick={zalozKonto}>
                  {tryb === "rejestracja" ? "Załóż konto" : "Zaloguj się"} <ArrowRight size={16} />
                </Button>
                <button
                  type="button"
                  className="cursor-pointer text-[14px] font-bold text-navy-link underline-offset-4 hover:underline"
                  onClick={() => {
                    setTryb(tryb === "rejestracja" ? "logowanie" : "rejestracja");
                    setBladKonta(null);
                  }}
                >
                  {tryb === "rejestracja" ? "Mam już konto" : "Nie mam jeszcze konta"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------- 3. Formularz ---------- */}
      {krok === "formularz" && (
        <div>
          <OfferForm
            oferta={oferta}
            zmien={setOferta}
            bledy={bledy}
            naZdjecie={async (plik) => {
              const url = await wyslijZdjecie(plik, auth.uid ?? "anonim");
              if (url) setOferta((o) => ({ ...o, zdjecie: url }));
            }}
          />
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-navy/8 pt-6">
            <Button
              variant="navy"
              size="lg"
              onClick={() => {
                const b = sprawdzOferte(oferta);
                setBledy(b);
                if (Object.keys(b).length === 0) setKrok("podglad");
              }}
            >
              Zobacz podgląd <ArrowRight size={16} />
            </Button>
            <Button variant="outline" size="md" onClick={() => setKrok(auth.zalogowany ? "zasady" : "konto")}>
              <ArrowLeft size={16} /> Wstecz
            </Button>
          </div>
        </div>
      )}

      {/* ---------- 4. Podgląd ---------- */}
      {krok === "podglad" && (
        <div>
          <OfferPreview oferta={oferta} firma={auth.profil?.firma ?? firma} />

          <div className="mt-6 space-y-3">
            <Zgoda zaznaczone={zgodaPrawda} zmien={setZgodaPrawda} wyrozniona>
              Oświadczam, że podane warunki pracy i wynagrodzenia są prawdziwe i zgodne z prawem pracy.
            </Zgoda>
            <Zgoda zaznaczone={zgodaPublikacja} zmien={setZgodaPublikacja} wyrozniona>
              Zgadzam się na publikację tego ogłoszenia wraz z podanymi danymi na stronie emigrante.pl.
            </Zgoda>
          </div>

          {bladWysylki && (
            <p className="mt-4 rounded-[14px] bg-red-50 p-4 text-[13px] font-semibold text-red-700">{bladWysylki}</p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button
              variant="lime"
              size="lg"
              disabled={!zgodaPrawda || !zgodaPublikacja || wysylam}
              onClick={wyslij}
            >
              {wysylam ? "Wysyłam…" : "Wyślij do sprawdzenia"}
            </Button>
            <Button variant="outline" size="md" onClick={() => setKrok("formularz")}>
              <ArrowLeft size={16} /> Popraw ogłoszenie
            </Button>
          </div>
        </div>
      )}

      {/* ---------- 5. Gotowe ---------- */}
      {krok === "gotowe" && (
        <div>
          <p className="flex items-start gap-3 text-[16px] leading-[1.6] text-ink-2">
            <CircleCheck size={22} className="mt-[2px] flex-none text-lime-text" />
            <span>
              Ogłoszenie trafiło do sprawdzenia. Zanim pojawi się na stronie, przeczyta je człowiek — zwykle tego samego
              dnia roboczego. O wyniku powiadomimy Cię e-mailem.
            </span>
          </p>
          <p className="mt-4 text-[14px] leading-[1.6] text-muted">
            Status zobaczysz w swoim profilu. Tam też możesz je poprawić albo wycofać.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="navy" size="lg" onClick={zamknijIWyzeruj}>
              Zamknij
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setOferta(PUSTA_OFERTA);
                setZgodaPrawda(false);
                setZgodaPublikacja(false);
                setKrok("formularz");
              }}
            >
              Dodaj kolejne ogłoszenie
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
