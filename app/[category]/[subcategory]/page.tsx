import { createClient } from "@/lib/supabase";
import SidebarLeft from "@/components/layout/SidebarLeft";
import SidebarRight from "@/components/layout/SidebarRight";
import Link from "next/link";
import { PenSquare } from "lucide-react";
import { MENUS } from "@/lib/constants"; // ★ 메뉴 데이터 가져오기

interface PageProps {
  params: { category: string; subcategory: string };
  searchParams: { q?: string };
}

export default async function BoardPage({ params, searchParams }: PageProps) {
  const supabase = createClient();

  // 1. 현재 대분류 찾기 (예: info)
  const currentMenu = MENUS.find((m) => m.id === params.category);
  // 2. 현재 소분류 찾기 (예: visa) - 제목 표시용
  const currentSub = currentMenu?.sub.find((s) => s.id === params.subcategory);

  // 3. DB에서 글 가져오기
  let query = supabase
    .from("posts")
    .select("*")
    .eq("category_main", params.category)
    .eq("category_sub", params.subcategory)
    .order("created_at", { ascending: false });

  if (searchParams.q) {
    query = query.ilike("title", `%${searchParams.q}%`);
  }

  const { data: posts } = await query;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* 좌측 사이드바 (PC에서만 보임) */}
      <div className="hidden md:block md:col-span-2">
        <SidebarLeft />
      </div>

      {/* 중앙 메인 피드 */}
      <main className="md:col-span-7 space-y-4">
        
        {/* ★ [모바일 전용] 상단 소분류 탭 (PC에선 숨김 md:hidden) ★ */}
        {currentMenu && (
          <div className="md:hidden bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-4">
            <h3 className="text-xs font-bold text-gray-500 mb-2">{currentMenu.label} 메뉴</h3>
            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
              {currentMenu.sub.map((sub) => {
                const isActive = sub.id === params.subcategory;
                return (
                  <Link
                    key={sub.id}
                    href={`/${currentMenu.id}/${sub.id}`}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 font-bold"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 게시판 헤더 & 글쓰기 버튼 */}
        <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-700">
            {currentSub ? currentSub.label : params.subcategory}
          </h2>
          <Link 
            href="/post/write" 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded flex items-center gap-2 transition"
          >
            <PenSquare size={16} /> <span className="hidden sm:inline">글쓰기</span>
          </Link>
        </div>

        {/* 게시글 리스트 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100 min-h-[300px]">
          {!posts || posts.length === 0 ? (
            <div className="p-10 text-center text-gray-500 flex flex-col items-center justify-center h-full">
              <p className="mb-2">아직 등록된 글이 없습니다.</p>
              <p className="text-xs">첫 번째 글의 주인공이 되어보세요!</p>
            </div>
          ) : (
            posts.map((post: any) => (
              <Link 
                key={post.id} 
                href={`/post/${post.id}`} 
                className="block p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded font-bold border border-blue-100">
                    {currentSub?.label || post.category_sub}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-md mb-1 line-clamp-1">
                  {post.title}
                </h3>
                <div className="text-xs text-gray-400 flex gap-3">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span>조회 {post.view_count || 0}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      {/* 우측 사이드바 (PC에서만 보임) */}
      <div className="hidden md:block md:col-span-3">
        <SidebarRight />
      </div>
    </div>
  );
}
