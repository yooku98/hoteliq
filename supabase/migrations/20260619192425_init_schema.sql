-- HotelIQ core schema: tenants (hotels), staff, and operational tables.
create extension if not exists pgcrypto;

create type staff_role as enum ('front_desk', 'general_manager', 'owner');
create type room_status as enum ('clean', 'dirty', 'occupied', 'maintenance', 'blocked');
create type booking_status as enum ('confirmed', 'checked_in', 'checked_out', 'cancelled');
create type booking_source as enum ('walk_in', 'phone', 'booking_com', 'expedia', 'direct');
create type payment_method as enum ('cash', 'momo_mtn', 'momo_vodafone', 'momo_airteltigo', 'card');
create type ticket_status as enum ('open', 'in_progress', 'resolved');

-- ── TENANTS ──────────────────────────────────────────────────────────────
create table hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  primary_color text,
  subscription_status text not null default 'trialing',
  created_at timestamptz not null default now()
);

-- ── STAFF ────────────────────────────────────────────────────────────────
-- One row per (hotel, person). A person owning multiple hotels gets one
-- staff row per hotel — this is what lets the Owner view's property
-- switcher work without a separate ownership table.
create table staff (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role staff_role not null,
  created_at timestamptz not null default now(),
  unique (hotel_id, auth_user_id)
);

create index staff_auth_user_id_idx on staff(auth_user_id);
create index staff_hotel_id_idx on staff(hotel_id);

-- ── ROOMS ────────────────────────────────────────────────────────────────
create table rooms (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  room_number text not null,
  room_type text not null,
  status room_status not null default 'clean',
  created_at timestamptz not null default now(),
  unique (hotel_id, room_number)
);

create index rooms_hotel_id_idx on rooms(hotel_id);

-- ── BOOKINGS ─────────────────────────────────────────────────────────────
create table bookings (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  room_id uuid not null references rooms(id) on delete restrict,
  guest_name text not null,
  guest_phone text,
  check_in_date date not null,
  check_out_date date not null,
  status booking_status not null default 'confirmed',
  source booking_source not null default 'walk_in',
  total_amount numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  payment_method payment_method,
  created_at timestamptz not null default now(),
  check (check_out_date > check_in_date)
);

create index bookings_hotel_id_idx on bookings(hotel_id);
create index bookings_room_id_idx on bookings(room_id);
create index bookings_hotel_dates_idx on bookings(hotel_id, check_in_date, check_out_date);

-- ── MAINTENANCE TICKETS ──────────────────────────────────────────────────
create table maintenance_tickets (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  room_id uuid not null references rooms(id) on delete cascade,
  description text not null,
  status ticket_status not null default 'open',
  reported_by uuid references staff(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index maintenance_tickets_hotel_id_idx on maintenance_tickets(hotel_id);
create index maintenance_tickets_status_idx on maintenance_tickets(hotel_id, status);

-- ── SHIFT HANDOVERS ──────────────────────────────────────────────────────
create table shift_handovers (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  staff_id uuid references staff(id) on delete set null,
  shift_date date not null,
  cash_collected numeric(12,2) not null default 0,
  cash_expected numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index shift_handovers_hotel_id_idx on shift_handovers(hotel_id, shift_date desc);
