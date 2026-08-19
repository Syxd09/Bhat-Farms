-- ============ EXTENSIONS ============
create extension if not exists pg_trgm;

-- ============ ROLES ============
create type public.app_role as enum ('admin','staff','customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','staff'))
$$;

create policy "profiles_select_own" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "profiles_insert_own" on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "user_roles_select_own" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_staff(auth.uid()));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'customer')
  on conflict (user_id, role) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ============ CATALOGUE ============
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  parent_id uuid references public.categories(id) on delete set null,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories_public_read" on public.categories for select to anon, authenticated using (is_active);
create policy "categories_staff_all" on public.categories for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  tags text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_subscribable boolean not null default false,
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  seo_title text,
  seo_description text,
  search_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products_public_read" on public.products for select to anon, authenticated using (is_active);
create policy "products_staff_all" on public.products for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create or replace function public.products_search_text()
returns trigger language plpgsql set search_path = public as $$
begin
  new.search_text := lower(coalesce(new.name,'') || ' ' || coalesce(new.short_description,'') || ' ' || array_to_string(coalesce(new.tags,'{}'), ' '));
  new.updated_at := now();
  return new;
end; $$;
create trigger products_search_text_trg before insert or update on public.products
  for each row execute function public.products_search_text();
create index products_search_idx on public.products using gin (search_text gin_trgm_ops);
create index products_category_idx on public.products (category_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  sku text,
  price_paise int not null check (price_paise >= 0),
  compare_at_paise int,
  unit text,
  stock_qty int not null default 0,
  reserved_qty int not null default 0,
  low_stock_threshold int not null default 5,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.product_variants to anon, authenticated;
grant insert, update, delete on public.product_variants to authenticated;
grant all on public.product_variants to service_role;
alter table public.product_variants enable row level security;
create policy "variants_public_read" on public.product_variants for select to anon, authenticated using (is_active);
create policy "variants_staff_all" on public.product_variants for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create index variants_product_idx on public.product_variants (product_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0
);
grant select on public.product_images to anon, authenticated;
grant insert, update, delete on public.product_images to authenticated;
grant all on public.product_images to service_role;
alter table public.product_images enable row level security;
create policy "images_public_read" on public.product_images for select to anon, authenticated using (true);
create policy "images_staff_all" on public.product_images for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create index images_product_idx on public.product_images (product_id);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  delta int not null,
  reason text not null,
  reference text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, insert on public.inventory_movements to authenticated;
grant all on public.inventory_movements to service_role;
alter table public.inventory_movements enable row level security;
create policy "inventory_staff_all" on public.inventory_movements for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ============ ADDRESSES ============
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null default 'Karnataka',
  pincode text not null,
  landmark text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.addresses to authenticated;
grant all on public.addresses to service_role;
alter table public.addresses enable row level security;
create policy "addresses_own" on public.addresses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "addresses_staff_read" on public.addresses for select to authenticated
  using (public.is_staff(auth.uid()));

-- ============ CART ============
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.carts to authenticated;
grant all on public.carts to service_role;
alter table public.carts enable row level security;
create policy "carts_own" on public.carts for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);
grant select, insert, update, delete on public.cart_items to authenticated;
grant all on public.cart_items to service_role;
alter table public.cart_items enable row level security;
create policy "cart_items_own" on public.cart_items for all to authenticated
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

-- ============ DELIVERY ============
create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(),
  pincode text not null unique,
  area text not null,
  city text not null default 'Bengaluru',
  fee_paise int not null default 0,
  free_above_paise int,
  min_order_paise int not null default 0,
  cod_available boolean not null default true,
  slots text[] not null default '{"6:00 AM - 8:00 AM","8:00 AM - 11:00 AM","4:00 PM - 7:00 PM"}',
  is_active boolean not null default true
);
grant select on public.delivery_zones to anon, authenticated;
grant insert, update, delete on public.delivery_zones to authenticated;
grant all on public.delivery_zones to service_role;
alter table public.delivery_zones enable row level security;
create policy "zones_public_read" on public.delivery_zones for select to anon, authenticated using (is_active);
create policy "zones_staff_all" on public.delivery_zones for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ============ COUPONS ============
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value int not null check (discount_value > 0),
  min_order_paise int not null default 0,
  max_discount_paise int,
  usage_limit int,
  used_count int not null default 0,
  per_user_limit int not null default 1,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.coupons to anon, authenticated;
grant insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "coupons_public_read" on public.coupons for select to anon, authenticated using (is_active);
create policy "coupons_staff_all" on public.coupons for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid,
  discount_paise int not null,
  created_at timestamptz not null default now()
);
grant select on public.coupon_redemptions to authenticated;
grant all on public.coupon_redemptions to service_role;
alter table public.coupon_redemptions enable row level security;
create policy "redemptions_own_read" on public.coupon_redemptions for select to authenticated
  using (user_id = auth.uid() or public.is_staff(auth.uid()));

