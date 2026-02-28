"use client";

import Link from "next/link";

export default function SidebarRight() {
  return (
    <aside className="w-full space-y-4">
      {/* 배너/광고 영역 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm mb-2">
          광고 배너 영역
        </div>
        <p className="text-xs text-gray-500 text-center">문의: contact@phil-life.com</p>
      </div>

      {/* 인기 게시글 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-3 text-sm border-b pb-2">🔥 실시간 인기글</h3>
        <ul className="space-y-3">
          {.map((i) => (
            <li key={i} className="text-sm">
              <Link href="#" className="flex gap-2 group">
                <span className="text-blue-600 font-bold">{i}</span>
                <span className="text-gray-600 group-hover:text-blue-600 group-hover:underline line-clamp-1">
                  인기글 제목 예시입니다...
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 환율 정보 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-3 text-sm border-b pb-2">💱 오늘의 환율</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">USD/PHP</span>
          <span className="font-bold text-red-500">56.20 ▲</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">KRW/PHP</span>
          <span className="font-bold text-blue-500">0.041 ▼</span>
        </div>
      </div>
    </aside>
  );
}
