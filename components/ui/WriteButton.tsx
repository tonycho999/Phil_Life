"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { PenSquare } from "lucide-react";
import { useEffect } from "react";

interface WriteButtonProps {
  minLevel?: number;
  href?: string; // 링크 주소를 바꿀 수 있게 유연성 추가
}

export default function WriteButton({ minLevel = 1, href = "/post/write" }: WriteButtonProps) {
  const { user, profile, loading } = useAuth();

  // 디버깅용 로그 (F12 콘솔에서 확인 가능)
  useEffect(() => {
    if (user) {
      console.log(`[WriteButton] User: ${user.email}, Level: ${profile?.level}, Required: ${minLevel}`);
    }
  }, [user, profile, minLevel]);

  // 1. 로딩 중이면? 일단 아무것도 안 보임 (깜빡임 방지)
  if (loading) return null;

  // 2. 로그인 안 했으면? 숨김
  if (!user) return null;

  // 3. 내 레벨 확인 (DB에 레벨이 없으면 1로 가정)
  // 주의: profile.level이 0일 수도 있으므로 null check를 ?? 로 해야 함
  const myLevel = profile?.level ?? 1;

  // 4. 권한 체크
  if (myLevel < minLevel) {
    // 권한 부족 시 콘솔에 로그 남김
    console.log(`[WriteButton] Hidden due to low level. My: ${myLevel}, Req: ${minLevel}`);
    return null;
  }

  // 5. 통과 시 버튼 출력
  return (
    <Link
      href={href}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded flex items-center gap-2 transition shadow-sm"
    >
      <PenSquare size={16} /> 글쓰기
    </Link>
  );
}
