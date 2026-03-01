import { createClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import CommentSection from "@/components/post/CommentSection";
import PostControls from "@/components/post/PostControls"; // ★ 통합 관리 컴포넌트
import { Eye } from "lucide-react";

// ★ 실시간 데이터 반영 (조회수/댓글수 등)
export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  // 1. 조회수 증가 (에러 발생 시 무시하고 페이지 로딩 계속)
  try {
    await supabase.rpc('increment_views', { row_id: params.id });
  } catch (e) {
    // console.error("조회수 증가 실패:", e); // 개발 중에만 확인
  }

  // 2. 게시글 정보 가져오기
  const { data: post, error } = await supabase
    .from("posts")
    .select("*, profiles(nickname, grade, level)")
    .eq("id", params.id)
    .single();

  if (error || !post) {
    return notFound();
  }

  // 3. 본문 렌더링 로직
  const renderContent = () => {
    if (post.format === 'html') {
      return (
        <div 
            className="prose max-w-none prose-img:rounded-lg prose-a:text-blue-600"
            dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      );
    }
    return <p className="whitespace-pre-wrap leading-relaxed text-gray-800">{post.content}</p>;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 영역 */}
      <div className="mb-6 border-b pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {post.category_sub}
            </span>
            {post.is_hidden && (
               <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">비공개(숨김)</span>
            )}
            {post.is_pinned && (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                    {post.pinned_reason || "공지"}
                </span>
            )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight flex-1">
                {post.title}
            </h1>
            
            {/* ★ 핵심: 작성자/관리자 권한 확인 및 버튼 표시를 전담하는 컴포넌트 */}
            <PostControls 
              postId={post.id}
              authorId={post.author_id}
              categoryMain={post.category_main}
              categorySub={post.category_sub}
              isHidden={post.is_hidden}
              isPinned={post.is_pinned}
            />
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mt-3">
            <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800">{post.profiles?.nickname || "알 수 없음"}</span>
                <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</span>
            </div>
            <span className="flex items-center gap-1 text-xs">
                <Eye size={14} /> {post.views}
            </span>
        </div>
      </div>

      {/* 본문 내용 (숨김 글일 경우 흐릿하게 표시) */}
      <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[300px] mb-8 ${post.is_hidden ? 'opacity-50 grayscale' : ''}`}>
        {renderContent()}
      </div>

      {/* 댓글 섹션 */}
      <CommentSection postId={params.id} />

      {/* 목록 버튼 */}
      <div className="mt-10 text-center border-t pt-8">
        <Link 
            href={`/${post.category_main}/${post.category_sub}`}
            className="px-8 py-2.5 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition inline-block text-sm shadow-sm"
        >
            목록으로
        </Link>
      </div>
    </div>
  );
}
