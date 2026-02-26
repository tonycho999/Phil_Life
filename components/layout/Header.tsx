// components/layout/Header.tsx
import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { MENUS, SITE_NAME } from "@/lib/constants";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      {/* 1. 로고 & 검색창 */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-blue-700 tracking-tighter mr-8">
          {SITE_NAME}
        </Link>
        
        <div className="flex-1 max-w-xl relative hidden md:block">
          <input 
            type="text" 
            placeholder="검색어를 입력하세요 (예: 비자 연장)" 
            className="w-full bg-gray-100 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <button className="md:hidden text-gray-600"><Menu /></button>
      </div>

      {/* 2. 대분류 메뉴 (GNB) */}
      <nav className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide">
          <ul className="flex gap-8 text-sm font-medium whitespace-nowrap">
            <li><Link href="/" className="block py-3 opacity-80 hover:opacity-100">홈</Link></li>
            {MENUS.map((menu) => (
              <li key={menu.id}>
                <Link href={`/${menu.id}`} className="block py-3 hover:text-yellow-400 transition">
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
