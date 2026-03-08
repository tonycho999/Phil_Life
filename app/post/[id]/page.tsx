// ★ 수정됨: 브라우저용 클라이언트 임포트 삭제, 서버용 ssr 및 cookies 임포트 추가
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import CommentSection from "@/components/post/CommentSection";
import PostControls from "@/components/post/PostControls";
import { Eye } from "lucide-react";
import ViewUpdater from "@/components/post/ViewUpdater";
// ★ 추가됨: 방금 만든 팝업 메뉴 컴포넌트 불러오기
import AuthorActionMenu from "@/components/post/AuthorActionMenu";

export const runtime = 'edge';
export const dynamic = "force-dynamic";

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

export default async function PostDetailPage({ params }: { params: any }) {
  // ★ 수정됨: Next.js 최신 버전 에러 방지를 위해 params를 안전하게 풀어줍니다.
  const resolvedParams = await params;
  const postId = resolvedParams.id;

  // ★ 수정됨: 서버 컴포넌트 환경에서 쿠키(로그인 정보)를 읽을 수 있도록 변경
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  // 1. 현재 유저 레벨 확인 (이제 서버가 쿠키를 읽으므로 관리자/회원을 정상 인식합니다)
  const { data: { user } } = await supabase.auth.getUser();
  let myLevel = -1; 
  if (user) {
    const { data: myProfile } = await supabase.from("profiles").select("level").eq("id", user.id).single();
    if (myProfile) myLevel = myProfile.level;
  }

  // 2. 게시글 데이터 가져오기
  const { data: post, error } = await supabase
    .from("posts")
    .select("*, profiles(nickname, grade, level), comments(count)")
    .eq("id", postId)
    .single();

  if (error || !post) {
    return notFound();
  }

  // 3. 게시판 읽기 권한 체크 로직
  const { data: boardInfo } = await supabase
    .from("boards")
    .select("read_level")
    .eq("category_sub", post.category_sub)
    .single();

  const requiredReadLevel = boardInfo?.read_level ?? 1;

  // 권한 미달 시 렌더링 중단 및 뒤로가기 버튼 제공
  if (myLevel < requiredReadLevel) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center">
        <div className="bg-white rounded-xl p-10 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🚫 접근 권한이 없습니다</h2>
          <p className="text-gray-600 mb-8">
            이 게시판의 글은 <strong>Lv.{requiredReadLevel}</strong> 이상만 읽을 수 있습니다.<br/>
            (현재 회원님의 등급: {user ? `Lv.${myLevel}` : '비회원'})
          </p>
          {!user ? (
            <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition inline-block">
              로그인하러 가기
            </Link>
          ) : (
            <Link href={`/${post.category_main}/${post.category_sub}`} className="bg-gray-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-700 transition inline-block">
              목록으로 돌아가기
            </Link>
          )}
        </div>
      </div>
    );
  }

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

  const userLevel = post.profiles?.level ?? 1;
  const badge = getLevelBadgeInfo(userLevel);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      <ViewUpdater postId={postId} />

      {/* ★ 추가됨: 메인 화면 등 외부에서 접속해도 사이드바가 올바른 게시판을 펼치도록 힌트(스크립트) 주입 */}
      <script
        dangerouslySetInnerHTML={{
          __html: `sessionStorage.setItem('lastVisitedMenu', '${post.category_main}');`
        }}
      />

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
                {/* ★ 수정됨: 정적이던 닉네임 영역을 팝업 메뉴 컴포넌트로 교체했습니다. */}
                <AuthorActionMenu 
                  authorId={post.author_id} 
                  nickname={post.profiles?.nickname} 
                  badge={badge} 
                />
                <span suppressHydrationWarning className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleString('ko-KR', {
                    timeZone: 'Asia/Manila', // ★ 핵심: 필리핀 시간(UTC+8)으로 강제 변환
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
            </div>
            <span className="flex items-center gap-1 text-xs">
                <Eye size={14} /> {(post.view_count || 0) + 1}
            </span>
        </div>
      </div>

      <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[300px] mb-8 ${post.is_hidden ? 'opacity-50 grayscale' : ''}`}>
        {renderContent()}
      </div>

      <CommentSection postId={post.id} />

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
