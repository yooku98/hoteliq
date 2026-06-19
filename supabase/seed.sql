-- Local dev seed only. Creates demo auth users (password: "password123")
-- via direct inserts into auth.users — this pattern is safe for the local
-- Supabase stack but must never run against a hosted project.

do $$
declare
  v_hotel_a uuid;
  v_hotel_b uuid;
  v_fd_user uuid;
  v_gm_user uuid;
  v_owner_user uuid;
  v_room_ids uuid[];
  v_day date;
  v_pick_room uuid;
  v_nights int;
begin
  insert into hotels (id, name, slug, primary_color, subscription_status)
  values (gen_random_uuid(), 'Peninsula Resort and Golf Club — Aburi', 'peninsula-aburi', '#0E6B6B', 'active')
  returning id into v_hotel_a;

  insert into hotels (id, name, slug, primary_color, subscription_status)
  values (gen_random_uuid(), 'Volta Lakeside Hotel', 'volta-lakeside', '#B8860B', 'active')
  returning id into v_hotel_b;

  -- ── Demo auth users ──
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at)
  values
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'frontdesk@peninsula.demo', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated', now(), now())
  returning id into v_fd_user;

  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at)
  values
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'gm@peninsula.demo', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated', now(), now())
  returning id into v_gm_user;

  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, role, aud, created_at, updated_at)
  values
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'owner@peninsula.demo', crypt('password123', gen_salt('bf')), now(), 'authenticated', 'authenticated', now(), now())
  returning id into v_owner_user;

  insert into staff (hotel_id, auth_user_id, name, email, role) values
    (v_hotel_a, v_fd_user, 'Akosua Mensah', 'frontdesk@peninsula.demo', 'front_desk'),
    (v_hotel_a, v_gm_user, 'Kwame Asante', 'gm@peninsula.demo', 'general_manager'),
    (v_hotel_a, v_owner_user, 'Abena Owusu', 'owner@peninsula.demo', 'owner'),
    (v_hotel_b, v_owner_user, 'Abena Owusu', 'owner@peninsula.demo', 'owner');

  -- ── Rooms (Standard/Deluxe/Suite/Executive, matching the demo mix) ──
  insert into rooms (hotel_id, room_number, room_type, status)
  select v_hotel_a, n::text, room_type, 'clean'::room_status
  from (
    select generate_series(101, 116) as n, 'Standard' as room_type
    union all select generate_series(201, 212), 'Deluxe'
    union all select generate_series(301, 307), 'Suite'
    union all select generate_series(401, 404), 'Executive'
  ) seed_rooms;

  select array_agg(id) into v_room_ids from rooms where hotel_id = v_hotel_a;

  update rooms set status = 'dirty' where id = v_room_ids[1];
  update rooms set status = 'maintenance' where id = v_room_ids[2];
  update rooms set status = 'blocked' where id = v_room_ids[3];

  -- ── Bookings: 30 days back through 7 days forward, randomised occupancy ──
  for v_day in select generate_series(current_date - interval '30 days', current_date + interval '7 days', interval '1 day')::date
  loop
    for i in 1..(array_length(v_room_ids, 1) * (0.55 + random() * 0.35))::int
    loop
      v_pick_room := v_room_ids[1 + floor(random() * array_length(v_room_ids, 1))::int];
      v_nights := 1 + floor(random() * 3)::int;

      insert into bookings (hotel_id, room_id, guest_name, guest_phone, check_in_date, check_out_date, status, source, total_amount, amount_paid, payment_method)
      values (
        v_hotel_a,
        v_pick_room,
        (array['Yaw Boateng','Efua Asantewaa','John Mensah','Adwoa Sarpong','Kojo Appiah','Linda Owusu','Samuel Tetteh','Grace Adjei'])[1 + floor(random()*8)::int],
        '+233' || (200000000 + floor(random()*99999999))::bigint::text,
        v_day,
        v_day + v_nights,
        case when v_day < current_date then 'checked_out' when v_day = current_date then 'checked_in' else 'confirmed' end::booking_status,
        (array['walk_in','phone','booking_com','expedia','direct'])[1 + floor(random()*5)::int]::booking_source,
        round((580 + random() * 1500)::numeric * v_nights, 2),
        0,
        (array['cash','momo_mtn','momo_vodafone','momo_airteltigo','card'])[1 + floor(random()*5)::int]::payment_method
      );
    end loop;
  end loop;

  -- amount_paid: most bookings paid in full, some partially (drives the
  -- Owner view's revenue-leakage flag), a few untouched.
  update bookings set amount_paid = total_amount
  where hotel_id = v_hotel_a and random() < 0.75;

  update bookings set amount_paid = round(total_amount * (0.2 + random() * 0.5), 2)
  where hotel_id = v_hotel_a and amount_paid = 0 and random() < 0.6;

  -- ── Maintenance tickets ──
  insert into maintenance_tickets (hotel_id, room_id, description, status, reported_by, created_at, resolved_at)
  select v_hotel_a, v_room_ids[2], 'AC unit not cooling', 'in_progress', id, now() - interval '2 days', null
  from staff where hotel_id = v_hotel_a and role = 'front_desk';

  insert into maintenance_tickets (hotel_id, room_id, description, status, reported_by, created_at, resolved_at)
  select v_hotel_a, v_room_ids[5], 'Leaking bathroom tap', 'open', id, now() - interval '6 hours', null
  from staff where hotel_id = v_hotel_a and role = 'front_desk';

  insert into maintenance_tickets (hotel_id, room_id, description, status, reported_by, created_at, resolved_at)
  select v_hotel_a, v_room_ids[8], 'TV remote missing', 'resolved', id, now() - interval '5 days', now() - interval '4 days'
  from staff where hotel_id = v_hotel_a and role = 'front_desk';

  -- ── Shift handovers ──
  insert into shift_handovers (hotel_id, staff_id, shift_date, cash_collected, cash_expected, notes)
  select v_hotel_a, id, current_date - 1, 4200, 4200, 'No discrepancies, smooth shift.'
  from staff where hotel_id = v_hotel_a and role = 'front_desk';

  insert into shift_handovers (hotel_id, staff_id, shift_date, cash_collected, cash_expected, notes)
  select v_hotel_a, id, current_date - 2, 3650, 3800, 'GH₵150 short — one walk-in paid cash, receipt not logged yet.'
  from staff where hotel_id = v_hotel_a and role = 'front_desk';
end $$;
