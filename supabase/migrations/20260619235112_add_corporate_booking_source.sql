-- Lets room bookings tied to a corporate/group client show up distinctly in
-- the booking-source breakdown rather than being lumped into "walk_in".
alter type booking_source add value 'corporate';
