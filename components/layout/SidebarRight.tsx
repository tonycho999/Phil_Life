"use client";

import Link from "next/link";

export default function SidebarRight() {
  return (
    <div className="w-full space-y-4">
      {/* 1. 광고 영역 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="h-20 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
          광고 배너
        </div>
      </div>

      {/* 2. 인기글 영역 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-bold text-sm mb-2">인기글</h3>
        <div className="text-xs text-gray-500">준비 중입니다.</div>
      </div>
    </div>
  );
}
