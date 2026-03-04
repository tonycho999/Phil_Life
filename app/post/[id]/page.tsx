import { createClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import CommentSection from "@/components/post/CommentSection";
import PostControls from "@/components/post/PostControls";
import { Eye } from "lucide-react";
// ★ 방금 만든 투명 부품 불러오기
import ViewUpdater from "@/components/post/ViewUpdater"; 

export const runtime = 'edge';
export const dynamic = "force-dynamic";

function getLevelBadgeStyle(level: number) {
  if (!level || level <= 5) return "bg-gray-100 text-gray-600 border-gray-200"; 
  if (level <= 10) return "bg-green-100 text-green-700 border-green-200";       
  if (level <= 15) return "bg-blue-100 text-blue-700 border-blue-200";          
  if (level <= 20) return "bg-purple-100 text-purple-700 border-purple-200";    
  return "bg-red-100 text-red-700 border-red-200";                              
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  // 1. 게시글 정보 가져오기 
  // (조회수 올리는 작업은 이제 ViewUpdater가 대신 해줍니다!)
  const { data: post, error } = await supabase
    .from("posts")
    .select("*, profiles(nickname, grade, level)")
    .eq("id", params.id)
    .single();

  if (error || !post) {
    return notFound();
  }

  // 2. 본문 렌더링 로직
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

  const userLevel = post.profiles?.level || 1; // 작성자 레벨

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* ★ 핵심: 백그라운드에서 조회수 +1을 실행하는 투명 부품 작동! */}
      <ViewUpdater postId={params.id} />

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
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${getLevelBadgeStyle(userLevel)}`}>
                    Lv.{userLevel}
                  </span>
                  <span className="font-bold text-gray-800">{post.profiles?.nickname || "알 수 없음"}</span>
                </div>
                <span suppressHydrationWarning className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</span>
            </div>
            <span className="flex items-center gap-1 text-xs">
                {/* 화면에 표시할 때는 DB값에 +1을 해서 당장 올라간 것처럼 보여줍니다 */}
                <Eye size={14} /> {(post.view_count || 0) + 1}
            </span>
        </div>
      </div>

      {/* 본문 내용 */}
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
