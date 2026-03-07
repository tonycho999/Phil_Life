import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { Eye, Search, Info } from "lucide-react";

export const runtime = 'edge';
export const dynamic = "force-dynamic";

// 레벨 뱃지 함수 (기존과 동일한 디자인 유지)
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

export default async function SearchPage({ searchParams }: any) {
  const supabase = createClient();
  const q = searchParams?.q || "";
  // ★ 추가됨: URL 파라미터에서 author_id를 가져옵니다.
  const authorId = searchParams?.author || "";

  // 카테고리 구분 없이 제목에 검색어가 포함된 모든 게시글을 최신순으로 가져옵니다.
  let query = supabase
    .from("posts")
    .select("*, profiles(nickname, level)")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });

  // ★ 수정됨: 검색어(q)가 있으면 제목 검색, 작성자ID(author)가 있으면 해당 유저 필터링
  if (q) {
    query = query.ilike("title", `%${q}%`);
  }
  
  if (authorId) {
    query = query.eq("author_id", authorId);
  }

  const { data: searchResults, error } = await query;

  // ★ 추가됨: 닉네임 표시를 위해 결과 데이터에서 첫 번째 닉네임 참조 (작성자 글 보기 모드일 때 사용)
  const authorNickname = searchResults && searchResults.length > 0 ? searchResults[0].profiles?.nickname : "";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 검색 결과 헤더 */}
      <div className="bg-blue-50/50 border-b border-gray-100 px-6 py-5">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Search className="text-blue-600" size={24} />
          {/* ★ 수정됨: 작성자 검색 시 문구 변경 */}
          {authorId 
            ? `${authorNickname ? `'${authorNickname}'` : '작성자'} 님의 게시글` 
            : (q ? `'${q}' 검색 결과` : "전체 검색 결과")
          }
          <span className="text-sm font-normal text-gray-500 ml-2">
            (총 {searchResults?.length || 0}건)
          </span>
        </h2>
      </div>

      {/* 통합 게시판 리스트 영역 */}
      <div className="divide-y divide-gray-100">
        {!searchResults || searchResults.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-gray-500">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Info size={24} className="text-gray-300" />
            </div>
            <p>검색된 게시글이 없습니다.</p>
            <p className="text-sm text-gray-400 mt-1">다른 검색어를 입력해 보세요.</p>
          </div>
        ) : (
          searchResults.map((post: any) => {
            const userLevel = post.profiles?.level ?? 1;
            const badge = getLevelBadgeInfo(userLevel);

            return (
              <Link key={post.id} href={`/post/${post.id}`} className="block px-6 py-4 hover:bg-gray-50 transition group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-[15px] text-gray-800 group-hover:text-blue-600 font-medium truncate">
                        {post.title}
                      </p>
                      {new Date().getTime() - new Date(post.created_at).getTime() < 86400000 && (
                        <span className="text-[10px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 shrink-0">N</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${badge.style}`}>
                        {badge.label}
                      </span>
                      <span className="text-gray-600">{post.profiles?.nickname || '익명'}</span>
                      <span className="w-0.5 h-2 bg-gray-200"></span>
                      <span suppressHydrationWarning>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center shrink-0 mt-2 md:mt-0 gap-3 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5 bg-gray-50/80 px-2 py-1 rounded-md border border-gray-100">
                      <Eye size={12} className="text-gray-400" /> 
                      <span className="font-medium">{post.view_count || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
