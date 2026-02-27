// components/ui/Pagination.tsx
"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  totalCount: number; // 전체 글 개수
  currentPage: number; // 현재 페이지
  pageSize?: number; // 한 페이지당 글 개수 (기본 15개)
  basePath: string; // 이동할 기본 주소 (예: /info/news)
}

export default function Pagination({
  totalCount,
  currentPage,
  pageSize = 15,
  basePath,
}: PaginationProps) {
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalCount / pageSize);

  // 페이지가 1개뿐이면 숨김
  if (totalPages <= 1) return null;

  // 현재 페이지 그룹 계산 (한 화면에 5개씩 보여주기)
  const pageGroupSize = 5;
  const currentGroup = Math.ceil(currentPage / pageGroupSize);
  
  const startPage = (currentGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  // 검색어 유지하기 위한 쿼리 생성
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex justify-center items-center gap-2 py-8">
      {/* 이전 그룹으로 이동 (<) */}
      <Link
        href={createPageUrl(startPage - 1)}
        className={`p-2 rounded hover:bg-gray-100 ${
          startPage === 1 ? "pointer-events-none text-gray-300" : "text-gray-600"
        }`}
        aria-disabled={startPage === 1}
      >
        <ChevronLeft size={20} />
      </Link>

      {/* 페이지 번호들 */}
      <div className="flex gap-1">
        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(
          (pageNum) => (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                pageNum === currentPage
                  ? "bg-blue-600 text-white font-bold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {pageNum}
            </Link>
          )
        )}
      </div>

      {/* 다음 그룹으로 이동 (>) */}
      <Link
        href={createPageUrl(endPage + 1)}
        className={`p-2 rounded hover:bg-gray-100 ${
          endPage === totalPages ? "pointer-events-none text-gray-300" : "text-gray-600"
        }`}
        aria-disabled={endPage === totalPages}
      >
        <ChevronRight size={20} />
      </Link>
    </div>
  );
}
