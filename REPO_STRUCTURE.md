# Legal-OS Repository Structure

## 1. 폴더 구조 전체 트리 (node_modules 제외)

```
.
├── .github
│   └── workflows
│       └── deploy-functions.yml
├── .gitignore
├── .vscode
│   └── settings.json
├── LICENSE
├── README.md
├── apps
│   ├── mobile
│   │   ├── .env
│   │   ├── .gitignore
│   │   ├── App.tsx
│   │   ├── app.json
│   │   ├── assets
│   │   │   ├── android-icon-background.png
│   │   │   ├── android-icon-foreground.png
│   │   │   ├── android-icon-monochrome.png
│   │   │   ├── favicon.png
│   │   │   ├── icon.png
│   │   │   └── splash-icon.png
│   │   ├── index.ts
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── components
│   │   │   │   ├── AppleButton.tsx
│   │   │   │   └── ContractScanner.tsx
│   │   │   ├── hooks
│   │   │   │   └── useLocalPush.ts
│   │   │   └── store
│   │   │       └── useDashboardStore.ts
│   │   └── tsconfig.json
│   └── web
│       ├── .env.local
│       ├── .gitignore
│       ├── .vscode
│       │   └── settings.json
│       ├── README.md
│       ├── biome.json
│       ├── middleware.ts
│       ├── next-env.d.ts
│       ├── next.config.ts
│       ├── package.json
│       ├── pnpm-workspace.yaml
│       ├── postcss.config.mjs
│       ├── public
│       │   ├── file.svg
│       │   ├── globe.svg
│       │   ├── next.svg
│       │   ├── vercel.svg
│       │   └── window.svg
│       ├── src
│       │   ├── app
│       │   │   ├── billing
│       │   │   │   ├── page.tsx
│       │   │   │   └── success
│       │   │   │       ├── BillingSuccessClient.tsx
│       │   │   │       └── page.tsx
│       │   │   ├── dashboard
│       │   │   │   ├── fax
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── me
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── visa
│       │   │   │   │   └── page.tsx
│       │   │   │   └── wage
│       │   │   │       └── page.tsx
│       │   │   ├── favicon.ico
│       │   │   ├── globals.css
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components
│       │   │   ├── DailyLogBottomSheet.tsx
│       │   │   ├── DashboardTabBar.tsx
│       │   │   ├── GoogleAuthButton.tsx
│       │   │   ├── HydrationProvider.tsx
│       │   │   ├── LiabilityActionSheet.tsx
│       │   │   ├── MagicPalette.tsx
│       │   │   ├── MissingDocFallback.tsx
│       │   │   ├── SpecUpdateModal.tsx
│       │   │   ├── TossPaywall.tsx
│       │   │   └── widgets
│       │   │       ├── SafeHomeWidget.tsx
│       │   │       ├── VisaRingWidget.tsx
│       │   │       └── WageCalendarWidget.tsx
│       │   ├── lib
│       │   │   └── confetti.ts
│       │   └── store
│       │       ├── useDashboardStore.ts
│       │       ├── usePaymentStore.ts
│       │   │   ├── useSubmitStore.ts
│       │   │   ├── useUIStore.ts
│       │   │   └── useUserStore.ts
│       │   ├── tailwind.config.ts
│       │   ├── tsconfig.json
│       │   └── tsconfig.tsbuildinfo
├── deno.lock
├── legal-os
│   ├── .gitignore
│   ├── .npmrc
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   ├── README.md
│   ├── turbo.json
│   ├── apps
│   │   ├── mobile
│   │   │   ├── .gitignore
│   │   │   ├── .npmrc
│   │   │   ├── App.tsx
│   │   │   ├── app.json
│   │   │   ├── assets
│   │   │   │   ├── android-icon-background.png
│   │   │   │   ├── android-icon-foreground.png
│   │   │   │   ├── android-icon-monochrome.png
│   │   │   │   ├── favicon.png
│   │   │   │   ├── icon.png
│   │   │   │   └── splash-icon.png
│   │   │   ├── index.ts
│   │   │   ├── package.json
│   │   │   └── tsconfig.json
│   │   └── web
│   │       ├── .gitignore
│   │       ├── README.md
│   │       ├── app
│   │       │   ├── favicon.ico
│   │       │   ├── fonts
│   │   │   │   ├── GeistMonoVF.woff
│   │   │   │   └── GeistVF.woff
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── page.module.css
│   │   │   ├── page.tsx
│   │   │   └── public
│   │       ├── eslint.config.js
│   │       ├── next-env.d.ts
│   │       ├── next.config.js
│   │       ├── package.json
│   │       ├── public
│       │   ├── file-text.svg
│       │   ├── globe.svg
│       │   ├── next.svg
│       │   ├── turborepo-dark.svg
│       │   ├── turborepo-light.svg
│       │   ├── vercel.svg
│       │   └── window.svg
│       │   └── tsconfig.json
│   ├── packages
│   │   ├── eslint-config
│   │   │   ├── README.md
│   │   │   ├── base.js
│   │   │   ├── next.js
│   │   │   ├── package.json
│   │   │   └── react-internal.js
│   │   ├── typescript-config
│   │   │   ├── base.json
│   │   │   ├── nextjs.json
│   │   │   ├── package.json
│   │   │   └── react-library.json
│   │   └── ui
│   │       ├── eslint.config.mjs
│   │       ├── package.json
│   │       ├── src
│   │       │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── code.tsx
│   │       └── tsconfig.json
├── mobile
│   ├── .gitignore
│   ├── App.tsx
│   ├── app.json
│   ├── assets
│   │   ├── android-icon-background.png
│   │   ├── android-icon-foreground.png
│   │   ├── android-icon-monochrome.png
│   │   ├── favicon.png
│   │   ├── icon.png
│   │   └── splash-icon.png
│   │   ├── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── supabase
│   ├── .temp
│   │   ├── cli-latest
│   │   ├── gotrue-version
│   │   ├── pooler-url
│   │   ├── postgres-version
│   │   ├── project-ref
│   │   ├── rest-version
│   │   ├── storage-migration
│   │   └── storage-version
│   ├── functions
│   │   ├── _shared
│   │   │   ├── ai-parser
│   │   │   │   ├── gemini-adapter.ts
│   │   │   │   ├── interface.ts
│   │   │   │   └── openai-adapter.ts
│   │   │   ├── auth
│   │   │   │   └── hibp-check.ts
│   │   │   └── get-wage-summary
│   │   │       └── index.ts
│   │   │   ├── handle-vault-cleanup
│   │   │   └── index.ts
│   │   ├── parse-contract-ocr
│   │   │   └── index.ts
│   │   ├── render-immigration-pdf
│   │   │   └── index.ts
│   │   ├── send-immigration-fax
│   │   │   └── index.ts
│   │   ├── sync-beehiiv-subscriber
│   │   │   └── index.ts
│   │   ├── toss-batch-billing
│   │   │   └── index.ts
│   │   ├── toss-recurring-batch
│   │   │   └── index.ts
│   │   ├── toss-subscribe-init
│   │   │   └── index.ts
│   │   ├── toss-webhook-handler
│   │   │   └── index.ts
│   │   └── webhook-fax-handler
│   │       └── index.ts
│   └── pg_cron_scheduler.sql
└── turbo.json
```

