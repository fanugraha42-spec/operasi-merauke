-- Portal Operasi UP3 Merauke: shared editing by EVERY visitor, without login.
-- Run this entire file in the SQL Editor of a dedicated Supabase project.
begin;
create table if not exists public.portal_tasks (
 id text primary key check (length(id) between 1 and 100),
 title text not null check (length(btrim(title)) between 1 and 100),
 team text not null check (team in ('Proteksi & Meter','Pemeliharaan E&M','Support')),
 owner text not null check (length(btrim(owner)) between 1 and 60),
 start date not null,
 "end" date not null,
 progress integer not null check (progress between 0 and 100),
 priority text not null check (priority in ('Rendah','Sedang','Tinggi')),
 revision integer not null default 1,
 updated_at timestamptz not null default now(),
 check ("end" >= start)
);
create table if not exists public.portal_sheet_sources (
 id text primary key check (length(id) between 1 and 250),
 url text not null check (length(url) <= 2048 and url ~ '^https://docs[.]google[.]com/spreadsheets/d/[A-Za-z0-9_-]+(/|$)'),
 revision integer not null default 1,
 updated_at timestamptz not null default now()
);
create or replace function public.portal_stamp_revision()
returns trigger language plpgsql set search_path = '' as $$
begin
 if TG_OP = 'INSERT' then
  new.revision := 1;
 else
  new.id := old.id;
  new.revision := old.revision + 1;
 end if;
 new.updated_at := clock_timestamp();
 return new;
end;
$$;
revoke all on function public.portal_stamp_revision() from public;
drop trigger if exists portal_tasks_revision on public.portal_tasks;
create trigger portal_tasks_revision before insert or update on public.portal_tasks
 for each row execute function public.portal_stamp_revision();
drop trigger if exists portal_sources_revision on public.portal_sheet_sources;
create trigger portal_sources_revision before insert or update on public.portal_sheet_sources
 for each row execute function public.portal_stamp_revision();

alter table public.portal_tasks enable row level security;
alter table public.portal_sheet_sources enable row level security;
-- Intentionally public read/write/delete, explicitly requested by the owner.
-- These policies cover only these two portal tables.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.portal_tasks, public.portal_sheet_sources to anon, authenticated;
drop policy if exists portal_tasks_public_edit on public.portal_tasks;
create policy portal_tasks_public_edit on public.portal_tasks
 for all to anon, authenticated using (true) with check (true);
drop policy if exists portal_sources_public_edit on public.portal_sheet_sources;
create policy portal_sources_public_edit on public.portal_sheet_sources
 for all to anon, authenticated using (true) with check (true);

-- Idempotent: rerunning the script never replaces a source edited by a visitor.
insert into public.portal_sheet_sources (id,url) values
 ('proteksi-meter/products/settings-ocr-gfr-20-kv','https://docs.google.com/spreadsheets/d/1xjdD4OGKPsp99M9V-p2ytLK7D7o8ylk6/edit?gid=1788085531#gid=1788085531'),
 ('pemeliharaan-em/products/jadwal-padam','https://docs.google.com/spreadsheets/d/1piBDtEZ9kyncJCJS-RAmKsxdtyJ5es49DgybwoQ5M1c/edit?gid=1825013793#gid=1825013793')
on conflict (id) do nothing;
-- Shared tasks start empty. Local/demo tasks are not published automatically.
commit;
