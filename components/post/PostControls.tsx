"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit, Trash2, ShieldAlert, EyeOff, Eye } from "lucide-react";

interface PostControlsProps {
  postId: string;
  authorId: string;
  categoryMain: string;
  categorySub: string;
  isHidden: boolean;
}

export default function PostControls({ postId, authorId, categoryMain, categorySub, isHidden }: PostControlsProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  if (!user) return null;

  // 권한 체크
  const isAuthor = user.id === authorId;
  const isAdmin = profile?.grade === "관리자" || (profile?.level || 0) >= 10;

  // 게시글 삭제 (관리자/작성자 공용)
  const handleDelete = async () => {
    if (!confirm("정말 게시글을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.")) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      alert("삭제 실패: " + error.message);
    } else {
      alert("삭제되었습니다.");
      router.push(`/${categoryMain}/${categorySub}`);
      router.refresh();
    }
  };

  // 관리자: 숨김 처리 토글
  const handleToggleHidden = async () => {
    const { error } = await supabase.from("posts").update({ is_hidden: !isHidden }).eq("id", postId);
    if (!error) router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      {/* 1. 작성자 전용: 수정 버튼 */}
      {isAuthor && (
        <Link
          href={`/post/edit/${postId}`}
          className="flex items-center gap-1 text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-blue-50 hover:text-blue-600 transition"
        >
          <Edit size={14} /> 수정
        </Link>
      )}

      {/* 2. 관리자/작성자 공용: 삭제 버튼 */}
      {(isAuthor || isAdmin) && (
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 text-xs font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded border border-red-100 hover:bg-red-600 hover:text-white transition"
        >
          <Trash2 size={14} /> 삭제
        </button>
      )}

      {/* 3. 관리자 전용: 숨김 버튼 */}
      {isAdmin && (
        <button
          onClick={handleToggleHidden}
          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded border transition ${
            isHidden ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:bg-gray-100"
          }`}
        >
          {isHidden ? <><Eye size={14} /> 숨김 해제</> : <><EyeOff size={14} /> 숨김 처리</>}
        </button>
      )}
    </div>
  );
}
