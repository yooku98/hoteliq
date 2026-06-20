-- Corporate/group client tracker for the GM's business-development workflow:
-- companies booked for team-building, conferences, etc. that pay a deposit
-- and stay in rooms. Decoupled from `bookings` (the negotiated deal often
-- covers more than just room revenue) but linkable to the actual room
-- bookings created when the group checks in.
create type corporate_client_status as enum ('inquiry', 'confirmed', 'completed', 'cancelled');

create table corporate_clients (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  company_name text not null,
  contact_name text,
  contact_phone text,
  contact_email text,
  purpose text,
  event_date date,
  total_amount numeric(12,2) not null default 0,
  deposit_amount numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  status corporate_client_status not null default 'inquiry',
  notes text,
  logged_by uuid references staff(id) on delete set null,
  created_at timestamptz not null default now()
);

create index corporate_clients_hotel_id_idx on corporate_clients(hotel_id);

alter table bookings add column corporate_client_id uuid references corporate_clients(id) on delete set null;
create index bookings_corporate_client_id_idx on bookings(corporate_client_id);

alter table corporate_clients enable row level security;

-- Read is open to all hotel staff — front desk needs to see confirmed
-- corporate clients to tag their room bookings to one. Logging/editing the
-- business-development record itself (deposits, totals, status) stays
-- GM/owner-only.
create policy "staff can read corporate clients in own hotel" on corporate_clients
  for select using (hotel_id in (select auth_staff_hotel_ids()));

create policy "gm and owner can create corporate clients" on corporate_clients
  for insert with check (
    hotel_id in (select auth_staff_hotel_ids())
    and auth_staff_role_for_hotel(hotel_id) in ('general_manager', 'owner')
  );

create policy "gm and owner can update corporate clients" on corporate_clients
  for update using (
    hotel_id in (select auth_staff_hotel_ids())
    and auth_staff_role_for_hotel(hotel_id) in ('general_manager', 'owner')
  );
