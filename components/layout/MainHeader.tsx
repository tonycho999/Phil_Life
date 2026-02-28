"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MENUS, SITE_NAME } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import NicknameModal from "@/components/auth/NicknameModal";

export default function MainHeader() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    router.push(`/?q=${keyword}`); // 메인에서 검색되도록 설정 (필요시 수정)
  };

  return (
    <>
      {user && profile && !profile.nickname && (
        <NicknameModal userId={user.id} onComplete={refreshProfile} />
      )}

      <header className="bg-white sticky top-0 z-50 shadow-sm">
        
        {/* 1. 최상단 정보 바 */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 h-7 flex justify-end items-center text-[10px] text-gray-500 gap-3">
             {/* 상단 정보 내용 유지 */}
             <span>1 PHP = 25.00 KRW</span>
          </div>
        </div>

        {/* 2. 메인 헤더 */}
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-between items-center gap-4">
            <Link href="/" className="font-extrabold text-2xl text-blue-600 tracking-tight shrink-0">
              {SITE_NAME}
            </Link>

            <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="검색어를 입력하세요" 
                  className="w-full bg-gray-100 border border-gray-200 rounded-full py-2 px-4 pl-10 text-xs focus:outline-blue-500 transition"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </form>
            <div className="shrink-0"></div>
          </div>
        </div>
        
        {/* 3. 메뉴바 (여기 수정됨!) */}
        <div className="max-w-7xl mx-auto px-4 pb-0">
            <nav className="bg-blue-600 text-white rounded-t-lg overflow-hidden">
                <ul className="flex justify-between items-center overflow-x-auto scrollbar-hide">
                {MENUS.map((menu: any) => (
                    <li key={menu.id} className="flex-1 text-center hover:bg-blue-700 transition">
                    {/* ★ 중요 수정: 기존에는 menu.sub.id로 갔기 때문에 undefined 에러가 났습니다.
                        이제는 그냥 /menu.id (예: /community)로 이동하게 하여 대분류 페이지를 띄웁니다.
                    */}
                    <Link 
                        href={`/${menu.id}`} 
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
