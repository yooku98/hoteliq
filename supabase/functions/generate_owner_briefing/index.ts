// Weekly AI briefing for the Owner/CEO view. Summarizes the last 7 days of
// bookings, revenue and maintenance load, then asks Gemini 1.5 Flash to turn
// that into a plain-language narrative plus a list of flagged anomalies.
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ message: "Method not allowed" }, { status: 405 });
    }

    const { hotel_id } = await req.json().catch(() => ({ hotel_id: null }));
    if (!hotel_id) {
      return Response.json({ message: "hotel_id is required" }, { status: 400 });
    }

    const userId = ctx.userClaims?.id;

    // ctx.supabase is RLS-scoped to the caller — this only succeeds if the
    // caller actually has a staff row at this hotel, and we additionally
    // require the owner role since the briefing is an owner-tier feature.
    const { data: membership } = await ctx.supabase
      .from("staff")
      .select("role")
      .eq("hotel_id", hotel_id)
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (!membership || membership.role !== "owner") {
      return Response.json({ message: "Owner access required for this hotel" }, { status: 403 });
    }

    const { data: hotel } = await ctx.supabase
      .from("hotels")
      .select("name")
      .eq("id", hotel_id)
      .single();

    const { data: rooms } = await ctx.supabase.from("rooms").select("id").eq("hotel_id", hotel_id);
    const totalRooms = rooms?.length ?? 0;

    const today = new Date();
    const weekStart = addDays(today, -6);

    const { data: bookings } = await ctx.supabase
      .from("bookings")
      .select("check_in_date, check_out_date, total_amount")
      .eq("hotel_id", hotel_id)
      .gte("check_in_date", toISODate(weekStart))
      .lte("check_in_date", toISODate(today))
      .neq("status", "cancelled");

    const { data: ticketsThisWeek } = await ctx.supabase
      .from("maintenance_tickets")
      .select("id")
      .eq("hotel_id", hotel_id)
      .gte("created_at", weekStart.toISOString());

    const { data: openTickets } = await ctx.supabase
      .from("maintenance_tickets")
      .select("id")
      .eq("hotel_id", hotel_id)
      .neq("status", "resolved");

    const days: string[] = [];
    for (let i = 0; i < 7; i++) days.push(toISODate(addDays(weekStart, i)));

    const daily = days.map((day) => {
      const dayBookings = (bookings ?? []).filter((b) => b.check_in_date === day);
      const revenue = dayBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
      const occupiedRooms = (bookings ?? []).filter(
        (b) => b.check_in_date <= day && day < b.check_out_date,
      ).length;
      return {
        day,
        revenue: Math.round(revenue),
        occupancy_pct: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
      };
    });

    const totalRevenue = daily.reduce((sum, d) => sum + d.revenue, 0);
    const avgOccupancy = Math.round(
      daily.reduce((sum, d) => sum + d.occupancy_pct, 0) / daily.length,
    );

    const summary = {
      hotel: hotel?.name ?? "the hotel",
      currency: "GH₵",
      week_start: days[0],
      week_end: days[6],
      total_rooms: totalRooms,
      total_revenue: Math.round(totalRevenue),
      average_occupancy_pct: avgOccupancy,
      daily,
      maintenance_tickets_opened_this_week: ticketsThisWeek?.length ?? 0,
      maintenance_tickets_currently_open: openTickets?.length ?? 0,
    };

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return Response.json({ message: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const prompt = `You are a hospitality revenue analyst writing a weekly briefing for the owner of a hotel in Ghana. All money amounts are in Ghanaian cedis (GH₵).

This week's operational data as JSON:
${JSON.stringify(summary, null, 2)}

Write a short, plain-language briefing (3-5 sentences) covering occupancy, revenue, and any notable maintenance load, in a confident, neutral tone with no filler. Then list any real anomalies you notice in the daily figures (e.g. a day far below the weekly average, an unusual occupancy dip, a build-up of open maintenance tickets). If nothing stands out, return an empty anomalies list — do not invent one.

Respond ONLY with JSON in exactly this shape, no markdown fences:
{"narrative": "string", "anomalies": [{"label": "short tag", "detail": "one sentence"}]}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return Response.json({ message: `Gemini request failed: ${errText}` }, { status: 502 });
    }

    const geminiJson = await geminiRes.json();
    const text = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    let parsed: { narrative?: string; anomalies?: Array<{ label: string; detail: string }> };
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { narrative: text, anomalies: [] };
    }

    return Response.json({
      narrative: parsed.narrative ?? "",
      anomalies: parsed.anomalies ?? [],
      summary,
      generated_at: new Date().toISOString(),
    });
  }),
};
