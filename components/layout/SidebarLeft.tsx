"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; 
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import { MENUS } from "@/lib/constants"; 
import { 
  User, ChevronRight, LayoutGrid, 
  Newspaper, MapPin, MessageSquare, Building2, ShoppingBag, Plane, Store,
  Settings, EyeOff, LogOut, Users, FileText, Shield // ★ 관리자 메뉴용 아이콘 3개 추가됨
} from "lucide-react";

// 아이콘 매핑
const ICONS: { [key: string]: any } = {
  news: Newspaper,
  info: MapPin,
  community: MessageSquare,
  estate: Building2,
  market: ShoppingBag,
  travel: Plane,
  biz: Store,
};

// ★ 최신 0~10레벨, S등급(99), M(10레벨) 색상 함수 추가
function getLevelBadgeInfo(level: any) {
  const strLevel = String(level);
  if (strLevel === "10") return { label: "M", style: "bg-gray-800 text-white border-gray-900" }; 
  if (strLevel === "S" || strLevel === "99") return { label: "S", style: "bg-yellow-100 text-yellow-700 border-yellow-300" };
  
  if (strLevel === "0") return { label: "Lv.0", style: "bg-gray-100 text-gray-500 border-gray-200" };
  if (strLevel === "1") return { label: "Lv.1", style: "bg-green-100 text-green-700 border-green-200" };
  if (strLevel === "2") return { label: "Lv.2", style: "bg-blue-100 text-blue-700 border-blue-200" };
  if (strLevel === "3") return { label: "Lv.3", style: "bg-purple-100 text-purple-700 border-purple-200" };
  if (strLevel === "4") return { label: "Lv.4", style: "bg-teal-100 text-teal-700 border-teal-200" };
  if (strLevel === "5") return { label: "Lv.5", style: "bg-pink-100 text-pink-700 border-pink-200" };
  
  return { label: `Lv.${strLevel}`, style: "bg-indigo-100 text-indigo-700 border-indigo-200" };
}

