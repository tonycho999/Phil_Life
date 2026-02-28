"use client";

import Link from "next/link";
import { MENUS, SITE_NAME } from "@/lib/constants";
import LoginButton from "@/components/auth/LoginButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import NicknameModal from "@/components/auth/NicknameModal";

export default function Header() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  return (
    <>
      {/* 닉네임 설정 모달 (로그인은 했는데 닉네임 없으면 표시) */}
      {user && profile && !profile.nickname && (
        <NicknameModal userId={user.id} onComplete={refreshProfile} />
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 상단: 로고 및 로그인/회원가입 */}
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <Link href="/" className="font-extrabold text-2xl text-blue-600 tracking-tight">
              {SITE_NAME}
            </Link>

            {/* 우측 로그인/유저 정보 (모바일에서는 햄버거 메뉴 등으로 대체 가능하지만 일단 심플하게) */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="w-20 h-8 bg-gray-100 animate-pulse rounded"></div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-700 hidden md:block">
                    {profile?.nickname || "회원"}님
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded font-bold transition"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <LoginButton />
              )}
            </div>
          </div>

          {/* 하단: 네비게이션 메뉴 (가로 스크롤 가능) */}
          <nav className="overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <ul className="flex space-x-6 min-w-max border-t border-gray-100 pt-1">
              {/* ★ [핵심 수정] 
                  여기서 (menu: any) 라고 타입을 명시해야 에러가 안 납니다.
              */}
              {MENUS.map((menu: any) => (
                <li key={menu.id} className="py-3">
                  <Link 
                    href={`/${menu.id}/${menu.sub.id}`}
                    className="text-sm font-bold text-gray-600 hover:text-blue-600 transition whitespace-nowrap"
                  >
                    {menu.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

        </div>
      </header>
    </>
  );
}
