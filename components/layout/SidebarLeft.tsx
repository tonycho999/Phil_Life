"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { MENUS } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import LoginButton from "@/components/auth/LoginButton";

export default function SidebarLeft() {
  const params = useParams();
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    location.reload();
  };
  
  // 현재 URL의 category 가져오기
  const currentCategory = params?.category as string;
  const menuData = MENUS.find((menu: any) => menu.id === currentCategory);

  return (
    <aside className="w-full space-y-6">
      
      {/* 1. 고정된 프로필 영역 (절대 고정) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
        {user ? (
          <div className="flex flex-col items-center">
            {/* 관리자 뱃지 (임시) */}
            <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded mb-2">
              관리자
            </span>
            <h3 className="font-bold text-lg text-gray-800 mb-4">
              {profile?.nickname || "회원"}님
            </h3>

            {/* 포인트 영역 */}
            <div className="w-full flex justify-between items-center text-sm text-gray-600 mb-4 px-2">
              <span>포인트</span>
              <span className="font-bold text-blue-600">100 P</span>
            </div>

            {/* 버튼 그룹 */}
            <div className="w-full space-y-2">
              <Link href="/admin" className="block w-full py-2 bg-gray-800 text-white text-xs rounded hover:bg-gray-700 transition">
                ⚙️ 관리자 페이지
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/my-posts" className="block w-full py-2 bg-blue-50 text-blue-600 text-xs rounded hover:bg-blue-100 transition font-bold">
                  내 글 보기
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full py-2 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">로그인이 필요합니다.</p>
            <LoginButton />
          </div>
        )}
      </div>

      {/* 2. 게시판 메뉴 (카테고리 선택 시에만 나옴) */}
      {menuData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 text-white p-3 font-bold text-center">
             {menuData.label}
          </div>
          <ul className="divide-y divide-gray-100">
            {menuData.sub.map((sub: any) => {
              const isActive = pathname === `/${currentCategory}/${sub.id}`;
              return (
                <li key={sub.id}>
                  <Link
                    href={`/${currentCategory}/${sub.id}`}
                    className={`block px-4 py-3 text-sm transition hover:bg-gray-50 flex justify-between items-center ${
                      isActive 
                        ? "text-blue-600 font-bold bg-blue-50 border-l-4 border-blue-600" 
                        : "text-gray-600 border-l-4 border-transparent"
                    }`}
                  >
                    <span>{sub.label}</span>
                    {isActive && <span className="text-xs text-blue-500">▶</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 글쓰기 버튼 삭제됨 */}
    </aside>
  );
}
