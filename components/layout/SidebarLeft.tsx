// components/layout/SidebarLeft.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENUS } from "@/lib/constants";

export default function SidebarLeft() {
  const pathname = usePathname();
  // URL에서 대분류 찾기 (예: /info/visa -> info)
  const currentMainId = pathname.split("/")[1];
  const currentMenu = MENUS.find((m) => m.id === currentMainId);

  return (
    <aside className="space-y-4">
      {/* 로그인 박스 */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-xs text-gray-500 mb-3">로그인하고 글쓰기</p>
        <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded transition">
          구글 로그인
        </button>
      </div>

      {/* 소분류 메뉴 (동적 변경) */}
      {currentMenu && (
        <div className="bg-white py-2 rounded-lg shadow-sm border border-gray-200">
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
      
      {/* 빈 공간 광고 */}
      <div className="bg-slate-100 p-4 rounded-lg text-center text-xs text-gray-400">
        광고 문의
      </div>
    </aside>
  );
}
