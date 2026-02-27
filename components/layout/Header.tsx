// components/layout/Header.tsx
import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { MENUS } from "@/lib/constants";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* 1. 로고 & 검색창 영역 */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-blue-800 tracking-tighter mr-8 flex items-center gap-1 shrink-0">
          <span>PHIL</span><span className="text-green-600">LIFE</span>
        </Link>
        
        <div className="hidden md:block flex-1 max-w-xl relative mx-4">
          <input 
            type="text" 
            placeholder="검색어를 입력하세요 (예: 비자 연장, 맛집)" 
            className="w-full bg-gray-100 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <button className="md:hidden text-gray-600"><Menu /></button>
      </div>

      {/* 2. 대분류 메뉴 (GNB) - 화면 꽉 차게 배치 */}
      <nav className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* justify-between: 양쪽 끝으로 균등 배치, w-full: 전체 너비 사용 */}
          <ul className="flex overflow-x-auto md:justify-between w-full text-sm font-medium whitespace-nowrap scrollbar-hide">
            
            {/* 홈 버튼 */}
            <li className="flex-1 text-center md:flex-none">
              <Link href="/" className="block py-3 px-2 opacity-80 hover:opacity-100 hover:text-yellow-400 transition">
                홈
              </Link>
            </li>

            {/* 동적 메뉴 생성 */}
            {MENUS.map((menu) => (
              <li key={menu.id} className="flex-1 text-center md:flex-none">
                <Link 
                  href={`/${menu.id}/${menu.sub[0].id}`} 
                  className="block py-3 px-2 hover:text-yellow-400 transition"
                >
                  {menu.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
