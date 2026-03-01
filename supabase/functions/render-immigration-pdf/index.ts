import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { PDFDocument, rgb } from "https://cdn.skypack.dev/pdf-lib";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
  try {
    // 🎯 [핵심 진화] 이제 프론트엔드에서 템플릿 이름(templateName)을 지정해서 쏴줍니다.
    const { templateName, contractData, arcImageUrl } = await req.json();

    if (!templateName) {
      throw new Error("요청 본문에 'templateName' (관공서 PDF 파일명)이 누락되었습니다.");
    }

    // ── 1. 실제 관공서 PDF 도화지 다운로드 (public_forms 버킷) ──
    const { data: pdfData, error: downloadError } = await supabase.storage
      .from("public_forms")
      .download(templateName);

    if (downloadError || !pdfData) {
      throw new Error(`'public_forms' 버킷에서 '${templateName}' 파일을 찾을 수 없습니다. 파일명을 정확히 확인하세요.`);
    }

    const pdfBytes = await pdfData.arrayBuffer();
    // 여기서 진짜 PDF가 아니면 (예: jpg) No PDF header found 에러가 납니다.
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0]; // 무조건 1페이지에 정보 기입

    // ── 2. 파싱된 JSON 데이터 맵핑 (임시 PoC 좌표) ──
    if (contractData) {
      // 나중에 이 좌표(x, y)만 진짜 서식 빈칸 위치로 맞추면 끝입니다.
      firstPage.drawText(`Deposit: ${contractData.deposit}`, { x: 50, y: 700, size: 14, color: rgb(0,0,0) });
      firstPage.drawText(`Rent: ${contractData.monthly_rent}`, { x: 50, y: 670, size: 14, color: rgb(0,0,0) });
      firstPage.drawText(`Exp: ${contractData.expiration_date}`, { x: 50, y: 640, size: 14, color: rgb(0,0,0) });
    }

    // ── 3. [보완 6] 헌법: 신분증(ARC) 이미지 다운로드 및 2페이지 강제 병합 ──
    if (arcImageUrl) {
      const imgRes = await fetch(arcImageUrl);
      if (!imgRes.ok) throw new Error("ARC 신분증 이미지를 다운로드할 수 없습니다.");
      
      const imgBuffer = await imgRes.arrayBuffer();
      let arcImage;
      
      try {
        arcImage = await pdfDoc.embedPng(imgBuffer);
      } catch (_e) {
        arcImage = await pdfDoc.embedJpg(imgBuffer);
      }
      
      const newPage = pdfDoc.addPage();
      newPage.drawImage(arcImage, {
        x: 50,
        y: newPage.getHeight() - 400,
        width: 400,
        height: 250,
      });
    }

    const finalPdfBytes = await pdfDoc.save();

    // ── 4. temp_pdfs 버킷에 합성된 파일 업로드 (비공개 버킷) ──
    const fileName = `merged_${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("temp_pdfs")
      .upload(fileName, finalPdfBytes, { contentType: "application/pdf" });

    if (uploadError) {
      throw new Error(`temp_pdfs 버킷 업로드 실패: ${uploadError.message}`);
    }

    // ── 5. Signed URL 생성 (1시간 제한) ──
    const { data: signedData, error: signedError } = await supabase.storage
      .from("temp_pdfs")
      .createSignedUrl(fileName, 3600);

    if (signedError || !signedData) {
      throw new Error(`다운로드 URL 생성 실패`);
    }

    return new Response(JSON.stringify({ signedUrl: signedData.signedUrl, expiresIn: 3600 }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: unknown) {
    // error가 진짜 Error 객체인지 확인하여 안전하게 메시지 추출
    const errormessage = error instanceof Error ? error.message : String(error);
    
    return new Response(JSON.stringify({ 
      error: "PDF 렌더링 에러", 
      detail: errormessage 
    }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});