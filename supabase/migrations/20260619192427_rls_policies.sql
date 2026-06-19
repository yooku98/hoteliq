-- Tenant-isolation RLS. Helper functions are SECURITY DEFINER so they can
-- read `staff` without recursing into staff's own RLS policy.

create function auth_staff_hotel_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select hotel_id from staff where auth_user_id = auth.uid();
$$;

create function auth_staff_role_for_hotel(p_hotel_id uuid)
returns staff_role
language sql
security definer
stable
set search_path = public
as $$
  select role from staff where auth_user_id = auth.uid() and hotel_id = p_hotel_id;
$$;

create function auth_staff_id_for_hotel(p_hotel_id uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from staff where auth_user_id = auth.uid() and hotel_id = p_hotel_id;
$$;

alter table hotels enable row level security;
alter table staff enable row level security;
alter table rooms enable row level security;
alter table bookings enable row level security;
alter table maintenance_tickets enable row level security;
alter table shift_handovers enable row level security;

-- ── HOTELS ───────────────────────────────────────────────────────────────
create policy "staff can read own hotels" on hotels
  for select using (id in (select auth_staff_hotel_ids()));

create policy "owner can update own hotel" on hotels
  for update using (auth_staff_role_for_hotel(id) = 'owner');

-- ── STAFF ────────────────────────────────────────────────────────────────
create policy "staff can read colleagues in same hotel" on staff
  for select using (hotel_id in (select auth_staff_hotel_ids()));

-- ── ROOMS ────────────────────────────────────────────────────────────────
create policy "staff can read rooms in own hotel" on rooms
  for select using (hotel_id in (select auth_staff_hotel_ids()));

create policy "staff can update rooms in own hotel" on rooms
  for update using (hotel_id in (select auth_staff_hotel_ids()));

create policy "staff can add rooms in own hotel" on rooms
  for insert with check (hotel_id in (select auth_staff_hotel_ids()));

-- ── BOOKINGS ─────────────────────────────────────────────────────────────
create policy "staff can read bookings in own hotel" on bookings
  for select using (hotel_id in (select auth_staff_hotel_ids()));

create policy "staff can create bookings in own hotel" on bookings
  for insert with check (hotel_id in (select auth_staff_hotel_ids()));

create policy "staff can update bookings in own hotel" on bookings
  for update using (hotel_id in (select auth_staff_hotel_ids()));

-- ── MAINTENANCE TICKETS ──────────────────────────────────────────────────
create policy "staff can read tickets in own hotel" on maintenance_tickets
  for select using (hotel_id in (select auth_staff_hotel_ids()));

create policy "staff can create tickets in own hotel" on maintenance_tickets
  for insert with check (hotel_id in (select auth_staff_hotel_ids()));

create policy "staff can update tickets in own hotel" on maintenance_tickets
  for update using (hotel_id in (select auth_staff_hotel_ids()));

-- ── SHIFT HANDOVERS ──────────────────────────────────────────────────────
-- Front desk staff see only their own handovers; GMs and owners see all
-- handovers for the hotel (matches the GM-view "handover log" requirement).
create policy "staff can read handovers in own hotel" on shift_handovers
  for select using (
    hotel_id in (select auth_staff_hotel_ids())
    and (
      auth_staff_role_for_hotel(hotel_id) in ('general_manager', 'owner')
      or staff_id = auth_staff_id_for_hotel(hotel_id)
    )
  );

create policy "staff can create own handovers" on shift_handovers
  for insert with check (
    hotel_id in (select auth_staff_hotel_ids())
    and staff_id = auth_staff_id_for_hotel(hotel_id)
  );
