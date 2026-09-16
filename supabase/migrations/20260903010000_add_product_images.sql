alter table public.products add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "public upload product images" on storage.objects;
create policy "public upload product images" on storage.objects for insert with check (bucket_id = 'product-images');
drop policy if exists "public update product images" on storage.objects;
create policy "public update product images" on storage.objects for update using (bucket_id = 'product-images') with check (bucket_id = 'product-images');
drop policy if exists "public delete product images" on storage.objects;
create policy "public delete product images" on storage.objects for delete using (bucket_id = 'product-images');
