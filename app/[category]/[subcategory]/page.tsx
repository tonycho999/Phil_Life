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

  // 1. 현재 메뉴 정보 가져오기
  const currentMenu = MENUS.find((m: any) => m.id === params.category);
  const currentSub = currentMenu?.sub.find((s: any) => s.id === params.subcategory);

  // 2. 유저 정보 및 레벨 가져오기
  const { data: { user } } = await supabase.auth.getUser();
  let userLevel = 0; // 비로그인 시 0 레벨

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("level")
      .eq("id", user.id)
      .single();
    userLevel = profile?.level || 1; // 프로필 없으면 기본 1
  }

  // 3. 게시판 설정(권한) 가져오기
  const { data: boardConfig } = await supabase
    .from("boards")
    .select("write_level")
    .eq("category_main", params.category)
    .eq("category_sub", params.subcategory)
    .single();

  const writeLevel = boardConfig?.write_level || 1; // 설정 없으면 기본 1 (회원만)

  // ★ 핵심 조건: 로그인 했고(user) && 내 레벨이 게시판 제한보다 높아야 함(userLevel >= writeLevel)
  const showWriteButton = user && (userLevel >= writeLevel);

  // 4. 게시글 목록 쿼리
  let query = supabase
    .from("posts")
    .select("id, title, created_at, views, is_pinned, pinned_reason, profiles(nickname)", { count: "exact" })
    .eq("category_main", params.category)
    .eq("category_sub", params.subcategory)
    .eq("is_hidden", false)
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
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{currentSub?.label || "게시판"}</h2>
            <p className="text-xs text-gray-500 mt-1">{currentMenu?.label} &gt; {currentSub?.label}</p>
          </div>
          
          {/* ★ 조건부 렌더링: 로그인 & 레벨 체크 통과 시에만 버튼 표시 */}
          {showWriteButton && (
            <Link 
              href={`/post/write?main=${params.category}&sub=${params.subcategory}`} 
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition text-sm shadow-sm"
            >
              ✏️ 글쓰기
            </Link>
          )}
        </div>

        {/* 게시글 리스트 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100 min-h-[500px]">
          {!posts || posts.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
                {searchParams.q ? `'${searchParams.q}' 검색 결과가 없습니다.` : "아직 등록된 글이 없습니다."}
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
                  {/* 모바일용 카테고리 태그 */}
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
