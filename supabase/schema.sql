-- emigrante.pl — schemat bazy (Supabase / Postgres)
-- Uruchom w SQL Editorze projektu Supabase.

create extension if not exists "pgcrypto";

-- Oferty pracy
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  industry text not null check (industry in ('produkcja','logistyka','budownictwo','gastronomia')),
  city text not null,
  shifts text not null,
  contract text not null,
  rate text not null,
  published_at date not null default current_date,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Statystyki (hero + pas statystyk); klucz = identyfikator w UI
create table if not exists public.stats (
  key text primary key,
  value numeric not null,
  suffix text not null default ''
);

-- Opinie
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author text not null,
  role text not null,
  initials text not null,
  lang text not null default 'pl',
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- Opłaty legalizacyjne (jednorazowo, za osobę) — zmieniają się, dlatego w bazie
create table if not exists public.fee_rates (
  path text primary key check (path in ('oswiadczenie','zezwolenie','karta')),
  amount_pln numeric not null,
  employer_contrib_rate numeric not null default 0.205,
  hours_per_month int not null default 168,
  updated_at timestamptz not null default now()
);

-- Leady z formularza
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  role text not null check (role in ('kandydat','pracodawca')),
  lang text not null default 'pl',
  source text not null default 'homepage',
  user_agent text,
  created_at timestamptz not null default now()
);

-- RLS: odczyt publiczny treści, zapis leadów tylko insert dla anon
alter table public.jobs enable row level security;
alter table public.stats enable row level security;
alter table public.testimonials enable row level security;
alter table public.fee_rates enable row level security;
alter table public.leads enable row level security;

drop policy if exists "jobs public read" on public.jobs;
create policy "jobs public read" on public.jobs for select using (is_active);
drop policy if exists "stats public read" on public.stats;
create policy "stats public read" on public.stats for select using (true);
drop policy if exists "testimonials public read" on public.testimonials;
create policy "testimonials public read" on public.testimonials for select using (is_active);
drop policy if exists "fee_rates public read" on public.fee_rates;
create policy "fee_rates public read" on public.fee_rates for select using (true);
drop policy if exists "leads anon insert" on public.leads;
create policy "leads anon insert" on public.leads for insert to anon, authenticated with check (true);

-- Seed
insert into public.jobs (title, industry, city, shifts, contract, rate, published_at, sort_order) values
  ('Operator linii pakującej','produkcja','Poznań','3 zmiany','Umowa o pracę','32 zł/h', current_date, 1),
  ('Magazynier z UDT','logistyka','Wrocław','2 zmiany','Umowa o pracę','35 zł/h', current_date - 1, 2),
  ('Zbrojarz / cieśla','budownictwo','Warszawa','1 zmiana','Umowa o pracę','42 zł/h', current_date - 2, 3),
  ('Pomoc kuchenna','gastronomia','Kraków','grafik','Umowa o pracę','31 zł/h', current_date - 3, 4),
  ('Pracownik montażu AGD','produkcja','Łódź','2 zmiany','Zlecenie','30 zł/h', current_date - 3, 5),
  ('Kierowca kat. C+E','logistyka','Gdańsk','krajowe','Umowa o pracę','8 200 zł', current_date - 7, 6)
on conflict do nothing;

insert into public.stats (key, value, suffix) values
  ('hired', 1240, ''), ('employers', 160, '+'), ('years', 12, ''),
  ('cases', 870, ''), ('days', 5, ''), ('recommend', 96, '%')
on conflict (key) do update set value = excluded.value, suffix = excluded.suffix;

insert into public.fee_rates (path, amount_pln) values
  ('oswiadczenie', 100), ('zezwolenie', 100), ('karta', 440)
on conflict (path) do update set amount_pln = excluded.amount_pln, updated_at = now();

insert into public.testimonials (quote, author, role, initials, sort_order) values
  ('Umowę dostałam przed pierwszą zmianą, a kartę pobytu odebrałam po siedmiu miesiącach — bez jednej wizyty w urzędzie.','Oksana H.','operator produkcji, Poznań','OH',1),
  ('Trzydziestu magazynierów przeszło z oświadczeń na zezwolenia jednolite bez jednego dnia przestoju. Tak to powinno wyglądać.','Marek W.','kierownik HR, Logistyka24','MW',2),
  ('Rozmawialiśmy po hiszpańsku. Pierwszy raz w Polsce rozumiałem wszystko, co podpisuję.','Luis R.','monter, Łódź','LR',3)
on conflict do nothing;