-- ============ ORDERS ============
create sequence public.order_number_seq start 10001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','confirmed','packed','out_for_delivery','delivered','cancelled','refunded')),
  payment_method text not null check (payment_method in ('upi','card','netbanking','cod')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  payment_reference text,
  subtotal_paise int not null,
  discount_paise int not null default 0,
  delivery_fee_paise int not null default 0,
  total_paise int not null,
  coupon_code text,
  delivery_address jsonb not null,
  delivery_pincode text not null,
  delivery_slot text,
  delivery_date date,
  notes text,
  placed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "orders_own_read" on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "orders_staff_update" on public.orders for update to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create index orders_user_idx on public.orders (user_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_label text not null,
  image_url text,
  unit_price_paise int not null,
  quantity int not null,
  total_paise int not null
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "order_items_own_read" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff(auth.uid()))));

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, insert on public.order_status_history to authenticated;
grant all on public.order_status_history to service_role;
alter table public.order_status_history enable row level security;
create policy "history_own_read" on public.order_status_history for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff(auth.uid()))));
create policy "history_staff_insert" on public.order_status_history for insert to authenticated
  with check (public.is_staff(auth.uid()));

-- ============ SUBSCRIPTIONS ============
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  address_id uuid references public.addresses(id) on delete set null,
  quantity int not null default 1 check (quantity > 0),
  frequency text not null default 'daily' check (frequency in ('daily','alternate','weekly')),
  slot text,
  status text not null default 'active' check (status in ('active','paused','cancelled')),
  start_date date not null default current_date,
  next_delivery_date date not null default (current_date + 1),
  pause_from date,
  pause_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
alter table public.subscriptions enable row level security;
create policy "subs_own" on public.subscriptions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "subs_staff_read" on public.subscriptions for select to authenticated
  using (public.is_staff(auth.uid()));

create table public.subscription_deliveries (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  delivery_date date not null,
  status text not null default 'scheduled' check (status in ('scheduled','skipped','delivered','failed')),
  quantity int not null default 1,
  created_at timestamptz not null default now(),
  unique (subscription_id, delivery_date)
);
grant select, insert, update on public.subscription_deliveries to authenticated;
grant all on public.subscription_deliveries to service_role;
alter table public.subscription_deliveries enable row level security;
create policy "sub_deliveries_own" on public.subscription_deliveries for all to authenticated
  using (exists (select 1 from public.subscriptions s where s.id = subscription_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.subscriptions s where s.id = subscription_id and s.user_id = auth.uid()));
create policy "sub_deliveries_staff_read" on public.subscription_deliveries for select to authenticated
  using (public.is_staff(auth.uid()));

-- ============ REVIEWS ============
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
grant select, insert, update, delete on public.reviews to authenticated;
grant select on public.reviews to anon;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "reviews_public_read" on public.reviews for select to anon, authenticated
  using (status = 'approved');
create policy "reviews_own_read" on public.reviews for select to authenticated
  using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "reviews_own_write" on public.reviews for insert to authenticated
  with check (user_id = auth.uid());
create policy "reviews_own_update" on public.reviews for update to authenticated
  using (user_id = auth.uid() and status = 'pending') with check (user_id = auth.uid());
create policy "reviews_staff_all" on public.reviews for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

create or replace function public.refresh_product_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  pid := coalesce(new.product_id, old.product_id);
  update public.products p set
    rating_avg = coalesce((select round(avg(rating)::numeric,2) from public.reviews r where r.product_id = pid and r.status='approved'),0),
    rating_count = (select count(*) from public.reviews r where r.product_id = pid and r.status='approved')
  where p.id = pid;
  return null;
end; $$;
create trigger reviews_rating_trg after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();

