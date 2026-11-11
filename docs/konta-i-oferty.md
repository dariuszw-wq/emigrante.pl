# Konta pracodawców i samodzielne dodawanie ofert

Wersja robocza z 11.11.2026. **Nie jest wdrożona na emigrante.pl** — żyje na gałęzi
`funkcja/oferty-pracodawcow` i czeka na uzupełnienie spraw formalnych.

---

## 1. Jak to działa

Pracodawca klika **„Jestem pracodawcą, mam wakat"** w sekcji ofert (albo „Dodaj ogłoszenie",
gdy oferty już są) i przechodzi przez cztery kroki:

| Krok | Co się dzieje |
|---|---|
| Pytanie | „Chcesz wstawić ogłoszenie?" z informacją, że publikacja jest bezpłatna. Tak / Nie teraz. |
| Zasady | Siedem punktów regulaminu i dwie zgody — bez obu zaznaczonych przycisk „Dalej" jest nieaktywny. |
| Konto | Rejestracja albo logowanie. Konto zapamiętuje firmę, osobę kontaktową i telefon. |
| Ogłoszenie | Formularz pogrupowany w pięć sekcji, z walidacją. |
| Podgląd | Dokładnie taka karta, jaką zobaczy kandydat, plus dwie zgody końcowe. |

Po wysłaniu ogłoszenie dostaje status **„oczekuje"** i **nie pojawia się na stronie**.
Trafia do poczekalni moderatora, który może je opublikować albo odrzucić, dodając uwagę
widoczną w profilu pracodawcy.

Pracodawca w swoim profilu („Mój profil" w menu) widzi wszystkie swoje ogłoszenia ze
statusami i może je wycofać.

## 2. Co zbiera formularz

**Kogo szukasz** — stanowisko, branża, liczba osób.
**Gdzie i na jakich zasadach** — miejsce pracy, rodzaj umowy, minimum godzin w miesiącu,
system zmianowy.
**Wynagrodzenie** — stawka od–do, za godzinę albo miesięcznie, brutto/netto, premie.
**Co zapewniasz** — nocleg, transport, posiłki, pomoc w legalizacji, kurs języka, odzież,
premia za polecenie, zaliczka. Plus języki, w których można się dogadać.
**Opis** — na czym polega praca, wymagania, nieobowiązkowe zdjęcie.

Pola obowiązkowe to tylko **stanowisko** i **miejsce pracy**. Reszta jest opcjonalna, żeby
nie zniechęcać — ale „minimum godzin w miesiącu" ma podpowiedź, bo to pytanie, które
kandydaci zadają najczęściej.

## 3. Tryb roboczy bez bazy

Dopóki w `.env` nie ma `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`, całość działa na
atrapie: konto i ogłoszenia zapisują się **wyłącznie w pamięci przeglądarki**. W oknie
kreatora widać wtedy wyraźną ramkę „Wersja robocza". Nic nie trafia na serwer i nikt poza
tą jedną przeglądarką tego nie zobaczy.

Dzięki temu cały przepływ można wyklikać i ocenić, zanim powstanie zaplecze.

## 4. Uruchomienie zaplecza — krok po kroku

1. Załóż darmowy projekt na [supabase.com](https://supabase.com) (region: Frankfurt).
2. **SQL Editor** → wklej całą zawartość `supabase/schema.sql` → **Run**. Skrypt zakłada
   tabele `profile` i `oferta`, reguły dostępu, kosz na zdjęcia i zabezpieczenie, które nie
   pozwala pracodawcy samemu opublikować ogłoszenia.
3. **Project Settings → API** → skopiuj `Project URL` i klucz `anon public`.
4. W katalogu projektu utwórz plik `.env` (wzór w `.env.example`):
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
5. Te same dwie wartości dodaj w GitHubie: **Settings → Secrets and variables → Actions →
   Variables**, żeby trafiły do wersji produkcyjnej. Trzeba je też wczytać w
   `.github/workflows/deploy.yml` — to jeszcze do zrobienia.
6. Załóż sobie konto przez formularz na stronie, a potem w SQL Editor nadaj sobie
   uprawnienia moderatora:
   ```sql
   update public.profile set rola = 'moderator'
   where id = (select id from auth.users where email = 'TWOJ@EMAIL');
   ```
   Od tej chwili w menu pojawi się pozycja **„Do sprawdzenia"**.

## 5. Co musi powstać, zanim to ruszy publicznie

To nie są drobiazgi techniczne, tylko warunki, bez których nie wolno zbierać danych.

- [ ] **Administrator danych osobowych** — kto nim jest: kancelaria, spółka, osoba fizyczna.
      Bez tego nie da się napisać ani polityki prywatności, ani klauzuli informacyjnej.
- [ ] **Regulamin serwisu** — pełna treść. Siedem punktów w kreatorze to szkic do rozwinięcia.
- [ ] **Polityka prywatności** i **klauzula informacyjna z art. 13 RODO** — co zbieramy,
      po co, jak długo trzymamy, komu udostępniamy, jakie prawa ma użytkownik.
- [ ] **Podstrony** `/regulamin` i `/polityka-prywatnosci` z linkami w kreatorze i w stopce.
      Po ich dodaniu trzeba też wpisać adres polityki do konfiguracji czatu (`PRC_CZAT.polityka`),
      żeby pojawił się checkbox zgody.
- [ ] **Wysyłka powiadomień e-mail** do pracodawcy po decyzji moderatora. Dziś kreator
      obiecuje taką wiadomość, ale nic jej jeszcze nie wysyła.
- [ ] **Potwierdzanie adresu e-mail** — włączyć w Supabase (Authentication → Providers).
- [ ] **Decyzja o weryfikacji firm** — czy wymagamy NIP i sprawdzamy go w rejestrze, czy
      wystarcza moderacja ręczna.

## 6. Czego świadomie jeszcze nie ma

- **Konta kandydatów.** Model danych je przewiduje (`rola_konta` ma wartość `kandydat`),
  ale żaden ekran dla nich nie powstał. To osobny temat: profil, CV, zgłoszenia na oferty.
- **Odpowiadanie na ogłoszenia.** Przycisk „Aplikuj" prowadzi dziś do sekcji kontaktowej,
  a nie do zgłoszenia przypisanego do konkretnej oferty.
- **Tłumaczenia kreatora.** Interfejs pracodawcy jest po polsku. Tłumaczenia na cztery
  pozostałe języki ma sens robić dopiero wtedy, gdy treść regulaminu będzie zatwierdzona —
  inaczej przetłumaczymy tekst, który i tak się zmieni.
- **Wygasanie ogłoszeń.** Baza ustawia datę wygaśnięcia na 60 dni, ale nic jej jeszcze nie
  sprząta — trzeba dopisać zadanie cykliczne albo filtrować po stronie zapytania.

## 7. Gdzie co leży

```
supabase/schema.sql                       baza: tabele, reguły dostępu, zabezpieczenia
src/lib/auth.tsx                          logowanie i rejestracja (+ tryb atrapy)
src/lib/panels.tsx                        otwieranie okien z dowolnego miejsca strony
src/data/offers.ts                        zapis i odczyt ofert, mapowanie na kartę
src/components/employer/EmployerFlow.tsx  kreator: pytanie → zasady → konto → formularz → podgląd
src/components/employer/OfferForm.tsx     formularz i walidacja
src/components/employer/OfferPreview.tsx  karta oferty widziana przez kandydata
src/components/employer/EmployerPanel.tsx profil pracodawcy i poczekalnia moderatora
src/components/ui/dialog.tsx              okno modalne
src/components/ui/form.tsx                pola formularza w stylu strony
```
