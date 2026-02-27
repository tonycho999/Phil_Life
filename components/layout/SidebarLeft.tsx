"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENUS } from "@/lib/constants";
import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import LoginButton from "@/components/auth/LoginButton";
import NicknameForm from "@/components/auth/NicknameForm";

export default function SidebarLeft() {
  const pathname = usePathname();
  const currentMainId = pathname.split("/")[1];
  const currentMenu = MENUS.find((m) => m.id === currentMainId);
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 내 정보 가져오기
  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  return (
    <aside className="space-y-4">
      {/* 1. 회원 정보 / 로그인 박스 */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          // 로딩 중
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        ) : user ? (
          // 로그인 했을 때
          profile && !profile.nickname ? (
            // 닉네임 없을 때 (닉네임 설정 폼)
            <NicknameForm userId={user.id} onComplete={fetchProfile} />
          ) : (
            // 닉네임 있을 때 (내 정보 표시)
            <div className="text-center">
              <div className="mb-3">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-white bg-green-500 rounded mb-1">
                  {profile?.grade || "새싹"}
                </span>
                <p className="font-bold text-lg text-gray-800">
                  {profile?.nickname || "회원"}님
                </p>
              </div>
              
              <div className="bg-gray-50 rounded p-3 mb-4 flex justify-between items-center text-sm">
                <span className="text-gray-500">내 포인트</span>
                <span className="font-bold text-blue-600">{profile?.points?.toLocaleString()} P</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button className="py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded hover:bg-blue-100">
                  내 글 보기
                </button>
                <button onClick={handleLogout} className="py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded hover:bg-gray-200">
                  로그아웃
                </button>
              </div>
            </div>
          )
        ) : (
          // 로그인 안 했을 때
          <>
            <p className="text-xs text-gray-500 mb-3 text-center">로그인하고 더 많은 활동을 해보세요!</p>
            <LoginButton />
          </>
        )}
      </div>

      {/* 2. 소분류 메뉴 (기존 코드) */}
      {currentMenu && (
        <div className="bg-white py-2 rounded-lg shadow-sm border border-gray-200 hidden md:block">
          <h3 className="px-4 py-2 text-xs font-bold text-gray-400 border-b border-gray-100">
            {currentMenu.label} 메뉴
          </h3>
          <ul>
            {currentMenu.sub.map((sub) => {
              const isActive = pathname.includes(sub.id);
              return (
                <li key={sub.id}>
                  <Link 
                    href={`/${currentMenu.id}/${sub.id}`}
                    className={`block px-4 py-2 text-sm hover:bg-gray-50 ${isActive ? "text-blue-600 font-bold bg-blue-50" : "text-gray-600"}`}
                  >
                    {sub.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {/* 3. 광고 영역 */}
      <div className="bg-slate-100 p-4 rounded-lg text-center text-xs text-gray-400 min-h-[150px] flex items-center justify-center">
        광고 문의
      </div>
    </aside>
  );
}