-- ============ SECURE ORDER PLACEMENT ============
create or replace function public.place_order(
  _items jsonb,
  _address_id uuid,
  _payment_method text,
  _coupon_code text default null,
  _delivery_slot text default null,
  _delivery_date date default null,
  _notes text default null
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  addr public.addresses;
  zone public.delivery_zones;
  item jsonb;
  v public.product_variants;
  prod public.products;
  img text;
  subtotal int := 0;
  discount int := 0;
  fee int := 0;
  cp public.coupons;
  used int;
  new_order public.orders;
  qty int;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  if _items is null or jsonb_array_length(_items) = 0 then raise exception 'Cart is empty'; end if;

  select * into addr from public.addresses where id = _address_id and user_id = uid;
  if addr.id is null then raise exception 'Delivery address not found'; end if;

  select * into zone from public.delivery_zones where pincode = addr.pincode and is_active;
  if zone.id is null then raise exception 'We do not deliver to PIN code % yet', addr.pincode; end if;

  if _payment_method = 'cod' and not zone.cod_available then
    raise exception 'Cash on delivery is not available for PIN code %', addr.pincode;
  end if;

  insert into public.orders (order_number, user_id, payment_method, subtotal_paise, total_paise,
    delivery_address, delivery_pincode, delivery_slot, delivery_date, notes, coupon_code)
  values ('BNB-' || nextval('public.order_number_seq'), uid, _payment_method, 0, 0,
    to_jsonb(addr), addr.pincode, coalesce(_delivery_slot, zone.slots[1]), _delivery_date, _notes, upper(nullif(_coupon_code,'')))
  returning * into new_order;

  for item in select * from jsonb_array_elements(_items) loop
    qty := greatest(1, (item->>'quantity')::int);
    select * into v from public.product_variants where id = (item->>'variant_id')::uuid and is_active for update;
    if v.id is null then raise exception 'Product no longer available'; end if;
    if v.stock_qty - v.reserved_qty < qty then
      raise exception 'Insufficient stock for %', v.label;
    end if;
    select * into prod from public.products where id = v.product_id;
    select url into img from public.product_images where product_id = v.product_id order by sort_order limit 1;

    insert into public.order_items (order_id, variant_id, product_name, variant_label, image_url, unit_price_paise, quantity, total_paise)
    values (new_order.id, v.id, prod.name, v.label, img, v.price_paise, qty, v.price_paise * qty);

    update public.product_variants set reserved_qty = reserved_qty + qty where id = v.id;
    insert into public.inventory_movements (variant_id, delta, reason, reference, created_by)
    values (v.id, -qty, 'order_reserved', new_order.order_number, uid);

    subtotal := subtotal + v.price_paise * qty;
  end loop;

  if _coupon_code is not null and length(trim(_coupon_code)) > 0 then
    select * into cp from public.coupons where code = upper(trim(_coupon_code)) and is_active
      and starts_at <= now() and (ends_at is null or ends_at > now());
    if cp.id is null then raise exception 'Invalid or expired coupon'; end if;
    if subtotal < cp.min_order_paise then
      raise exception 'Coupon requires a minimum order of Rs %', (cp.min_order_paise/100);
    end if;
    if cp.usage_limit is not null and cp.used_count >= cp.usage_limit then
      raise exception 'This coupon has reached its usage limit';
    end if;
    select count(*) into used from public.coupon_redemptions where coupon_id = cp.id and user_id = uid;
    if used >= cp.per_user_limit then raise exception 'You have already used this coupon'; end if;

    if cp.discount_type = 'percent' then
      discount := (subtotal * cp.discount_value) / 100;
    else
      discount := cp.discount_value;
    end if;
    if cp.max_discount_paise is not null then discount := least(discount, cp.max_discount_paise); end if;
    discount := least(discount, subtotal);

    insert into public.coupon_redemptions (coupon_id, user_id, order_id, discount_paise)
    values (cp.id, uid, new_order.id, discount);
    update public.coupons set used_count = used_count + 1 where id = cp.id;
  end if;

  if subtotal < zone.min_order_paise then
    raise exception 'Minimum order for PIN code % is Rs %', addr.pincode, (zone.min_order_paise/100);
  end if;

  fee := zone.fee_paise;
  if zone.free_above_paise is not null and (subtotal - discount) >= zone.free_above_paise then fee := 0; end if;

  update public.orders set subtotal_paise = subtotal, discount_paise = discount,
    delivery_fee_paise = fee, total_paise = subtotal - discount + fee,
    status = case when _payment_method = 'cod' then 'confirmed' else 'pending' end
  where id = new_order.id returning * into new_order;

  insert into public.order_status_history (order_id, status, note, created_by)
  values (new_order.id, new_order.status, 'Order placed', uid);

  return new_order;
end; $$;

revoke all on function public.place_order(jsonb, uuid, text, text, text, date, text) from public;
grant execute on function public.place_order(jsonb, uuid, text, text, text, date, text) to authenticated;

-- Order status transitions consume or release reserved stock
create or replace function public.orders_on_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare it public.order_items;
begin
  if new.status = old.status then new.updated_at = now(); return new; end if;
  if new.status = 'delivered' then
    for it in select * from public.order_items where order_id = new.id loop
      update public.product_variants set stock_qty = stock_qty - it.quantity,
        reserved_qty = greatest(0, reserved_qty - it.quantity) where id = it.variant_id;
    end loop;
  elsif new.status in ('cancelled','refunded') then
    for it in select * from public.order_items where order_id = new.id loop
      update public.product_variants set reserved_qty = greatest(0, reserved_qty - it.quantity)
        where id = it.variant_id;
      insert into public.inventory_movements (variant_id, delta, reason, reference)
      values (it.variant_id, it.quantity, 'order_released', new.order_number);
    end loop;
  end if;
  new.updated_at = now();
  return new;
end; $$;
create trigger orders_status_trg before update of status on public.orders
  for each row execute function public.orders_on_status_change();