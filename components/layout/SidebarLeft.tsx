"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { MENUS } from "@/lib/constants";

export default function SidebarLeft() {
  const params = useParams();
  const pathname = usePathname();
  
  // 현재 URL의 category 부분 (예: 'news', 'community') 가져오기
  const currentCategory = params?.category as string;

  // 전체 메뉴 목록에서 현재 카테고리와 일치하는 것 찾기
  const menuData = MENUS.find((menu: any) => menu.id === currentCategory);

  // 만약 일치하는 메뉴가 없다면(메인화면 등) 아무것도 표시 안 함
  if (!menuData) return null;

  return (
    <aside className="w-full space-y-4">
      {/* 카테고리 제목 박스 */}
      <div className="bg-blue-600 text-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold flex items-center gap-2">
          📌 {menuData.label}
        </h2>
        <p className="text-xs text-blue-100 mt-1">
          {menuData.label} 관련 정보입니다.
        </p>
      </div>

      {/* 서브 메뉴 리스트 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {menuData.sub.map((sub: any) => {
            // 현재 보고 있는 서브메뉴인지 확인 (하이라이트용)
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

      {/* 글쓰기 바로가기 버튼 (편의성 추가) */}
      <Link 
        href="/post/write"
        className="block w-full py-3 bg-gray-800 text-white text-center text-sm font-bold rounded-lg hover:bg-gray-700 transition shadow-sm"
      >
        ✏️ 새 글 작성하기
      </Link>
    </aside>
  );
}
