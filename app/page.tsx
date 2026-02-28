import { createClient } from "@/lib/supabase";
import SidebarLeft from "@/components/layout/SidebarLeft";
import SidebarRight from "@/components/layout/SidebarRight";
import Link from "next/link";
import { PenSquare } from "lucide-react";

export default async function Home() {
  const supabase = createClient();

  // 1. [추가] 로그인 상태 및 레벨 확인
  const { data: { user } } = await supabase.auth.getUser();
  let userLevel = 0;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("level")
      .eq("id", user.id)
      .single();
    userLevel = profile?.level || 1;
  }

  // 2. [추가] 버튼 표시 여부 결정 (로그인 필수 + 레벨 1 이상)
  const showWriteButton = !!user && (userLevel >= 1);

  // 3. 최신글 20개 가져오기 (작성자 닉네임 포함)
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(nickname)") // profiles 테이블 연결
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* 좌측 사이드바 */}
      <div className="hidden md:block md:col-span-2">
        <SidebarLeft />
      </div>

      {/* 중앙 메인 피드 */}
      <main className="md:col-span-7 space-y-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-700">📌 최신 글</h2>
          
          {/* ★ 조건부 렌더링: 로그인한 유저에게만 버튼 표시 */}
          {showWriteButton && (
            <Link 
              href="/post/write" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded flex items-center gap-2 transition"
            >
              <PenSquare size={16} /> 글쓰기
            </Link>
          )}
        </div>

        {/* 게시글 리스트 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
          {!posts || posts.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              아직 등록된 글이 없습니다.
            </div>
          ) : (
            posts.map((post: any) => (
              <Link 
                key={post.id} 
                href={`/post/${post.id}`} 
                className="block p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-bold">
                    {post.category_sub || '전체'}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-md mb-1 line-clamp-1">
                  {post.title}
                </h3>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <div className="flex gap-2">
                    <span>{post.profiles?.nickname || "익명"}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  {/* DB 컬럼명이 views인지 view_count인지 확인 필요 (기본값 views로 설정) */}
                  <span>조회 {post.views || post.view_count || 0}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      {/* 우측 사이드바 */}
      <div className="hidden md:block md:col-span-3">
        <SidebarRight />
      </div>
    </div>
  );
}
