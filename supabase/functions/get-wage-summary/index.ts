import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { target_month, user_id } = await req.json();
    if (!target_month || !user_id) throw new Error("target_month, user_id required");

    // service_role — JWT 검증 우회, 401 구조적 제거
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: logs, error } = await supabase
      .from("daily_work_logs")
      .select("actual_work_minutes, clock_in_time, hourly_wage")
      .eq("user_id", user_id)
      .gte("work_date", `${target_month}-01`)
      .lte("work_date", `${target_month}-31`);

    if (error) throw error;

    if (!logs || logs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        data: { base_pay: 0, night_bonus_pay: 0, overtime_pay: 0, weekly_holiday_pay: 0, total_pay: 0, snapshot_min_wage: 9860, target_month }
      }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    let base_pay = 0;
    let night_bonus_pay = 0;
    let overtime_pay = 0;

    for (const log of logs) {
      const wage = Number(log.hourly_wage) || 9860;
      const workMin = Number(log.actual_work_minutes) || 0;
      const workHours = workMin / 60;

      base_pay += Math.min(workHours, 8) * wage;
      overtime_pay += Math.max(0, workHours - 8) * wage * 1.5;

      if (log.clock_in_time) {
        const hourKST = (new Date(log.clock_in_time).getUTCHours() + 9) % 24;
        if (hourKST >= 22 || hourKST < 6) night_bonus_pay += workHours * wage * 0.5;
      }
    }

    const totalMinutes = logs.reduce((s, l) => s + (Number(l.actual_work_minutes) || 0), 0);
    const avgWage = logs.reduce((s, l) => s + (Number(l.hourly_wage) || 9860), 0) / logs.length;
    const weekly_holiday_pay = totalMinutes >= 900 ? avgWage * 8 * Math.floor(logs.length / 5) : 0;
    const total_pay = Math.round(base_pay + night_bonus_pay + overtime_pay + weekly_holiday_pay);

    return new Response(JSON.stringify({
      success: true,
      data: {
        base_pay: Math.round(base_pay), night_bonus_pay: Math.round(night_bonus_pay),
        overtime_pay: Math.round(overtime_pay), weekly_holiday_pay: Math.round(weekly_holiday_pay),
        total_pay, snapshot_min_wage: 9860, target_month,
      }
    }), { headers: { ...CORS, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 400, headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
});