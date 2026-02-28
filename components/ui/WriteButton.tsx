"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { PenSquare } from "lucide-react";
import { useEffect, useState } from "react";

interface WriteButtonProps {
  requiredLevel: number; // 이 게시판에 글을 쓰기 위한 최소 레벨
  href: string;          // 이동할 주소 (카테고리 파라미터 포함)
}

export default function WriteButton({ requiredLevel, href }: WriteButtonProps) {
  const { user, profile, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. 로딩 중이거나, 클라이언트 마운트 전이면 숨김 (Hydration 에러 방지)
  if (!mounted || loading) return null;

  // 2. 로그인 안 했으면 숨김
  if (!user) return null;

  // 3. 내 레벨 확인 (프로필 없으면 1레벨로 간주)
  const myLevel = profile?.level ?? 1;

  // 4. 권한 체크: 내 레벨이 요구 레벨보다 낮으면 숨김
  if (myLevel < requiredLevel) {
    // 디버깅용 로그 (개발 중에만 확인하세요)
    // console.log(`[권한부족] 내레벨: ${myLevel}, 필요레벨: ${requiredLevel}`);
    return null;
  }

  // 5. 통과 시 버튼 표시
  return (
    <Link
      href={href}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded flex items-center gap-2 transition shadow-sm"
    >
      <PenSquare size={16} /> 글쓰기
    </Link>
  );
}
