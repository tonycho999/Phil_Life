import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// ★ 빌드 시 미리 생성하지 않고, 요청이 올 때 Edge에서 생성합니다.
export const runtime = 'edge';

// ★ layout.tsx의 canonical(https://phcafe24.com)과 반드시 동일하게 맞춥니다.
const baseUrl = 'https://phcafe24.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. 고정된 기본 페이지들
  const routes: MetadataRoute.Sitemap = ['', '/news', '/info', '/community'].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: route === '' ? 1.0 : 0.8,
    })
  );

  // 2. 환경 변수가 없으면 DB 조회 없이 기본 페이지만 반환 (빌드 멈춤 방지)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // 공개용 anon key

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[sitemap] Supabase 환경 변수가 없어 기본 페이지만 반환합니다.');
    return routes;
  }

  // 3. 서버 전용 클라이언트: 세션 저장·자동 토큰 갱신 끄기 (백그라운드 타이머 방지)
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // 4. 최신 게시글 1,000개 (5초 안에 응답이 없으면 요청 취소)
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(1000)
      .abortSignal(AbortSignal.timeout(5000));

    if (error) throw error;

    // 5. 게시글별 주소 매핑
    const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
      url: `${baseUrl}/post/${post.id}`,
      lastModified: new Date(post.created_at),
      changeFrequency: 'daily',
      priority: 0.6,
    }));

    return [...routes, ...postRoutes];
  } catch (err) {
    // DB 오류가 나도 sitemap 자체는 깨지지 않도록 기본 페이지는 반환
    console.error('[sitemap] 게시글 조회 실패:', err);
    return routes;
  }
}
