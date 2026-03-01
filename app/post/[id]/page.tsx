import { createClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import CommentSection from "@/components/post/CommentSection";
import { Edit, Eye, Trash2, ShieldAlert } from "lucide-react"; // 아이콘 import 확인

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  // ★ 수정된 부분: 조회수 증가가 실패해도 페이지는 뜨도록 안전장치 추가
  try {
    await supabase.rpc('increment_views', { row_id: params.id });
  } catch (e) {
    console.error("조회수 증가 실패 (함수 없음 등):", e);
  }

  // 게시글 정보 가져오기
  const { data: post, error } = await supabase
    .from("posts")
    .select("*, profiles(nickname, grade, level)") // profiles에 grade, level이 있어야 함
    .eq("id", params.id)
    .single();

  if (error || !post) {
    console.error("게시글 로딩 에러:", error);
    return notFound();
  }

  // 현재 로그인한 유저 확인
  const { data: { user } } = await supabase.auth.getUser();
  
  // 관리자 여부 체크
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("grade, level")
      .eq("id", user.id)
      .single();
    
    isAdmin = profile?.grade === "관리자" || (profile?.level || 0) >= 10;
  }

  // 작성자 본인 확인
  const isAuthor = user?.id === post.author_id;

  // 본문 렌더링
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
        <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {post.category_sub}
            </span>
            {post.is_pinned && (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                    {post.pinned_reason || "공지"}
                </span>
            )}
        </div>

        <div className="flex justify-between items-start gap-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight flex-1">
                {post.title}
            </h1>
            
            {/* 수정 버튼 (작성자만) */}
            {isAuthor && (
                <Link 
                    href={`/post/edit/${post.id}`} 
                    className="shrink-0 flex items-center gap-1 text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded hover:bg-blue-50 hover:text-blue-600 transition"
                >
                    <Edit size={14} /> 수정
                </Link>
            )}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
            <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800">{post.profiles?.nickname || "알 수 없음"}</span>
                <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</span>
            </div>
            <span className="flex items-center gap-1 text-xs">
                <Eye size={14} /> {post.views}
            </span>
        </div>
      </div>

      {/* 본문 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[300px] mb-8">
        {renderContent()}
      </div>

      {/* 관리자 컨트롤 패널 */}
      {isAdmin && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
          <span className="text-xs font-bold text-gray-500 flex items-center gap-2">
            <ShieldAlert size={14} /> 관리자 메뉴
          </span>
          <div className="flex gap-2">
            {/* 숨김 처리 */}
            <form action={async () => {
                "use server";
                const sb = createClient();
                await sb.from("posts").update({ is_hidden: !post.is_hidden }).eq("id", post.id);
            }}>
                <button className={`px-3 py-1.5 border rounded text-xs font-bold transition ${post.is_hidden ? 'bg-gray-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                    {post.is_hidden ? "숨김 해제" : "숨김 처리"}
                </button>
            </form>

            {/* 영구 삭제 */}
            <form action={async () => {
                "use server";
                const sb = createClient();
                await sb.from("posts").delete().eq("id", post.id);
            }}>
                <button className="px-3 py-1.5 bg-red-100 text-red-600 border border-red-200 rounded text-xs font-bold hover:bg-red-600 hover:text-white transition flex items-center gap-1">
                    <Trash2 size={12} /> 영구 삭제
                </button>
            </form>
          </div>
        </div>
      )}

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
