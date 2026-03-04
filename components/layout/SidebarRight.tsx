import Link from "next/link";
import { createClient } from "@/lib/supabase";

// ★ 캐시 방지: 누군가 새 글이나 댓글을 쓰면 즉시 사이드바에 반영되도록 합니다.
export const dynamic = "force-dynamic";

export default async function SidebarRight() {
  const supabase = createClient();

  // 1. 최신글 5개 가져오기 (숨김 처리된 글 제외)
  const { data: recentPosts } = await supabase
    .from("posts")
    .select("id, title, created_at")
    .neq("is_hidden", true)
    .order("created_at", { ascending: false })
    .limit(5);

  // 2. 최신 댓글 5개 가져오기 (첨부해주신 스크린샷의 content 컬럼 적용)
  const { data: recentComments } = await supabase
    .from("comments")
    .select("id, content, post_id, created_at")
    .neq("is_hidden", true) // 숨김 처리된 댓글 제외
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <aside className="space-y-6">
      
      {/* 1️⃣ 최신글 리스트 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          최신글
        </h3>
        <ul className="space-y-3">
          {recentPosts && recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <li key={post.id} className="border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <Link href={`/post/${post.id}`} className="block group">
                  <p className="text-sm text-gray-700 group-hover:text-blue-600 line-clamp-1 transition mb-1">
                    {post.title}
                  </p>
                  <span suppressHydrationWarning className="text-[10px] text-gray-400 block">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))
          ) : (
            <li className="text-xs text-gray-500 text-center py-4">새로운 글이 없습니다.</li>
          )}
        </ul>
      </div>

      {/* 2️⃣ 최신 댓글 리스트 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          최신 댓글
        </h3>
        <ul className="space-y-3">
          {recentComments && recentComments.length > 0 ? (
            recentComments.map((comment) => (
              <li key={comment.id} className="border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                {/* 댓글을 누르면 해당 게시글로 바로 이동합니다 */}
                <Link href={`/post/${comment.post_id}`} className="block group">
                  <p className="text-sm text-gray-700 group-hover:text-green-600 line-clamp-2 transition mb-1 leading-snug">
                    {comment.content}
                  </p>
                  <span suppressHydrationWarning className="text-[10px] text-gray-400 block">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))
          ) : (
            <li className="text-xs text-gray-500 text-center py-4">새로운 댓글이 없습니다.</li>
          )}
        </ul>
      </div>

    </aside>
  );
}
