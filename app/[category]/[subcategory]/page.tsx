// app/[category]/[subcategory]/page.tsx
import { createClient } from "@/lib/supabase";
import SidebarLeft from "@/components/layout/SidebarLeft";
import SidebarRight from "@/components/layout/SidebarRight";
import Link from "next/link";
import { PenSquare } from "lucide-react";

// 동적 라우팅 파라미터 타입 정의
interface PageProps {
  params: { category: string; subcategory: string };
  searchParams: { q?: string };
}

export default async function BoardPage({ params, searchParams }: PageProps) {
  const supabase = createClient();

  // 1. DB에서 글 가져오기 (필터링)
  let query = supabase
    .from("posts")
    .select("*")
    .eq("category_main", params.category) // 대분류 일치
    .eq("category_sub", params.subcategory) // 소분류 일치
    .order("created_at", { ascending: false });

  // 검색어가 있으면 검색
  if (searchParams.q) {
    query = query.ilike("title", `%${searchParams.q}%`);
  }

  const { data: posts } = await query;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* 좌측 사이드바 (2칸) */}
      <div className="hidden md:block md:col-span-2">
        <SidebarLeft />
      </div>

      {/* 중앙 메인 피드 (7칸) */}
      <main className="md:col-span-7 space-y-4">
        {/* 헤더 & 글쓰기 버튼 */}
        <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-700 capitalize">
            {params.subcategory} 게시판
          </h2>
          <Link 
            href="/post/write" 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded flex items-center gap-2 transition"
          >
            <PenSquare size={16} /> 글쓰기
          </Link>
        </div>

        {/* 게시글 리스트 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
          {!posts || posts.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              아직 등록된 글이 없습니다. 첫 글을 작성해보세요!
            </div>
          ) : (
            posts.map((post: any) => (
              <Link 
                key={post.id} 
                href={`/post/${post.id}`} 
                className="block p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-bold">
                    {post.category_sub}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-md mb-1">
                  {post.title}
                </h3>
                <div className="text-xs text-gray-400 flex gap-3">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span>조회 {post.view_count}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      {/* 우측 사이드바 (3칸) */}
      <div className="hidden md:block md:col-span-3">
        <SidebarRight />
      </div>
    </div>
  );
}
