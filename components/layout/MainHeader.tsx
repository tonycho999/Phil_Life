"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MENUS, SITE_NAME } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import NicknameModal from "@/components/auth/NicknameModal";
import LoginButton from "@/components/auth/LoginButton";

export default function MainHeader() {
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

      <header className="bg-white sticky top-0 z-50 shadow-sm">
        
        {/* 1. 최상단 정보 바 (높이 최소화) */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 h-7 flex justify-end items-center text-[10px] text-gray-500 gap-3">
            <span className="flex items-center gap-2">
              <span className="text-red-500 font-bold">$1 = 57.68 PHP</span>
              <span className="w-px h-2.5 bg-gray-300"></span>
              <span className="text-blue-600 font-bold">1 PHP = 25.00 KRW</span>
            </span>
            <span className="hidden md:flex items-center gap-2">
              <span>🌤️ 마닐라 28°C</span>
              <span>🌴 세부 29°C</span>
            </span>
          </div>
        </div>

        {/* 2. 메인 헤더 (여백 py-4 -> py-2로 축소) */}
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-between items-center gap-4">
            <Link href="/" className="font-extrabold text-2xl text-blue-600 tracking-tight shrink-0">
              {SITE_NAME}
            </Link>

            {/* 검색창 (높이 조절) */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="검색어를 입력하세요" 
                  className="w-full bg-gray-100 border border-gray-200 rounded-full py-2 px-4 pl-10 text-xs focus:outline-blue-500 transition"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                 <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </form>

            <div className="shrink-0">
               {!loading && !user && <LoginButton />}
            </div>
          </div>
        </div>
        
        {/* 3. 메뉴바 (파란색 배경 복구 + 사이트 크기에 맞춤) */}
        <div className="max-w-7xl mx-auto px-4 pb-0">
            {/* nav에 rounded-t-lg를 주어 위쪽만 둥글게, 파란색 배경 적용 */}
            <nav className="bg-blue-600 text-white rounded-t-lg overflow-hidden">
                <ul className="flex justify-between items-center overflow-x-auto scrollbar-hide">
                {MENUS.map((menu: any) => (
                    <li key={menu.id} className="flex-1 text-center hover:bg-blue-700 transition">
                    <Link 
                        href={`/${menu.id}/${menu.sub.id}`}
                        className="block py-3 text-sm font-bold whitespace-nowrap"
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
