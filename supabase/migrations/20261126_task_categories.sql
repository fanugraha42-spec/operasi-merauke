-- Jalankan di Supabase SQL Editor. Data lama diberi kategori Proteksi.
begin;
alter table public.portal_tasks add column if not exists category text not null default 'proteksi';
alter table public.portal_tasks drop constraint if exists portal_tasks_category_check;
alter table public.portal_tasks add constraint portal_tasks_category_check
 check (category in ('proteksi','scada-telekomunikasi','jasa-pekerjaan','material-penunjang','pelayanan-teknik'));
notify pgrst, 'reload schema';
commit;
