# Projekt: strona emigrante.pl — instrukcje dla Claude Code

Właściciel: Dariusz Włodarczyk — „Prawnik — Specjalizacja: Legalizacja Pobytu i Pracy Cudzoziemców”
(NIGDY: adwokat / radca prawny / attorney). Odpowiadaj zawsze po polsku.

## Lokalizacje (od 27.09.2026)
- Katalog projektu: `D:\PROJEKTY\STRONY\emigrante.pl\` — **JEDYNY** katalog tego projektu.
  Nie pracuj w żadnej innej kopii i nie twórz nowych.
- ŹRÓDŁO PRAWDY = repo GitHub https://github.com/dariuszw-wq/emigrante.pl (gałąź `main`).
  Przed każdą pracą: `git pull --ff-only origin main`.
- Stare lokalizacje `C:\Projekty\emigrante.pl\` i `G:\Mój dysk\STRONY\Strona_emigrante.pl\`
  NIE są już używane — do usunięcia przy porządkach.
- Kopie zapasowe: wyłącznie repozytorium GitHub. Bez mirrorów na Google Drive.
- Wszystkie prace prowadzimy w Claude Code — **nie w Claude Cowork** (żadnych zadań w sandboksie Cowork).

## Stack i wdrożenie
- Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui; i18n PL/EN/UK/RU/ES (`react-i18next`, `?lang=`).
- Hosting: GitHub Pages przez `.github/workflows/deploy.yml`. Push na `main` = deploy (~1 min).
- Przed commitem: `npm run build` musi przejść. Commit kończymy linią
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- Domena: emigrante.pl (DNS w dhosting/dpanel.pl: 4× A → GitHub Pages, `www` CNAME → `dariuszw-wq.github.io`,
  TXT `google-site-verification` — **nie usuwać**). HTTPS wymuszone. `public/CNAME` zawiera `emigrante.pl`.
- gh CLI: `"C:\Program Files\GitHub CLI\gh.exe"`, zalogowane jako dariuszw-wq.

## Kontakt = czat (nie formularz)
`public/czat-widget.js` + `public/czat-jezyki.js` — ten sam widget co na ekartapobytu.pl, teksty w 5 językach.
Osadzenie i konfiguracja w `index.html`. Dowolny element z atrybutem `data-prc-otworz-czat` otwiera czat.
Zgłoszenia trafiają do wspólnego arkusza Google z polem `site = emigrante.pl`. Supabase nieużywane.

## Automaty (zadania zaplanowane Claude Code, `C:\Users\PC\.claude\scheduled-tasks\`)
- `emigrante-monitor-tygodniowy` — poniedziałki 9:00: dostępność, robots, sitemap, canonical,
  Search Console (sc-domain:emigrante.pl), auto-zgłoszenie do indeksu, JSON-LD, wydajność.

## Do uzupełnienia
- Zdjęcia (nazwy plików i rozmiary w `README.md`, sekcja „Zdjęcia — gdzie wgrać”).
- Numer KRAZ w `src/data/contact.ts` i kluczu `footer.about` w słownikach.
- Podstrony (oferty, blog, case studies, polityka prywatności, regulamin) — dziś linki prowadzą do kotwic.
  Po dodaniu polityki prywatności dopisać jej adresy do konfiguracji czatu (`PRC_CZAT.polityka`), żeby
  pojawił się checkbox zgody RODO.