## 2. 각 페이지 파일(page.tsx)의 역할 한 줄 요약

- `apps/web/src/app/page.tsx`: 메인 대시보드 페이지로 VisaRingWidget, WageCalendarWidget, SafeHomeWidget, MagicPalette 위젯들을 표시
- `apps/web/src/app/billing/page.tsx`: TossPaywall 컴포넌트를 사용하여 결제 페이지를 표시
- `apps/web/src/app/billing/success/page.tsx`: 결제 성공 페이지를 표시하며 BillingSuccessClient를 사용
- `apps/web/src/app/dashboard/fax/page.tsx`: 팩스 페이지로 "Zero-Visit 팩스 발송 — 준비 중" 메시지 표시
- `apps/web/src/app/dashboard/me/page.tsx`: 내 정보 페이지로 "프로필 및 구독 관리 — 준비 중" 메시지 표시
- `apps/web/src/app/dashboard/visa/page.tsx`: 비자 페이지로 "비자 오토파일럿 — 준비 중" 메시지 표시
- `apps/web/src/app/dashboard/wage/page.tsx`: 임금 페이지로 "스마트 임금 달력 — 준비 중" 메시지 표시
- `legal-os/apps/web/app/page.tsx`: Turborepo 예제 페이지로 로고와 시작 가이드 표시

