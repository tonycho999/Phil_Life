import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { ChevronRight, Eye, Zap, MessageCircle, Info, HelpCircle } from "lucide-react";

export const runtime = 'edge';
export const dynamic = "force-dynamic";

// ★ 추가됨: 메인 화면용 0~10레벨, S등급(99), M(10레벨) 색상 함수
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

// 홈 화면용 게시판 위젯 (디자인 개선)
function HomeBoardWidget({ title, subtitle, posts, link, color = "blue", icon: Icon }: any) {
  const colorStyles: any = {
    blue: "border-t-blue-600 text-blue-600 bg-blue-50",
    red: "border-t-red-600 text-red-600 bg-red-50",
    green: "border-t-green-600 text-green-600 bg-green-50",
    orange: "border-t-orange-500 text-orange-600 bg-orange-50"
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full border-t-4 ${colorStyles[color]?.split(" ")[0] || "border-t-gray-500"}`}>
      {/* 헤더 영역 */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${colorStyles[color]?.split(" ").slice(1).join(" ")}`}>
                <Icon size={18} />
            </div>
            <div>
                <h3 className="font-bold text-gray-800 text-base">{title}</h3>
                <p className="text-[11px] text-gray-400 font-medium">{subtitle}</p>
            </div>
        </div>
        <Link href={link} className="text-xs font-bold text-gray-400 hover:text-blue-600 flex items-center gap-0.5 py-1 px-2 hover:bg-gray-50 rounded transition">
            더보기 <ChevronRight size={12} />
        </Link>
      </div>

      {/* 리스트 영역 */}
      <div className="divide-y divide-gray-50 flex-1">
        {!posts || posts.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400 bg-gray-50/30 h-full flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Info size={14} className="text-gray-300"/>
              </div>
              게시글이 없습니다.
          </div>
        ) : (
          posts.map((post: any) => {
            // ★ 작성자 레벨 뱃지 가져오기
            const userLevel = post.profiles?.level ?? 1;
            const badge = getLevelBadgeInfo(userLevel);

            return (
              <Link key={post.id} href={`/post/${post.id}`} className="block px-5 py-3 hover:bg-blue-50/30 transition group">
                <div className="flex justify-between items-start mb-1.5 gap-3">
                  <p className="text-sm text-gray-700 group-hover:text-blue-700 font-medium line-clamp-1 flex-1">
                      {post.title}
                  </p>
                  {/* 24시간 내 새글 N 표시 */}
                  {new Date().getTime() - new Date(post.created_at).getTime() < 86400000 && (
                      <span className="text-[10px] font-black text-red-500 bg-red-50 px-1.5 rounded border border-red-100 shrink-0 animate-pulse">N</span>
                  )}
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 items-center">
                  <div className="flex items-center gap-2">
                      {/* ★ 메인 화면에도 예쁜 레벨 뱃지 적용 */}
                      <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${badge.style}`}>
                        {badge.label}
                      </span>
                      <span className="text-gray-500">{post.profiles?.nickname || '익명'}</span>
                      <span className="w-0.5 h-2 bg-gray-200"></span>
                      <span suppressHydrationWarning>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded text-gray-500">
                      {/* ★ view_count 로 정확하게 수정 */}
                      <Eye size={10} /> {post.view_count || 0}
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

export default async function Home() {
  const supabase = createClient();

  // ★ DB에서 level 값도 같이 가져오도록 수정
  const [news, community, info, qna] = await Promise.all([
    supabase.from("posts").select("*, profiles(nickname, level)").eq("category_main", "news").eq("is_hidden", false).order("created_at", { ascending: false }).limit(5),
    supabase.from("posts").select("*, profiles(nickname, level)").eq("category_main", "community").eq("is_hidden", false).order("created_at", { ascending: false }).limit(5),
    supabase.from("posts").select("*, profiles(nickname, level)").eq("category_main", "info").eq("is_hidden", false).order("created_at", { ascending: false }).limit(5),
    supabase.from("posts").select("*, profiles(nickname, level)").eq("category_sub", "qna").eq("is_hidden", false).order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <div className="space-y-6">
      {/* 메인 타이틀 */}
      <div className="flex items-center gap-2 px-1">
          <h2 className="text-lg font-bold text-gray-800">🔥 실시간 인기 게시글</h2>
      </div>

      {/* 게시판 위젯 그리드 (2열 배치) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
         <HomeBoardWidget 
             title="뉴스/이슈" 
             subtitle="필리핀 주요 소식"
             posts={news.data} 
             link="/news" 
             color="red" 
             icon={Zap}
         />
         <HomeBoardWidget 
             title="커뮤니티" 
             subtitle="자유로운 소통 공간"
             posts={community.data} 
             link="/community" 
             color="blue" 
             icon={MessageCircle}
         />
         <HomeBoardWidget 
             title="정보/팁" 
             subtitle="생활에 도움이 되는 정보"
             posts={info.data} 
             link="/info" 
             color="green" 
             icon={Info}
         />
         <HomeBoardWidget 
             title="질문과답변" 
             subtitle="궁금한 점 물어보세요"
             posts={qna.data} 
             link="/community/qna" 
             color="orange" 
             icon={HelpCircle}
         />
      </div>
    </div>
  );
}
