"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { MENUS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";

// useSearchParams를 쓰려면 Suspense로 감싸야 하는 Next.js 규칙 때문에 분리합니다.
function WriteForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();

  // 1. URL 파라미터로 초기 카테고리 설정
  // URL에 없으면 첫 번째 메뉴를 기본값으로 사용
  const paramMain = searchParams.get("main");
  const paramSub = searchParams.get("sub");

  const [categoryMain, setCategoryMain] = useState(paramMain || MENUS.id);
  const [categorySub, setCategorySub] = useState(paramSub || MENUS.sub.id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isHtml, setIsHtml] = useState(false);
  const [loading, setLoading] = useState(false);

  // 공지사항 관련 상태
  const [isPinned, setIsPinned] = useState(false);
  const [pinnedReason, setPinnedReason] = useState("");
  const [pinnedUntil, setPinnedUntil] = useState("");

  // 관리자 여부 확인 (레벨 10 이상)
  const isAdmin = (profile?.level || 0) >= 10;

  // 2. 메인 카테고리 변경 시 서브 카테고리 자동 선택
  useEffect(() => {
    // 현재 선택된 메인 카테고리에 속한 서브 메뉴들 찾기
    const targetMenu = MENUS.find((m: any) => m.id === categoryMain);
    
    // 만약 현재 선택된 서브 카테고리가 이 메인 메뉴에 속해있지 않다면, 첫 번째로 변경
    const isSubValid = targetMenu?.sub.some((s: any) => s.id === categorySub);
    
    if (targetMenu && !isSubValid) {
       setCategorySub(targetMenu.sub.id);
    }
  }, [categoryMain, categorySub]);

  // 3. 권한 체크 (boards 테이블 사용 + 숫자 레벨 비교)
  useEffect(() => {
    const checkPermission = async () => {
        if (!categoryMain || !categorySub || authLoading) return;

        // DB에서 해당 게시판의 쓰기 권한 가져오기
        const { data: boardData } = await supabase
            .from('boards')
            .select('write_level')
            .eq('category_main', categoryMain)
            .eq('category_sub', categorySub)
            .single();
        
        // 설정이 없으면 기본 1 (회원)
        const requiredLevel = boardData?.write_level ?? 1;
        const myLevel = profile?.level ?? 0;

        // 관리자는 무조건 통과
        if (myLevel >= 10) return;

        if (myLevel < requiredLevel) {
            alert(`이 게시판은 레벨 ${requiredLevel} 이상만 글을 쓸 수 있습니다.\n(현재 내 레벨: ${myLevel})`);
            // 권한 없으면 메인으로 튕기기 (또는 뒤로가기)
            router.push(`/${categoryMain}/${categorySub}`);
        }
    };
    
    if (user) checkPermission();
  }, [categoryMain, categorySub, user, profile, authLoading, router, supabase]);


  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return alert("제목과 내용을 입력해주세요.");
    if (!user) return alert("로그인이 필요합니다.");

    setLoading(true);

    const postData = {
      title,
      content,
      category_main: categoryMain,
      category_sub: categorySub,
      author_id: user.id,
      format: isHtml ? 'html' : 'text',
      is_pinned: isAdmin ? isPinned : false, // 관리자만 공지 가능
      pinned_reason: (isAdmin && isPinned) ? pinnedReason : null,
      pinned_until: (isAdmin && isPinned && pinnedUntil) ? new Date(pinnedUntil).toISOString() : null,
    };

    const { error } = await supabase.from("posts").insert(postData);

    if (error) {
      alert("작성 실패: " + error.message);
    } else {
      router.push(`/${categoryMain}/${categorySub}`); // 작성한 게시판으로 이동
      router.refresh();
    }
    setLoading(false);
  };

  // 현재 선택된 메인 카테고리의 서브 메뉴 목록
  const currentSubMenus = MENUS.find((m: any) => m.id === categoryMain)?.sub || [];

  if (authLoading) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">✏️ 글쓰기</h1>
      
      <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        
        {/* 카테고리 선택 영역 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-500 font-bold">메인 게시판</label>
             <select 
                value={categoryMain} 
                onChange={(e) => setCategoryMain(e.target.value)}
                className="p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
             >
                {MENUS.map((m: any) => <option key={m.id} value={m.id}>{m.label}</option>)}
             </select>
          </div>
          
          <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-500 font-bold">상세 게시판</label>
             <select 
                value={categorySub} 
                onChange={(e) => setCategorySub(e.target.value)}
                className="p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
             >
                {currentSubMenus.map((s: any) => <option key={s.id} value={s.id}>{s.label}</option>)}
             </select>
          </div>
        </div>

        <input 
          type="text" 
          placeholder="제목을 입력하세요" 
          className="w-full p-3 border border-gray-300 rounded text-lg font-bold focus:outline-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 옵션 영역 (HTML 모드, 공지 설정) */}
        <div className="flex flex-wrap items-center gap-4 text-sm bg-gray-50 p-3 rounded border border-gray-200">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
                type="checkbox" 
                checked={isHtml} 
                onChange={(e) => setIsHtml(e.target.checked)} 
                className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="font-bold text-gray-700">HTML 소스 모드</span>
          </label>

          {/* 관리자 전용 옵션 */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-3 border-l pl-4 ml-auto border-gray-300">
              <label className="flex items-center gap-2 font-bold text-red-600 cursor-pointer select-none">
                <input 
                    type="checkbox" 
                    checked={isPinned} 
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                />
                상단 고정(공지)
              </label>
              
              {isPinned && (
                <>
                  <input 
                    type="text" 
                    placeholder="라벨 (예: 공지)" 
                    className="p-1 px-2 border rounded w-24 text-xs"
                    value={pinnedReason}
                    onChange={(e) => setPinnedReason(e.target.value)}
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">종료일:</span>
                    <input 
                        type="date" 
                        className="p-1 border rounded text-xs"
                        value={pinnedUntil}
                        onChange={(e) => setPinnedUntil(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 에디터 영역 */}
        <textarea 
          className={`w-full p-4 border rounded min-h-[400px] focus:outline-blue-500 resize-y ${
            isHtml ? 'bg-slate-900 text-green-400 font-mono text-sm' : 'bg-white text-gray-800'
          }`}
          placeholder={isHtml ? "<p>HTML 태그를 직접 입력하세요.</p>" : "내용을 입력하세요."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition font-bold text-sm">
            취소
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition shadow-sm text-sm">
            {loading ? "등록 중..." : "등록완료"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Next.js에서 useSearchParams 사용 시 Suspense 필수
export default function WritePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">로딩 중...</div>}>
      <WriteForm />
    </Suspense>
  );
}
