import React from "react"; 

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* 헤더 로딩바 */}
      <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* 게시글 리스트 로딩바 (가운데 내용만 로딩) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
        {.map((i) => (
          <div key={i} className="p-4 block">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-12 bg-gray-100 rounded animate-pulse"></div>
            </div>
            <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse mb-2"></div>
            <div className="flex gap-3">
              <div className="h-3 w-16 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-3 w-10 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
