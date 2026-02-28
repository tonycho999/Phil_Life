"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { PenSquare } from "lucide-react"; // 아이콘이 없다면 지우거나 ✏️ 로 대체

interface WriteButtonProps {
  minLevel?: number;   // 글쓰기 가능한 최소 레벨 (기본값 1)
  href?: string;       // 이동할 주소
}

export default function WriteButton({ minLevel = 1, href = "/post/write" }: WriteButtonProps) {
  const { user, profile, loading } = useAuth();

  // 1. 로딩 중이면 아무것도 안 보임 (깜빡임 방지)
  if (loading) return null;

  // 2. 로그인 안 했으면 숨김
  if (!user) return null;

  // 3. 내 레벨 확인 (프로필 로딩 덜 됐으면 기본 1로 가정하거나 숨김)
  const myLevel = profile?.level || 1;

  // 4. 권한 체크: 내 레벨이 조건보다 낮으면 숨김
  if (myLevel < minLevel) return null;

  // 5. 통과하면 버튼 표시
  return (
    <Link
      href={href}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded flex items-center gap-2 transition"
    >
      <PenSquare size={16} /> 글쓰기
    </Link>
  );
}
