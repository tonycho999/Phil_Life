"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2, EyeOff, Eye, Megaphone, CheckCircle } from "lucide-react";

interface PostControlsProps {
  postId: string;
  authorId: string;
  categoryMain: string;
  categorySub: string;
  isHidden: boolean;
  isPinned: boolean;
}

export default function PostControls({ 
  postId, authorId, categoryMain, categorySub, isHidden, isPinned 
}: PostControlsProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  if (!user) return null;

  // 관리자 여부 확인 (레벨 10 이상 또는 등급이 '관리자')
  const isAdmin = profile?.grade === "관리자" || (profile?.level || 0) >= 10;
  // 작성자 본인 여부
  const isAuthor = user.id === authorId;

  // 1. 삭제 (관리자 또는 작성자)
  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까? 복구할 수 없습니다.")) return;
    await supabase.from("posts").delete().eq("id", postId);
    alert("삭제되었습니다.");
    router.push(`/${categoryMain}/${categorySub}`);
    router.refresh();
  };

  // 2. 관리자: 숨김 토글
  const handleToggleHidden = async () => {
    await supabase.from("posts").update({ is_hidden: !isHidden }).eq("id", postId);
    router.refresh();
  };

  // 3. 관리자: 공지(상단 노출) 토글
  const handleTogglePin = async () => {
    const reason = !isPinned ? prompt("공지로 등록할 말머리를 입력하세요 (예: 필독)", "공지") : null;
    if (!isPinned && !reason) return; // 취소함

    await supabase.from("posts").update({ 
        is_pinned: !isPinned,
        pinned_reason: reason 
    }).eq("id", postId);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-1">
      {/* 관리자 전용 기능 */}
      {isAdmin && (
        <>
            <button onClick={handleTogglePin} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border transition ${isPinned ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-500 hover:bg-red-50'}`}>
                <Megaphone size={12} /> {isPinned ? "공지 해제" : "공지 등록"}
            </button>
            <button onClick={handleToggleHidden} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border transition ${isHidden ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
                {isHidden ? <><Eye size={12} /> 숨김 해제</> : <><EyeOff size={12} /> 숨김 처리</>}
            </button>
        </>
      )}

      {/* 수정 (작성자 또는 관리자) */}
      {(isAuthor || isAdmin) && (
        <Link
          href={`/post/edit/${postId}`}
          className="flex items-center gap-1 text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <Edit size={14} /> 수정
        </Link>
      )}

      {/* 삭제 (작성자 또는 관리자) */}
      {(isAuthor || isAdmin) && (
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 text-xs font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded border border-red-100 hover:bg-red-600 hover:text-white transition"
        >
          <Trash2 size={14} /> 삭제
        </button>
      )}
    </div>
  );
}
