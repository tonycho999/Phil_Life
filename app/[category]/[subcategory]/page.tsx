import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { MENUS } from "@/lib/constants";
import WriteButton from "@/components/ui/WriteButton";
import PostList from "@/components/board/PostList"; // ★ 만든 컴포넌트 import

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

  // 2. 글 조회
  let query = supabase
    .from("posts")
    .select("*, profiles(nickname)", { count: "exact" }) // comment_count가 있으면 자동으로 가져옴
    .eq("category_main", params.category)
    .eq("category_sub", params.subcategory) // 소분류 일치
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
      {/* 헤더 영역 */}
      <div className="flex justify-between items-end bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{currentSub?.label || "게시판"}</h2>
          <p className="text-xs text-gray-500 mt-1">{currentMenu?.label} &gt; {currentSub?.label}</p>
        </div>
        
        {/* 글쓰기 버튼 */}
        <WriteButton 
          requiredLevel={requiredLevel} 
          href={`/post/write?main=${params.category}&sub=${params.subcategory}`}
        />
      </div>

      {/* ★ 게시글 리스트 (이제 이 한 줄이 디자인을 책임집니다) */}
      <PostList 
        posts={posts || []} 
        showSubCategory={false} // 소분류 화면이니까 제목 옆 [카테고리] 숨김
        totalCount={count || 0}
        currentPage={page}
        pageSize={pageSize}
      />

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
