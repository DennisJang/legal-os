// supabase/functions/_shared/auth/hibp-check.ts
// ============================================================
// HaveIBeenPwned.org k-Anonymity API — 유출 비밀번호 차단
// Pro Plan 없이도 앱 레벨에서 동일한 보안 효과 구현
//
// k-Anonymity 방식: 비밀번호 평문을 절대 전송하지 않음
//   1. SHA-1 해시 → 앞 5자리만 API 전송
//   2. 나머지 해시 목록을 받아 로컬에서 매칭
//   → 비밀번호 원문이 외부로 유출되는 구조적 불가능
// ============================================================

/**
 * 비밀번호가 유출된 적 있는지 HIBP k-Anonymity API로 확인
 * @returns { pwned: true, count: N }  → 유출됨 (회원가입 차단)
 * @returns { pwned: false }           → 안전 (회원가입 허용)
 */
export async function checkLeakedPassword(
  password: string,
): Promise<{ pwned: boolean; count?: number }> {
  // 1. SHA-1 해시 생성
  const encoder  = new TextEncoder();
  const data     = encoder.encode(password);
  const hashBuf  = await crypto.subtle.digest("SHA-1", data);
  const hashHex  = Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  // 2. 앞 5자리만 HIBP API로 전송 (k-Anonymity)
  const prefix = hashHex.slice(0, 5);
  const suffix = hashHex.slice(5);

  const res = await fetch(
    `https://api.pwnedpasswords.com/range/${prefix}`,
    {
      headers: {
        // HIBP 권장: Add-Padding 헤더로 응답 크기 균일화 (타이밍 공격 방어)
        "Add-Padding": "true",
      },
    },
  );

  if (!res.ok) {
    // HIBP API 장애 시 → 보안보다 가용성 우선: 통과시키되 로그 기록
    console.warn(`[HIBP] API 응답 실패 (${res.status}) — 검증 스킵`);
    return { pwned: false };
  }

  // 3. 응답 목록에서 suffix 매칭 (로컬 비교)
  const text  = await res.text();
  const lines = text.split("\r\n");

  for (const line of lines) {
    const [hashSuffix, countStr] = line.split(":");
    if (hashSuffix === suffix) {
      const count = parseInt(countStr, 10);
      return { pwned: true, count };
    }
  }

  return { pwned: false };
}