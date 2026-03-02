"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { User, LogIn, Newspaper, MessageCircle, MapPin, ShoppingBag } from "lucide-react";

export default function SidebarLeft() {
  const { user, profile, loading } = useAuth();

  // ★ 에러 방지용 렌더링 함수
  const renderProfile = () => {
    // 1. 로딩 중일 때 (깜빡임 방지용 스켈레톤)
    if (loading) return <div className="h-40 bg-gray-50 animate-pulse rounded-xl border border-gray-100"></div>;
    
    // 2. 비로그인 상태일 때
    if (!user) {
      return (
        <div className="bg-blue-50 p-5 rounded-xl text-center border border-blue-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-3 font-medium">더 많은 기능을 이용해보세요!</p>
          <Link href="/login" className="block w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2">
            <LogIn size={16} /> 로그인 / 가입
          </Link>
        </div>
      );
    }

    // 3. 로그인 했지만 프로필 데이터가 아직 로딩 중일 때 (안전장치 ★)
    // 여기서 profile이 null이어도 에러가 나지 않도록 '?.'(물음표)를 붙여줍니다.
    return (
      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 overflow-hidden flex items-center justify-center border border-gray-100">
           <User className="w-8 h-8 text-gray-400" />
        </div>
        
        {/* ★ 핵심: profile 뒤에 ?를 붙여서 데이터가 없으면 '닉네임 설정 필요'라고 뜨게 함 */}
        <h2 className="font-bold text-lg text-gray-800 mb-1">
            {profile?.nickname || "닉네임 설정 필요"}
        </h2>
        
        <div className="flex justify-center items-center gap-2 mb-4">
           <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-bold">
             {profile?.grade || "새싹"}
           </span>
           <span className="text-xs text-gray-400 font-mono">Lv.{profile?.level || 1}</span>
        </div>
        
        {/* 관리자 버튼 (관리자일 때만 보임) */}
        {(profile?.grade === "관리자" || (profile?.level || 0) >= 10) && (
            <Link href="/admin/grades" className="block w-full bg-gray-800 text-white py-2 rounded-lg text-xs font-bold hover:bg-gray-700 transition mb-2">
                관리자 페이지
            </Link>
        )}

        <button className="w-full border border-gray-200 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 hover:text-blue-600 transition">
          마이페이지
        </button>
      </div>
    );
  };

  return (
    <aside className="space-y-6">
      {/* 프로필 영역 */}
      {renderProfile()}

      {/* 메뉴 바로가기 */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-700 text-sm">바로가기</h3>
         </div>
         <nav className="flex flex-col p-2">
            <Link href="/news" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition font-medium text-sm">
                <Newspaper size={18} /> 뉴스/이슈
            </Link>
            <Link href="/community" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition font-medium text-sm">
                <MessageCircle size={18} /> 커뮤니티
            </Link>
            <Link href="/info" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition font-medium text-sm">
                <MapPin size={18} /> 여행/정보
            </Link>
            <Link href="/market" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition font-medium text-sm">
                <ShoppingBag size={18} /> 마켓/구인
            </Link>
         </nav>
      </div>
    </aside>
  );
}
