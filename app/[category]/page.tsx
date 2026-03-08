import { createClient } from "@/lib/supabase";
import { MENUS } from "@/lib/constants";
import Link from "next/link";
import { Suspense } from "react";

// ★ 글 썼을 때 바로 보이게 하는 설정 & Cloudflare Edge 런타임 설정
export const dynamic = "force-dynamic";
export const runtime = 'edge';

type PageProps = {
  params: { category: string };
  searchParams: { page?: string; q?: string };
};

// ★ 수정됨: 최신 0~10레벨, S등급(99), M(10레벨) 색상 함수 적용
function getLevelBadgeInfo(level: any) {
  const strLevel = String(level);
  if (strLevel === "10") return { label: "M", style: "bg-gray-800 text-white border-gray-900" }; 
  if (strLevel === "S" || strLevel === "99") return { label: "S", style: "bg-yellow-100 text-yellow-700 border-yellow-300" };
  
  if (strLevel === "0") return { label: "Lv.0", style: "bg-gray-100 text-gray-500 border-gray-200" };
  if (strLevel === "1") return { label: "Lv.1", style: "bg-green-100 text-green-700 border-green-200" };
  if (strLevel === "2") return { label: "Lv.2", style: "bg-blue-100 text-blue-700 border-blue-200" };
  if (strLevel === "3") return { label: "Lv.3", style: "bg-purple-100 text-purple-700 border-purple-200" };
  if (strLevel === "4") return { label: "Lv.4", style: "bg-teal-100 text-teal-700 border-teal-200" };
  if (strLevel === "5") return { label: "Lv.5", style: "bg-pink-100 text-pink-700 border-pink-200" };
  
  return { label: `Lv.${strLevel}`, style: "bg-indigo-100 text-indigo-700 border-indigo-200" };
}

// ─────────────────────────────────────────────────────────
// 1. [데이터 패칭 전용 컴포넌트] (게시글 목록을 DB에서 불러옵니다)
// ─────────────────────────────────────────────────────────
async function PostList({ params, searchParams, currentMenu }: { params: PageProps["params"]; searchParams: PageProps["searchParams"]; currentMenu: any }) {
  const supabase = createClient();
  const page = Number(searchParams.page) || 1;
  const pageSize = 15;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // profiles 테이블에서 nickname과 level을 함께 가져옵니다.
  let query = supabase
    .from("posts")
    .select("*, profiles(nickname, level), comments(count)", { count: "exact" }) // ✅ 추가!
    .eq("category_main", params.category)
    .neq("is_hidden", true)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchParams.q) {
    query = query.like("title", `%${searchParams.q}%`);
  }

  const { data: posts, count } = await query;
  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  return (
    <>
      {/* 게시글 리스트 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100 min-h-[500px]">
        {!posts || posts.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            {searchParams.q
              ? `'${searchParams.q}' 검색 결과가 없습니다.`
              : "등록된 게시글이 없습니다."}
          </div>
        ) : (
          posts.map((post: any) => {
            // [소분류] 이름 찾기 로직
            const subMenu = currentMenu?.sub?.find((s: any) => s.id === post.category_sub);
            const subLabel = subMenu ? subMenu.label : post.category_sub;
            
            // ★ 작성자 레벨 뱃지 가져오기
            const userLevel = post.profiles?.level ?? 1;
            const badge = getLevelBadgeInfo(userLevel);

            return (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className={`block p-4 hover:bg-gray-50 transition group ${
                  post.is_pinned ? "bg-blue-50/40" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {post.is_pinned && (
                    <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded font-bold border border-red-200 shadow-sm">
                      {post.pinned_reason || "공지"}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* 제목 앞 [소분류] 표시 */}
                <h3 className={`text-md mb-1.5 line-clamp-1 group-hover:text-blue-600 transition ${
                    post.is_pinned ? "font-bold text-gray-900" : "font-medium text-gray-800"
                  }`}>
                  <span className="text-blue-600 mr-1 font-bold text-sm">
                    [{subLabel}]
                  </span>
                  {post.title}
                </h3>

                <div className="flex justify-between items-center text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    {/* ★ 메인 화면과 동일한 최신 뱃지 적용 */}
                    <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${badge.style}`}>
                      {badge.label}
                    </span>
                    <span className="font-medium text-gray-600">{post.profiles?.nickname || "익명"}</span>
                    <span className="text-gray-300">|</span>
                    <span>조회 {post.view_count || 0}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2 pb-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/${params.category}?page=${p}${
                searchParams.q ? `&q=${searchParams.q}` : ""
              }`}
              className={`px-3 py-1 rounded border text-sm ${
                p === page
                  ? "bg-blue-600 text-white border-blue-600 font-bold"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────
// 2. [메인 페이지 컴포넌트] (화면 레이아웃)
// ─────────────────────────────────────────────────────────
export default function CategoryPage({ params, searchParams }: PageProps) {
  // 현재 대분류 메뉴 정보 찾기 (예: 'news')
  const currentMenu = MENUS.find((m: any) => m.id === params.category);

  return (
    <div className="space-y-4">
      {/* 헤더 영역 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">
          {currentMenu?.label || params.category}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {currentMenu?.label} 전체 게시글 목록
        </p>
      </div>

      {/* 게시글 리스트 영역 (로딩 스피너 포함) */}
      <Suspense fallback={
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">목록을 불러오는 중입니다...</p>
        </div>
      }>
        <PostList params={params} searchParams={searchParams} currentMenu={currentMenu} />
      </Suspense>
    </div>
  );
}
