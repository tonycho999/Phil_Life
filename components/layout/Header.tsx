import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { MENUS, SITE_NAME } from "@/lib/constants";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* 1. 로고 & 검색창 */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 변경: Phil Life 스타일 */}
        <Link href="/" className="text-2xl font-black text-blue-800 tracking-tighter mr-8 flex items-center gap-1">
          <span>PHIL</span><span className="text-green-600">LIFE</span>
        </Link>
        
        <div className="hidden md:block flex-1 max-w-xl relative">
          <input 
            type="text" 
            placeholder="필리핀 생활정보 검색" 
            className="w-full bg-gray-100 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <button className="md:hidden text-gray-600"><Menu /></button>
      </div>

      {/* 2. 대분류 메뉴 (GNB) - 링크 수정됨 */}
      <nav className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide">
          <ul className="flex gap-8 text-sm font-medium whitespace-nowrap">
            <li><Link href="/" className="block py-3 opacity-80 hover:opacity-100 hover:text-yellow-400">홈</Link></li>
            {MENUS.map((menu) => (
              <li key={menu.id}>
                {/* ★ 수정된 부분: 대분류 클릭 시 '첫 번째 소분류'로 이동 */}
                <Link 
                  href={`/${menu.id}/${menu.sub[0].id}`} 
                  className="block py-3 hover:text-yellow-400 transition"
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
