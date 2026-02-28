import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { MENUS } from "@/lib/constants";

type PageProps = {
  params: { category: string; subcategory: string };
  searchParams: { page?: string; q?: string };
};

export default async function BoardPage({ params, searchParams }: PageProps) {
  const supabase = createClient();
  const page = Number(searchParams.page) || 1;
  const pageSize = 15;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // ★ [수정됨] (m: any) 와 (s: any)를 붙여서 에러를 막았습니다.
  const currentMenu = MENUS.find((m: any) => m.id === params.category);
  const currentSub = currentMenu?.sub.find((s: any) => s.id === params.subcategory);

  // 쿼리 작성: 상단 고정(is_pinned) 우선, 그다음 최신순
  let query = supabase
    .from("posts")
    .select("*, profiles(nickname)", { count: "exact" })
    .eq("category_main", params.category)
    .eq("category_sub", params.subcategory)
    .eq("is_hidden", false) // 숨김 처리된 글 제외
    .order("is_pinned", { ascending: false }) 
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchParams.q) {
    query = query.like("title", `%${searchParams.q}%`);
  }

  const { data: posts, count } = await query;
  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{currentSub?.label || "게시판"}</h2>
          <p className="text-sm text-gray-500 mt-1">{currentMenu?.label} &gt; {currentSub?.label}</p>
        </div>
        <Link href="/post/write" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-sm shadow-md">
          ✏️ 글쓰기
        </Link>
      </div>

      {/* 게시글 리스트 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100 min-h-[500px]">
        {!posts || posts.length === 0 ? (
          <div className="p-10 text-center text-gray-500">아직 등록된 글이 없습니다.</div>
        ) : (
          posts.map((post: any) => (
            <Link 
                key={post.id} 
                href={`/post/${post.id}`} 
                className={`block p-4 hover:bg-gray-50 transition group ${post.is_pinned ? 'bg-blue-50/40' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {/* 상단 고정 뱃지 */}
                {post.is_pinned && (
                    <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded font-bold border border-red-200 shadow-sm">
                      {post.pinned_reason || "공지"}
                    </span>
                )}
                <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-bold">
                  {currentSub?.label}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className={`text-md mb-1.5 line-clamp-1 group-hover:text-blue-600 transition ${post.is_pinned ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                {post.title}
              </h3>
              
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>작성자: {post.profiles?.nickname || "익명"}</span>
                <div className="flex gap-2">
                    <span>조회 {post.views || 0}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center mt-8 gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={`/${params.category}/${params.subcategory}?page=${p}`}
            className={`px-3 py-1 rounded border text-sm ${
              p === page ? "bg-blue-600 text-white border-blue-600 font-bold" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {p}
          </Link>
        ))}
      </div>
    </div>
  );
}
