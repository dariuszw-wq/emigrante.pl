-- =====================================================================
--  emigrante.pl — schemat bazy dla kont i ofert pracy
--  Wersja robocza, 11.11.2026
--
--  Jak uruchomić: Supabase → SQL Editor → wklej całość → Run.
--  Skrypt można uruchomić ponownie; używa IF NOT EXISTS / CREATE OR REPLACE.
--
--  UWAGA — administrator danych osobowych nie jest jeszcze ustalony.
--  Dopóki nie zostanie wskazany w regulaminie i polityce prywatności,
--  nie uruchamiamy rejestracji dla prawdziwych użytkowników.
-- =====================================================================

-- ---------- 1. Typy -------------------------------------------------

do $$ begin
  create type rola_konta as enum ('pracodawca', 'kandydat', 'moderator');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_oferty as enum ('szkic', 'oczekuje', 'opublikowana', 'odrzucona', 'wycofana');
exception when duplicate_object then null; end $$;

do $$ begin
  create type branza as enum ('produkcja', 'logistyka', 'budownictwo', 'gastronomia', 'opieka', 'rolnictwo', 'inne');
exception when duplicate_object then null; end $$;

-- ---------- 2. Profile ----------------------------------------------
-- Rozszerzenie auth.users. Jeden wiersz na konto.

create table if not exists public.profile (
  id              uuid primary key references auth.users on delete cascade,
  rola            rola_konta  not null default 'pracodawca',

  -- dane pracodawcy (dla kandydata zostają puste)
  firma           text,
  nip             text,
  osoba_kontakt   text,
  telefon         text,
  miasto          text,
  www             text,

  -- zgody złożone przy rejestracji
  zgoda_regulamin boolean     not null default false,
  zgoda_dane      boolean     not null default false,
  zgoda_data      timestamptz,

  utworzono       timestamptz not null default now(),
  zmieniono       timestamptz not null default now()
);

comment on table public.profile is
  'Profil konta. Powstaje automatycznie przy rejestracji (trigger na auth.users).';

-- ---------- 3. Oferty pracy -----------------------------------------

create table if not exists public.oferta (
  id              uuid primary key default gen_random_uuid(),
  pracodawca_id   uuid        not null references public.profile(id) on delete cascade,
  status          status_oferty not null default 'szkic',

  -- kogo szuka
  stanowisko      text        not null,
  branza          branza      not null default 'inne',
  liczba_osob     int         check (liczba_osob is null or liczba_osob between 1 and 999),

  -- gdzie
  miasto          text        not null,
  wojewodztwo     text,

  -- warunki finansowe
  stawka_od       numeric(10,2),
  stawka_do       numeric(10,2),
  stawka_jednostka text       not null default 'zl_h',   -- zl_h | zl_mies
  stawka_brutto   boolean     not null default true,
  premie          text,

  -- czas pracy
  godzin_min_mies int         check (godzin_min_mies is null or godzin_min_mies between 1 and 400),
  zmiany          text,
  umowa           text        not null default 'umowa_o_prace', -- umowa_o_prace | zlecenie | b2b

  -- co pracodawca zapewnia (lista haseł: nocleg, transport, posilki, ...)
  udogodnienia    text[]      not null default '{}',

  -- opisy
  opis            text,
  wymagania       text,
  jezyki          text[]      not null default '{}',

  -- zdjęcie w Storage (bucket "oferty"), ścieżka względna
  zdjecie         text,

  -- zgody złożone przy wysyłce oferty (ślad dowodowy)
  zgoda_publikacja boolean    not null default false,
  zgoda_prawdziwosc boolean   not null default false,
  zgoda_data      timestamptz,

  -- moderacja
  uwaga_moderacji text,
  moderowal       uuid        references public.profile(id),
  opublikowano    timestamptz,
  wygasa          timestamptz,

  utworzono       timestamptz not null default now(),
  zmieniono       timestamptz not null default now()
);

create index if not exists oferta_status_idx   on public.oferta (status, opublikowano desc);
create index if not exists oferta_pracodawca_idx on public.oferta (pracodawca_id, utworzono desc);

comment on table public.oferta is
  'Ogłoszenie pracodawcy. Na stronie widoczne dopiero po zmianie statusu na "opublikowana".';

-- ---------- 4. Automatyczne znaczniki czasu --------------------------

create or replace function public.ustaw_zmieniono()
returns trigger language plpgsql as $$
begin
  new.zmieniono := now();
  return new;
end $$;

drop trigger if exists profile_zmieniono on public.profile;
create trigger profile_zmieniono before update on public.profile
  for each row execute function public.ustaw_zmieniono();

drop trigger if exists oferta_zmieniono on public.oferta;
create trigger oferta_zmieniono before update on public.oferta
  for each row execute function public.ustaw_zmieniono();

-- ---------- 5. Profil powstaje razem z kontem ------------------------

