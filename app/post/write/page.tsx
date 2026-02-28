"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { MENUS, GRADE_LEVELS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";

export default function WritePage() {
  const supabase = createClient();
  const router = useRouter();
  const { user, profile } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // ★ 여기가 수정되었습니다 (배열의 첫 번째 항목 선택)
  const [categoryMain, setCategoryMain] = useState(MENUS.id);
  const [categorySub, setCategorySub] = useState(MENUS.sub.id);
  
  // 기능 옵션
  const [isHtml, setIsHtml] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 관리자 옵션
  const [isPinned, setIsPinned] = useState(false);
  const [pinnedReason, setPinnedReason] = useState("");
  const [pinnedUntil, setPinnedUntil] = useState("");

  const isAdmin = profile?.grade === "관리자";

  // 권한 체크
  useEffect(() => {
    const checkPermission = async () => {
        if (!categorySub) return;
        const { data } = await supabase.from('board_settings').select('write_grade').eq('board_id', categorySub).single();
        
        // 설정이 없으면 기본값 '새싹'
        const minGrade = data?.write_grade || '새싹';
        const userGrade = profile?.grade || '새싹';
        
        if (GRADE_LEVELS[userGrade] < GRADE_LEVELS[minGrade]) {
            alert(`등급이 부족합니다. (최소: ${minGrade})`);
            router.back();
        }
    };
    if (profile) checkPermission();
  }, [categorySub, profile, router, supabase]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return alert("제목과 내용을 입력해주세요.");
    
    setLoading(true);

    const postData = {
      title,
      content,
      category_main: categoryMain,
      category_sub: categorySub,
      author_id: user?.id,
      format: isHtml ? 'html' : 'text',
      is_pinned: isPinned,
      pinned_reason: isPinned ? pinnedReason : null,
      pinned_until: isPinned && pinnedUntil ? new Date(pinnedUntil).toISOString() : null,
    };

    const { error } = await supabase.from("posts").insert(postData);

    if (error) {
      alert("작성 실패: " + error.message);
    } else {
      router.push(`/${categoryMain}/${categorySub}`);
      router.refresh();
    }
    setLoading(false);
  };

  const currentSubMenus = MENUS.find((m) => m.id === categoryMain)?.sub || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">글쓰기</h1>
      
      <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {/* 카테고리 선택 */}
        <div className="grid grid-cols-2 gap-4">
          <select 
            value={categoryMain} 
            onChange={(e) => { 
                const mainId = e.target.value;
                setCategoryMain(mainId); 
                // 대분류 변경 시 소분류도 첫 번째 것으로 자동 선택
                const subMenu = MENUS.find(m => m.id === mainId)?.sub;
                if (subMenu) setCategorySub(subMenu.id);
            }}
            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {MENUS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <select 
            value={categorySub} 
            onChange={(e) => setCategorySub(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {currentSubMenus.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        {/* 제목 */}
        <input 
          type="text" 
          placeholder="제목을 입력하세요" 
          className="w-full p-3 border border-gray-300 rounded text-lg font-bold focus:outline-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* 옵션 바 */}
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
                상단 고정/공지
              </label>
              
              {isPinned && (
                <>
                  <input 
                    type="text" 
                    placeholder="라벨 (예: 공지)" 
                    className="p-1 px-2 border rounded w-28 text-xs"
                    value={pinnedReason}
                    onChange={(e) => setPinnedReason(e.target.value)}
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">종료:</span>
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

        {/* 본문 입력 */}
        <textarea 
          className={`w-full p-4 border rounded min-h-[400px] focus:outline-blue-500 resize-y ${
            isHtml ? 'bg-slate-900 text-green-400 font-mono text-sm' : 'bg-white text-gray-800'
          }`}
          placeholder={isHtml ? "<p>HTML 태그를 직접 입력하세요.</p>" : "내용을 입력하세요."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition">취소</button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition shadow-sm">
            {loading ? "등록 중..." : "등록완료"}
          </button>
        </div>
      </div>
    </div>
  );
}
