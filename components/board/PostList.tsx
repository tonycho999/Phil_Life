"use client";

import Link from "next/link";

interface PostListProps {
  posts: any[];
  showSubCategory: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

// ★ 수정됨: 최신 0~10레벨, S등급(99), M(10레벨) 색상 함수 적용
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

export default function PostList({ posts, showSubCategory, totalCount, currentPage, pageSize }: PostListProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500 border-t border-b border-gray-200">
        등록된 게시글이 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full bg-white border-t-2 border-gray-800">
      <div className="hidden md:grid grid-cols-12 gap-2 py-3 border-b border-gray-200 bg-gray-50 text-center text-sm font-bold text-gray-700">
        <div className="col-span-1">번호</div>
        <div className="col-span-7">제목</div>
        <div className="col-span-2">작성자</div>
        <div className="col-span-1">날짜</div>
        <div className="col-span-1">조회</div>
      </div>

      {posts.map((post, index) => {
        const seqNum = totalCount - ((currentPage - 1) * pageSize) - index;
        const dateStr = new Date(post.created_at).toLocaleDateString();
        
        // ★ 작성자 레벨 뱃지 가져오기
        const userLevel = post.profiles?.level ?? 1;
        const badge = getLevelBadgeInfo(userLevel);

        return (
          <div key={post.id} className="group border-b border-gray-100 hover:bg-gray-50 transition">
            <Link href={`/post/${post.id}`} className="grid grid-cols-12 gap-2 py-3 items-center">
              
              <div className="hidden md:block col-span-1 text-center text-gray-500 text-sm font-mono">
                {post.is_pinned ? (
                  <span className="font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded text-xs">공지</span>
                ) : (
                  seqNum
                )}
              </div>

              <div className="col-span-12 md:col-span-7 px-4 md:px-0">
                <div className="flex items-center gap-1.5 truncate">
                  {post.is_pinned && (
                    <span className="md:hidden bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded mr-1 font-bold">공지</span>
                  )}
                  {showSubCategory && (
                    <span className="text-gray-500 text-sm font-bold mr-1">
                      [{post.category_sub_label || post.category_sub}]
                    </span>
                  )}
                  <span className={`text-sm md:text-base ${post.is_pinned ? 'font-bold text-gray-900' : 'text-gray-800'} group-hover:text-blue-600 transition`}>
                    {post.title}
                  </span>
                  {(post.comment_count || 0) > 0 && (
                    <span className="text-red-500 text-xs font-bold font-mono ml-1">
                      [{post.comment_count}]
                    </span>
                  )}
                  {new Date().getTime() - new Date(post.created_at).getTime() < 86400000 && (
                     <span className="w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold ml-0.5">N</span>
                  )}
                </div>
                
                <div className="md:hidden flex gap-2 text-xs text-gray-400 mt-1 items-center">
                  {/* 모바일 뱃지 적용 */}
                  <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${badge.style}`}>
                    {badge.label}
                  </span>
                  <span>{post.profiles?.nickname || "익명"}</span>
                  <span>|</span>
                  <span suppressHydrationWarning>{dateStr}</span>
                  <span>|</span>
                  <span>조회 {post.view_count || 0}</span>
                </div>
              </div>

              <div className="hidden md:flex col-span-2 items-center justify-center gap-1 text-sm text-gray-600 truncate px-2">
                {/* PC 뱃지 적용 */}
                <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${badge.style}`}>
                  {badge.label}
                </span>
                <span className="truncate">{post.profiles?.nickname || "익명"}</span>
              </div>

              <div suppressHydrationWarning className="hidden md:block col-span-1 text-center text-sm text-gray-400 whitespace-nowrap">
                {dateStr}
              </div>

              <div className="hidden md:block col-span-1 text-center text-sm text-gray-500 font-mono">
                {post.view_count || 0}
              </div>

            </Link>
          </div>
        );
      })}
    </div>
  );
}