## 3. Zustand store 파일 위치 및 관리하는 상태 목록

- `apps/web/src/store/useDashboardStore.ts`: user profile, hydration, marked dates, monthly wage, fax payload, disclaimer states. Methods: hydrate, reset, updateSpecOptimistic, saveWorkLog, fax submission
- `apps/web/src/store/usePaymentStore.ts`: subscription status, plan type. Methods: activateSubscription, resetSubscription
- `apps/web/src/store/useSubmitStore.ts`: fax status, pdf url. Methods: submitFax, resolveFax, rejectFax, reset
- `apps/web/src/store/useUIStore.ts`: theme, palette open, disclaimer checked. Methods: toggleTheme, togglePalette, setDisclaimer
- `apps/web/src/store/useUserStore.ts`: user spec (visa, wage, hours, zip), subscription status. Methods: updateSpec, setSubscribed
- `apps/mobile/src/store/useDashboardStore.ts`: 임시 뼈대, user null (런칭 전 웹과 동일한 로직 병합 예정)

## 4. Supabase 연동 포인트 (Edge Functions, RPC, 직접 쿼리) 목록

### Edge Functions
- `send-immigration-fax`: 팩스 전송, fax_routing_directory 조회, public_forms/storage 다운로드, fax_transmissions 삽입, sensitive_vault_ttl 삽입
- `toss-subscribe-init`: 구독 초기화, subscriptions upsert
- `toss-webhook-handler`: Toss 웹훅 처리
- `sync-beehiiv-subscriber`: Beehiiv 구독자 동기화
- `toss-batch-billing`: 배치 결제
- `toss-recurring-batch`: 반복 배치
- `parse-contract-ocr`: 계약 OCR 파싱
- `render-immigration-pdf`: 이민 PDF 렌더링
- `webhook-fax-handler`: 팩스 웹훅 처리
- `handle-vault-cleanup`: 볼트 정리
- `get-wage-summary`: 임금 요약

### RPC
- `update_user_spec`: 사용자 스펙 업데이트

### 직접 쿼리
- `visa_trackers.select`: current_score 조회
- `profiles.select`: 프로필 조회
- `work_logs.insert`: 근무 로그 삽입
- `fax_transmissions.insert`: 팩스 전송 삽입
- `sensitive_vault_ttl.insert`: 민감 데이터 삽입
- `subscriptions.upsert`: 구독 upsert

## 5. 현재 미완성/더미 데이터로 동작 중인 컴포넌트 목록

- `MissingDocFallback.tsx`: dummy affiliateUrl ('https://pf.kakao.com/dummy') 사용
- `apps/web/src/app/dashboard/visa/page.tsx`: "준비 중" 메시지 표시
- `apps/web/src/app/dashboard/fax/page.tsx`: "준비 중" 메시지 표시
- `apps/web/src/app/dashboard/wage/page.tsx`: "준비 중" 메시지 표시
- `apps/web/src/app/dashboard/me/page.tsx`: "준비 중" 메시지 표시

## 6. 각 컴포넌트의 의존 관계 (어떤 컴포넌트가 어떤 store/RPC를 사용하는지)

- `VisaRingWidget`: 독립적, props로 score/target 등 받음
- `WageCalendarWidget`: useDashboardStore (markedDates, monthlyWage, wageLoading), DailyLogBottomSheet 사용
- `SafeHomeWidget`: 독립적, 하드코딩된 status ("SAFE")
- `MagicPalette`: 독립적, ACTIONS 배열
- `TossPaywall`: TossPayments SDK, GoogleAuthButton 사용
- `SpecUpdateModal`: useDashboardStore (user, updateSpecOptimistic), supabase 클라이언트, update_user_spec RPC
- `DailyLogBottomSheet`: useDashboardStore (saveWorkLog), supabase 클라이언트, work_logs.insert 쿼리</content>
<parameter name="filePath">/workspaces/legal-os/REPO_STRUCTURE.md