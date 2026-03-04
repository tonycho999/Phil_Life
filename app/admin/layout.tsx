"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // 관리자 체크
  useEffect(() => {
    if (!loading && (!user || (profile?.level || 0) < 10)) {
      alert("관리자만 접근 가능합니다.");
      router.push("/");
    }
  }, [user, profile, loading, router]);

  if (loading) return null;

  // 좌측 사이드바 메뉴 영역을 제거하고 메인 컨텐츠만 전체 너비로 출력합니다.
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