create or replace function public.utworz_profil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profile (id, rola, firma, osoba_kontakt, telefon, miasto,
                              zgoda_regulamin, zgoda_dane, zgoda_data)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'rola')::rola_konta, 'pracodawca'),
    new.raw_user_meta_data ->> 'firma',
    new.raw_user_meta_data ->> 'osoba_kontakt',
    new.raw_user_meta_data ->> 'telefon',
    new.raw_user_meta_data ->> 'miasto',
    coalesce((new.raw_user_meta_data ->> 'zgoda_regulamin')::boolean, false),
    coalesce((new.raw_user_meta_data ->> 'zgoda_dane')::boolean, false),
    now()
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists na_nowe_konto on auth.users;
create trigger na_nowe_konto after insert on auth.users
  for each row execute function public.utworz_profil();

-- ---------- 6. Kto jest moderatorem ----------------------------------

create or replace function public.czy_moderator()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profile
    where id = auth.uid() and rola = 'moderator'
  );
$$;

-- ---------- 7. Reguły dostępu (RLS) ----------------------------------

alter table public.profile enable row level security;
alter table public.oferta  enable row level security;

-- Profil: właściciel widzi i zmienia swój; moderator widzi wszystkie.
drop policy if exists profil_wlasny_select on public.profile;
create policy profil_wlasny_select on public.profile
  for select using (id = auth.uid() or public.czy_moderator());

drop policy if exists profil_wlasny_update on public.profile;
create policy profil_wlasny_update on public.profile
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Oferta: świat widzi tylko opublikowane.
drop policy if exists oferta_publiczne_select on public.oferta;
create policy oferta_publiczne_select on public.oferta
  for select using (
    status = 'opublikowana'
    or pracodawca_id = auth.uid()
    or public.czy_moderator()
  );

-- Pracodawca zakłada własne ogłoszenia.
drop policy if exists oferta_wlasna_insert on public.oferta;
create policy oferta_wlasna_insert on public.oferta
  for insert with check (pracodawca_id = auth.uid());

-- Pracodawca edytuje swoje, ale NIE może sam ustawić statusu "opublikowana".
-- Pilnuje tego trigger niżej — polityka dopuszcza update, trigger odrzuca podmianę statusu.
drop policy if exists oferta_wlasna_update on public.oferta;
create policy oferta_wlasna_update on public.oferta
  for update using (pracodawca_id = auth.uid() or public.czy_moderator())
  with check (pracodawca_id = auth.uid() or public.czy_moderator());

drop policy if exists oferta_wlasna_delete on public.oferta;
create policy oferta_wlasna_delete on public.oferta
  for delete using (pracodawca_id = auth.uid() or public.czy_moderator());

-- ---------- 8. Publikować może wyłącznie moderator -------------------

create or replace function public.pilnuj_statusu()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status
     and new.status in ('opublikowana', 'odrzucona')
     and not public.czy_moderator() then
    raise exception 'Status "%" może nadać wyłącznie moderator.', new.status;
  end if;

  if new.status = 'opublikowana' and old.status <> 'opublikowana' then
    new.opublikowano := now();
    new.wygasa := coalesce(new.wygasa, now() + interval '60 days');
  end if;

  return new;
end $$;

drop trigger if exists oferta_pilnuj_statusu on public.oferta;
create trigger oferta_pilnuj_statusu before update on public.oferta
  for each row execute function public.pilnuj_statusu();

-- Przy zakładaniu oferty też nie wolno od razu wpisać "opublikowana".
create or replace function public.pilnuj_statusu_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('opublikowana', 'odrzucona') and not public.czy_moderator() then
    raise exception 'Nowa oferta nie może mieć statusu "%".', new.status;
  end if;
  return new;
end $$;

drop trigger if exists oferta_pilnuj_statusu_insert on public.oferta;
create trigger oferta_pilnuj_statusu_insert before insert on public.oferta
  for each row execute function public.pilnuj_statusu_insert();

-- ---------- 9. Zdjęcia ofert (Storage) -------------------------------

insert into storage.buckets (id, name, public)
values ('oferty', 'oferty', true)
on conflict (id) do nothing;

-- Pracodawca wgrywa tylko do swojego katalogu: oferty/<uid>/<plik>
drop policy if exists oferty_zapis on storage.objects;
create policy oferty_zapis on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'oferty'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists oferty_kasowanie on storage.objects;
create policy oferty_kasowanie on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'oferty'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.czy_moderator())
  );

drop policy if exists oferty_odczyt on storage.objects;
create policy oferty_odczyt on storage.objects
  for select using (bucket_id = 'oferty');

-- ---------- 10. Jak nadać sobie uprawnienia moderatora ---------------
-- Po założeniu własnego konta na stronie uruchom raz, podstawiając swój e-mail:
--
--   update public.profile set rola = 'moderator'
--   where id = (select id from auth.users where email = 'TWOJ@EMAIL');
