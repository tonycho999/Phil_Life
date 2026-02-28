import { createClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import CommentSection from "@/components/post/CommentSection"; // ★ 댓글 컴포넌트 추가

export const dynamic = "force-dynamic"; // ★ 실시간 데이터 반영 (조회수/댓글수 등)

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  // 조회수 증가
  await supabase.rpc('increment_views', { row_id: params.id });

  // 게시글 정보 + 작성자 정보
  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles(nickname, grade)")
    .eq("id", params.id)
    .single();

  if (!post) return notFound();

  // 현재 로그인한 유저 확인 (관리자 여부 판단용)
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    // profile 테이블에 grade가 없거나 level 컬럼을 쓴다면 그에 맞게 수정 필요
    // 여기서는 기존 코드를 존중하여 grade 체크 유지
    const { data: adminCheck } = await supabase.from("profiles").select("grade, level").eq("id", user.id).single();
    // grade가 '관리자' 이거나 level이 10 이상이면 관리자로 취급
    isAdmin = adminCheck?.grade === "관리자" || (adminCheck?.level || 0) >= 10;
  }

  // 본문 렌더링 로직 (HTML vs Text)
  const renderContent = () => {
    if (post.format === 'html') {
      return (
        <div 
            className="prose max-w-none prose-img:rounded-lg prose-a:text-blue-600"
            dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      );
    }
    // 일반 텍스트는 줄바꿈 처리
    return <p className="whitespace-pre-wrap leading-relaxed text-gray-800">{post.content}</p>;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
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
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
        <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">{post.profiles?.nickname || "알 수 없음"}</span>
                <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</span>
            </div>
            <span>조회 {post.views}</span>
        </div>
      </div>

      {/* 본문 내용 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[300px]">
        {renderContent()}
      </div>

      {/* 관리자 컨트롤 패널 */}
      {isAdmin && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
          <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
            🛡️ 관리자 기능
          </span>
          <div className="flex gap-2">
            {/* 숨김 처리 버튼 */}
            <form action={async () => {
                "use server";
                const sb = createClient();
                await sb.from("posts").update({ is_hidden: !post.is_hidden }).eq("id", post.id);
            }}>
                <button className={`px-3 py-1.5 border rounded text-xs font-bold transition ${post.is_hidden ? 'bg-gray-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                    {post.is_hidden ? "숨김 해제 (공개)" : "숨김 처리 (비공개)"}
                </button>
            </form>

            {/* 영구 삭제 버튼 */}
            <form action={async () => {
                "use server";
                const sb = createClient();
                await sb.from("posts").delete().eq("id", post.id);
            }}>
                <button className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition shadow-sm">
                    영구 삭제
                </button>
            </form>
          </div>
        </div>
      )}

      {/* ★ 댓글 섹션 추가 */}
      <CommentSection postId={params.id} />

      {/* 목록 버튼 */}
      <div className="mt-8 text-center border-t pt-8">
        <Link 
            href={`/${post.category_main}/${post.category_sub}`}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition inline-block"
        >
            목록으로
        </Link>
      </div>
    </div>
  );
}
