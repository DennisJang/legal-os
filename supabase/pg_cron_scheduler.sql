-- ============================================================
-- LEGAL-OS: pg_cron + pg_net 월간 정기결제 스케줄러
-- Supabase SQL Editor에서 실행
-- ============================================================

-- 0. 확장 활성화 (최초 1회)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ============================================================
-- 1. 매일 자정(KST 00:00 = UTC 15:00) toss-recurring-batch 호출
-- ============================================================
select cron.schedule(
  'toss-recurring-batch-daily',   -- 잡 이름 (중복 방지용 고유 식별자)
  '0 15 * * *',                   -- UTC 15:00 = KST 00:00 매일
  $$
  select net.http_post(
    url     := (
      select decrypted_secret
      from vault.decrypted_secrets
      where name = 'SUPABASE_FUNCTIONS_URL'  -- Vault에 저장된 Edge Function 베이스 URL
    ) || '/toss-recurring-batch',
    headers := jsonb_build_object(
      'Content-Type',   'application/json',
      'Authorization',  'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'SUPABASE_SERVICE_ROLE_KEY'  -- 🔒 Vault에서 안전하게 참조
      )
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- ============================================================
-- 2. 등록된 cron 잡 확인
-- ============================================================
-- select * from cron.job;

-- ============================================================
-- 3. 잡 삭제 (롤백 시 사용)
-- ============================================================
-- select cron.unschedule('toss-recurring-batch-daily');

-- ============================================================
-- [보안 원칙]
-- SERVICE_ROLE_KEY는 절대 SQL 평문 하드코딩 금지.
-- Supabase Vault(vault.decrypted_secrets)에 저장 후 참조.
-- toss-recurring-batch Edge Function은 수신 시
-- Authorization Bearer 헤더로 SERVICE_ROLE_KEY를 검증하여
-- 외부 무단 호출을 차단한다.
-- ============================================================
