import { createClient } from "@/lib/supabase";
// Sidebar 임포트 제거됨 (layout에서 처리하므로)
import Link from "next/link";
import { ChevronRight, Eye, Zap, MessageCircle, Info, HelpCircle } from "lucide-react";

// (HomeBoardWidget 컴포넌트는 기존 코드 그대로 두시면 됩니다)
function HomeBoardWidget({ title, subtitle, posts, link, color = "blue", icon: Icon }: any) {
  // ... 기존 내용 동일 ...
}

export default async function Home() {
  const supabase = createClient();

  // 각 섹션별 데이터 병렬 조회 (최신순 5개)
  const [news, community, info, qna] = await Promise.all([
    supabase.from("posts").select("*, profiles(nickname)").eq("category_main", "news").eq("is_hidden", false).order("created_at", { ascending: false }).limit(5),
    supabase.from("posts").select("*, profiles(nickname)").eq("category_main", "community").eq("is_hidden", false).order("created_at", { ascending: false }).limit(5),
    supabase.from("posts").select("*, profiles(nickname)").eq("category_main", "info").eq("is_hidden", false).order("created_at", { ascending: false }).limit(5),
    supabase.from("posts").select("*, profiles(nickname)").eq("category_sub", "qna").eq("is_hidden", false).order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <div className="space-y-6">
      {/* 메인 타이틀 */}
      <div className="flex items-center gap-2 px-1">
          <h2 className="text-lg font-bold text-gray-800">🔥 실시간 인기 게시글</h2>
      </div>

      {/* 게시판 위젯 그리드 (2열 배치) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
