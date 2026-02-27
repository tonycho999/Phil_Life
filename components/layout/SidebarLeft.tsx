"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENUS } from "@/lib/constants";
import { createClient } from "@/lib/supabase";
import LoginButton from "@/components/auth/LoginButton";
import NicknameModal from "@/components/auth/NicknameModal";
import { useAuth } from "@/components/auth/AuthProvider"; // ★ import 변경

export default function SidebarLeft() {
  const pathname = usePathname();
  const currentMainId = pathname.split("/")[1];
  const currentMenu = MENUS.find((m) => m.id === currentMainId);
  const supabase = createClient();

  // ★ 기존 useEffect, useState 다 지우고 이거 한 줄이면 끝!
  const { user, profile, loading, refreshProfile } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    location.reload(); // 로그아웃은 새로고침이 깔끔함
  };

  return (
    <>
      {/* 닉네임 저장 시 refreshProfile 호출 */}
      {user && profile && !profile.nickname && (
        <NicknameModal userId={user.id} onComplete={refreshProfile} />
      )}

      <aside className="space-y-4 w-full">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 w-full">
          {loading ? (
            // 로딩 중 (AuthContext가 로딩 중일 때만 잠깐 보임)
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 w-1/2 mx-auto rounded"></div>
              <div className="h-10 bg-gray-200 w-full rounded"></div>
            </div>
          ) : user ? (
            // 로그인 상태 (데이터가 이미 있으므로 즉시 보임)
            <div className="text-center w-full">
              <div className="mb-4">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-white bg-green-500 rounded mb-1">
                  {profile?.grade || "새싹"}
                </span>
                <p className="font-bold text-lg text-gray-800 break-words">
                  {profile?.nickname || "회원"}님
                </p>
              </div>
              <div className="bg-gray-50 rounded p-3 mb-4 flex justify-between text-sm">
                <span className="text-gray-500">포인트</span>
                <span className="font-bold text-blue-600">
                  {profile?.points?.toLocaleString()} P
                </span>
              </div>
              <button 
                onClick={handleLogout} 
                className="w-full py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded hover:bg-gray-200 transition"
              >
                로그아웃
              </button>
            </div>
          ) : (
            // 비로그인 상태
            <div className="text-center w-full">
              <p className="text-sm text-gray-600 mb-4 font-medium break-keep">
                로그인하고 더 많은<br/>활동을 해보세요!
              </p>
              <div className="w-full">
                <LoginButton />
              </div>
            </div>
          )}
        </div>

        {/* 메뉴 리스트 */}
        {currentMenu && (
          <div className="bg-white py-2 rounded-lg shadow-sm border border-gray-200 hidden md:block">
            <h3 className="px-4 py-2 text-xs font-bold text-gray-400 border-b border-gray-100">
              {currentMenu.label} 메뉴
            </h3>
            <ul>
              {currentMenu.sub.map((sub) => (
                <li key={sub.id}>
                  <Link 
                    href={`/${currentMenu.id}/${sub.id}`} 
                    className={`block px-4 py-2 text-sm hover:bg-gray-50 transition ${
                      pathname.includes(sub.id) ? "text-blue-600 font-bold bg-blue-50" : "text-gray-600"
                    }`}
                  >
                    {sub.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </>
  );
}
