# Prompty do Kling AI — zdjęcia na emigrante.pl

Dokument roboczy do zlecenia. Zamawiamy **25 ujęć**, z których wybieram **15** na stronę.
Stan na 11.11.2026. Prompty są uniwersalne — zadziałają też w innym generatorze.

---

## 1. Co jest do obsadzenia

Kod strony już czeka na te pliki. Każda ramka ma ustaloną ścieżkę i proporcje — wystarczy
wrzucić plik o właściwej nazwie, zdjęcie pojawia się samo, bez zmian w kodzie.

| Miejsce na stronie | Plik docelowy | Proporcje | Ile |
|---|---|---|---|
| Karuzela w nagłówku | `hero-01.jpg` … `hero-08.jpg` | **3:4 pion** | 8 |
| Sekcja „Legalizacja" | `legalizacja.jpg` | **16:9 poziom** | 1 |
| Realizacje — hala, magazyn, budowa | `case-01.jpg` … `case-03.jpg` | **16:9 poziom** | 3 |
| Rezerwa na blog i podstrony | — | 16:9 poziom | 3 |

Razem **15 wybranych z 25 zamówionych**. Nadwyżka jest celowa: przy generowaniu AI część
ujęć zawsze wychodzi nienaturalnie — dłonie, twarze, sprzęt — i trzeba mieć z czego wybierać.

**Awatary przy ocenie — 3 kółka obok pięciu gwiazdek — celowo pomijam.** Wygenerowane
twarze stałyby tam jako „zadowoleni klienci" przy ocenie i liczbie „+1k". To fabrykowanie
opinii, a przy kancelarii realne ryzyko wizerunkowe. Proponuję usunąć te kółka albo wstawić
prawdziwe zdjęcia osób, które dadzą pisemną zgodę. Decyzja Twoja, ale nie generujmy tego.

---

## 2. Ustawienia w generatorze

- **Proporcje:** 3:4 dla pionów, 16:9 dla poziomów. Niech ustawią od razu — przycinanie
  kwadratu do pionu obcina głowy.
- **Rozdzielczość:** maksymalna dostępna, minimum **1600 px** na dłuższym boku. Strona
  wyświetla 800 px, ale na ekranach retina potrzebujemy dwukrotności.
- **Warianty:** 2–4 na każdy prompt. Im więcej, tym pewniejszy wybór.
- **Znak wodny:** jeśli plan pozwala — wyłączyć. Jeśli nie, trudno, przycinam pasek sam.
- **Język promptu:** angielski. Generatory rozumieją go znacznie dokładniej niż polski.

---

## 3. Blok stylu — doklejany do KAŻDEGO promptu

Bez tego osiem zdjęć w karuzeli będzie wyglądać jak osiem różnych stron internetowych.

```
documentary editorial photography, natural available light, overcast Central European
daylight, realistic muted colours, cool neutral palette with warm skin tones, 35mm lens,
shallow depth of field, candid unposed moment, modern Poland, European industrial
architecture, no text anywhere
```

## 4. Negative prompt — doklejany do KAŻDEGO promptu

```
text, letters, words, numbers, logos, brand names, watermark, signage with writing,
distorted hands, extra fingers, deformed face, plastic skin, oversaturated, HDR,
cartoon, illustration, 3d render, stock photo smile, american setting, US flag
```

**Dlaczego „no text":** AI nie napisze poprawnie po polsku. Każdy napis na kamizelce,
tablicy czy dokumencie wyjdzie jako bełkot i od razu zdradzi, że zdjęcie jest sztuczne.
Lepiej czyste powierzchnie.

---

## 5. Prompty

### Karuzela — 12 ujęć pionowych 3:4 (wybiorę 8)

**01 · Operatorka linii pakującej**
```
Vertical portrait of a woman in her late twenties wearing a clean hi-vis vest and hairnet,
standing beside a packaging line in a modern Polish food factory, hands relaxed, looking
calmly towards the camera, machinery softly out of focus behind her
```

**02 · Magazynier przy regałach**
```
Vertical portrait of a man in his thirties in a hi-vis vest and work gloves standing in
front of tall pallet racking in a bright modern warehouse, a forklift blurred in the
background, confident relaxed posture
```

**03 · Zbrojarz na budowie**
```
Vertical portrait of a construction worker in a hard hat and dusty work jacket on a Polish
residential building site, rebar and scaffolding behind him, late afternoon overcast light,
weathered honest face
```

**04 · Pomoc kuchenna**
```
Vertical shot of a young man in a white kitchen apron working at a stainless steel prep
counter in a busy restaurant kitchen, steam and warm highlights, caught mid-task, not
looking at the camera
```

**05 · Spawacz**
```
Vertical portrait of a welder lifting a protective mask onto his forehead in a metal
workshop, sparks extinguished, blue-grey industrial interior, calm focused expression
```

**06 · Zmiana w bramie zakładu**
```
Vertical shot of a small group of factory workers in hi-vis vests walking out through a
factory gate at shift change, motion slightly blurred, grey Polish morning, backs and
three-quarter views
```

**07 · Magazyn — skaner**
```
Vertical portrait of a woman in a logistics uniform holding a barcode scanner between
warehouse shelves, looking down at her work, soft industrial lighting
```

**08 · Monterka AGD**
```
Vertical portrait of a woman in her forties at an assembly workstation in an appliance
factory, protective glasses pushed up, hands resting on the bench, quiet dignified moment
```

**09 · Pokojowa w hotelu**
```
Vertical shot of a hotel housekeeper in a neat uniform pushing a linen trolley along a
bright hotel corridor, window light from the side, natural unposed stride
```

