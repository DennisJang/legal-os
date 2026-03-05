import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const authHeader = req.headers.get("Authorization") ?? "";
  if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) return new Response("Unauthorized", { status: 401 });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 🚨 관제탑 패치: encrypted_storage_path 컬럼 사용
  const { data: targets } = await supabase
    .from("sensitive_vault_ttl")
    .select("id, user_id, encrypted_storage_path, expires_at")
    .lt("expires_at", new Date().toISOString())
    .eq("is_physically_deleted", false);

  if (!targets || targets.length === 0) return new Response(JSON.stringify({ cleaned: 0 }), { status: 200, headers: { "Content-Type": "application/json" } });

  let deletedCount = 0;
  for (const record of targets) {
    try {
      let arcPath = record.encrypted_storage_path;
      if (arcPath.includes("/storage/v1/object/public/")) {
        arcPath = arcPath.split("/storage/v1/object/public/")[1];
      }
      const [bucket, ...filePathArr] = arcPath.split("/");
      const filePath = filePathArr.join("/");

      // 1. Storage 영구 삭제 (Hard Delete)
      const { error: storageError } = await supabase.storage.from(bucket).remove([filePath]);
      
      if (storageError) {
        console.error(`[vault-cleanup] 삭제 실패:`, storageError.message);
        continue; // DB 갱신 없이 넘어가서 다음 크론에 재시도
      }

      // 2. DB 이력 갱신 (소각 증명)
      await supabase.from("sensitive_vault_ttl").update({
        is_physically_deleted: true,
        deleted_at: new Date().toISOString(),
      }).eq("id", record.id);
      
      deletedCount++;
    } catch (e) {
      console.error("[vault-cleanup] 예외:", String(e));
    }
  }

  return new Response(JSON.stringify({ cleaned: deletedCount }), { status: 200, headers: { "Content-Type": "application/json" } });
});