import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

// Supabase 관리자 키(서버 전용)를 사용하여 안전하게 데이터를 가져옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.phcafe24.com'; // ★ 대표님의 실제 도메인

  // 1. 고정된 기본 페이지들 (메인, 뉴스, 정보 등)
  const routes = ['', '/news', '/info', '/community'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Supabase에서 최신 게시글 1,000개 가져오기
  const { data: posts } = await supabase
    .from('posts')
    .select('id, created_at')
    .order('created_at', { ascending: false })
    .limit(1000);

  // 3. 게시글마다 각각의 주소(URL) 매핑하기
  const postRoutes = (posts || []).map((post) => ({
    url: `${baseUrl}/post/${post.id}`, // 게시글 상세 주소
    lastModified: new Date(post.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  // 고정 페이지 + 게시글 페이지를 합쳐서 구글에 제출!
  return [...routes, ...postRoutes];
}