export default function SidebarLeft() {
  const { user, profile, loading } = useAuth();
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter(); 

  // ★ 로그아웃 기능
  const handleLogout = async () => {
    if (!confirm("로그아웃 하시겠습니까?")) return;
    await supabase.auth.signOut();
    router.refresh();
  };

  // 2. 프로필 영역
  const renderProfile = () => {
    if (loading) return <div className="h-[200px] bg-gray-50 animate-pulse rounded-xl border border-gray-100 mb-6"></div>;
    
    // 비로그인 (로그인 전용 페이지로 이동하도록 수정됨)
    if (!user) {
      return (
        <div className="bg-white p-6 rounded-xl text-center border border-gray-200 shadow-sm mb-6">
          <p className="text-gray-800 font-bold mb-2">환영합니다!</p>
          <p className="text-xs text-gray-500 mb-4">로그인 후 더 많은 정보를<br/>확인해보세요.</p>
          <Link 
            href="/login"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-sm"
          >
             로그인 / 회원가입
          </Link>
        </div>
      );
    }

    // 로그인 완료
    const isAdmin = profile?.grade === "관리자" || (profile?.level || 0) >= 10;
    
    // ★ 동적 뱃지 정보 가져오기
    const badge = getLevelBadgeInfo(profile?.level ?? 1);

    return (
      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm text-center mb-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 overflow-hidden flex items-center justify-center border border-gray-100">
           <User className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="font-bold text-lg text-gray-800 mb-1">{profile?.nickname || "닉네임 없음"}</h2>
        <div className="flex justify-center items-center gap-2 mb-4">
           {/* 등급명 + 최신 동적 뱃지 적용 */}
           <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-bold">{profile?.grade || "새싹"}</span>
           <span className={`text-xs px-2 py-0.5 rounded border font-bold ${badge.style}`}>{badge.label}</span>
        </div>
        
        {/* ★ 확장된 관리자 메뉴 영역 */}
        {isAdmin && (
            <div className="bg-gray-50 rounded-lg p-2 mb-3 border border-gray-100 text-left space-y-1">
                <p className="text-[10px] text-gray-400 font-bold px-1 mb-1">ADMIN MENU</p>
                <Link href="/admin/boards" className="flex items-center gap-2 w-full text-gray-700 hover:bg-white hover:text-blue-600 py-1.5 px-2 rounded-md text-xs font-bold transition">
                    <FileText size={14} /> 게시판 관리
                </Link>
                <Link href="/admin/users" className="flex items-center gap-2 w-full text-gray-700 hover:bg-white hover:text-blue-600 py-1.5 px-2 rounded-md text-xs font-bold transition">
                    <Users size={14} /> 회원 관리
                </Link>
                <Link href="/admin/grades" className="flex items-center gap-2 w-full text-gray-700 hover:bg-white hover:text-blue-600 py-1.5 px-2 rounded-md text-xs font-bold transition">
                    <Shield size={14} /> 등급 설정
                </Link>
                <div className="border-t border-gray-200 my-1"></div>
                <Link href="/admin/hidden" className="flex items-center gap-2 w-full text-gray-700 hover:bg-white hover:text-red-600 py-1.5 px-2 rounded-md text-xs font-bold transition">
                    <EyeOff size={14} /> 숨긴 글 관리
                </Link>
            </div>
        )}

        <div className="flex gap-2">
          <Link 
              href="/my-posts" 
              className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 hover:text-blue-600 transition text-center"
          >
              내 글 보기
          </Link>
          <button 
              onClick={handleLogout}
              className="flex items-center justify-center px-3 border border-gray-200 text-gray-500 rounded-lg text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition bg-white"
              title="로그아웃"
          >
              <LogOut size={16} />
          </button>
        </div>
      </div>
    );
  };

  // 3. 내비게이션 렌더링 (기존 코드 완벽 유지 + 게시글 방어 로직 추가)
  const renderNavigation = () => {
    if (pathname === "/") return null;

    let activeMenu = MENUS.find((m: any) => 
        pathname === `/${m.id}` || pathname.startsWith(`/${m.id}/`)
    );
    
    // ★ 게시글(/post/)을 보고 있을 때 왼쪽 메뉴가 사라지지 않도록 방어하는 로직
    if (!activeMenu && pathname.startsWith("/post/")) {
        activeMenu = MENUS[0]; // 기본 메뉴(첫 번째 탭) 강제 유지
    }

    if (activeMenu && activeMenu.sub && activeMenu.sub.length > 0) {
        const Icon = ICONS[activeMenu.id] || LayoutGrid;
        
        return (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <Icon size={16} className="text-blue-600"/> 
                    <h3 className="font-bold text-gray-700 text-sm">{activeMenu.label}</h3>
                </div>
                <nav className="flex flex-col p-2">
                    {activeMenu.sub.map((subItem: any) => (
                        <Link 
                            key={subItem.id} 
                            href={`/${activeMenu.id}/${subItem.id}`} 
                            className={`flex items-center justify-between p-3 rounded-lg transition font-medium text-sm ${
                                pathname.includes(`/${subItem.id}`) 
                                ? "bg-blue-50 text-blue-600 font-bold" 
                                : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                            }`}
                        >
                            {subItem.label} 
                            <ChevronRight size={14} className="opacity-30"/>
                        </Link>
                    ))}
                    <Link 
                         href={`/${activeMenu.id}`}
                         className={`flex items-center justify-between p-3 text-xs mt-1 border-t border-gray-50 ${
                            pathname === `/${activeMenu.id}` 
                            ? "text-blue-600 font-bold bg-blue-50/50" 
                            : "text-gray-400 hover:text-gray-600"
                         }`}
                    >
                        전체 글 보기
                    </Link>
                </nav>
            </div>
        );
    }

    return null;
  };

  return (
    <aside className="space-y-6">
      {renderProfile()}
      {renderNavigation()}
    </aside>
  );
}
