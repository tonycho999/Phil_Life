import { createClient } from "@/lib/supabase";
import { MENUS } from "@/lib/constants";
import Link from "next/link";

// ★ 캐싱 방지: 글이 안 보이는 문제 해결
export const dynamic = "force-dynamic";

type PageProps = {
  params: { category: string };
  searchParams: { page?: string; q?: string };
};

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const supabase = createClient();
  const page = Number(searchParams.page) || 1;
  const pageSize = 15;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 1. 현재 대분류 메뉴 정보 찾기
  const currentMenu = MENUS.find((m: any) => m.id === params.category);

  // 2. 글 목록 조회 (조건: 대분류 일치 + 숨김 아님)
  let query = supabase
    .from("posts")
    .select("*, profiles(nickname)", { count: "exact" })
    .eq("category_main", params.category) // ★ 중요: 서브카테고리 상관없이 다 가져옴
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
    <div className="space-y-4">
      {/* 헤더 영역: 버튼 없음 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">
          {currentMenu?.label || params.category}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {currentMenu?.label} 전체 게시글 목록
        </p>
      </div>

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
            // ★ [소카테고리] 이름 찾기 로직
            const subMenu = currentMenu?.sub.find((s: any) => s.id === post.category_sub);
            const subLabel = subMenu ? subMenu.label : post.category_sub;

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

                {/* ★ 제목 앞 [소카테고리] 표시 */}
                <h3
                  className={`text-md mb-1.5 line-clamp-1 group-hover:text-blue-600 transition ${
                    post.is_pinned
                      ? "font-bold text-gray-900"
                      : "font-medium text-gray-800"
                  }`}
                >
                  <span className="text-blue-600 mr-1 font-bold text-sm">
                    [{subLabel}]
                  </span>
                  {post.title}
                </h3>

                <div className="flex justify-between items-center text-xs text-gray-400">
                  <div className="flex gap-2">
                    <span>{post.profiles?.nickname || "익명"}</span>
                    <span>조회 {post.views || 0}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* 페이지네이션 */}
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
    </div>
  );
}
