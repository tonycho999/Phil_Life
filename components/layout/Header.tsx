"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MENUS, SITE_NAME } from "@/lib/constants";
import LoginButton from "@/components/auth/LoginButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import NicknameModal from "@/components/auth/NicknameModal";

export default function Header() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    // 현재 카테고리 내에서 검색하거나, 전체 검색으로 보낼 수 있습니다.
    // 여기서는 현재 페이지를 리로드하며 쿼리를 붙이는 방식으로 구현 (간단 버전)
    const currentPath = window.location.pathname;
    router.push(`${currentPath}?q=${keyword}`);
  };

  return (
    <>
      {user && profile && !profile.nickname && (
        <NicknameModal userId={user.id} onComplete={refreshProfile} />
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* 상단: 로고, 검색, 로그인 정보 */}
          <div className="flex justify-between items-center h-16 gap-4">
            {/* 로고 */}
            <Link href="/" className="font-extrabold text-2xl text-blue-600 tracking-tight shrink-0">
              {SITE_NAME}
            </Link>

            {/* 검색창 (가운데 배치) */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="검색어를 입력하세요" 
                  className="w-full bg-gray-100 border border-gray-200 rounded-full py-2 px-4 pl-10 text-sm focus:outline-blue-500 transition"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </form>

            {/* 우측 로그인 상태 (로그아웃 버튼 삭제됨) */}
            <div className="flex items-center gap-3 shrink-0">
              {loading ? (
                <div className="w-20 h-8 bg-gray-100 animate-pulse rounded"></div>
              ) : user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">
                    {profile?.nickname || "회원"}님
                  </span>
                  {/* 로그아웃 버튼 제거됨 (사이드바에 이미 있음) */}
                </div>
              ) : (
                <LoginButton />
              )}
            </div>
          </div>

          {/* 하단: 네비게이션 메뉴 (배경색 추가) */}
        </div>
        
        {/* 메뉴바 배경색 적용 (bg-blue-600) */}
        <nav className="bg-blue-600 text-white">
            <div className="max-w-7xl mx-auto px-4">
                <ul className="flex w-full justify-between items-center overflow-x-auto scrollbar-hide">
                {MENUS.map((menu: any) => (
                    <li key={menu.id} className="flex-1 text-center hover:bg-blue-700 transition">
                    <Link 
                        href={`/${menu.id}/${menu.sub.id}`}
                        className="block py-3 text-sm font-bold whitespace-nowrap w-full"
                    >
                        {menu.label}
                    </Link>
                    </li>
                ))}
                </ul>
            </div>
        </nav>
      </header>
    </>
  );
}
