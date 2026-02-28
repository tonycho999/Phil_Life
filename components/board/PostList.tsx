"use client";

import Link from "next/link";

interface PostListProps {
  posts: any[];
  showSubCategory: boolean; // true면 [자유게시판] 표시, false면 숨김
  totalCount: number;
  currentPage: number;
  pageSize: number;
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
    <div className="w-full bg-white border-t border-gray-800">
      {/* PC 버전 헤더 */}
      <div className="hidden md:grid grid-cols-12 gap-2 py-3 border-b border-gray-200 bg-gray-50 text-center text-sm font-bold text-gray-700">
        <div className="col-span-1">번호</div>
        <div className="col-span-7">제목</div>
        <div className="col-span-2">작성자</div>
        <div className="col-span-1">날짜</div>
        <div className="col-span-1">조회</div>
      </div>

      {/* 리스트 아이템 */}
      {posts.map((post, index) => {
        // 순번 계산: 전체개수 - ((현재페이지-1) * 페이지당개수) - 인덱스
        const seqNum = totalCount - ((currentPage - 1) * pageSize) - index;
        const dateStr = new Date(post.created_at).toLocaleDateString().slice(2); // 23.10.25 형식

        return (
          <div key={post.id} className="group border-b border-gray-100 hover:bg-gray-50 transition">
            <Link href={`/post/${post.id}`} className="grid grid-cols-12 gap-2 py-3 items-center">
              
              {/* 번호 */}
              <div className="hidden md:block col-span-1 text-center text-gray-500 text-sm">
                {post.is_pinned ? <span className="font-bold text-red-500">공지</span> : seqNum}
              </div>

              {/* 제목 영역 */}
              <div className="col-span-12 md:col-span-7 px-4 md:px-0">
                <div className="flex items-center gap-1.5 truncate">
                  {/* 공지 뱃지 (모바일용) */}
                  {post.is_pinned && (
                    <span className="md:hidden bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded mr-1">공지</span>
                  )}

                  {/* [소카테고리] - 대분류 화면에서만 보임 */}
                  {showSubCategory && (
                    <span className="text-gray-500 text-sm mr-1">[{post.category_sub_label || post.category_sub}]</span>
                  )}

                  {/* 제목 */}
                  <span className={`text-sm md:text-base ${post.is_pinned ? 'font-bold text-gray-900' : 'text-gray-800'} group-hover:text-blue-600`}>
                    {post.title}
                  </span>

                  {/* 댓글 수 (제목 옆에 붙음) */}
                  {post.comment_count > 0 && (
                    <span className="text-blue-600 text-xs font-bold font-mono">
                      [{post.comment_count}]
                    </span>
                  )}

                  {/* New 뱃지 (24시간 이내) */}
                  {new Date().getTime() - new Date(post.created_at).getTime() < 86400000 && (
                     <span className="w-1.5 h-1.5 bg-red-500 rounded-full mb-2 ml-0.5"></span>
                  )}
                </div>
                
                {/* 모바일용 정보 줄 */}
                <div className="md:hidden flex gap-2 text-xs text-gray-400 mt-1">
                  <span>{post.profiles?.nickname || "익명"}</span>
                  <span>·</span>
                  <span>{dateStr}</span>
                  <span>·</span>
                  <span>조회 {post.views}</span>
                </div>
              </div>

              {/* 작성자 (PC) */}
              <div className="hidden md:block col-span-2 text-center text-sm text-gray-600 truncate">
                {post.profiles?.nickname || "익명"}
              </div>

              {/* 날짜 (PC) */}
              <div className="hidden md:block col-span-1 text-center text-sm text-gray-400">
                {dateStr}
              </div>

              {/* 조회수 (PC) */}
              <div className="hidden md:block col-span-1 text-center text-sm text-gray-400 font-mono">
                {post.views}
              </div>

            </Link>
          </div>
        );
      })}
    </div>
  );
}
