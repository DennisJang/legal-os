import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib@1.17.1?dts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const POPBILL_LINK_ID = Deno.env.get("POPBILL_LINK_ID") ?? "TEST_LINK_ID";
const POPBILL_SECRET_KEY = Deno.env.get("POPBILL_SECRET_KEY") ?? "TEST_SECRET_KEY";
const POPBILL_SENDER_NUM = Deno.env.get("POPBILL_SENDER_NUM") ?? "020000000";

const A4_WIDTH = 595;
const A4_HEIGHT = 842;

serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const body = await req.json().catch(() => ({}));
  const { userId, zipcode, contractData, arc_image_url, form_template_path, liability_agreed, idempotency_key, document_type } = body;

  // 🚨 예외 방어 게이트 1 & 2
  if (!liability_agreed) return new Response(JSON.stringify({ error: "면책 동의가 필요합니다." }), { status: 403 });
  if (!arc_image_url) return new Response(JSON.stringify({ error: "신분증(ARC) 누락" }), { status: 400 });
  if (!userId || !zipcode || !form_template_path || !idempotency_key) {
    return new Response(JSON.stringify({ error: "필수 파라미터 누락" }), { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // ── Step 1: 팩스 라우팅 조회 (🚨 관제탑 패치: postal_code 매칭)
  const { data: routeData, error: routeError } = await supabase
    .from("fax_routing_directory")
    .select("fax_number, office_name")
    .eq("postal_code", zipcode)
    .single();

  if (routeError || !routeData) return new Response(JSON.stringify({ error: "관할 팩스번호를 찾을 수 없습니다." }), { status: 404 });
  const targetFaxNumber = routeData.fax_number;

  // ── Step 2: 빈칸 서식 로드 및 맵핑
  const { data: formBlob } = await supabase.storage.from("public_forms").download(form_template_path);
  if (!formBlob) return new Response(JSON.stringify({ error: "서식 PDF 로드 실패" }), { status: 500 });
  
  const formArrayBuffer = await formBlob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(formArrayBuffer);
  const firstPage = pdfDoc.getPages()[0];

  const { rgb } = await import("https://cdn.skypack.dev/pdf-lib@1.17.1?dts");
  const fieldMap: Record<string, { x: number; y: number }> = {
    deposit: { x: 120, y: 600 }, monthly_rent: { x: 120, y: 560 }, expiration_date: { x: 120, y: 520 },
  };
  
  if (contractData) {
    for (const [key, coords] of Object.entries(fieldMap)) {
      if (contractData[key] !== undefined) {
        firstPage.drawText(String(contractData[key]), { x: coords.x, y: coords.y, size: 11, color: rgb(0,0,0) });
      }
    }
  }

  // ── Step 3: 보완 6 헌법 - ARC 리사이징 및 병합
  let arcPath = arc_image_url;
  if (arc_image_url.includes("/storage/v1/object/public/")) {
    arcPath = arc_image_url.split("/storage/v1/object/public/")[1];
  }
  const [arcBucket, ...arcPathArr] = arcPath.split("/");
  const { data: arcBlob } = await supabase.storage.from(arcBucket).download(arcPathArr.join("/"));
  if (!arcBlob) return new Response(JSON.stringify({ error: "ARC 로드 실패" }), { status: 500 });

  const arcArrayBuffer = await arcBlob.arrayBuffer();
  const isJpeg = new Uint8Array(arcArrayBuffer)[0] === 0xFF && new Uint8Array(arcArrayBuffer)[1] === 0xD8;
  const arcImage = isJpeg ? await pdfDoc.embedJpg(arcArrayBuffer) : await pdfDoc.embedPng(arcArrayBuffer);

  const arcPage = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  const imgDims = arcImage.scaleToFit(A4_WIDTH - 80, A4_HEIGHT - 80);
  arcPage.drawImage(arcImage, { 
    x: (A4_WIDTH - imgDims.width) / 2, 
    y: (A4_HEIGHT - imgDims.height) / 2, 
    width: imgDims.width, 
    height: imgDims.height 
  });

  const pdfBytes = await pdfDoc.save();
  const pdfBase64 = btoa(String.fromCharCode.apply(null, Array.from(pdfBytes)));

  // ── Step 4: Popbill 전송 
  // 기본적으로는 무작위 UUID를 생성하되, 실제 Popbill 발송 시 응답에 포함된 접수번호를 사용합니다.
  let receiptNum = crypto.randomUUID(); // MVP Test Random ID (실제 연동 시 Popbill Response 파싱 필요)
  
  /* [MVP 테스트 기간 동안은 Popbill 실제 발송은 주석 처리 또는 에러 패스]
  const popbillRes = await fetch(`https://fax.popbill.com/FAX/SendFAX`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${POPBILL_SECRET_KEY}`, "Content-Type": "application/json", "X-Popbill-LinkID": POPBILL_LINK_ID },
    body: JSON.stringify({ senderNum: POPBILL_SENDER_NUM, receiverNum: targetFaxNumber, receiverName: routeData.office_name, fileData: pdfBase64, receiptNum }),
  });
  if (!popbillRes.ok) return new Response(JSON.stringify({ error: "Popbill 전송 실패" }), { status: 502 });

  // Popbill이 자체 생성한 접수번호를 반환하므로, 가능한 경우 그 값을 사용
  const popbillData = await popbillRes.json();
  receiptNum = popbillData.receiptNum ?? receiptNum;
  */

  // ── Step 5: DB 기록 (🚨 관제탑 패치: 모든 필수 컬럼 100% 매칭)
  const { data: txData, error: txError } = await supabase.from("fax_transmissions").insert({
    user_id: userId,
    postal_code: zipcode,
    document_type: document_type || 'HOUSING_REPORT', // ENUM 방어
    recipient_fax: targetFaxNumber,
    status: "QUEUED",
    receipt_num: receiptNum,
    idempotency_key: idempotency_key,
    liability_agreed: true
  }).select("id").single();

  if (txError || !txData) return new Response(JSON.stringify({ error: "팩스 이력 저장 실패", detail: txError }), { status: 500 });

  // ── Step 6: TTL 소각 예약 (🚨 관제탑 패치: FK 주입 및 암호화 컬럼 매칭)
  await supabase.from("sensitive_vault_ttl").insert({
    fax_transmission_id: txData.id,
    user_id: userId,
    encrypted_storage_path: arc_image_url,
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    is_physically_deleted: false,
  });

  return new Response(JSON.stringify({ success: true, receiptNum, targetFaxNumber }), { status: 200, headers: { "Content-Type": "application/json" } });
});