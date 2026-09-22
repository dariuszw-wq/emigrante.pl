# emigrante.pl — strona główna

Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui, i18n (PL/EN/UK/RU/ES, `react-i18next`), Supabase (oferty, statystyki, opinie, stawki opłat, leady).

Odwzorowanie 1:1 handoffu `design_handoff_emigrante_strona_glowna/README.md`.

## Uruchomienie

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/
```

## Supabase

1. Utwórz projekt na https://supabase.com i w **SQL Editor** uruchom `supabase/schema.sql` (tabele `jobs`, `stats`, `testimonials`, `fee_rates`, `leads` + RLS + seed).
2. Skopiuj `.env.example` → `.env` i wpisz `VITE_SUPABASE_URL` oraz `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
3. Bez `.env` strona działa na danych seed z `src/data/seed.ts`, a leady są tylko logowane w konsoli.

Leady trafiają do tabeli `leads` (kolumny: `name`, `contact`, `role` = `kandydat`|`pracodawca`, `lang`). Powiadomienie e-mail: podłącz Database Webhook na `leads` → Edge Function / Resend.

Zmiana opłat legalizacyjnych i składek: tabela `fee_rates` (bez deployu).

## Deploy (GitHub Pages — jak pozostałe strony kancelarii)

Repo: https://github.com/dariuszw-wq/emigrante.pl. Każdy push na `main` uruchamia `.github/workflows/deploy.yml` (build + publikacja do GitHub Pages).

Zmienne budowania: Settings → Secrets and variables → Actions → **Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (opcjonalnie `SITE_BASE`, domyślnie `/`).

## Domena emigrante.pl

Plik `public/CNAME` zawiera `emigrante.pl`. U rejestratora domeny ustaw:

| Typ   | Nazwa | Wartość                 |
|-------|-------|-------------------------|
| A     | @     | `185.199.108.153`       |
| A     | @     | `185.199.109.153`       |
| A     | @     | `185.199.110.153`       |
| A     | @     | `185.199.111.153`       |
| CNAME | www   | `dariuszw-wq.github.io` |

Potem w repo: Settings → Pages → Custom domain = `emigrante.pl`, zaznacz **Enforce HTTPS** (po propagacji DNS, do 24 h).

## Struktura

```
src/
  components/sections/   14 sekcji strony (TopBar … Footer)
  components/ui/         shadcn/ui: button, input, slider
  data/                  typy, seed, api (Supabase z fallbackiem), kontakt
  hooks/useCountUp.ts    liczniki (IntersectionObserver, 1600 ms, ease-out cubic)
  i18n/locales/*.json    słowniki 5 języków
  index.css              tokeny (@theme), keyframes karuzeli, utilities
supabase/schema.sql      schemat + RLS + seed
```

## Do uzupełnienia

- Zdjęcia: komponent `ImageSlot` — przekaż `src` (8 kafli karuzeli, 3 awatary, sekcja legalizacji, 3 case studies, 3 wpisy bloga).
- Dane kontaktowe i nr KRAZ: `src/data/contact.ts`, klucz `footer.about` w słownikach.
- Logotypy pracodawców: `src/data/seed.ts` → `logos` (docelowo SVG).
- Podstrony (oferty, blog, case studies, polityka prywatności, regulamin) — linki prowadzą dziś do kotwic.
