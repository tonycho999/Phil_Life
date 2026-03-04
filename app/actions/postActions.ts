"use server";

import { createClient } from "@/lib/supabase";

export async function incrementView(postId: string) {
  try {
    const supabase = createClient();
    
    // 서버에서 안전하게 RPC 함수를 호출합니다.
    const { error } = await supabase.rpc('increment_views', { row_id: Number(postId) });
    
    if (error) {
      console.error("Supabase RPC 에러:", error);
    }
  } catch (error) {
    console.error("조회수 증가 서버 액션 실패:", error);
  }
}
