"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import { MENUS } from "@/lib/constants"; 
import { 
  User, ChevronRight, LayoutGrid, 
  Newspaper, MapPin, MessageSquare, Building2, ShoppingBag, Plane, Store,
  Settings, EyeOff
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

export default function SidebarLeft() {
  const { user, profile, loading } = useAuth();
  const supabase = createClient();
  const pathname = usePathname();

  // 1. 구글 로그인
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
  };

  // 2. 프로필 영역
  const renderProfile = () => {
    if (loading) return <div className="h-[200px] bg-gray-50 animate-pulse rounded-xl border border-gray-100 mb-6"></div>;
    
    // 비로그인
    if (!user) {
      return (
        <div className="bg-white p-6 rounded-xl text-center border border-gray-200 shadow-sm mb-6">
          <p className="text-gray-800 font-bold mb-2">환영합니다!</p>
          <p className="text-xs text-gray-500 mb-4">로그인 후 더 많은 정보를<br/>확인해보세요.</p>
          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-[#4285F4] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#3367D6] transition flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"></path><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>
            Google 로그인
          </button>
        </div>
      );
    }

    // 로그인 완료
    const isAdmin = profile?.grade === "관리자" || (profile?.level || 0) >= 10;

    return (
      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm text-center mb-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 overflow-hidden flex items-center justify-center border border-gray-100">
           <User className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="font-bold text-lg text-gray-800 mb-1">{profile?.nickname || "닉네임 없음"}</h2>
        <div className="flex justify-center items-center gap-2 mb-4">
           <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-bold">{profile?.grade || "새싹"}</span>
           <span className="text-xs text-gray-400 font-mono">Lv.{profile?.level || 1}</span>
        </div>
        
        {/* 관리자 메뉴 영역 */}
        {isAdmin && (
            <div className="bg-gray-50 rounded-lg p-2 mb-3 border border-gray-100 text-left space-y-1">
                <p className="text-[10px] text-gray-400 font-bold px-1 mb-1">ADMIN MENU</p>
                <Link href="/admin/grades" className="flex items-center gap-2 w-full text-gray-700 hover:bg-white hover:text-blue-600 py-1.5 px-2 rounded-md text-xs font-bold transition">
                    <Settings size={14} /> 관리자 페이지
                </Link>
                <Link href="/admin/hidden-posts" className="flex items-center gap-2 w-full text-gray-700 hover:bg-white hover:text-red-600 py-1.5 px-2 rounded-md text-xs font-bold transition">
                    <EyeOff size={14} /> 숨긴 글 관리
                </Link>
            </div>
        )}

        {/* ★ 수정됨: 이미 존재하는 /my-posts 경로로 연결하고 이름 변경 */}
        <Link 
            href="/my-posts" 
            className="block w-full border border-gray-200 text-gray-600 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 hover:text-blue-600 transition text-center"
        >
            내 글 보기
        </Link>
      </div>
    );
  };

  // 3. 내비게이션 렌더링
  const renderNavigation = () => {
    if (pathname === "/") return null;

    const activeMenu = MENUS.find((m: any) => 
        pathname === `/${m.id}` || pathname.startsWith(`/${m.id}/`)
    );
    
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
