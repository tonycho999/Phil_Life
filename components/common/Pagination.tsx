"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inputPage, setInputPage] = useState("");

  // 1. 현재 URL을 유지하면서 page 파라미터만 변경하는 함수
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // 2. 텍스트 상자에서 엔터/이동 버튼을 눌렀을 때 실행되는 함수
  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(inputPage, 10);
    if (page >= 1 && page <= totalPages) {
      router.push(createPageURL(page));
      setInputPage("");
    } else {
      alert(`1부터 ${totalPages} 페이지 사이의 숫자를 입력해주세요.`);
    }
  };

  // 3. 1 ... 23 24 25 26 27 ... 41 형태의 배열을 만들어내는 핵심 로직
  const generatePages = () => {
    const pages = [];
    if (totalPages <= 10) {
      // 전체 페이지가 10개 이하면 전부 출력
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    let start = Math.max(1, currentPage - 4);
    let end = Math.min(totalPages, currentPage + 4);

    if (currentPage <= 5) {
      end = 9;
    } else if (currentPage + 4 >= totalPages) {
      start = totalPages - 8;
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-5 mt-10 mb-8">
      {/* 상단: 페이지 번호 리스트 */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* 이전 페이지 버튼 */}
        {currentPage > 1 ? (
          <Link href={createPageURL(currentPage - 1)} className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-600 transition">
            <ChevronLeft size={18} />
          </Link>
        ) : (
          <div className="p-2 border border-gray-100 rounded-md bg-gray-50 text-gray-300 cursor-not-allowed">
            <ChevronLeft size={18} />
          </div>
        )}

        {/* 생성된 번호 출력 */}
        {generatePages().map((page, idx) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${idx}`} className="px-1 md:px-2 text-gray-400 font-medium tracking-widest">
                ...
              </span>
            );
          }
          const isActive = page === currentPage;
          return (
            <Link
              key={page}
              href={createPageURL(page)}
              className={`min-w-[36px] md:minw-[40px] h-9 md:h-10 flex items-center justify-center text-sm font-semibold border rounded-md transition ${
                isActive 
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {page}
            </Link>
          );
        })}

        {/* 다음 페이지 버튼 */}
        {currentPage < totalPages ? (
          <Link href={createPageURL(currentPage + 1)} className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-600 transition">
            <ChevronRight size={18} />
          </Link>
        ) : (
          <div className="p-2 border border-gray-100 rounded-md bg-gray-50 text-gray-300 cursor-not-allowed">
            <ChevronRight size={18} />
          </div>
        )}
      </div>

      {/* 하단: 페이지 점프 이동 텍스트 상자 */}
      <form onSubmit={handleJump} className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 py-2 px-4 rounded-lg border border-gray-200">
        <span className="font-medium">페이지 이동</span>
        <input
          type="number"
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          placeholder={String(currentPage)}
          className="w-16 h-8 px-2 border border-gray-300 rounded-md text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
          min={1}
          max={totalPages}
        />
        <span className="text-gray-400 mr-1">/ {totalPages}</span>
        <button type="submit" className="h-8 px-3 font-medium bg-gray-800 text-white rounded-md hover:bg-gray-700 transition shadow-sm">
          이동
        </button>
      </form>
    </div>
  );
}
