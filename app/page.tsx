import { createClient } from "@/lib/supabase";
import SidebarLeft from "@/components/layout/SidebarLeft";
import SidebarRight from "@/components/layout/SidebarRight";
import NicknameSetup from "@/components/auth/NicknameSetup"; // ★ 방금 만든 컴포넌트 임포트
import Link from "next/link";
import { ChevronRight, Eye } from "lucide-react";

// 홈 화면용 미니 게시판 위젯
function HomeBoardWidget({ title, posts, link, color = "blue" }: any) {
  const colorClasses: any = {
    blue: "border-t-blue-600",
    green: "border-t-green-600", 
    orange: "border-t-orange-500",
    red: "border-t-red-500"
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full border-t-4 ${colorClasses[color] || "border-t-gray-500"}`}>
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            {title}
        </h3>
        <Link href={link} className="text-xs font-bold text-gray-400 hover:text-blue-600 flex items-center">
            더보기 <ChevronRight size={12} />
        </Link>
      </div>
      <div className="divide-y divide-gray-50 flex-1">
        {!posts || posts.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400 bg-gray-50/50 h-full flex items-center justify-center">
              게시글이 준비 중입니다.
          </div>
        ) : (
          posts.map((post: any) => (
            <Link key={post.id} href={`/post/${post.id}`} className="block px-5 py-3 hover:bg-blue-50/50 transition group">
              <div className="flex justify-between items-start mb-1">
                 <p className="text-sm text-gray-700 group-hover:text-blue-600 line-clamp-1 font-medium flex-1 pr-2">
                    {post.title}
                 </p>
                 {new Date().getTime() - new Date(post.created_at).getTime() < 86400000 && (
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0"></span>
                 )}
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 items-center">
                 <div className="flex gap-2">
                    <span>{post.profiles?.nickname || '익명'}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <Eye size={10} /> {post.views || 0}
                 </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default async function Home() {
  const supabase = createClient();

  // 1. 유저 정보 조회 (서버 사이드)
  const { data: { user } } = await supabase.auth.getUser();

  // 2. 로그인 상태라면, 프로필(닉네임) 확인
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .single();

    // ★ 핵심 수정: 닉네임이 없으면 메인 화면을 그리지 않고, 설정 화면만 리턴해버림 (Early Return)
    if (!profile?.nickname) {
      return <NicknameSetup userId={user.id} />;
    }
  }

  // --- 닉네임이 있을 때만 아래 메인 화면이 실행됩니다 ---

  const [news, community, info, qna] = await Promise.all([
    supabase.from("posts").select("*, profiles(nickname)").eq("category_main", "news").eq("is_hidden", false).order("created_at", { ascending: false }).limit(5),
    supabase.from("posts").select("*, profiles(nickname)").eq("category_main", "community").eq("is_hidden", false).order("created_at", { ascending: false }).limit(5),
    supabase.from("posts").select("*, profiles(nickname)").eq("category_main", "info").eq("is_hidden", false).order("created_at", { ascending: false }).limit(5),
    supabase.from("posts").select("*, profiles(nickname)").eq("category_sub", "qna").eq("is_hidden", false).order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* 좌측 사이드바 */}
      <div className="hidden md:block md:col-span-2">
        <SidebarLeft />
      </div>

      {/* 중앙 메인 컨텐츠 */}
      <main className="md:col-span-7 space-y-8">
        
        {/* 상단 웰컴 배너 */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">오늘의 필리핀 소식 🌴</h1>
            <p className="text-blue-100 opacity-90 mb-6 text-sm">교민들을 위한 생생한 정보와 커뮤니티</p>
            <div className="flex gap-3">
                <Link href="/community/free" className="bg-white text-blue-800 px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition shadow-sm">
                    자유게시판
                </Link>
                <Link href="/news/local" className="bg-blue-600/50 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition backdrop-blur-sm border border-blue-400/30">
                    뉴스보기
                </Link>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* 게시판 위젯 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <HomeBoardWidget title="📢 뉴스/이슈" posts={news.data} link="/news" color="red" />
           <HomeBoardWidget title="💬 커뮤니티" posts={community.data} link="/community" color="blue" />
           <HomeBoardWidget title="💡 정보/팁" posts={info.data} link="/info" color="green" />
           <HomeBoardWidget title="❓ 질문과답변" posts={qna.data} link="/community/qna" color="orange" />
        </div>

      </main>

      {/* 우측 사이드바 */}
      <div className="hidden md:block md:col-span-3">
         <SidebarRight />
      </div>
    </div>
  );
}
