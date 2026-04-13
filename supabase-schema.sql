-- ============================
-- KasirIn - Supabase Schema
-- ============================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================
-- USERS TABLE
-- ============================
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'kasir')) default 'kasir',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.users enable row level security;

create policy "Users can view all users" on public.users
  for select using (auth.role() = 'authenticated');

create policy "Admin can insert users" on public.users
  for insert with check (true); -- Handled by service role in API

create policy "Admin can update users" on public.users
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ============================
-- CATEGORIES TABLE
-- ============================
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique
);

alter table public.categories enable row level security;

create policy "Anyone authenticated can view categories" on public.categories
  for select using (auth.role() = 'authenticated');

create policy "Admin can manage categories" on public.categories
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ============================
-- PRODUCTS TABLE
-- ============================
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  price integer not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  barcode text,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;

create policy "Authenticated can view products" on public.products
  for select using (auth.role() = 'authenticated');

create policy "Admin can manage products" on public.products
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Kasir can update product stock" on public.products
  for update using (auth.role() = 'authenticated');

-- ============================
-- TRANSACTIONS TABLE
-- ============================
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  invoice_code text not null unique,
  user_id uuid references public.users(id) on delete set null,
  total_price integer not null,
  payment_method text not null check (payment_method in ('cash', 'qris', 'transfer', 'ewallet')),
  paid_amount integer not null default 0,
  change_amount integer not null default 0,
  status text not null check (status in ('pending', 'paid', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Admin can view all transactions" on public.transactions
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Kasir can view own transactions" on public.transactions
  for select using (user_id = auth.uid());

create policy "Authenticated can insert transactions" on public.transactions
  for insert with check (auth.role() = 'authenticated');

create policy "Admin can update transactions" on public.transactions
  for update using (auth.role() = 'authenticated');

-- ============================
-- TRANSACTION ITEMS TABLE
-- ============================
create table public.transaction_items (
  id uuid default uuid_generate_v4() primary key,
  transaction_id uuid references public.transactions(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  price integer not null,
  subtotal integer not null
);

alter table public.transaction_items enable row level security;

create policy "Authenticated can view transaction items" on public.transaction_items
  for select using (auth.role() = 'authenticated');

create policy "Authenticated can insert transaction items" on public.transaction_items
  for insert with check (auth.role() = 'authenticated');

-- ============================
-- PAYMENTS TABLE
-- ============================
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  transaction_id uuid references public.transactions(id) on delete cascade not null,
  method text not null,
  amount integer not null,
  status text not null default 'pending',
  midtrans_order_id text,
  snap_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payments enable row level security;

create policy "Admin can view payments" on public.payments
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Service role can manage payments" on public.payments
  for all using (true); -- Managed via service role in API

-- ============================
-- INDEXES
-- ============================
create index idx_products_category on public.products(category_id);
create index idx_transactions_user on public.transactions(user_id);
create index idx_transactions_status on public.transactions(status);
create index idx_transactions_created on public.transactions(created_at desc);
create index idx_transaction_items_transaction on public.transaction_items(transaction_id);
create index idx_payments_transaction on public.payments(transaction_id);

-- ============================
-- SEED: Default Admin User
-- ============================
-- Run this AFTER creating admin user via Supabase Auth dashboard
-- INSERT INTO public.users (id, name, email, role)
-- VALUES ('your-auth-user-uuid', 'Admin', 'admin@kasirin.com', 'admin');
