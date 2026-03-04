"use server";

import { createClient } from '@supabase/supabase-js';
// ★ 추가됨: Next.js의 캐시를 강제로 새로고침 해주는 마법의 도구입니다.
import { revalidatePath } from 'next/cache';

export async function incrementView(postId: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.rpc('increment_views', { row_id: Number(postId) });

    if (error) {
      return { success: false, error: error.message };
    }
    
    // ─────────────────────────────────────────────────────────
    // ★ 핵심: DB 업데이트가 성공하면, 해당 게시글과 전체 레이아웃의 캐시를 날려버립니다!
    // 이렇게 하면 유저가 새로고침을 누르지 않아도, 뒤로 가기를 했을 때 목록의 조회수가 바로 반영됩니다.
    // ─────────────────────────────────────────────────────────
    revalidatePath(`/post/${postId}`);
    revalidatePath('/', 'layout'); 
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
