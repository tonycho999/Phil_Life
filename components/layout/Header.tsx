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
      {/* 닉네임 설정 모달 */}
      {user && profile && !profile.nickname && (
        <NicknameModal userId={user.id} onComplete={refreshProfile} />
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 상단: 로고 및 로그인 */}
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="font-extrabold text-2xl text-blue-600 tracking-tight">
              {SITE_NAME}
            </Link>

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

          {/* 하단: 네비게이션 메뉴 (100% 넓이 사용) */}
          <nav className="overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {/* ★ [수정됨] w-full과 justify-between을 사용하여 메뉴를 양끝으로 정렬 */}
            <ul className="flex w-full justify-between items-center border-t border-gray-100 pt-1">
              {MENUS.map((menu: any) => (
                <li key={menu.id} className="py-3 flex-1 text-center">
                  <Link 
                    href={`/${menu.id}/${menu.sub.id}`}
                    className="text-sm font-bold text-gray-600 hover:text-blue-600 transition whitespace-nowrap block w-full"
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
