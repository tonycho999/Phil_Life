import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { MENUS } from "@/lib/constants";
import WriteButton from "@/components/ui/WriteButton";
import PostList from "@/components/board/PostList";
import Pagination from "@/components/common/Pagination";

export const dynamic = "force-dynamic";
export const runtime = 'edge';

type PageProps = {
  params: { category: string; subcategory: string };
  searchParams: { page?: string; q?: string };
};

export default async function BoardPage({ params, searchParams }: PageProps) {
  // ★ 1. 먼저 MENUS에 있는 게시판인지 확인 (DB 조회 없음)
  const currentMenu = MENUS.find((m: any) => m.id === params.category);
  const currentSub = currentMenu?.sub?.find((s: any) => s.id === params.subcategory);

  // ★ 2. 없는 게시판(.git/config 같은 봇 주소)이면 DB 조회 없이 바로 404
  if (!currentMenu || !currentSub) {
    notFound();
  }

  const supabase = createClient();

  const page = Math.max(1, Number(searchParams.page) || 1);
  const pageSize = 15;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 3. 권한 확인 (DB)
  const { data: boardConfig } = await supabase
    .from("boards")
    .select("write_level")
    .eq("category_main", params.category)
    .eq("category_sub", params.subcategory)
    .single();

  const requiredLevel = boardConfig?.write_level ?? 1;

  // 4. 글 조회
  let query = supabase
    .from("posts")
    .select("*, profiles(nickname, level), comments(count)", { count: "exact" })
    .eq("category_main", params.category)
    .eq("category_sub", params.subcategory)
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

      {/* 게시글 리스트 */}
      <PostList
        posts={posts || []}
        showSubCategory={false}
        totalCount={count || 0}
        currentPage={page}
        pageSize={pageSize}
      />

      {/* 페이지네이션 */}
      <Pagination totalPages={totalPages} currentPage={page} />
    </div>
  );
}
