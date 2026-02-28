import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MENUS } from "@/lib/constants";

export default async function MyPostsPage() {
  const supabase = createClient();

  // 1. 로그인 체크
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/"); // 비로그인 시 메인으로 튕기기
  }

  // 2. 내가 쓴 글 조회 (최신순 50개)
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // 카테고리 이름 찾는 헬퍼 함수
  const getCategoryLabel = (mainId: string, subId: string) => {
    const main = MENUS.find((m: any) => m.id === mainId);
    const sub = main?.sub.find((s: any) => s.id === subId);
    return sub?.label || "게시판";
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">내 글 보기</h2>
        <p className="text-xs text-gray-500 mt-1">내가 작성한 게시글 목록입니다. (최근 50개)</p>
      </div>

      {/* 리스트 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100 min-h-[500px]">
        {!posts || posts.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            작성한 글이 없습니다.
          </div>
        ) : (
          posts.map((post: any) => (
            <Link 
              key={post.id} 
              href={`/post/${post.id}`} 
              className="block p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded font-bold border border-blue-100">
                  {getCategoryLabel(post.category_main, post.category_sub)}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-md font-medium text-gray-800 mb-1.5 line-clamp-1">
                {post.title}
              </h3>
              
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>조회 {post.views || 0}</span>
                {post.is_hidden && <span className="text-red-500 font-bold">숨김 처리됨</span>}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
