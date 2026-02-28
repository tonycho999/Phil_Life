"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MENUS, SITE_NAME } from "@/lib/constants";
import LoginButton from "@/components/auth/LoginButton";
import { useAuth } from "@/components/auth/AuthProvider";
import NicknameModal from "@/components/auth/NicknameModal";

export default function Header() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    router.push(`${window.location.pathname}?q=${keyword}`);
  };

  return (
    <>
      {user && profile && !profile.nickname && (
        <NicknameModal userId={user.id} onComplete={refreshProfile} />
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16 gap-4">
            <Link href="/" className="font-extrabold text-2xl text-blue-600 tracking-tight shrink-0">
              {SITE_NAME}
            </Link>

            <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="검색어를 입력하세요" 
                  className="w-full bg-gray-100 border border-gray-200 rounded-full py-2 px-4 pl-10 text-sm focus:outline-blue-500 transition"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </form>

            <div className="flex items-center gap-3 shrink-0">
              {loading ? (
                <div className="w-20 h-8 bg-gray-100 animate-pulse rounded"></div>
              ) : user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">
                    {profile?.nickname || "회원"}님
                  </span>
                </div>
              ) : (
                <LoginButton />
              )}
            </div>
          </div>
        </div>
        
        {/* 파란색 메뉴바 */}
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
