import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// 임시 모바일 상태 뼈대 (UI 렌더링 및 모바일 뼈대 검증용)
export const useDashboardStore = create((set, get) => ({
  user: null,
  // 런칭 전 웹과 동일한 로직을 완전히 병합할 예정
}));