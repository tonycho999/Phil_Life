"use server";

import { createClient } from '@supabase/supabase-js';

export async function incrementView(postId: string) {
  try {
    // 1. 기존 프로젝트 설정을 무시하고, 환경변수로 쌩(?) 통신망을 만듭니다.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. 아까 만들어두신 마법 함수(increment_views)를 타격합니다.
    const { error } = await supabase.rpc('increment_views', { row_id: Number(postId) });

    // 3. 만약 실패하면 왜 실패했는지 에러 메시지를 화면으로 던집니다!
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
