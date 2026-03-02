"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import NicknameModal from "@/components/auth/NicknameModal"; // 이미 있는 파일 불러오기

export default function NicknameGuard() {
  const { user, profile, refreshProfile, loading } = useAuth();

  // 1. 로딩 중이거나, 로그인 안 했으면 무시
  if (loading || !user) return null;

  // 2. 프로필 데이터가 아직 로딩 중이면 대기
  if (!profile) return null;

  // 3. 닉네임이 이미 있으면(정상) 팝업 안 띄움
  if (profile.nickname) return null;

  // 4. 로그인 했는데 닉네임이 없다? -> 팝업 출동!
  return (
    <NicknameModal userId={user.id} onComplete={refreshProfile} />
  );
}
