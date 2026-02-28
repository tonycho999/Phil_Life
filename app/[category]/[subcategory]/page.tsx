import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { MENUS } from "@/lib/constants";
import WriteButton from "@/components/ui/WriteButton";

export const dynamic = "force-dynamic";

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

  const currentMenu = MENUS.find((m: any) => m.id === params.category);
  const currentSub = currentMenu?.sub.find((s: any) => s.id === params.subcategory);

  // 1. 권한 확인 (DB)
  const { data: boardConfig } = await supabase
    .from("boards")
    .select("write_level")
    .eq("category_main", params.category)
    .eq("category_sub", params.subcategory)
    .single();

  const requiredLevel = boardConfig?.write_level ?? 1;

  // 2. 글 조회 (조건: 대분류 + 소분류 일치)
  let query = supabase
    .from("posts")
    .select("*, profiles(nickname)", { count: "exact" })
    .eq("category_main", params.category)
    .eq("category_sub", params.subcategory) // ★ 소분류 일치 필수
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
      {/* 헤더 영역: 글쓰기 버튼 있음 */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{currentSub?.label || "게시판"}</h2>
          <p className="text-xs text-gray-500 mt-1">{currentMenu?.label} &gt; {currentSub?.label}</p>
        </div>
        
        {/* ★ 글쓰기 버튼 (권한 체크) */}
        <WriteButton 
          requiredLevel={requiredLevel} 
          href={`/post/write?main=${params.category}&sub=${params.subcategory}`}
        />
      </div>

      {/* 게시글 리스트 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100 min-h-[500px]">
        {!posts || posts.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            {searchParams.q ? `'${searchParams.q}' 검색 결과가 없습니다.` : "등록된 글이 없습니다."}
          </div>
        ) : (
          posts.map((post: any) => (
            <Link 
              key={post.id} 
              href={`/post/${post.id}`} 
              className={`block p-4 hover:bg-gray-50 transition group ${post.is_pinned ? 'bg-blue-50/40' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {post.is_pinned && (
                  <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded font-bold border border-red-200 shadow-sm">
                    {post.pinned_reason || "공지"}
                  </span>
                )}
                {/* 소분류 뱃지 */}
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
                <div className="flex gap-2">
                  <span>{post.profiles?.nickname || "익명"}</span>
                  <span>조회 {post.views || 0}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center mt-6 gap-2 pb-8">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={`/${params.category}/${params.subcategory}?page=${p}${searchParams.q ? `&q=${searchParams.q}` : ''}`}
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