**10 · Kierowca przy naczepie**
```
Vertical portrait of a truck driver standing beside the open doors of a trailer in a
logistics yard, keys in hand, plain unmarked trailer, overcast sky
```

**11 · Operator CNC**
```
Vertical portrait of a man in his twenties at a CNC machine control panel in a clean
machining hall, concentrated expression, cool machine light on his face
```

**12 · Portret zbiorowy**
```
Vertical group portrait of four workers of different ages and ethnicities in hi-vis vests
standing together in front of a factory wall, relaxed natural posture, one of them
mid-conversation, soft even daylight
```

> **Uwaga do obsady.** Nasi klienci to przede wszystkim Ukraina, Białoruś i Gruzja, a coraz
> częściej Indie, Nepal, Filipiny i Ameryka Łacińska — strona ma przecież wersję
> hiszpańską. Niech przez te 12 ujęć przewinie się realny przekrój, a nie osiem razy ta sama
> twarz. Jeśli generator domyślnie robi same osoby o jednym typie urody, trzeba dopisać
> narodowość wprost w prompcie.

### Sekcja „Legalizacja" — 4 ujęcia poziome 16:9 (wybiorę 1)

Scena: nasz opiekun sprawy z cudzoziemcem. Ma budzić zaufanie, a nie przypominać
korporacyjnego stocku.

**13 · Rozmowa przy biurku**
```
Horizontal shot of a consultant and a foreign client sitting at a desk in a bright modern
office, papers and a laptop between them, the consultant explaining something with an open
gesture, the client listening attentively, blank unprinted documents
```

**14 · Dokumenty na stole**
```
Horizontal close-up of two pairs of hands over a wooden desk with a document folder and
passports, one hand pointing at a blank page, soft window light, faces out of frame
```

**15 · Poczekalnia urzędu**
```
Horizontal shot of a man and a woman sitting on chairs in a clean institutional waiting
area, holding a folder, talking quietly, neutral municipal interior, no signage
```

**16 · Po podpisaniu**
```
Horizontal shot of two people standing and shaking hands in an office doorway after a
meeting, warm natural light, genuine relieved smile, document folder under one arm
```

### Realizacje — 6 ujęć poziomych 16:9 (wybiorę 3)

Mają ilustrować konkretne wdrożenia: **hala produkcyjna, magazyn, budowa**. Ludzie mogą
być drobni w kadrze — tu bohaterem jest miejsce pracy.

**17 · Hala produkcyjna, szeroki kadr**
```
Wide horizontal interior of a modern production hall, long assembly line, several workers
in hi-vis vests at their stations, clean floor, cool overhead lighting, sense of scale
```

**18 · Hala produkcyjna, bliżej**
```
Horizontal shot of a production line section with two workers handling products on a
conveyor, machinery in the foreground slightly out of focus, industrial greys and blues
```

**19 · Magazyn, szeroki kadr**
```
Wide horizontal interior of a high-bay warehouse, tall pallet racking receding into the
distance, a forklift mid-aisle, daylight from roof windows
```

**20 · Magazyn, strefa kompletacji**
```
Horizontal shot of a warehouse picking area with workers moving between shelves and roll
containers, plain unmarked cardboard boxes, bright even lighting
```

**21 · Budowa, szeroki kadr**
```
Wide horizontal view of a Polish residential construction site, concrete frame and
scaffolding, tower crane against an overcast sky, a few workers visible on the structure
```

**22 · Budowa, poziom roboczy**
```
Horizontal shot of two construction workers in hard hats tying rebar on a concrete slab,
shot from a low angle, grey daylight, dust in the air
```

### Rezerwa na blog i podstrony — 3 ujęcia poziome 16:9 (wybiorę 3)

Artykułów przybywa co tydzień i każdy potrzebuje grafiki. Te trzy trafią do wspólnego
katalogu ilustracji.

**23 · Okienko urzędowe**
```
Horizontal shot of a person seen from behind at a service counter in a public office,
a clerk on the other side of the glass, neutral institutional interior, no signage
```

**24 · Rodzina przed szkołą**
```
Horizontal shot of a parent walking a child with a backpack towards a school entrance on
an autumn morning, both seen from behind, warm low sunlight, European school building
```

**25 · Rozmowa o rekrutacji**
```
Horizontal shot of two people in business-casual clothing talking across a meeting table
in a small modern office, a notebook and coffee between them, relaxed working atmosphere
```

---

## 6. Jak przekazać gotowe pliki

Wszystko do jednego folderu. Nazw nie trzeba zmieniać — byle dało się rozpoznać, który
plik odpowiada któremu numerowi promptu. Najprościej: podfolder na każdy numer albo
prefiks `01-`, `02-` w nazwie pliku.

Podaj mi ścieżkę do folderu, a ja:

1. przeglądam wszystkie warianty i odrzucam ujęcia z wadami,
2. wybieram 15 i krótko uzasadniam wybór,
3. przycinam pasek znaku wodnego i kadruję do dokładnych proporcji,
4. konwertuję do WebP i optymalizuję rozmiar,
5. dopisuję każde zdjęcie do wspólnego indeksu ilustracji, żeby nie powtórzyło się na innym
   naszym serwisie,
6. wgrywam na stronę i pokazuję efekt.

## 7. Czego pilnuję przy odbiorze

Odrzucam ujęcie, jeśli: dłoń ma sześć palców albo zrasta się ze sprzętem; twarz wygląda na
wygładzoną plastikiem; na kamizelce, tablicy lub dokumencie jest bełkotliwy napis; maszyna
lub rusztowanie są fizycznie niemożliwe; scena wygląda na amerykańską — inne gniazdka,
znaki drogowe, architektura; uśmiech jest stockowy zamiast naturalnego.
