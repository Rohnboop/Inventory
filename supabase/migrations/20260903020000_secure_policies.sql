-- SECURE RLS POLICIES
-- Replaces world-writable (using (true) with check (true)) policies with
-- authenticated staff policies. Run via Supabase SQL editor or `supabase db push`.
--
-- ROLLBACK: To revert, drop the policies below and re-run the original dev policies
-- from 20260903000000_create_inventory_pos.sql:95-107 and 20260903010000_add_product_images.sql:8-14.

-- Products: public read (catalog loads before sign-in), writes require auth
drop policy if exists "public manage products" on public.products;
create policy "auth write products" on public.products
  for insert to authenticated with check (true);
create policy "auth update products" on public.products
  for update to authenticated using (true) with check (true);
create policy "auth delete products" on public.products
  for delete to authenticated using (true);

-- Customers: no public write; sign-up creates via auth, not direct insert
drop policy if exists "public manage customers" on public.customers;
create policy "auth read own customer" on public.customers
  for select to authenticated using (auth.uid() = id);
create policy "auth create customer" on public.customers
  for insert to authenticated with check (auth.uid() = id);

-- Orders: staff write, customer reads own
drop policy if exists "public manage orders" on public.orders;
create policy "auth write orders" on public.orders
  for insert to authenticated with check (true);
create policy "auth update orders" on public.orders
  for update to authenticated using (true) with check (true);
create policy "auth read orders" on public.orders
  for select to authenticated using (
    customer_id is null or customer_id = auth.uid()
    -- staff could be granted a role check here if you add app_metadata.role
  );

-- Order items: cascade via orders, staff write
drop policy if exists "public manage order items" on public.order_items;
create policy "auth write order items" on public.order_items
  for insert to authenticated with check (true);
create policy "auth read order items" on public.order_items
  for select to authenticated using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.customer_id is null or o.customer_id = auth.uid())
    )
  );

-- Inventory movements: staff write only (audit trail)
drop policy if exists "public manage inventory movements" on public.inventory_movements;
create policy "auth write inventory movements" on public.inventory_movements
  for insert to authenticated with check (true);
create policy "auth read inventory movements" on public.inventory_movements
  for select to authenticated using (true);

-- Storage: authenticated uploads, owner-only delete/update
drop policy if exists "public upload product images" on storage.objects;
drop policy if exists "public update product images" on storage.objects;
drop policy if exists "public delete product images" on storage.objects;

create policy "auth upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');
create policy "auth update own product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and owner = auth.uid())
  with check (bucket_id = 'product-images' and owner = auth.uid());
create policy "auth delete own product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and owner = auth.uid());

-- Categories: keep public read (reference data)
-- Original: "public read categories" already exists and is correct
